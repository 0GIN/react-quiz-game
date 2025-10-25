# 🚀 Quick Reference - Nowa Struktura Projektu

## 📍 Gdzie Co Teraz Jest?

### Komponenty

| Przed | Po | Import |
|-------|-------|--------|
| `components/Card.tsx` | `shared/ui/Card.tsx` | `import { Card } from '@shared/ui'` |
| `components/Button.tsx` | `shared/ui/Button.tsx` | `import { Button } from '@shared/ui'` |
| `components/ProtectedRoute.tsx` | `shared/components/ProtectedRoute.tsx` | `import { ProtectedRoute } from '@shared/components'` |
| `components/Navbar.tsx` | `layouts/components/Navbar.tsx` | `import { Navbar } from '@layouts/components'` |
| `pages/Login.tsx` | `features/auth/components/Login.tsx` | `import { Login } from '@features/auth'` |
| `pages/GameBlitz.tsx` | `features/game/components/GameBlitz.tsx` | `import { GameBlitz } from '@features/game'` |
| `pages/Profile.tsx` | `features/profile/components/Profile.tsx` | `import { Profile } from '@features/profile'` |

### Utils i Helpers

| Przed | Po | Import |
|-------|-------|--------|
| `utils/logger.ts` | `shared/utils/logger.ts` | `import { logger } from '@shared/utils'` |
| - | `shared/utils/format.ts` | `import { formatNumber } from '@shared/utils'` |
| - | `shared/utils/validators.ts` | `import { validateEmail } from '@shared/utils'` |

### Services → API

| Przed | Po | Import |
|-------|-------|--------|
| `services/questionService.ts` | `api/modules/questions.ts` | `import { getRandomQuestions } from '@api/modules/questions'` |
| `services/gameService.ts` | `api/modules/game.ts` | `import { saveGameResult } from '@api/modules/game'` |
| `services/profileService.ts` | `api/modules/profile.ts` | `import { getProfile } from '@api/modules/profile'` |

### Contexts

| Przed | Po | Import |
|-------|-------|--------|
| `contexts/AuthContext.tsx` | `features/auth/contexts/AuthContext.tsx` | `import { useAuth } from '@features/auth'` |

### Constants

| Dodane | Path | Import |
|--------|------|--------|
| Game config | `constants/game.ts` | `import { GAME_MODES } from '@constants'` |
| Routes | `constants/routes.ts` | `import { ROUTES } from '@constants'` |
| Theme | `constants/theme.ts` | `import { THEME } from '@constants'` |
| Validation | `constants/validation.ts` | `import { VALIDATION_RULES } from '@constants'` |

---

## 🎯 Path Aliases

```typescript
@/              → src/
@features/      → src/features/
@shared/        → src/shared/
@api/           → src/api/
@hooks/         → src/hooks/
@layouts/       → src/layouts/
@routes/        → src/routes/
@constants/     → src/constants/
@lib/           → src/lib/
@config/        → src/config/
@types/         → src/types/
@assets/        → src/assets/
@styles/        → src/styles/
```

---

## 💡 Przykłady Użycia

### Importowanie UI Components
```typescript
// ✅ Dobrze
import { Button, Input, Card, Badge, Spinner } from '@shared/ui';

// ❌ Źle
import Button from '../../../../shared/ui/Button';
```

### Importowanie Utils
```typescript
// ✅ Dobrze
import { logger, formatNumber, validateEmail } from '@shared/utils';

// ❌ Źle
import { logger } from '../../../shared/utils/logger';
```

### Importowanie z Features
```typescript
// ✅ Dobrze
import { Login, Register, useAuth } from '@features/auth';
import { GameBlitz, useGame } from '@features/game';

// ❌ Źle
import Login from '../../../features/auth/components/Login';
```

### Importowanie Constants
```typescript
// ✅ Dobrze
import { ROUTES, GAME_MODES, THEME } from '@constants';

// ❌ Źle
import { ROUTES } from '../../../constants/routes';
```

### Używanie API Client
```typescript
// ✅ Dobrze
import { apiClient } from '@api/client';

const data = await apiClient.execute(() =>
  supabase.from('users').select('*')
);

// ❌ Źle (bezpośrednio Supabase bez error handling)
const { data, error } = await supabase.from('users').select('*');
```

### Używanie Custom Hooks
```typescript
// ✅ Dobrze
import { useLocalStorage, useDebounce } from '@shared/hooks';

const [theme, setTheme] = useLocalStorage('theme', 'dark');
const debouncedSearch = useDebounce(searchTerm, 300);
```

---

## 🏗️ Struktura Feature

Każda feature ma standardową strukturę:

```
features/
└── my-feature/
    ├── components/       # UI components
    │   └── MyComponent.tsx
    ├── hooks/           # Custom hooks
    │   └── useMyFeature.ts
    ├── contexts/        # Context API (opcjonalne)
    │   └── MyContext.tsx
    ├── types/           # TypeScript types (opcjonalne)
    │   └── index.ts
    └── index.ts         # Barrel export
```

**Przykład barrel export:**
```typescript
// features/my-feature/index.ts
export * from './components/MyComponent';
export * from './hooks/useMyFeature';
```

---

## 🎨 Shared UI Components

### Button
```typescript
<Button 
  variant="primary" | "secondary" | "danger" | "ghost"
  size="sm" | "md" | "lg"
  isLoading={boolean}
>
  Click me
</Button>
```

### Input
```typescript
<Input
  label="Email"
  type="email"
  error="Error message"
  helperText="Helper text"
  placeholder="Enter email..."
/>
```

### Badge
```typescript
<Badge 
  variant="default" | "success" | "warning" | "error" | "info"
  size="sm" | "md" | "lg"
>
  New
</Badge>
```

### Spinner
```typescript
<Spinner size="sm" | "md" | "lg" | "xl" />
```

---

## 🪝 Shared Hooks

### useLocalStorage
```typescript
const [value, setValue] = useLocalStorage<string>('key', 'defaultValue');
```

### useDebounce
```typescript
const debouncedValue = useDebounce(value, 300); // 300ms delay
```

### useAsync
```typescript
const { data, loading, error, execute, reset } = useAsync(
  async () => fetchData(),
  true // immediate execution
);
```

---

## 🛡️ Error Handling

### ErrorBoundary
```typescript
import { ErrorBoundary } from '@shared/components';

<ErrorBoundary 
  onReset={() => console.log('Reset')}
  fallback={<CustomErrorUI />}
>
  <YourComponent />
</ErrorBoundary>
```

### LoadingFallback
```typescript
import { LoadingFallback } from '@shared/components';
import { Suspense } from 'react';

<Suspense fallback={<LoadingFallback message="Loading..." />}>
  <LazyComponent />
</Suspense>
```

---

## 🔧 Utility Functions

### Format
```typescript
import { 
  formatNumber,      // 1000 → "1 000"
  formatPercentage,  // (3, 10) → "30%"
  formatTime,        // 125 → "2:05"
  formatDate,        // Date → "25 października 2025"
  truncate          // "Long text..." → "Long..."
} from '@shared/utils';
```

### Validators
```typescript
import {
  validateUsername,
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateBio
} from '@shared/utils';

const error = validateEmail(email); // string | null
```

---

## 📝 Constants

### Game Constants
```typescript
import { GAME_MODES, GAME_CONFIG, DIFFICULTY_LEVELS } from '@constants';

const mode = GAME_MODES.BLITZ;
const livesCount = GAME_CONFIG.BLITZ.INITIAL_LIVES;
```

### Routes
```typescript
import { ROUTES } from '@constants';

navigate(ROUTES.PROFILE);
navigate(ROUTES.GAME_BLITZ);
```

### Theme
```typescript
import { THEME } from '@constants';

const primaryColor = THEME.colors.primary;
const spacing = THEME.spacing.md;
```

### Validation Rules
```typescript
import { VALIDATION_RULES } from '@constants';

const minLength = VALIDATION_RULES.username.minLength;
```

---

## 📚 Więcej Informacji

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Szczegółowy opis architektury
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Instrukcja migracji
- **[SUMMARY.md](./SUMMARY.md)** - Pełne podsumowanie zmian

---

**Keep this file handy! 📌**
