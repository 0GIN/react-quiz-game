# 🗄️ Skrypty Bazy Danych

## 🚀 Szybki Start

### 1. Pierwszy raz? Użyj `quick-setup.sql`

**Zalecane dla nowych instalacji** - bezpieczne, nie nadpisze danych:

```sql
-- Otwórz Supabase SQL Editor i uruchom:
database/quick-setup.sql
```

✅ **Co robi:**
- Dodaje 4 tryby gry (Duel, Squad, Blitz, Master)
- Dodaje 8 kategorii (Historia, Geografia, Nauka, Sport, Kultura, Przyroda, Technologia, Matematyka)
- Dodaje 100 pytań quizowych
- Używa `ON CONFLICT DO NOTHING` - bezpieczne dla istniejących danych

---

### 2. Masz problemy? Użyj `complete-setup.sql`

**Pełny reset bazy** - usuwa wszystkie dane i zaczyna od nowa:

```sql
-- ⚠️ UWAGA: Usuwa wszystkie gry, statystyki i dane użytkowników!
database/complete-setup.sql
```

✅ **Co robi:**
- Usuwa wszystkie gry i statystyki
- Resetuje sekwencje ID
- Dodaje dane podstawowe (tryby, kategorie, pytania)
- Naprawia RLS policies
- Weryfikuje poprawność

---

## 📁 Inne Skrypty

### Seed Scripts (pojedyncze operacje)
- `seed-categories.sql` - 8 kategorii
- `seed-questions.sql` - 100 pytań
- `seed-game-modes.sql` - 4 tryby gry
- `seed-shop-items.sql` - przedmioty w sklepie

### System Scripts
- `create-profile-system.sql` - system profili użytkowników
- `profile-system-functions.sql` - funkcje pomocnicze
- `fix-all-rls-policies.sql` - napraw Row Level Security

### Schema
- `schema.sql` - pełna struktura tabel
- `create-user-achievements-table.sql` - tabela osiągnięć

### Maintenance
- `drop-all-tables.sql` - ⚠️ USUWA wszystkie tabele

---

## 🔍 Weryfikacja

Po uruchomieniu setup sprawdź:

```sql
-- Sprawdź liczby rekordów
SELECT 'game_modes' as tabela, COUNT(*) FROM game_modes
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'questions', COUNT(*) FROM questions;
```

**Oczekiwane wyniki:**
- `game_modes`: 4
- `categories`: 8
- `questions`: 100

---

## ❓ FAQ

### Czemu quiz używa fallback questions?

Baza danych jest pusta. Uruchom `quick-setup.sql`.

### Błąd: "violates foreign key constraint"

Użyj `complete-setup.sql` zamiast `quick-setup.sql` - czyści wszystkie zależności.

### Pytania nie pojawiają się w grze

Sprawdź w konsoli aplikacji:
- ✅ Dobrze: `"✅ Received questions: 50"`
- ❌ Źle: `"⚠️ Using fallback questions"`

Jeśli widzisz fallback, sprawdź:
1. Połączenie z Supabase (`.env.local`)
2. RLS policies: `fix-all-rls-policies.sql`
3. Dane w bazie: `SELECT COUNT(*) FROM questions;`

### Jak dodać własne pytania?

```sql
INSERT INTO questions (
  category_id, 
  question_text, 
  correct_answer, 
  wrong_answer_1, 
  wrong_answer_2, 
  wrong_answer_3, 
  difficulty_level, 
  is_approved, 
  is_active
) VALUES (
  (SELECT id FROM categories WHERE name = 'Historia'),
  'Twoje pytanie?',
  'Poprawna odpowiedź',
  'Zła 1',
  'Zła 2',
  'Zła 3',
  'medium',
  true,
  true
);
```

---

## 🛠️ Troubleshooting

### Problem: Brak połączenia z bazą

Sprawdź `src/config/env.ts`:
```typescript
export const ENV = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
}
```

Upewnij się, że masz `.env.local`:
```env
VITE_SUPABASE_URL=https://twoj-projekt.supabase.co
VITE_SUPABASE_ANON_KEY=twoj-klucz-anon
```

### Problem: RLS Policy blokuje dostęp

Uruchom:
```sql
database/fix-all-rls-policies.sql
```

---

## 📚 Kolejność Wykonania (czysta instalacja)

1. **Schema** → `schema.sql` (jeśli tabele nie istnieją)
2. **Quick Setup** → `quick-setup.sql`
3. **Weryfikacja** → Sprawdź liczby rekordów
4. **Test** → Uruchom aplikację i zagraj w quiz

---

## ⚡ Szybkie Komendy

```sql
-- Sprawdź status bazy
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = t.table_name) as records
FROM (VALUES 
  ('game_modes'), 
  ('categories'), 
  ('questions'), 
  ('users'), 
  ('games')
) AS t(table_name);

-- Wyczyść cache pytań (jeśli są nieaktualne)
DELETE FROM questions WHERE is_active = false;

-- Sprawdź RLS policies
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```
