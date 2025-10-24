# 🚀 Deployment Guide - QuizGame

## Setup lokalny

1. Sklonuj repozytorium:
```bash
git clone https://github.com/0GIN/react-quiz-game.git
cd react-quiz-game
```

2. Zainstaluj zależności:
```bash
npm install
```

3. Skopiuj `.env.example` jako `.env`:
```bash
cp .env.example .env
```

4. Wklej swoje klucze Supabase do `.env`:
```env
VITE_SUPABASE_URL=https://hgjknetpixnvidfrqygc.supabase.co
VITE_SUPABASE_ANON_KEY=twoj_klucz_tutaj
```

5. Uruchom dev server:
```bash
npm run dev
```

---

## 🌐 Deployment na Vercel

### Metoda 1: Przez Dashboard Vercel (ZALECANA)

1. Wejdź na https://vercel.com/new
2. Zaimportuj swoje repo: `0GIN/react-quiz-game`
3. **WAŻNE:** Przed kliknięciem "Deploy", dodaj **Environment Variables**:
   
   Kliknij **"Environment Variables"** i dodaj:
   
   ```
   Name: VITE_SUPABASE_URL
   Value: https://hgjknetpixnvidfrqygc.supabase.co
   ```
   
   ```
   Name: VITE_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. Kliknij **Deploy**

### Metoda 2: Przez Vercel CLI

```bash
# Zainstaluj Vercel CLI
npm i -g vercel

# Zaloguj się
vercel login

# Deploy
vercel

# Podczas deployu zostaniesz zapytany o zmienne środowiskowe
# Wklej te same wartości co w .env
```

### ⚙️ Dodawanie zmiennych później

Jeśli już zdeployowałeś projekt BEZ zmiennych:

1. Wejdź na https://vercel.com/dashboard
2. Wybierz projekt `react-quiz-game`
3. Kliknij **Settings** → **Environment Variables**
4. Dodaj:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Kliknij **Save**
6. Idź do **Deployments** → kliknij **"Redeploy"** na ostatnim deploymencie

---

## 📋 Checklist przed deploymentem

- [ ] `.env` jest w `.gitignore` (NIE commituj kluczy!)
- [ ] `.env.example` istnieje (z przykładowymi wartościami)
- [ ] Baza danych Supabase jest skonfigurowana (tabele, RLS)
- [ ] Build działa lokalnie (`npm run build`)
- [ ] Zmienne środowiskowe dodane na Vercel

---

## 🔒 Bezpieczeństwo

**NIE** commituj `.env` do Gita!

Zawsze używaj:
- `.env` (lokalnie, gitignore)
- `.env.example` (template, commit do Gita)
- Vercel Environment Variables (produkcja)

---

## 🐛 Troubleshooting

### Pusta strona na Vercel
✅ Sprawdź czy dodałeś Environment Variables w dashboard Vercel

### "Missing Supabase environment variables"
✅ Upewnij się, że nazwy zmiennych zaczynają się od `VITE_` (wymagane przez Vite)

### Deployment fails
✅ Sprawdź czy `npm run build` działa lokalnie
