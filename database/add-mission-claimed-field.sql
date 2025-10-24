-- Dodaj pole is_claimed do tabeli user_daily_missions

ALTER TABLE user_daily_missions
ADD COLUMN IF NOT EXISTS is_claimed BOOLEAN DEFAULT FALSE;

ALTER TABLE user_daily_missions
ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE;

-- Dodaj komentarze
COMMENT ON COLUMN user_daily_missions.is_claimed IS 'Czy nagroda została odebrana przez użytkownika';
COMMENT ON COLUMN user_daily_missions.claimed_at IS 'Kiedy nagroda została odebrana';

-- Zaktualizuj istniejące rekordy - jeśli misja jest ukończona, oznacz jako odebraną
UPDATE user_daily_missions
SET is_claimed = TRUE, claimed_at = completed_at
WHERE is_completed = TRUE AND is_claimed IS NULL;
