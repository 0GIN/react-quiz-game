-- ========================================
-- FIX: Row Level Security Policies
-- Umożliwia anonimowy dostęp do odczytu pytań
-- ========================================

-- Włącz RLS dla wszystkich tabel
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Polityki dla tabeli QUESTIONS
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
    AND users.role = 'admin'
  )
);

-- Polityki dla tabeli CATEGORIES
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
    AND users.role = 'admin'
  )
);

-- Sprawdź polityki
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('questions', 'categories')
ORDER BY tablename, policyname;
