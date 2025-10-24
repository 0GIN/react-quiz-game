# 🔧 Konfiguracja Supabase - WAŻNE!

## ⚠️ Aplikacja wymaga konfiguracji bazy danych

### Krok 1: Uzyskaj dane z Supabase

1. Przejdź do [Supabase Dashboard](https://app.supabase.com)
2. Zaloguj się lub utwórz konto
3. Wybierz swój projekt (lub utwórz nowy)
4. Przejdź do **Settings** → **API**
5. Znajdź:
   - **Project URL** (np. `https://abcdefgh.supabase.co`)
   - **anon/public key** (długi string zaczynający się od `eyJ...`)

### Krok 2: Skonfiguruj plik .env

Otwórz plik `.env` w głównym katalogu projektu i uzupełnij danymi:

```env
VITE_SUPABASE_URL=https://twoj-projekt.supabase.co
VITE_SUPABASE_ANON_KEY=twoj-anon-key-tutaj
```

### Krok 3: Uruchom ponownie aplikację

```bash
# Zatrzymaj aplikację (Ctrl+C)
npm run dev
```

---

## 🗃️ Konfiguracja bazy danych

Jeśli to jest nowy projekt Supabase, musisz wykonać skrypty SQL:

### 1. Przejdź do SQL Editor w Supabase
Dashboard → SQL Editor → New Query

### 2. Wykonaj skrypty w kolejności:

1. **schema.sql** - Struktura tabel
   - Lokalizacja: `database/schema.sql`
   - Tworzy tabele: users, games, questions, missions, achievements, etc.

2. **seed-questions.sql** - Przykładowe pytania
   - Lokalizacja: `database/seed-questions.sql`
   - Dodaje pytania quizowe

3. **seed-missions.sql** - Definicje misji
   - Lokalizacja: `database/seed-missions.sql`
   - Dodaje misje dzienne

### 3. Weryfikacja

Po wykonaniu skryptów sprawdź w Table Editor czy tabele istnieją:
- ✅ users
- ✅ games
- ✅ questions
- ✅ daily_missions
- ✅ user_daily_missions
- ✅ achievements
- ✅ user_achievements

---

## ✅ Weryfikacja połączenia

Po skonfigurowaniu `.env`, aplikacja powinna się połączyć automatycznie.

**Sprawdź w konsoli przeglądarki (F12):**
- Brak błędów "Missing Supabase environment variables" ✅
- Brak błędów połączenia ✅

---

## 🆘 Rozwiązywanie problemów

### Problem: "Missing Supabase environment variables"
**Rozwiązanie:**
1. Sprawdź czy plik `.env` istnieje w głównym katalogu
2. Upewnij się że zmienne zaczynają się od `VITE_`
3. Restart dev servera (`Ctrl+C` → `npm run dev`)

### Problem: "Invalid API key"
**Rozwiązanie:**
1. Sprawdź czy skopiowałeś **anon/public key** (nie service_role!)
2. Upewnij się że nie ma spacji na początku/końcu klucza

### Problem: "Failed to fetch"
**Rozwiązanie:**
1. Sprawdź czy URL jest poprawny (bez spacji, ze `https://`)
2. Sprawdź połączenie internetowe
3. Zweryfikuj czy projekt Supabase jest aktywny

### Problem: "Row Level Security" errors
**Rozwiązanie:**
- Zobacz `docs/DATABASE_SETUP_GUIDE.md`
- Wykonaj skrypt `database/fix-rls-policies-v2.sql`

---

## 📚 Dodatkowe zasoby

- [Dokumentacja Supabase](https://supabase.com/docs)
- [Przewodnik RLS](https://supabase.com/docs/guides/auth/row-level-security)
- `docs/DATABASE_SETUP_GUIDE.md` - Szczegółowy przewodnik

---

**Potrzebujesz pomocy? Sprawdź `QUICK_START.md` lub `README_CODE.md`**
