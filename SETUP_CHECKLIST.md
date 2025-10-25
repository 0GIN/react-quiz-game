# ✅ Checklist Setup Projektu

## Krok po kroku - Setup QuizRush

### 1. ⚙️ Instalacja Aplikacji
- [ ] Sklonowałeś repozytorium: `git clone ...`
- [ ] Zainstalowałeś dependencies: `npm install`
- [ ] Skopiowałeś `.env.example` → `.env`

### 2. 🗄️ Setup Supabase (WAŻNE!)
- [ ] Utworzyłeś projekt na [supabase.com](https://supabase.com)
- [ ] Skopiowałeś **URL** i **anon key** do `.env`
- [ ] Uruchomiłeś `database/complete-setup.sql` w SQL Editor
- [ ] Sprawdziłeś że tabele mają dane: `SELECT COUNT(*) FROM questions;`

### 3. 🔐 Konfiguracja Auth
- [ ] Włączyłeś Email Provider w Supabase (Authentication → Providers)
- [ ] Wyłączyłeś "Confirm email" (dla developmentu)

### 4. 🚀 Uruchomienie
- [ ] Uruchomiłeś dev server: `npm run dev`
- [ ] Otworzył `http://localhost:5173`
- [ ] Sprawdziłeś konsolę - brak błędów związanych z pytaniami

---

## 🔍 Weryfikacja

### Sprawdź czy baza działa:

1. Otwórz konsolę przeglądarki (F12)
2. Uruchom quiz (Blitz)
3. Poszukaj w konsoli:

**✅ Działa poprawnie:**
```
✅ Received questions: 50
✅ Questions loaded successfully
```

**❌ Problem - używa fallback:**
```
⚠️ Using fallback questions
```

Jeśli widzisz fallback, przeczytaj: [DATABASE_SETUP.md](./DATABASE_SETUP.md)

---

## 📝 Troubleshooting

### Problem: "No questions in database"
**Rozwiązanie:** Uruchom `database/complete-setup.sql` w Supabase SQL Editor

### Problem: "Permission denied"
**Rozwiązanie:** Uruchom `database/fix-all-rls-policies.sql`

### Problem: ".env variables not loaded"
**Rozwiązanie:** 
1. Sprawdź czy plik nazywa się `.env` (nie `.env.example`)
2. Zrestartuj dev server
3. Upewnij się że zmienne zaczynają się od `VITE_`

---

**Potrzebujesz pomocy?** Zobacz [DATABASE_SETUP.md](./DATABASE_SETUP.md) dla szczegółowych instrukcji.
