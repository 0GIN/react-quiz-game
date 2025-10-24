# 🎮 React Quiz Game - Instrukcja konfiguracji bazy danych

## ✅ Co zostało utworzone:

1. **`database-setup.sql`** - Kompletny schemat bazy danych (20 tabel)
2. **`src/lib/supabase.ts`** - Konfiguracja połączenia z Supabase
3. **`.env`** - Plik zmiennych środowiskowych (UZUPEŁNIJ DANYMI!)
4. **`src/pages/RankingWithDatabase.tsx`** - Przykład działającej strony z bazą

---

## 🚀 INSTRUKCJA KROK PO KROKU:

### Krok 1: Utwórz konto Supabase (DARMOWE)

1. Otwórz: https://supabase.com
2. Kliknij **"Start your project"**
3. Zaloguj się przez **GitHub** (konto: 0GIN)
4. Kliknij **"New Project"**

### Krok 2: Utwórz nowy projekt

Wypełnij formularz:
- **Name**: `quiz-game`
- **Database Password**: (wymyśl silne hasło i ZAPISZ!)
- **Region**: `Europe Central (Frankfurt)`
- **Plan**: Free tier (wystarczy!)

Kliknij **"Create new project"** i poczekaj ~2 minuty.

### Krok 3: Wykonaj SQL i utwórz tabele

1. W dashboardzie Supabase kliknij **SQL Editor** (ikona po lewej)
2. Kliknij **"New query"**
3. Otwórz plik `database-setup.sql` z tego projektu
4. **Skopiuj CAŁĄ zawartość** i wklej do SQL Editora
5. Kliknij **"Run"** (lub Ctrl+Enter)
6. Powinieneś zobaczyć: ✅ **"Success. No rows returned"**

✅ GOTOWE! Masz teraz 20 tabel w bazie danych!

### Krok 4: Pobierz klucze API

1. W Supabase przejdź do **Settings** → **API**
2. Skopiuj dwie rzeczy:

**Project URL:**
```
https://xxxxxxxxxx.supabase.co
```

**anon public key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Krok 5: Uzupełnij plik .env

Otwórz plik **`.env`** w projekcie i wklej swoje dane:

```env
VITE_SUPABASE_URL=https://twoj-projekt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Krok 6: Dodaj testowych użytkowników (opcjonalne)

W Supabase SQL Editor wykonaj:

```sql
INSERT INTO users (username, email, password_hash, flash_points, level, total_games_played, total_wins, total_losses) 
VALUES 
('ProGamer123', 'pro@example.com', 'hash', 8500, 42, 186, 134, 52),
('QuizMaster99', 'quiz@example.com', 'hash', 7890, 38, 156, 102, 54),
('BrainChampion', 'brain@example.com', 'hash', 7200, 35, 142, 95, 47);
```

### Krok 7: Uruchom aplikację

```powershell
npm run dev
```

Otwórz http://localhost:5173 i przejdź do `/ranking` - powinieneś zobaczyć dane z bazy!

---

## 📊 Co teraz możesz robić:

✅ **Ranking działa** - dane z PostgreSQL  
✅ **20 gotowych tabel** - users, games, questions, chat, etc.  
✅ **Real-time updates** - Supabase wspiera subscriptions  
✅ **Darmowy hosting** - 500MB bazy + 50k użytkowników  

---

## 🔧 Przykład użycia w komponencie:

```typescript
import { supabase } from '../lib/supabase';

// Pobierz wszystkich użytkowników
const { data } = await supabase
  .from('users')
  .select('*')
  .order('flash_points', { ascending: false })
  .limit(10);

// Dodaj nowego użytkownika
const { data, error } = await supabase
  .from('users')
  .insert({ username: 'NowyGracz', email: 'nowy@example.com' });

// Aktualizuj punkty
await supabase
  .from('users')
  .update({ flash_points: 1000 })
  .eq('id', userId);

// Usuń użytkownika
await supabase
  .from('users')
  .delete()
  .eq('id', userId);
```

---

## 🎯 Następne kroki:

1. ✅ Skonfiguruj Supabase (2 min)
2. ✅ Wykonaj SQL (1 min)
3. ✅ Uzupełnij .env (1 min)
4. 🚀 Testuj ranking z bazą danych!
5. 💡 Dodaj autentykację użytkowników (Supabase Auth)
6. 💬 Zaimplementuj real-time czat (Supabase Realtime)

---

## ❓ Problemy?

**Błąd połączenia?**
- Sprawdź czy `.env` jest poprawnie uzupełniony
- Sprawdź czy projekt Supabase jest aktywny
- Zobacz logi w konsoli przeglądarki (F12)

**Brak danych w rankingu?**
- Dodaj testowych użytkowników przez SQL (krok 6)
- Sprawdź w Supabase → Table Editor czy tabela `users` istnieje

**Inne pytania?**
- Dokumentacja: https://supabase.com/docs
- Dashboard: https://app.supabase.com

---

Powodzenia! 🚀
