-- ========================================
-- FIX: Polityka RLS dla tabeli users
-- Umożliwia odczyt natychmiast po logowaniu
-- ========================================

-- Usuń starą politykę która nie działa przy fresh login
DROP POLICY IF EXISTS "Users read own" ON users;
DROP POLICY IF EXISTS "Public read all" ON users;

-- NOWA POLITYKA: Każdy authenticated może czytać wszystkie users
-- (potrzebne dla rankingu, profili, itp.)
CREATE POLICY "authenticated_read_all_users"
ON users FOR SELECT
TO authenticated
USING (true);

-- NOWA POLITYKA: Każdy authenticated może aktualizować TYLKO swoje dane
CREATE POLICY "authenticated_update_own"
ON users FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- NOWA POLITYKA: Każdy authenticated może wstawić swój rekord
CREATE POLICY "authenticated_insert_own"
ON users FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());
