-- ========================================
-- FIX: Row Level Security Policies
-- Umożliwia anonimowy dostęp do odczytu pytań
-- ========================================

-- Włącz RLS dla wszystkich tabel
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- ========================================
-- Polityki dla tabeli QUESTIONS
-- ========================================

-- Pozwól anonimowym użytkownikom czytać aktywne i zatwierdzone pytania
DROP POLICY IF EXISTS "Allow anonymous read questions" ON questions;
CREATE POLICY "Allow anonymous read questions" 
ON questions FOR SELECT 
TO anon, authenticated
USING (is_active = true AND is_approved = true);

-- Pozwól zalogowanym użytkownikom dodawać pytania (będą wymagały zatwierdzenia)
DROP POLICY IF EXISTS "Allow authenticated insert questions" ON questions;
CREATE POLICY "Allow authenticated insert questions" 
ON questions FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Pozwól adminom na wszystkie operacje
DROP POLICY IF EXISTS "Allow admin all on questions" ON questions;
CREATE POLICY "Allow admin all on questions" 
ON questions FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.is_admin = true
  )
);

-- ========================================
-- Polityki dla tabeli CATEGORIES
-- ========================================

-- Pozwól wszystkim czytać aktywne kategorie
DROP POLICY IF EXISTS "Allow read categories" ON categories;
CREATE POLICY "Allow read categories" 
ON categories FOR SELECT 
TO anon, authenticated
USING (is_active = true);

-- Pozwól adminom zarządzać kategoriami
DROP POLICY IF EXISTS "Allow admin all on categories" ON categories;
CREATE POLICY "Allow admin all on categories" 
ON categories FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.is_admin = true
  )
);

-- ========================================
-- Polityki dla tabeli USERS
-- ========================================

-- Pozwól użytkownikom czytać swoje dane
DROP POLICY IF EXISTS "Allow users read own data" ON users;
CREATE POLICY "Allow users read own data" 
ON users FOR SELECT 
TO authenticated
USING (id = auth.uid());

-- Pozwól użytkownikom aktualizować swoje dane
DROP POLICY IF EXISTS "Allow users update own data" ON users;
CREATE POLICY "Allow users update own data" 
ON users FOR UPDATE 
TO authenticated
USING (id = auth.uid());

-- Pozwól czytać publiczne dane innych użytkowników (ranking, profil)
DROP POLICY IF EXISTS "Allow read public user data" ON users;
CREATE POLICY "Allow read public user data" 
ON users FOR SELECT 
TO authenticated
USING (true);

-- ========================================
-- Polityki dla tabeli GAME_MODES
-- ========================================

-- Pozwól wszystkim czytać aktywne tryby gry
DROP POLICY IF EXISTS "Allow read game_modes" ON game_modes;
CREATE POLICY "Allow read game_modes" 
ON game_modes FOR SELECT 
TO anon, authenticated
USING (is_active = true);

-- ========================================
-- Polityki dla tabeli GAMES
-- ========================================

-- Pozwól zalogowanym użytkownikom tworzyć gry
DROP POLICY IF EXISTS "Allow authenticated create games" ON games;
CREATE POLICY "Allow authenticated create games" 
ON games FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Pozwól czytać wszystkie gry
DROP POLICY IF EXISTS "Allow read games" ON games;
CREATE POLICY "Allow read games" 
ON games FOR SELECT 
TO authenticated
USING (true);

-- Pozwól aktualizować gry
DROP POLICY IF EXISTS "Allow update games" ON games;
CREATE POLICY "Allow update games" 
ON games FOR UPDATE 
TO authenticated
USING (true);

-- ========================================
-- Polityki dla tabeli GAME_PARTICIPANTS
-- ========================================

-- Pozwól zalogowanym użytkownikom dołączać do gier
DROP POLICY IF EXISTS "Allow insert game_participants" ON game_participants;
CREATE POLICY "Allow insert game_participants" 
ON game_participants FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Pozwól czytać uczestników gier
DROP POLICY IF EXISTS "Allow read game_participants" ON game_participants;
CREATE POLICY "Allow read game_participants" 
ON game_participants FOR SELECT 
TO authenticated
USING (true);

-- Pozwól aktualizować wyniki
DROP POLICY IF EXISTS "Allow update game_participants" ON game_participants;
CREATE POLICY "Allow update game_participants" 
ON game_participants FOR UPDATE 
TO authenticated
USING (user_id = auth.uid());

-- ========================================
-- Polityki dla tabeli FRIENDSHIPS
-- ========================================

-- Pozwól użytkownikom zarządzać swoimi znajomymi
DROP POLICY IF EXISTS "Allow manage own friendships" ON friendships;
CREATE POLICY "Allow manage own friendships" 
ON friendships FOR ALL 
TO authenticated
USING (user_id = auth.uid() OR friend_id = auth.uid());

-- ========================================
-- Sprawdź polityki
-- ========================================

SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
