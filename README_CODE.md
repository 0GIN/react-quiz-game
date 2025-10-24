# 📘 Dokumentacja Kodu - React Quiz Game

## 📁 Struktura Projektu

```
src/
├── assets/              # Obrazy, logo, ikony
├── components/          # Komponenty React UI
│   ├── Layout.tsx       # Główny layout (Navbar + Sidebar + Content)
│   ├── Navbar.tsx       # Górny pasek nawigacyjny
│   ├── Sidebar.tsx      # Boczne menu (dynamiczne dla guest/user/admin)
│   ├── Hero.tsx         # Sekcja wyboru trybu gry
│   ├── Card.tsx         # Uniwersalny komponent karty
│   ├── ProgressBar.tsx  # Pasek postępu
│   ├── ExperienceBar.tsx # Pasek XP z poziomem
│   ├── ProtectedRoute.tsx # Ochrona tras dla zalogowanych
│   ├── GuestRoute.tsx   # Ochrona tras dla gości
│   └── index.ts         # Barrel export
│
├── contexts/            # React Contexts
│   └── AuthContext.tsx  # Kontekst autentykacji (user, login, logout)
│
├── pages/               # Strony aplikacji
│   ├── Home.tsx         # Dashboard główny
│   ├── Login.tsx        # Logowanie
│   ├── Register.tsx     # Rejestracja
│   ├── GameBlitz.tsx    # Tryb gry Blitz (3 życia)
│   ├── GameResult.tsx   # Podsumowanie gry
│   ├── DailyMissions.tsx # Codzienne misje
│   ├── GameHistory.tsx  # Historia gier
│   ├── Ranking.tsx      # Ranking graczy
│   ├── Rules.tsx        # Regulamin
│   └── ... (inne strony)
│
├── services/            # Logika biznesowa
│   ├── gameService.ts   # Zarządzanie grami (zapis, scoring, XP)
│   ├── missionService.ts # System misji dziennych
│   ├── questionService.ts # Pobieranie pytań
│   └── achievementService.ts # System osiągnięć
│
├── lib/                 # Biblioteki zewnętrzne
│   └── supabase.ts      # Konfiguracja Supabase Client
│
├── utils/               # Funkcje pomocnicze
│   └── logger.ts        # Warunkowe logowanie (dev/prod)
│
├── config/              # Konfiguracja
│   └── env.ts           # Zmienne środowiskowe
│
├── types/               # Typy TypeScript
│   └── index.ts         # Centralne definicje typów
│
├── styles/              # Style CSS
│   ├── tokens.css       # Design tokens (kolory, fonts)
│   ├── ui.css           # Style główne UI
│   ├── GameBlitz.css    # Style dla trybu Blitz
│   └── ...
│
└── main.tsx             # Entry point aplikacji
```

---

## 🎯 Główne Koncepcje

### 1. **Autentykacja (AuthContext)**

**Lokalizacja**: `src/contexts/AuthContext.tsx`

**Odpowiedzialność**:
- Zarządzanie stanem użytkownika (zalogowany/gość)
- Funkcje: `login()`, `register()`, `logout()`, `refreshUser()`
- Przechowywanie danych profilu i statystyk
- Sprawdzanie ról: `isGuest`, `isUser`, `isAdmin`

**Użycie**:
```tsx
import { useAuth } from '@contexts/AuthContext';

function MyComponent() {
  const { user, isGuest, login, logout } = useAuth();
  
  if (isGuest) return <p>Zaloguj się!</p>;
  return <p>Witaj {user.username}!</p>;
}
```

---

### 2. **System Gier (gameService)**

**Lokalizacja**: `src/services/gameService.ts`

**Odpowiedzialność**:
- Obliczanie punktów (Flash Points, Experience Points)
- Zarządzanie poziomami i XP
- Zapis wyniku gry do bazy danych (tabele: `games`, `game_participants`, `game_questions`, `game_answers`)
- Aktualizacja statystyk użytkownika (streak, win/loss ratio)
- Integracja z misjami i osiągnięciami

**Główne funkcje**:
- `calculateFlashPoints(result)` - Oblicza FP na podstawie wyniku
- `calculateExperience(result)` - Oblicza XP
- `calculateRequiredXP(level)` - Wymagane XP do poziomu
- `saveGameResult(userId, result)` - Zapisuje grę i aktualizuje stats

**Scoring**:
- Poprawna odpowiedź: +10 pkt bazowych
- Bonus za streak: +10/25/50 (3/5/10+ streak)
- Bonus za accuracy: +25/50/100 (75%/90%/100%)
- Bonus za życia w Blitz: +20 FP za życie

---

### 3. **System Misji Dziennych (missionService)**

**Lokalizacja**: `src/services/missionService.ts`

**Odpowiedzialność**:
- Generowanie losowych misji na dany dzień
- Inicjalizacja misji dla użytkownika
- Śledzenie postępu w czasie rzeczywistym
- Automatyczne oznaczanie ukończonych misji
- System odbierania nagród (claim rewards)

**Typy misji**:
- `play_games` - Zagraj X gier
- `win_games` - Wygraj X gier
- `perfect_game` - Ukończ grę bezbłędnie
- `earn_flash_points` - Zdobądź X FP
- `answer_category` - Odpowiedz na X pytań z kategorii

**Użycie (MissionTracker)**:
```tsx
import { MissionTracker } from '@services/missionService';

// Po zakończeniu gry
await MissionTracker.onGamePlayed(userId);
await MissionTracker.onGameWon(userId);
await MissionTracker.onPerfectGame(userId);
await MissionTracker.onFlashPointsEarned(userId, amount);
```

---

### 4. **System Osiągnięć (achievementService)**

**Lokalizacja**: `src/services/achievementService.ts`

**Odpowiedzialność**:
- Definicje kategorii osiągnięć (10 kategorii)
- Wielopoziomowe milestone'y (bronze → silver → gold → platinum → diamond)
- Automatyczne sprawdzanie i odblokowywanie
- Przyznawanie nagród (FP, XP)

**Kategorie osiągnięć**:
- 🎮 Mistrz Gry (liczba gier)
- 🏆 Legenda Wygranych (wygrane)
- 💎 Kolekcjoner Flash Points
- 📊 Ekspert Wiedzy (poprawne odpowiedzi)
- 🔥 Mistrz Streaka
- 📈 Wspinacz Poziomów
- 🧠 Encyklopedia (wszystkie odpowiedzi)
- 🎯 Snajper (80%+ win rate)
- ⚡ Błyskawica (streak 10+)
- 💯 Perfekcjonista (100% accuracy)

---

### 5. **System Pytań (questionService)**

**Lokalizacja**: `src/services/questionService.ts`

**Odpowiedzialność**:
- Pobieranie losowych pytań z bazy
- Filtrowanie po kategorii i trudności
- Automatyczne mieszanie odpowiedzi
- Weryfikacja poprawności odpowiedzi

**Użycie**:
```tsx
import { getRandomQuestions } from '@services/questionService';

const questions = await getRandomQuestions(20); // 20 losowych pytań
const questionsEasy = await getRandomQuestions(10, undefined, 'easy');
```

---

## 🛡️ Ochrona Tras (Route Guards)

### ProtectedRoute
Ochrona dla zalogowanych użytkowników.

```tsx
<Route path="/missions" element={
  <ProtectedRoute>
    <DailyMissions />
  </ProtectedRoute>
} />

// Z wymaganiem admina
<Route path="/admin" element={
  <ProtectedRoute requireAdmin>
    <AdminPanel />
  </ProtectedRoute>
} />
```

### GuestRoute
Ochrona dla niezalogowanych (login, register).

```tsx
<Route path="/login" element={
  <GuestRoute>
    <Login />
  </GuestRoute>
} />
```

---

## 🎨 Konwencje Kodu

### 1. **Nazewnictwo**
- **Komponenty**: PascalCase (`Navbar.tsx`, `GameBlitz.tsx`)
- **Funkcje**: camelCase (`saveGameResult`, `getRandomQuestions`)
- **Typy**: PascalCase (`User`, `GameResult`, `MissionType`)
- **Stałe**: UPPER_SNAKE_CASE (`ACHIEVEMENT_CATEGORIES`)

### 2. **Struktura plików**
- Każdy plik zaczyna się od komentarza JSDoc z opisem
- Importy pogrupowane: React → biblioteki → komponenty → typy → style
- Eksport defaultowy na końcu pliku

### 3. **Typy TypeScript**
- Wszystkie główne typy zdefiniowane w `src/types/index.ts`
- Używamy interfejsów dla obiektów
- Używamy type dla union types i aliasów

### 4. **Obsługa błędów**
- Każda funkcja async ma try-catch
- Zwracamy obiekty `{ success: boolean, error?: string }`
- Błędy logowane przez `logger.error()`

---

## 🔧 Konfiguracja

### Zmienne środowiskowe (.env)
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

### Dostęp do zmiennych
```tsx
import { supabaseConfig, appConfig } from '@config/env';

console.log(supabaseConfig.url);
console.log(appConfig.isDevelopment);
```

---

## 📚 Aliasy ścieżek

Zdefiniowane w `vite.config.ts` i `tsconfig.app.json`:

```tsx
import { useAuth } from '@contexts/AuthContext';
import { Card } from '@components';
import { saveGameResult } from '@services/gameService';
import type { User, GameResult } from '@types';
import logo from '@assets/logo.png';
import '@styles/ui.css';
```

---

## 🚀 Workflow Developmentu

### 1. Dodanie nowej funkcji
1. Zdefiniuj typy w `src/types/index.ts`
2. Utwórz serwis w `src/services/` (jeśli logika biznesowa)
3. Utwórz komponent w `src/components/` lub stronę w `src/pages/`
4. Dodaj komentarz JSDoc na początku pliku
5. Dodaj route w `src/main.tsx` (jeśli strona)

### 2. Dodanie nowej strony
```tsx
// src/pages/MyNewPage.tsx
/**
 * @fileoverview Opis strony
 * 
 * Funkcjonalność:
 * - Lista funkcji
 * 
 * @page
 */

export default function MyNewPage() {
  return <div>Moja nowa strona</div>;
}

// main.tsx
<Route path="/my-page" element={<MyNewPage />} />
```

### 3. Logowanie
```tsx
import { logger } from '@utils/logger';

logger.log('Info tylko w dev');
logger.error('Błąd zawsze widoczny');
logger.warn('Ostrzeżenie tylko w dev');
```

---

## 🎮 Przepływ Gry (GameBlitz)

1. **Start gry**: Pobierz 20 losowych pytań
2. **Odpowiedź**: Użytkownik wybiera odpowiedź
3. **Sprawdzenie**: Porównanie z correct_answer
4. **Feedback**: Wyświetl czy poprawna (zielony/czerwony)
5. **Update stats**: Aktualizuj score, streak, lives
6. **Kolejne pytanie**: Lub zakończ jeśli lives == 0
7. **Zapis wyniku**: `saveGameResult()` → baza danych
8. **Aktualizacja misji**: `MissionTracker` automatycznie
9. **Sprawdzenie osiągnięć**: `checkAndUnlockAchievements()`
10. **Przekierowanie**: GameResult z podsumowaniem

---

## 🗃️ Struktura Bazy Danych

**Główne tabele**:
- `users` - Użytkownicy (profil + statystyki)
- `games` - Gry (metadata)
- `game_participants` - Uczestnicy gier (score, FP, XP)
- `game_questions` - Pytania w grze
- `game_answers` - Odpowiedzi użytkowników
- `questions` - Pytania quizowe
- `categories` - Kategorie pytań
- `daily_missions` - Definicje misji
- `user_daily_missions` - Postęp misji użytkownika
- `achievements` - Definicje osiągnięć
- `user_achievements` - Odblokowane osiągnięcia

---

## ✅ Best Practices

1. **Zawsze używaj TypeScript** - nie `any`, tylko konkretne typy
2. **Walidacja na froncie i backendzie** - nigdy nie ufaj klientowi
3. **Używaj aliasów ścieżek** - czytelniejsze importy
4. **Komentarze JSDoc** - każdy plik ma opis na górze
5. **Errorhandling** - każda funkcja async ma try-catch
6. **Logowanie warunkowe** - `logger` zamiast `console.log`
7. **DRY principle** - nie duplikuj kodu, wydziel do serwisów
8. **Single Responsibility** - każdy plik/funkcja ma jedno zadanie

---

## 📞 Kontakt

W razie pytań sprawdź:
- Dokumentację Supabase: https://supabase.com/docs
- React Docs: https://react.dev
- TypeScript Handbook: https://www.typescriptlang.org/docs
