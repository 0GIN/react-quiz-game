# 🚀 Instrukcja Migracji do Nowej Struktury

## ✅ Co Zostało Zrobione

### 1. **Utworzona Nowa Struktura Folderów** ✅
```
src/
├── api/               # Warstwa API z error handling
├── features/          # Feature-based architecture
├── shared/            # Reusable components i utilities
├── layouts/           # Layout components
├── routes/            # Routing configuration
├── hooks/             # Global custom hooks
├── constants/         # Stałe i konfiguracje
└── ...
```

### 2. **Stworzone Kluczowe Pliki** ✅
- ✅ `constants/` - game.ts, routes.ts, theme.ts, validation.ts
- ✅ `api/client.ts` - API client z error handling
- ✅ `shared/ui/` - Button, Input, Badge, Spinner
- ✅ `shared/utils/` - format.ts, validators.ts
- ✅ `routes/index.tsx` - Centralna konfiguracja routingu
- ✅ `vite.config.ts` - Optymalizacje build (code splitting, chunking)
- ✅ `tsconfig.app.json` - Nowe path aliases

### 3. **Barrel Exports** ✅
Utworzone pliki `index.ts` dla wszystkich modułów:
- `constants/index.ts`
- `shared/ui/index.ts`
- `shared/components/index.ts`
- `features/*/index.ts`
- `api/index.ts`

### 4. **Dokumentacja** ✅
- ✅ `ARCHITECTURE.md` - Szczegółowy opis struktury
- ✅ Ten plik - Instrukcja migracji

---

## 📋 Co Trzeba Jeszcze Zrobić (Ręcznie)

### Faza 1: Migracja Komponentów (Priorytet: WYSOKI)

#### 1.1 Przeniesienie komponentów Auth
```bash
# Login i Register
mv src/pages/Login.tsx src/features/auth/components/Login.tsx
mv src/pages/Register.tsx src/features/auth/components/Register.tsx

# AuthContext
mv src/contexts/AuthContext.tsx src/features/auth/contexts/AuthContext.tsx

# ProtectedRoute i GuestRoute
mv src/components/ProtectedRoute.tsx src/shared/components/ProtectedRoute.tsx
mv src/components/GuestRoute.tsx src/shared/components/GuestRoute.tsx
```

**Następnie zaktualizuj importy w tych plikach:**
```typescript
// Przed:
import { useAuth } from '../contexts/AuthContext';

// Po:
import { useAuth } from '@features/auth';
```

#### 1.2 Przeniesienie komponentów Game
```bash
# Game pages
mv src/pages/GameBlitz.tsx src/features/game/components/GameBlitz.tsx
mv src/pages/GameResult.tsx src/features/game/components/GameResult.tsx
mv src/pages/GameHistory.tsx src/features/game/components/GameHistory.tsx
```

**Zaktualizuj importy:**
```typescript
// Przed:
import { getRandomQuestions } from '../services/questionService';

// Po:
import { getRandomQuestions } from '@api/modules/questions';
```

#### 1.3 Przeniesienie komponentów Profile
```bash
mv src/pages/Profile.tsx src/features/profile/components/Profile.tsx
```

#### 1.4 Przeniesienie komponentów Shop
```bash
mv src/pages/Shop.tsx src/features/shop/components/Shop.tsx
```

#### 1.5 Przeniesienie komponentów Social
```bash
mv src/pages/Friends.tsx src/features/social/components/Friends.tsx
mv src/pages/FriendSearch.tsx src/features/social/components/FriendSearch.tsx
mv src/pages/Chat.tsx src/features/social/components/Chat.tsx
```

#### 1.6 Przeniesienie komponentów Admin
```bash
mv src/pages/AddQuestion.tsx src/features/admin/components/AddQuestion.tsx
mv src/pages/AdminPanel.tsx src/features/admin/components/AdminPanel.tsx
```

#### 1.7 Przeniesienie Shared Components
```bash
mv src/components/ExperienceBar.tsx src/shared/components/ExperienceBar.tsx
mv src/components/StatsGrid.tsx src/shared/components/StatsGrid.tsx
mv src/components/AchievementBadge.tsx src/shared/components/AchievementBadge.tsx
mv src/components/CategoryCard.tsx src/shared/components/CategoryCard.tsx
mv src/components/GameModeCard.tsx src/shared/components/GameModeCard.tsx
mv src/components/Hero.tsx src/shared/components/Hero.tsx
```

---

### Faza 2: Migracja Serwisów do API (Priorytet: WYSOKI)

#### 2.1 Stwórz moduły API
```bash
# Skopiuj i zaktualizuj services jako api modules
cp src/services/questionService.ts src/api/modules/questions.ts
cp src/services/gameService.ts src/api/modules/game.ts
cp src/services/profileService.ts src/api/modules/profile.ts
cp src/services/shopService.ts src/api/modules/shop.ts
cp src/services/achievementService.ts src/api/modules/achievements.ts
```

#### 2.2 Zaktualizuj moduły API
W każdym pliku `src/api/modules/*.ts`:
1. Zmień import Supabase:
```typescript
// Przed:
import { supabase } from '../lib/supabase';

// Po:
import { supabase } from '@lib/supabase';
import { apiClient } from '@api/client';
```

2. Użyj `apiClient.execute()` dla lepszego error handling:
```typescript
// Przed:
const { data, error } = await supabase.from('questions').select('*');
if (error) throw error;
return data;

// Po:
return await apiClient.execute(() => 
  supabase.from('questions').select('*')
);
```

#### 2.3 Stwórz hooks dla każdej feature

**Przykład: `src/features/auth/hooks/useAuth.ts`**
```typescript
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

**Przykład: `src/features/game/hooks/useGame.ts`**
```typescript
import { useState } from 'react';
import { saveGameResult } from '@api/modules/game';
import type { GameResult } from '@types';

export function useGame() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveGame = async (result: GameResult) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const stats = await saveGameResult(result);
      return stats;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { saveGame, isLoading, error };
}
```

---

### Faza 3: Aktualizacja Importów (Priorytet: ŚREDNI)

#### 3.1 Globalna zamiana importów

**Użyj VS Code Find & Replace (Ctrl/Cmd + Shift + H):**

1. **Zmiana importów UI components:**
```
Find:    from '\.\./components/Card'
Replace: from '@shared/ui'
```

2. **Zmiana importów utils:**
```
Find:    from '\.\./utils/logger'
Replace: from '@shared/utils'
```

3. **Zmiana importów contexts:**
```
Find:    from '\.\./contexts/AuthContext'
Replace: from '@features/auth'
```

4. **Zmiana importów services:**
```
Find:    from '\.\./services/
Replace: from '@api/modules/
```

#### 3.2 Zaktualizuj main.tsx
```typescript
// Przed:
import Layout from './components/Layout'
import Home from './pages/Home'

// Po:
import { MainLayout } from '@layouts'
import Home from '@pages/Home'
```

---

### Faza 4: Optymalizacje (Priorytet: NISKI)

#### 4.1 Dodaj Custom Hooks (opcjonalne)

**`src/shared/hooks/useLocalStorage.ts`**
```typescript
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key, value]);

  return [value, setValue] as const;
}
```

**`src/shared/hooks/useDebounce.ts`**
```typescript
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

#### 4.2 Dodaj Error Boundaries (opcjonalne)

**`src/shared/components/ErrorBoundary.tsx`**
```typescript
import { Component, type ReactNode } from 'react';
import { logger } from '@shared/utils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    logger.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Coś poszło nie tak</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 🧪 Testowanie Po Migracji

### 1. Sprawdź czy aplikacja się buduje
```bash
npm run build
```

### 2. Sprawdź czy nie ma błędów TypeScript
```bash
npx tsc --noEmit
```

### 3. Uruchom aplikację i przetestuj wszystkie funkcje
```bash
npm run dev
```

**Checklist testowania:**
- [ ] Logowanie i rejestracja działa
- [ ] Gra Blitz uruchamia się i kończy poprawnie
- [ ] Profile użytkownika wyświetla się
- [ ] Ranking i historia działa
- [ ] Shop wyświetla przedmioty
- [ ] Panel admina jest dostępny dla adminów
- [ ] Wszystkie linki w nawigacji działają

---

## 📊 Monitoring Wydajności

### Przed i po migracji sprawdź:

**Bundle size:**
```bash
npm run build
# Sprawdź rozmiary chunks w dist/assets/
```

**Lighthouse score:**
- Otwórz DevTools → Lighthouse
- Uruchom audit dla Performance

**Expected improvements:**
- ✅ Mniejsze initial bundle (dzięki code splitting)
- ✅ Lepszy cache (vendor chunks oddzielnie)
- ✅ Szybsze rebuildy w dev (lepsze HMR)

---

## 🆘 Troubleshooting

### Problem: "Cannot find module '@features/...'"
**Rozwiązanie:** Sprawdź czy `tsconfig.app.json` i `vite.config.ts` mają poprawne path aliases

### Problem: Circular dependency warning
**Rozwiązanie:** Nie importuj z `index.ts` w tym samym folderze, importuj bezpośrednio z pliku

### Problem: Błędy TypeScript po migracji
**Rozwiązanie:** 
1. Usuń `node_modules/.vite` i `.tsbuildinfo`
2. Uruchom `npm install`
3. Restart VS Code

---

## 📚 Dodatkowe Resources

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Pełny opis struktury
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Vite Guide](https://vitejs.dev/guide/)

---

**Powodzenia w migracji! 🚀**

Jeśli potrzebujesz pomocy, sprawdź ARCHITECTURE.md lub skonsultuj się z zespołem.
