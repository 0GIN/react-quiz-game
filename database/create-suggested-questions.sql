-- ========================================
-- SUGGESTED QUESTIONS SYSTEM
-- ========================================
-- Pozwala użytkownikom na proponowanie nowych pytań
-- Admini mogą akceptować/edytować/odrzucać propozycje

CREATE TABLE IF NOT EXISTS suggested_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Autor propozycji
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Dane pytania
  category_id INTEGER NOT NULL REFERENCES categories(id),
  question_text TEXT NOT NULL CHECK (char_length(question_text) >= 10 AND char_length(question_text) <= 500),
  correct_answer TEXT NOT NULL CHECK (char_length(correct_answer) >= 1 AND char_length(correct_answer) <= 200),
  wrong_answer_1 TEXT NOT NULL CHECK (char_length(wrong_answer_1) >= 1 AND char_length(wrong_answer_1) <= 200),
  wrong_answer_2 TEXT NOT NULL CHECK (char_length(wrong_answer_2) >= 1 AND char_length(wrong_answer_2) <= 200),
  wrong_answer_3 TEXT NOT NULL CHECK (char_length(wrong_answer_3) >= 1 AND char_length(wrong_answer_3) <= 200),
  difficulty_level VARCHAR(10) NOT NULL CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  
  -- Status propozycji
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'edited')),
  
  -- Feedback dla autora (opcjonalne)
  admin_comment TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  
  -- Nagroda (jeśli zaakceptowano)
  reward_fp INTEGER DEFAULT 0,
  reward_xp INTEGER DEFAULT 0,
  reward_claimed BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeksy
CREATE INDEX IF NOT EXISTS idx_suggested_questions_author ON suggested_questions(author_id);
CREATE INDEX IF NOT EXISTS idx_suggested_questions_status ON suggested_questions(status);
CREATE INDEX IF NOT EXISTS idx_suggested_questions_category ON suggested_questions(category_id);
CREATE INDEX IF NOT EXISTS idx_suggested_questions_created ON suggested_questions(created_at DESC);

-- ========================================
-- RLS POLICIES
-- ========================================

-- Enable RLS
ALTER TABLE suggested_questions ENABLE ROW LEVEL SECURITY;

-- Użytkownicy mogą dodawać własne propozycje
CREATE POLICY "Users can create their own suggestions"
  ON suggested_questions FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Użytkownicy mogą przeglądać własne propozycje
CREATE POLICY "Users can view their own suggestions"
  ON suggested_questions FOR SELECT
  USING (auth.uid() = author_id);

-- Admini mogą przeglądać wszystkie propozycje
CREATE POLICY "Admins can view all suggestions"
  ON suggested_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Admini mogą aktualizować propozycje (status, komentarz, etc.)
CREATE POLICY "Admins can update suggestions"
  ON suggested_questions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Admini mogą usuwać propozycje
CREATE POLICY "Admins can delete suggestions"
  ON suggested_questions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ========================================
-- FUNKCJE POMOCNICZE
-- ========================================

-- Funkcja zatwierdzania pytania (tworzy pytanie w questions)
CREATE OR REPLACE FUNCTION approve_suggested_question(
  p_suggestion_id UUID,
  p_admin_id UUID,
  p_reward_fp INTEGER DEFAULT 50,
  p_reward_xp INTEGER DEFAULT 100
)
RETURNS JSONB AS $$
DECLARE
  v_suggestion suggested_questions%ROWTYPE;
  v_new_question_id UUID;
  v_author_fp INTEGER;
  v_author_xp INTEGER;
BEGIN
  -- Pobierz propozycję
  SELECT * INTO v_suggestion
  FROM suggested_questions
  WHERE id = p_suggestion_id AND status = 'pending';

  IF v_suggestion.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Suggestion not found or already processed');
  END IF;

  -- Utwórz pytanie w tabeli questions
  INSERT INTO questions (
    category_id,
    question_text,
    correct_answer,
    wrong_answer_1,
    wrong_answer_2,
    wrong_answer_3,
    difficulty_level,
    points_value,
    is_approved,
    is_active
  ) VALUES (
    v_suggestion.category_id,
    v_suggestion.question_text,
    v_suggestion.correct_answer,
    v_suggestion.wrong_answer_1,
    v_suggestion.wrong_answer_2,
    v_suggestion.wrong_answer_3,
    v_suggestion.difficulty_level,
    CASE v_suggestion.difficulty_level
      WHEN 'easy' THEN 10
      WHEN 'medium' THEN 20
      WHEN 'hard' THEN 30
    END,
    true,
    true
  )
  RETURNING id INTO v_new_question_id;

  -- Zaktualizuj status propozycji
  UPDATE suggested_questions
  SET 
    status = 'approved',
    reviewed_by = p_admin_id,
    reviewed_at = NOW(),
    reward_fp = p_reward_fp,
    reward_xp = p_reward_xp
  WHERE id = p_suggestion_id;

  -- Dodaj nagrodę autorowi
  UPDATE users
  SET 
    flash_points = flash_points + p_reward_fp,
    experience = experience + p_reward_xp
  WHERE id = v_suggestion.author_id
  RETURNING flash_points, experience INTO v_author_fp, v_author_xp;

  RETURN jsonb_build_object(
    'success', true,
    'question_id', v_new_question_id,
    'author_fp', v_author_fp,
    'author_xp', v_author_xp
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funkcja odrzucania pytania
CREATE OR REPLACE FUNCTION reject_suggested_question(
  p_suggestion_id UUID,
  p_admin_id UUID,
  p_comment TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
BEGIN
  -- Zaktualizuj status propozycji
  UPDATE suggested_questions
  SET 
    status = 'rejected',
    reviewed_by = p_admin_id,
    reviewed_at = NOW(),
    admin_comment = p_comment
  WHERE id = p_suggestion_id AND status = 'pending';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Suggestion not found or already processed');
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- STATYSTYKI
-- ========================================

-- Funkcja do pobierania statystyk propozycji
CREATE OR REPLACE FUNCTION get_suggestion_stats()
RETURNS JSONB AS $$
DECLARE
  v_total INTEGER;
  v_pending INTEGER;
  v_approved INTEGER;
  v_rejected INTEGER;
BEGIN
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'pending'),
    COUNT(*) FILTER (WHERE status = 'approved'),
    COUNT(*) FILTER (WHERE status = 'rejected')
  INTO v_total, v_pending, v_approved, v_rejected
  FROM suggested_questions;

  RETURN jsonb_build_object(
    'total', v_total,
    'pending', v_pending,
    'approved', v_approved,
    'rejected', v_rejected
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE suggested_questions IS 'User-submitted question suggestions for admin review';
COMMENT ON FUNCTION approve_suggested_question IS 'Approve a suggested question and add it to questions table';
COMMENT ON FUNCTION reject_suggested_question IS 'Reject a suggested question with optional feedback';
