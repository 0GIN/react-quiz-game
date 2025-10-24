# ⚡ QuizRush - Gra Quizowa Nowej Generacji

[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.10-646CFF?logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)

Nowoczesna aplikacja webowa do rozgrywania quizów online. Rywalizuj z przyjaciółmi, zdobywaj FlashPoints, wspinaj się na szczyty rankingów i zdobywaj osiągnięcia!

---

## 🎮 Funkcje

### Dla Użytkowników
- **4 Tryby Gry**
  - 🥊 **Duel** - Klasyczny pojedynek 1v1
  - 👥 **Squad** - Drużynowa rywalizacja 2v2
  - ⚡ **Blitz** - Szybka gra na czas z 3 życiami
  - 🏆 **Master** - Pojedynek w wybranej kategorii

- **System Postępu**
  - ⚡ FlashPoints - waluta w grze
  - 📈 System poziomów (XP)
  - 🏅 Osiągnięcia i odznaki
  - 🎯 Codzienne misje

- **Social Features**
  - 👥 System znajomych
  - 💬 Czat w czasie rzeczywistym
  - 🏆 Rankingi globalne i znajomych
  - 🎮 Wyzwania między graczami

- **Sklep**
  - 🛒 Kupuj awatary, motywy i ulepszenia
  - 💰 Wydawaj zdobyte FlashPoints

### Dla Administratorów
- 🛡️ Panel admina
- 📊 Zarządzanie pytaniami
- 👥 Zarządzanie użytkownikami
- 📈 Statystyki platformy

---

## 🚀 Szybki Start

### Wymagania
- Node.js 18+ 
- npm lub yarn
- Konto Supabase (darmowe)

### Instalacja

```bash
# Klonowanie repozytorium
git clone https://github.com/0GIN/react-quiz-game.git
cd react-quiz-game

# Instalacja zależności
npm install

# Konfiguracja zmiennych środowiskowych
cp .env.example .env
# Edytuj .env i dodaj swoje klucze Supabase

# Uruchomienie serwera deweloperskiego
npm run dev
```

Aplikacja będzie dostępna na `http://localhost:5173`

---

## 🗄️ Konfiguracja Bazy Danych

### 1. Utwórz projekt w Supabase
1. Przejdź na [supabase.com](https://supabase.com)
2. Utwórz nowy projekt
3. Skopiuj **URL** i **anon key** z Settings → API

### 2. Wykonaj schemat bazy danych
1. Otwórz SQL Editor w Supabase
2. Skopiuj zawartość `database/schema.sql`
3. Wykonaj skrypt (kliknij "Run")

### 3. Skonfiguruj autentykację
1. Przejdź do Authentication → Providers
2. Włącz **Email Provider**
3. **Wyłącz** "Confirm email" (dla developmentu)
4. Zapisz zmiany

Szczegółowe instrukcje: [docs/DATABASE_SETUP_GUIDE.md](docs/DATABASE_SETUP_GUIDE.md)

---

## 📁 Struktura Projektu

```
react-quiz-game/
├── src/
│   ├── components/        # Komponenty React
│   │   ├── Card.tsx
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── ...
│   ├── pages/            # Strony aplikacji
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Ranking.tsx
│   │   └── ...
│   ├── contexts/         # React Context API
│   │   └── AuthContext.tsx
│   ├── lib/              # Utility i konfiguracja
│   │   └── supabase.ts
│   ├── styles/           # Style CSS
│   │   ├── tokens.css
│   │   └── ui.css
│   └── assets/           # Obrazy, loga
├── database/             # SQL schemas
│   └── schema.sql
├── docs/                 # Dokumentacja
│   ├── AUTH_SETUP_GUIDE.md
│   ├── DATABASE_SETUP_GUIDE.md
│   ├── DATABASE_SCHEMA.md
│   ├── EXPERIENCE_SYSTEM.md
│   └── ROLES_SYSTEM.md
└── public/               # Statyczne pliki
```

---

## 🔐 System Ról

QuizRush implementuje 3-poziomowy system ról:

### 🌐 Guest (Gość)
- Dostęp do strony głównej (wersja demo)
- Przeglądanie regulaminu
- Dostęp do formularzy logowania/rejestracji

### 👤 User (Zalogowany)
- Pełny dostęp do gier
- Rankingi i statystyki
- Czat i znajomi
- Sklep i osiągnięcia

### 🛡️ Admin
- Wszystkie uprawnienia User +
- Panel administracyjny
- Zarządzanie pytaniami i użytkownikami

Szczegóły: [docs/ROLES_SYSTEM.md](docs/ROLES_SYSTEM.md)

---

## 🛠️ Technologie

### Frontend
- **React 19.1.1** - Biblioteka UI
- **TypeScript 5.x** - Typowanie statyczne
- **Vite 7.1.10** - Build tool
- **React Router DOM 6.x** - Routing

### Backend & Database
- **Supabase** - Backend as a Service
  - PostgreSQL 15+ database
  - Authentication
  - Realtime subscriptions
  - Storage

### Dev Tools
- **ESLint** - Linting
- **PostCSS** - CSS processing

---

## 📜 Skrypty NPM

```bash
# Rozwój
npm run dev          # Uruchom dev server

# Produkcja
npm run build        # Zbuduj dla produkcji
npm run preview      # Podgląd build'a

# Kod
npm run lint         # Sprawdź kod ESLintem
```

---

## 🎯 System Punktacji

### FlashPoints (FP)
- +100 FP - Wygrana w Duel
- +150 FP - Wygrana w Squad
- +50-200 FP - Wynik w Blitz
- +200 FP - Wygrana w Master
- +50 FP - Ukończenie Codziennej Misji
- +500 FP - Odblokowanie Osiągnięcia

### Experience (XP)
- +10 XP - Każde pytanie
- +25 XP - Poprawna odpowiedź
- +100 XP - Wygrana gra
- +200 XP - Bezbłędna gra (BONUS)

Formuła XP: `100 + (poziom - 1) × 50`

Szczegóły: [docs/EXPERIENCE_SYSTEM.md](docs/EXPERIENCE_SYSTEM.md)

---

## 🤝 Kontrybucja

Kontrybucje są mile widziane! 

1. Fork projektu
2. Stwórz branch (`git checkout -b feature/AmazingFeature`)
3. Commit zmian (`git commit -m 'Add some AmazingFeature'`)
4. Push do branch (`git push origin feature/AmazingFeature`)
5. Otwórz Pull Request

---

## 📄 Licencja

Ten projekt jest licencjonowany na licencji MIT - szczegóły w pliku [LICENSE](LICENSE)

---

## 👨‍💻 Autorzy

**Jan Ogiński & Szymon Mierzwicki**
- GitHub: [@0GIN](https://github.com/0GIN)

---

## 🙏 Podziękowania

- [React](https://reactjs.org/) - UI Library
- [Supabase](https://supabase.com/) - Backend Platform
- [Vite](https://vitejs.dev/) - Build Tool
- [Material Symbols](https://fonts.google.com/icons) - Icons

---

## 📞 Kontakt

Pytania? Problemy? Sugestie?



---

<div align="center">
  
**Stworzono z ⚡ przez Jan Ogiński & Szymon Mierzwicki**

[⬆ Wróć do góry](#-quizrush---gra-quizowa-nowej-generacji)

</div>

* Adding new quizzes (categories) and questions.
* Editing or deleting existing quizzes and questions.
* Managing the daily mission system (creating, editing).
* Viewing user statistics and results.
* Managing user accounts (e.g., blocking).
* Reviewing and accepting or rejecting questions submitted by users.

---

## Tech Stack

* **Frontend:** React, TypeScript, Vite
* **Backend:** (TBA - Required for the full functionality described above)
* **Database:** (TBA - Required for full functionality)

---

## Example Game Flow (Duel)

1.  A user registers or logs into the system.
2.  They check their online friends list or select the "Quick Duel" option.
3.  They send a challenge to a friend (or the system finds a random opponent) and choose a quiz category.
4.  Both players join the game.
5.  They receive the same set of questions, answering them under time pressure.
6.  After the quiz ends, the system compares the results (points and time) and announces the winner.
7.  The winner receives points for the ranking.
8.  The system checks if the duel contributed to progress in daily missions.

---

## Future Development

* Introduction of leagues and ranking seasons.
* Team game modes (e.g., 2 vs 2).
* Notification system (for friend requests, challenges, results).
* A shop where points can be exchanged for cosmetic items (avatars, profile backgrounds).
* Addition of different game modes (e.g., "Bomb," where time runs out faster).

---

## Authors

* **Jan Ogiński**
* **Szymon Mierzwicki**

---

## React + Vite Setup

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

### React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

### Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
