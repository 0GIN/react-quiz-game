-- ========================================
-- DUEL SYSTEM - Turowy system pojedynków 1v1
-- ========================================
-- Struktura:
-- - 5 rund po 3 pytania = 15 pytań łącznie
-- - Gracze na zmianę wybierają kategorie
-- - Turowa rozgrywka (asynchroniczna)
-- - Te same pytania dla obu graczy w rundzie

-- ========================================
-- 1. DUEL MATCHES - Główna tabela pojedynków
-- ========================================

CREATE TABLE duel_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    player2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Status pojedynku
    status VARCHAR(20) DEFAULT 'pending',
    -- pending: oczekuje na akceptację
    -- active: w trakcie
    -- completed: zakończony
    -- declined: odrzucony
    
    current_round INTEGER DEFAULT 0,
    -- 0 = oczekuje na akceptację
    -- 1-5 = numer bieżącej rundy
    -- 6 = zakończony
    
    -- Kto ma teraz turę (player1_id lub player2_id)
    current_turn_player_id UUID REFERENCES users(id),
    
    -- Wynik końcowy
    player1_score INTEGER DEFAULT 0,
    player2_score INTEGER DEFAULT 0,
    winner_id UUID REFERENCES users(id),
    
    -- Wiadomość przy wyzwaniu
    challenge_message TEXT,
    
    -- Timestampy
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP,
    completed_at TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CHECK (player1_id != player2_id),
    CHECK (status IN ('pending', 'active', 'completed', 'declined', 'cancelled')),
    CHECK (current_round >= 0 AND current_round <= 6)
);

CREATE INDEX idx_duel_matches_player1 ON duel_matches(player1_id, status);
CREATE INDEX idx_duel_matches_player2 ON duel_matches(player2_id, status);
CREATE INDEX idx_duel_matches_status ON duel_matches(status);
CREATE INDEX idx_duel_matches_current_turn ON duel_matches(current_turn_player_id);

-- ========================================
-- 2. DUEL ROUNDS - Rundy pojedynku
-- ========================================

CREATE TABLE duel_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES duel_matches(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    
    -- Kto wybrał kategorię dla tej rundy
    category_chooser_id UUID NOT NULL REFERENCES users(id),
    category_id INTEGER NOT NULL REFERENCES categories(id),
    
    -- Pytania dla tej rundy (3 pytania)
    question1_id UUID REFERENCES questions(id),
    question2_id UUID REFERENCES questions(id),
    question3_id UUID REFERENCES questions(id),
    
    -- Czy gracze odpowiedzieli
    player1_answered BOOLEAN DEFAULT FALSE,
    player2_answered BOOLEAN DEFAULT FALSE,
    
    -- Wyniki rundy
    player1_correct INTEGER DEFAULT 0,
    player2_correct INTEGER DEFAULT 0,
    
    -- Timestampy
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    player1_answered_at TIMESTAMP,
    player2_answered_at TIMESTAMP,
    
    CHECK (round_number >= 1 AND round_number <= 5),
    CHECK (player1_correct >= 0 AND player1_correct <= 3),
    CHECK (player2_correct >= 0 AND player2_correct <= 3),
    UNIQUE(match_id, round_number)
);

CREATE INDEX idx_duel_rounds_match ON duel_rounds(match_id);
CREATE INDEX idx_duel_rounds_chooser ON duel_rounds(category_chooser_id);

-- ========================================
-- 3. DUEL ANSWERS - Odpowiedzi graczy
-- ========================================

CREATE TABLE duel_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    round_id UUID NOT NULL REFERENCES duel_rounds(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id),
    
    -- Odpowiedź gracza
    selected_answer VARCHAR(10) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    time_taken INTEGER, -- w sekundach
    
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CHECK (selected_answer IN ('A', 'B', 'C', 'D')),
    UNIQUE(round_id, player_id, question_id)
);

CREATE INDEX idx_duel_answers_round ON duel_answers(round_id);
CREATE INDEX idx_duel_answers_player ON duel_answers(player_id);

-- ========================================
-- 4. ROW LEVEL SECURITY
-- ========================================

-- Duel Matches RLS
ALTER TABLE duel_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own duel matches"
    ON duel_matches FOR SELECT
    USING (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE POLICY "Users can create duel matches as player1"
    ON duel_matches FOR INSERT
    WITH CHECK (auth.uid() = player1_id);

CREATE POLICY "Users can update their own duel matches"
    ON duel_matches FOR UPDATE
    USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Duel Rounds RLS
ALTER TABLE duel_rounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view rounds of their matches"
    ON duel_rounds FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM duel_matches
            WHERE duel_matches.id = duel_rounds.match_id
            AND (duel_matches.player1_id = auth.uid() OR duel_matches.player2_id = auth.uid())
        )
    );

CREATE POLICY "Users can create rounds for their matches"
    ON duel_rounds FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM duel_matches
            WHERE duel_matches.id = duel_rounds.match_id
            AND (duel_matches.player1_id = auth.uid() OR duel_matches.player2_id = auth.uid())
        )
    );

CREATE POLICY "Users can update rounds of their matches"
    ON duel_rounds FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM duel_matches
            WHERE duel_matches.id = duel_rounds.match_id
            AND (duel_matches.player1_id = auth.uid() OR duel_matches.player2_id = auth.uid())
        )
    );

-- Duel Answers RLS
ALTER TABLE duel_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view answers in their rounds"
    ON duel_answers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM duel_rounds
            JOIN duel_matches ON duel_matches.id = duel_rounds.match_id
            WHERE duel_rounds.id = duel_answers.round_id
            AND (duel_matches.player1_id = auth.uid() OR duel_matches.player2_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert their own answers"
    ON duel_answers FOR INSERT
    WITH CHECK (auth.uid() = player_id);

-- ========================================
-- 5. FUNKCJE POMOCNICZE
-- ========================================

-- Funkcja do obliczania wyniku rundy
CREATE OR REPLACE FUNCTION calculate_round_scores(p_round_id UUID)
RETURNS VOID AS $$
DECLARE
    v_match_id UUID;
    v_player1_id UUID;
    v_player2_id UUID;
    v_player1_correct INTEGER;
    v_player2_correct INTEGER;
BEGIN
    -- Pobierz dane rundy
    SELECT 
        dr.match_id,
        dm.player1_id,
        dm.player2_id
    INTO 
        v_match_id,
        v_player1_id,
        v_player2_id
    FROM duel_rounds dr
    JOIN duel_matches dm ON dm.id = dr.match_id
    WHERE dr.id = p_round_id;
    
    -- Policz poprawne odpowiedzi player1
    SELECT COUNT(*)
    INTO v_player1_correct
    FROM duel_answers
    WHERE round_id = p_round_id
    AND player_id = v_player1_id
    AND is_correct = TRUE;
    
    -- Policz poprawne odpowiedzi player2
    SELECT COUNT(*)
    INTO v_player2_correct
    FROM duel_answers
    WHERE round_id = p_round_id
    AND player_id = v_player2_id
    AND is_correct = TRUE;
    
    -- Zaktualizuj wyniki w rundzie
    UPDATE duel_rounds
    SET 
        player1_correct = v_player1_correct,
        player2_correct = v_player2_correct
    WHERE id = p_round_id;
    
    -- Zaktualizuj łączne wyniki w meczu
    UPDATE duel_matches
    SET 
        player1_score = (
            SELECT COALESCE(SUM(player1_correct), 0)
            FROM duel_rounds
            WHERE match_id = v_match_id
        ),
        player2_score = (
            SELECT COALESCE(SUM(player2_correct), 0)
            FROM duel_rounds
            WHERE match_id = v_match_id
        ),
        last_activity_at = CURRENT_TIMESTAMP
    WHERE id = v_match_id;
END;
$$ LANGUAGE plpgsql;

-- Funkcja do zakończenia pojedynku
CREATE OR REPLACE FUNCTION complete_duel_match(p_match_id UUID)
RETURNS VOID AS $$
DECLARE
    v_player1_score INTEGER;
    v_player2_score INTEGER;
    v_player1_id UUID;
    v_player2_id UUID;
    v_winner_id UUID;
BEGIN
    -- Pobierz dane meczu
    SELECT player1_id, player2_id, player1_score, player2_score
    INTO v_player1_id, v_player2_id, v_player1_score, v_player2_score
    FROM duel_matches
    WHERE id = p_match_id;
    
    -- Ustal zwycięzcę
    IF v_player1_score > v_player2_score THEN
        v_winner_id := v_player1_id;
    ELSIF v_player2_score > v_player1_score THEN
        v_winner_id := v_player2_id;
    ELSE
        v_winner_id := NULL; -- Remis
    END IF;
    
    -- Zaktualizuj mecz
    UPDATE duel_matches
    SET 
        status = 'completed',
        winner_id = v_winner_id,
        completed_at = CURRENT_TIMESTAMP,
        current_turn_player_id = NULL
    WHERE id = p_match_id;
    
    -- Nagrody za wygraną (tylko jeśli nie remis)
    IF v_winner_id IS NOT NULL THEN
        UPDATE users
        SET 
            flash_points = flash_points + 100,
            total_wins = total_wins + 1,
            total_games_played = total_games_played + 1
        WHERE id = v_winner_id;
        
        -- Przegrany też dostaje statystykę
        UPDATE users
        SET total_games_played = total_games_played + 1
        WHERE id = CASE 
            WHEN v_winner_id = v_player1_id THEN v_player2_id 
            ELSE v_player1_id 
        END;
    ELSE
        -- Remis - obaj dostają po 50 FP
        UPDATE users
        SET 
            flash_points = flash_points + 50,
            total_games_played = total_games_played + 1
        WHERE id IN (v_player1_id, v_player2_id);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- KONIEC
-- ========================================
