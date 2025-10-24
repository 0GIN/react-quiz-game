-- ========================================
-- 🚀 COMPLETE SETUP SCRIPT
-- Uruchom to w Supabase SQL Editor
-- ========================================

-- KROK 1: Dodaj tryby gry
DELETE FROM game_modes;
ALTER SEQUENCE game_modes_id_seq RESTART WITH 1;

INSERT INTO game_modes (code, name, description, min_players, max_players, time_limit_seconds, lives_count, requires_category, is_active) VALUES
  ('duel', 'Duel', '1v1 - Kto jest lepszy?', 2, 2, 15, 3, false, true),
  ('squad', 'Squad', '2v2 drużynowa dominacja', 4, 4, 15, 3, false, true),
  ('blitz', 'Blitz', '3 życia i walka na czas', 1, 1, 30, 3, false, true),
  ('master', 'Master', 'Sprawdź się w pojedynku z jednej kategorii', 2, 2, 20, 3, true, true);

SELECT '✅ Game modes dodane' as status, COUNT(*) as count FROM game_modes;

-- KROK 2: Dodaj kategorie
DELETE FROM categories;
ALTER SEQUENCE categories_id_seq RESTART WITH 1;

INSERT INTO categories (name, icon_emoji, description, is_active) VALUES
  ('Historia', '📜', 'Pytania o historię świata', true),
  ('Geografia', '🌍', 'Pytania o geografię i miejsca na świecie', true),
  ('Nauka', '🔬', 'Pytania z zakresu nauki i technologii', true),
  ('Sport', '⚽', 'Pytania o sport i sportowców', true),
  ('Kultura', '🎭', 'Pytania o kulturę, sztukę i rozrywkę', true),
  ('Przyroda', '🌿', 'Pytania o przyrodę i zwierzęta', true),
  ('Technologia', '💻', 'Pytania o technologie i innowacje', true),
  ('Matematyka', '🔢', 'Pytania matematyczne i logiczne', true);

SELECT '✅ Categories dodane' as status, COUNT(*) as count FROM categories;

-- KROK 3: Napraw RLS policies (KOMPLETNE!)

-- Daily missions - muszą pozwalać na INSERT!
ALTER TABLE daily_missions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read active daily_missions" ON daily_missions;
DROP POLICY IF EXISTS "Allow read active missions" ON daily_missions;
DROP POLICY IF EXISTS "Allow authenticated insert missions" ON daily_missions;
DROP POLICY IF EXISTS "Allow authenticated update missions" ON daily_missions;

CREATE POLICY "Allow read active missions"
ON daily_missions FOR SELECT 
TO authenticated, anon
USING (is_active = true);

CREATE POLICY "Allow authenticated insert missions"
ON daily_missions FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated update missions"
ON daily_missions FOR UPDATE 
TO authenticated
USING (true);

-- User daily missions
ALTER TABLE user_daily_missions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow users read own missions" ON user_daily_missions;
DROP POLICY IF EXISTS "Allow users update own missions" ON user_daily_missions;
DROP POLICY IF EXISTS "Allow users insert own missions" ON user_daily_missions;

CREATE POLICY "Users read own missions" 
ON user_daily_missions FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users update own missions" 
ON user_daily_missions FOR UPDATE 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users insert own missions" 
ON user_daily_missions FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

-- USERS - KLUCZOWE dla zapisywania punktów/exp!
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow users read own data" ON users;
DROP POLICY IF EXISTS "Allow users update own data" ON users;
DROP POLICY IF EXISTS "Allow read public user data" ON users;
DROP POLICY IF EXISTS "Users read own" ON users;
DROP POLICY IF EXISTS "Users update own" ON users;
DROP POLICY IF EXISTS "Public read all" ON users;

CREATE POLICY "Users read own"
ON users FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users update own"
ON users FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Public read all"
ON users FOR SELECT
TO authenticated
USING (true);

-- User stats
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow users read own stats" ON user_stats;
DROP POLICY IF EXISTS "Allow users update own stats" ON user_stats;
DROP POLICY IF EXISTS "Allow users insert own stats" ON user_stats;
DROP POLICY IF EXISTS "Allow read public stats" ON user_stats;

CREATE POLICY "Users read own stats" 
ON user_stats FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users update own stats" 
ON user_stats FOR UPDATE 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users insert own stats" 
ON user_stats FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Public read stats" 
ON user_stats FOR SELECT 
TO authenticated
USING (true);

-- Games
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated create games" ON games;
DROP POLICY IF EXISTS "Allow read games" ON games;
DROP POLICY IF EXISTS "Allow update games" ON games;

CREATE POLICY "Create games"
ON games FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Read games"
ON games FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Update games"
ON games FOR UPDATE
TO authenticated
USING (true);

-- Game participants
ALTER TABLE game_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow insert game_participants" ON game_participants;
DROP POLICY IF EXISTS "Allow read game_participants" ON game_participants;
DROP POLICY IF EXISTS "Allow update game_participants" ON game_participants;

CREATE POLICY "Insert participants"
ON game_participants FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Read participants"
ON game_participants FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Update participants"
ON game_participants FOR UPDATE
TO authenticated
USING (true);

-- Game questions
ALTER TABLE game_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read game_questions" ON game_questions;
DROP POLICY IF EXISTS "Allow insert game_questions" ON game_questions;

CREATE POLICY "Read game questions" 
ON game_questions FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Insert game questions" 
ON game_questions FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Game answers
ALTER TABLE game_answers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read game_answers" ON game_answers;
DROP POLICY IF EXISTS "Allow insert game_answers" ON game_answers;

CREATE POLICY "Read answers" 
ON game_answers FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Insert answers" 
ON game_answers FOR INSERT 
TO authenticated
WITH CHECK (true);

SELECT '✅ RLS policies naprawione' as status;

-- KROK 4: NIE dodawaj misji (system sam je wygeneruje)
-- Usuń stare misje zamiast tego
DELETE FROM daily_missions WHERE valid_date < CURRENT_DATE;
DELETE FROM user_daily_missions WHERE mission_id NOT IN (SELECT id FROM daily_missions);

SELECT '✅ Stare misje wyczyszczone' as status;

-- KROK 5: Weryfikacja
SELECT 
  'game_modes' as table_name,
  COUNT(*) as records,
  CASE WHEN COUNT(*) >= 4 THEN '✅' ELSE '❌' END as status
FROM game_modes
UNION ALL
SELECT 
  'categories' as table_name,
  COUNT(*) as records,
  CASE WHEN COUNT(*) >= 8 THEN '✅' ELSE '❌' END as status
FROM categories;

-- Misje będą wygenerowane automatycznie przy pierwszym zalogowaniu

-- Sprawdź RLS
SELECT 
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('daily_missions', 'user_daily_missions', 'user_stats', 'game_questions', 'game_answers')
GROUP BY schemaname, tablename
ORDER BY tablename;
