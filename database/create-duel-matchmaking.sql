-- ========================================
-- SYSTEM MATCHMAKINGU DLA DUEL
-- ========================================
-- Gracze mogą się zapisać jako "szukający przeciwnika"
-- System automatycznie łączy graczy o podobnym poziomie

-- Tabela kolejki matchmakingu
CREATE TABLE IF NOT EXISTS duel_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL,
  flash_points INTEGER NOT NULL,
  preferred_categories INTEGER[], -- Preferowane kategorie (opcjonalne)
  message TEXT, -- Opcjonalna wiadomość do przeciwnika
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 minutes'),
  
  -- Constraint: jeden użytkownik w kolejce
  UNIQUE(user_id)
);

-- Index dla szybkiego matchmakingu
CREATE INDEX idx_duel_queue_level ON duel_queue(level);
CREATE INDEX idx_duel_queue_created_at ON duel_queue(created_at);
CREATE INDEX idx_duel_queue_expires_at ON duel_queue(expires_at);

-- ========================================
-- RLS POLICIES
-- ========================================

ALTER TABLE duel_queue ENABLE ROW LEVEL SECURITY;

-- Każdy może zobaczyć graczy w kolejce (oprócz swojego ID dla prywatności)
CREATE POLICY "Anyone can view queue"
  ON duel_queue FOR SELECT
  USING (true);

-- Tylko właściciel może dodać się do kolejki
CREATE POLICY "Users can add themselves to queue"
  ON duel_queue FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Tylko właściciel może usunąć się z kolejki
CREATE POLICY "Users can remove themselves from queue"
  ON duel_queue FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- FUNKCJA CZYSZCZĄCA WYGASŁE WPISY
-- ========================================

CREATE OR REPLACE FUNCTION cleanup_expired_queue()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM duel_queue
  WHERE expires_at < NOW();
END;
$$;

-- Trigger do automatycznego czyszczenia przy każdym INSERT
CREATE OR REPLACE FUNCTION trigger_cleanup_expired_queue()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM cleanup_expired_queue();
  RETURN NEW;
END;
$$;

CREATE TRIGGER cleanup_queue_on_insert
  BEFORE INSERT ON duel_queue
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_cleanup_expired_queue();

-- ========================================
-- GRANT PERMISSIONS
-- ========================================

GRANT ALL ON duel_queue TO authenticated;
GRANT ALL ON duel_queue TO service_role;
