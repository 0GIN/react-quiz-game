-- ========================================
-- FIX: Kompletne polityki RLS
-- Naprawia wszystkie problemy z zapisem
-- ========================================

-- ========================================
-- 1. DAILY_MISSIONS
-- ========================================

DROP POLICY IF EXISTS "Allow read active daily_missions" ON daily_missions;
DROP POLICY IF EXISTS "Allow admin all on daily_missions" ON daily_missions;
DROP POLICY IF EXISTS "Allow insert daily_missions" ON daily_missions;

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

-- ========================================
-- 2. USER_DAILY_MISSIONS
-- ========================================

DROP POLICY IF EXISTS "Allow users read own missions" ON user_daily_missions;
DROP POLICY IF EXISTS "Allow users update own missions" ON user_daily_missions;
DROP POLICY IF EXISTS "Allow users insert own missions" ON user_daily_missions;

CREATE POLICY "Users can read own missions"
ON user_daily_missions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own missions"
ON user_daily_missions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own missions"
ON user_daily_missions FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ========================================
-- 3. USERS (KLUCZOWE!)
-- ========================================

-- Usuń stare polityki
DROP POLICY IF EXISTS "Allow users read own data" ON users;
DROP POLICY IF EXISTS "Allow users update own data" ON users;
DROP POLICY IF EXISTS "Allow read public user data" ON users;

-- Użytkownicy mogą czytać swoje dane
CREATE POLICY "Users read own"
ON users FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Użytkownicy mogą aktualizować swoje dane (KLUCZOWE dla punktów/exp!)
CREATE POLICY "Users update own"
ON users FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Wszyscy mogą czytać publiczne dane (dla rankingu)
CREATE POLICY "Public read all"
ON users FOR SELECT
TO authenticated
USING (true);

-- ========================================
-- 4. GAMES
-- ========================================

DROP POLICY IF EXISTS "Allow authenticated create games" ON games;
DROP POLICY IF EXISTS "Allow read games" ON games;
DROP POLICY IF EXISTS "Allow update games" ON games;

CREATE POLICY "Anyone can create games"
ON games FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can read games"
ON games FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone can update games"
ON games FOR UPDATE
TO authenticated
USING (true);

-- ========================================
-- 5. GAME_PARTICIPANTS
-- ========================================

DROP POLICY IF EXISTS "Allow insert game_participants" ON game_participants;
DROP POLICY IF EXISTS "Allow read game_participants" ON game_participants;
DROP POLICY IF EXISTS "Allow update game_participants" ON game_participants;

CREATE POLICY "Anyone can add participants"
ON game_participants FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can read participants"
ON game_participants FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone can update participants"
ON game_participants FOR UPDATE
TO authenticated
USING (true);

-- ========================================
-- 6. GAME_QUESTIONS & GAME_ANSWERS
-- ========================================

DROP POLICY IF EXISTS "Allow read game_questions" ON game_questions;
DROP POLICY IF EXISTS "Allow insert game_questions" ON game_questions;

CREATE POLICY "Anyone can read game questions"
ON game_questions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone can insert game questions"
ON game_questions FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read game_answers" ON game_answers;
DROP POLICY IF EXISTS "Allow insert game_answers" ON game_answers;

CREATE POLICY "Anyone can read answers"
ON game_answers FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone can insert answers"
ON game_answers FOR INSERT
TO authenticated
WITH CHECK (true);

-- ========================================
-- 7. USER_ACHIEVEMENTS (jeśli istnieje)
-- ========================================

DROP POLICY IF EXISTS "Allow users read own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Allow users update own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Allow users insert own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Allow read public achievements" ON user_achievements;

CREATE POLICY "Users read own achievements"
ON user_achievements FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users insert own achievements"
ON user_achievements FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own achievements"
ON user_achievements FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Public read all achievements"
ON user_achievements FOR SELECT
TO authenticated
USING (true);

-- ========================================
-- WERYFIKACJA
-- ========================================

-- Sprawdź wszystkie polityki
SELECT 
  tablename,
  policyname,
  CASE cmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
  END as command
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'daily_missions',
    'user_daily_missions', 
    'users',
    'games',
    'game_participants',
    'game_questions',
    'game_answers',
    'user_achievements'
  )
ORDER BY tablename, policyname;

-- Sprawdź czy RLS jest włączony
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ ENABLED' 
    ELSE '❌ DISABLED' 
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'daily_missions',
    'user_daily_missions',
    'users',
    'games',
    'game_participants'
  )
ORDER BY tablename;
