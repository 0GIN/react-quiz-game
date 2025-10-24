# 🚀 Quick Start Guide - React Quiz Game

## 📋 Wymagania

- Node.js 18+ 
- npm lub yarn
- Konto Supabase (dla bazy danych)

## ⚙️ Instalacja

### 1. Sklonuj repozytorium (jeśli jeszcze nie masz)
```bash
git clone <repo-url>
cd react-quiz-game-1
```

### 2. Zainstaluj zależności
```bash
npm install
```

### 3. Skonfiguruj zmienne środowiskowe

Utwórz plik `.env` w głównym katalogu projektu:

```env
VITE_SUPABASE_URL=https://twoj-projekt.supabase.co
VITE_SUPABASE_ANON_KEY=twoj-anon-key
```

> 💡 **Gdzie znaleźć te dane?**
> 1. Zaloguj się do [Supabase Dashboard](https://app.supabase.com)
> 2. Wybierz swój projekt
> 3. Idź do Settings → API
> 4. Skopiuj "Project URL" (SUPABASE_URL)
> 5. Skopiuj "anon/public key" (SUPABASE_ANON_KEY)

### 4. Uruchom bazę danych

Wykonaj skrypty SQL z folderu `database/` w kolejności:
1. `schema.sql` - struktura tabel
2. `seed-questions.sql` - przykładowe pytania
3. `seed-missions.sql` - definicje misji

> 📖 Szczegóły w `docs/DATABASE_SETUP_GUIDE.md`

### 5. Uruchom aplikację

```bash
npm run dev
```

Aplikacja dostępna pod: http://localhost:5173

---

## 🏗️ Komendy NPM

```bash
npm run dev        # Uruchom dev server
npm run build      # Build produkcyjny
npm run preview    # Preview buildu
npm run lint       # Sprawdź błędy ESLint
```

---

## 📚 Dokumentacja

- **README_CODE.md** - Kompleksowa dokumentacja kodu
- **REFACTORING_SUMMARY.md** - Podsumowanie zmian
- **docs/** - Szczegółowa dokumentacja systemów

---

## 🎮 Pierwsze Kroki

1. **Zarejestruj się** - Utwórz nowe konto
2. **Zagraj w Blitz** - Wybierz tryb Blitz z 3 życiami
3. **Sprawdź Misje** - Zobacz swoje codzienne zadania
4. **Zobacz Ranking** - Rywalizuj z innymi graczami

---

## 🔧 Struktura Projektu

```
react-quiz-game-1/
├── src/
│   ├── components/   # Komponenty UI
│   ├── pages/        # Strony aplikacji
│   ├── services/     # Logika biznesowa
│   ├── contexts/     # React Contexts
│   ├── types/        # TypeScript types
│   ├── config/       # Konfiguracja
│   └── utils/        # Narzędzia pomocnicze
├── database/         # Skrypty SQL
├── docs/             # Dokumentacja
└── public/           # Statyczne pliki
```

---

## 🆘 Rozwiązywanie Problemów

### Błąd: "Missing Supabase environment variables"
✅ Upewnij się, że plik `.env` istnieje i zawiera poprawne dane

### Błąd: "Cannot find module 'react'"
✅ Uruchom `npm install`

### Błąd bazy danych / RLS
✅ Sprawdź `docs/DATABASE_SETUP_GUIDE.md`

### Pytania nie ładują się
✅ Upewnij się, że wykonałeś `seed-questions.sql`

---

## 🎯 Główne Features

- ✅ System autentykacji (Supabase Auth)
- ✅ Tryb gry Blitz (3 życia)
- ✅ System poziomów i XP
- ✅ Flash Points (waluta)
- ✅ Codzienne misje (3 dziennie)
- ✅ System osiągnięć (10 kategorii, 5 poziomów)
- ✅ Ranking graczy
- ✅ Historia gier
- ✅ Role użytkowników (guest, user, admin)

---

## 📞 Pomoc

Jeśli masz pytania lub problemy:
1. Sprawdź dokumentację w `docs/`
2. Przeczytaj `README_CODE.md`
3. Zobacz `REFACTORING_SUMMARY.md`

---

**Miłej gry! 🎮✨**
