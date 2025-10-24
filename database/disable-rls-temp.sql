-- TYMCZASOWE ROZWIĄZANIE: Wyłącz RLS dla testów
-- UWAGA: Nie używaj tego na produkcji!

ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE answers DISABLE ROW LEVEL SECURITY;

-- Sprawdź status RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('questions', 'categories', 'answers')
ORDER BY tablename;
