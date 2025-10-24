# 🚨 INSTRUKCJA NAPRAWY BAZY DANYCH SUPABASE

## Problem:
```
❌ NetworkError when attempting to fetch resource
❌ CORS Policy blocked
```

Oznacza to, że **baza danych nie jest skonfigurowana** lub **RLS policies blokują dostęp**.

---

## ✅ ROZWIĄZANIE KROK PO KROKU:

### 1️⃣ Wejdź do Supabase SQL Editor

1. Otwórz: https://supabase.com/dashboard/project/hgjknetpixnvidfrqygc
2. W menu po lewej stronie kliknij **"SQL Editor"**
3. Kliknij **"New query"**

---

### 2️⃣ KROK 1: Utwórz tabele (schema.sql)

**Skopiuj CAŁĄ zawartość pliku `database/schema.sql` i wklej do SQL Editora:**

```sql
-- Pełny plik schema.sql (445 linii)
-- Zawiera: users, categories, questions, game_modes, games, itd.
```

👉 **Kliknij "RUN"** (lub Ctrl+Enter)

---

### 3️⃣ KROK 2: Napraw polityki RLS (fix-rls-policies.sql)

**Skopiuj i uruchom:**

```sql
-- ========================================
-- FIX: Row Level Security Policies
-- Umożliwia anonimowy dostęp do odczytu pytań
-- ========================================

-- Włącz RLS dla wszystkich tabel
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_modes ENABLE ROW LEVEL SECURITY;

-- Polityki dla tabeli QUESTIONS
DROP POLICY IF EXISTS "Allow anonymous read questions" ON questions;
CREATE POLICY "Allow anonymous read questions" 
ON questions FOR SELECT 
TO anon, authenticated
USING (is_active = true AND is_approved = true);

DROP POLICY IF EXISTS "Allow authenticated insert questions" ON questions;
CREATE POLICY "Allow authenticated insert questions" 
ON questions FOR INSERT 
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin all on questions" ON questions;
CREATE POLICY "Allow admin all on questions" 
ON questions FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND is_admin = true
  )
);

-- Polityki dla tabeli CATEGORIES
DROP POLICY IF EXISTS "Allow read categories" ON categories;
CREATE POLICY "Allow read categories" 
ON categories FOR SELECT 
TO anon, authenticated
USING (is_active = true);

-- Polityki dla tabeli USERS
DROP POLICY IF EXISTS "Allow users read own data" ON users;
CREATE POLICY "Allow users read own data" 
ON users FOR SELECT 
TO authenticated
USING (id = auth.uid());

DROP POLICY IF EXISTS "Allow users update own data" ON users;
CREATE POLICY "Allow users update own data" 
ON users FOR UPDATE 
TO authenticated
USING (id = auth.uid());

-- Polityki dla tabeli GAME_MODES
DROP POLICY IF EXISTS "Allow read game_modes" ON game_modes;
CREATE POLICY "Allow read game_modes" 
ON game_modes FOR SELECT 
TO anon, authenticated
USING (is_active = true);

-- Polityki dla tabeli GAMES
DROP POLICY IF EXISTS "Allow authenticated create games" ON games;
CREATE POLICY "Allow authenticated create games" 
ON games FOR INSERT 
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read own games" ON games;
CREATE POLICY "Allow read own games" 
ON games FOR SELECT 
TO authenticated
USING (true);
```

👉 **Kliknij "RUN"**

---

### 4️⃣ KROK 3: Dodaj przykładowe pytania (seed-questions.sql)

**Skopiuj zawartość `database/seed-questions.sql` i uruchom.**

---

### 5️⃣ KROK 4: Skonfiguruj Authentication

1. W Supabase Dashboard idź do **Authentication** → **Settings**
2. W **Email Auth** upewnij się, że jest włączone:
   - ✅ Enable Email provider
   - ✅ Confirm email: **WYŁĄCZ** (dla testów)
3. W **URL Configuration** dodaj:
   ```
   Site URL: http://localhost:5174
   Redirect URLs: 
   - http://localhost:5174
   - http://localhost:5173
   - https://twoja-domena.vercel.app
   ```

---

### 6️⃣ KROK 5: Sprawdź czy działa

1. **Odśwież aplikację** w przeglądarce (Ctrl+Shift+R)
2. Spróbuj się zarejestrować nowym kontem
3. Powinieneś zobaczyć stronę główną QuizGame

---

## 🔍 Szybki test w SQL Editor:

```sql
-- Sprawdź czy tabele istnieją
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Sprawdź pytania
SELECT COUNT(*) FROM questions;

-- Sprawdź kategorie
SELECT * FROM categories;

-- Sprawdź RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## 🐛 Jeśli dalej nie działa:

### Opcja A: Wyłącz RLS (tylko na czas testów!)

```sql
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE game_modes DISABLE ROW LEVEL SECURITY;
```

⚠️ **UWAGA:** To niebezpieczne na produkcji! Użyj tylko lokalnie.

### Opcja B: Resetuj bazę i zrób od nowa

1. W Supabase: **Database** → **Tables**
2. Usuń wszystkie tabele
3. Wykonaj ponownie KROK 1-3

---

## ✅ Checklist:

- [ ] Tabele utworzone (`schema.sql`)
- [ ] RLS policies dodane (`fix-rls-policies.sql`)
- [ ] Pytania zaseedowane (`seed-questions.sql`)
- [ ] Authentication skonfigurowane (Email auth ON, Confirm email OFF)
- [ ] Site URL i Redirect URLs dodane
- [ ] Aplikacja odświeżona w przeglądarce

---

**Po wykonaniu tych kroków aplikacja powinna działać!** 🚀
