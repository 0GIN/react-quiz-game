-- Tabela osiągnięć użytkowników (achievements)

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  milestone_level TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unikalność: użytkownik może mieć każde osiągnięcie tylko raz
  UNIQUE(user_id, achievement_id, milestone_level)
);

-- Indeksy dla wydajności
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked_at ON user_achievements(unlocked_at DESC);

-- Komentarze
COMMENT ON TABLE user_achievements IS 'Osiągnięcia odblokowane przez użytkowników';
COMMENT ON COLUMN user_achievements.achievement_id IS 'ID kategorii osiągnięcia (total_games, total_wins, etc.)';
COMMENT ON COLUMN user_achievements.milestone_level IS 'Poziom kamienia milowego (bronze, silver, gold, platinum, diamond)';
COMMENT ON COLUMN user_achievements.unlocked_at IS 'Kiedy osiągnięcie zostało odblokowane';

-- RLS Policies
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Użytkownicy mogą odczytywać wszystkie osiągnięcia (dla rankingów)
CREATE POLICY "Allow read all achievements"
  ON user_achievements
  FOR SELECT
  USING (true);

-- Tylko serwer może dodawać osiągnięcia (przez service role)
CREATE POLICY "Service role can insert achievements"
  ON user_achievements
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
