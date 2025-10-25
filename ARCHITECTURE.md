# 📁 Profesjonalna Struktura Projektu - React Quiz Game

## 🎯 Architektura: Feature-Based + Domain-Driven Design

Projekt został zreorganizowany według **profesjonalnych standardów** dla aplikacji React/TypeScript scale-up.

---

## 📂 Rzeczywista Struktura Projektu

```
src/
├── api/                    # 🌐 Warstwa API
│   ├── client.ts          # API client z error handling
│   ├── modules/           # Moduły API (auth, game, profile, shop, questions)
│   │   ├── auth.ts
│   │   ├── game.ts
│   │   ├── profile.ts
│   │   ├── shop.ts
│   │   └── questions.ts
│   ├── types/             # Typy request/response
│   │   ├── requests.ts
│   │   └── responses.ts
│   └── index.ts
│
├── features/              # 🎨 Funkcjonalności (Feature-based)
│   ├── auth/             # Autoryzacja i rejestracja
│   │   ├── components/   # Login.tsx, Register.tsx
│   │   ├── contexts/     # AuthContext.tsx
│   │   ├── hooks/        # useAuth.ts
│   │   └── index.ts
│   │
│   ├── game/             # Logika gier
│   │   ├── components/   # GameBlitz.tsx, GameResult.tsx, GameHistory.tsx
│   │   ├── hooks/        # (placeholder)
│   │   └── index.ts
│   │
│   ├── profile/          # Profile użytkownika
│   │   ├── components/   # Profile.tsx
│   │   ├── hooks/        # (placeholder)
│   │   └── index.ts
│   │
│   ├── shop/             # Sklep
│   │   ├── components/   # Shop.tsx
│   │   ├── hooks/        # (placeholder)
│   │   └── index.ts
│   │
│   ├── social/           # Funkcje społecznościowe
│   │   ├── components/   # Friends.tsx, Chat.tsx, FriendSearch.tsx
│   │   ├── hooks/        # (placeholder)
│   │   └── index.ts
│   │
│   ├── admin/            # Panel administracyjny
│   │   ├── components/   # AdminPanel.tsx, AddQuestion.tsx
│   │   ├── hooks/        # (placeholder)
│   │   └── index.ts
│   │
│   └── index.ts
│
├── shared/               # 🔧 Współdzielone komponenty
│   ├── ui/              # Atomic UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Spinner.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Layout.tsx    # Simple wrapper component
│   │   └── index.ts
│   │
│   ├── components/      # Business components
│   │   ├── ProtectedRoute.tsx
│   │   ├── GuestRoute.tsx
│   │   ├── ExperienceBar.tsx
│   │   ├── StatsGrid.tsx
│   │   ├── Hero.tsx
│   │   ├── AchievementBadge.tsx
│   │   ├── CategoryCard.tsx
│   │   ├── GameModeCard.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── LoadingFallback.tsx
│   │   └── index.ts
│   │
│   ├── hooks/          # Custom React hooks
│   │   ├── useLocalStorage.ts
│   │   ├── useDebounce.ts
│   │   ├── useAsync.ts
│   │   └── index.ts
│   │
│   ├── utils/          # Utility functions
│   │   ├── logger.ts
│   │   ├── format.ts
│   │   ├── validators.ts
│   │   └── index.ts
│   │
│   └── index.ts
│
├── layouts/             # 🎨 Layout components
│   ├── MainLayout.tsx
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── index.ts
│   └── index.ts
│
├── pages/              # 📄 Page components (legacy - tylko dla stron bez features)
│   ├── Home.tsx        # Strona główna
│   ├── Rules.tsx       # Zasady
│   ├── Ranking.tsx     # Ranking
│   ├── TopPlayers.tsx  # Top gracze
│   └── Settings.tsx    # Ustawienia
│
├── routes/             # 🛣️ Routing configuration
│   └── index.tsx       # Konfiguracja tras (placeholder)
│
├── hooks/              # 🪝 Global custom hooks (legacy)
│   └── (empty)
│
├── constants/          # 📋 Stałe i konfiguracje
│   ├── game.ts        # Konfiguracja gier, tryby, mnożniki
│   ├── routes.ts      # Definicje ścieżek
│   ├── theme.ts       # Kolory, spacing, typography
│   ├── validation.ts  # Reguły walidacji
│   └── index.ts
│
├── services/           # 📡 API Services (legacy - do migracji do api/modules)
│   ├── gameService.ts
│   ├── profileService.ts
│   ├── questionService.ts
│   ├── shopService.ts
│   └── achievementService.ts
│
├── types/             # 📝 TypeScript types
│   └── index.ts       # Globalne typy
│
├── lib/               # 📚 External libraries config
│   └── supabase.ts    # Supabase client
│
├── config/            # ⚙️ App configuration
│   └── env.ts         # Environment variables
│
├── assets/            # 🖼️ Static assets
│   └── *.png          # Images, logos
│
├── styles/            # 🎨 Global styles
│   ├── tokens.css     # CSS variables
│   ├── ui.css         # Base UI styles
│   ├── GameBlitz.css  # Specific game styles
│   ├── GameResult.css
│   └── GameHistory.css
│
├── data/              # 📊 Static data
│   └── fallbackQuestions.ts
│
├── utils/             # 🔧 Utilities (legacy)
│   └── logger.ts
│
└── main.tsx           # 🚀 Entry point
```

---

## 🔑 Kluczowe Zasady

### 1. **Feature-Based Architecture**
Każda funkcjonalność (feature) ma swoją własną strukturę:
- `components/` - komponenty UI dedykowane dla tej funkcjonalności
- `hooks/` - custom hooks dla logiki biznesowej
- `contexts/` - context API (jeśli potrzebne)
- `types/` - typy TypeScript (jeśli potrzebne)

### 2. **Separation of Concerns**
- **`api/`** - komunikacja z backendem (Supabase)
- **`features/`** - logika biznesowa
- **`shared/`** - reusable components i utilities
- **`constants/`** - stałe wartości (nie logika!)

### 3. **Atomic Design (shared/ui)**
Komponenty UI są podzielone według złożoności:
- **Atoms** - Button, Input, Badge (podstawowe)
- **Molecules** - Card, ProgressBar (złożone z atoms)
- **Organisms** - StatsGrid, ExperienceBar (złożone komponenty biznesowe)

### 4. **Path Aliases**
Używaj aliasów dla czystych importów:

```typescript
// ✅ Dobrze
import { Button } from '@shared/ui';
import { ROUTES } from '@constants';
import { apiClient } from '@api/client';

// ❌ Źle
import { Button } from '../../../../shared/ui/Button';
```

### 5. **Barrel Exports**
Każdy folder powinien mieć `index.ts`:

```typescript
// shared/ui/index.ts
export { default as Button } from './Button';
export { default as Input } from './Input';
export { default as Card } from './Card';
```

---

## ⚡ Optymalizacje Wydajności

### 1. **Code Splitting**
- Lazy loading wszystkich page components
- Feature-based chunking (automatyczne w Vite)
- Vendor chunking (React, Supabase oddzielnie)

### 2. **Tree Shaking**
- ESM modules dla lepszego tree-shaking
- Named exports zamiast default (gdzie możliwe)

### 3. **Build Optimization**
- Minifikacja z esbuild (szybsza niż terser)
- Usuwanie console.log w produkcji
- Optymalizacja chunk size

### 4. **Caching Strategy**
- Vendor chunks z hash dla długiego cache
- Feature chunks dla selective invalidation

---

## 🚀 Jak Używać Nowej Struktury

### Dodawanie nowej funkcjonalności:

1. Utwórz folder w `features/`:
```bash
src/features/my-feature/
├── components/
│   └── MyComponent.tsx
├── hooks/
│   └── useMyFeature.ts
└── index.ts
```

2. Dodaj barrel export:
```typescript
// features/my-feature/index.ts
export * from './components/MyComponent';
export * from './hooks/useMyFeature';
```

3. Używaj w aplikacji:
```typescript
import { MyComponent, useMyFeature } from '@features/my-feature';
```

### Dodawanie nowego UI component:

1. Utwórz w `shared/ui/`:
```typescript
// shared/ui/MyButton.tsx
export default function MyButton() { ... }
```

2. Dodaj do barrel export:
```typescript
// shared/ui/index.ts
export { default as MyButton } from './MyButton';
```

3. Używaj:
```typescript
import { MyButton } from '@shared/ui';
```

---

## 📊 Comparison: Przed vs Po

| Aspekt | Przed | Po |
|--------|-------|-----|
| **Struktura** | Type-based (components/, pages/, contexts/) | Feature-based (features/, shared/) |
| **Komponenty** | Wszystko w components/ | UI w shared/ui/, business w shared/components/ |
| **Features** | Rozproszone w pages/ | Zgrupowane w features/ (auth, game, profile, etc.) |
| **Contexts** | src/contexts/ | features/*/contexts/ (lokalne dla feature) |
| **Skalowanie** | Trudne (wszystko w jednym folderze) | Łatwe (każda feature izolowana) |
| **Imports** | Relatywne (`../../../`) | Path aliases (`@features/`, `@shared/`) |
| **Code Splitting** | Manualne | Automatyczne (feature-based chunks) |
| **Reusability** | Niska (brak separacji UI/business) | Wysoka (shared/ui dla atomic components) |
| **Maintainability** | ⭐⭐ | ⭐⭐⭐⭐⭐ |

## ✅ Stan Migracji

| Folder | Status | Uwagi |
|--------|--------|-------|
| **features/auth/** | ✅ Zmigrowaneflush | Login, Register, AuthContext, useAuth |
| **features/game/** | ✅ Zmigrowane | GameBlitz, GameResult, GameHistory |
| **features/profile/** | ✅ Zmigrowane | Profile |
| **features/shop/** | ✅ Zmigrowane | Shop |
| **features/social/** | ✅ Zmigrowane | Friends, Chat, FriendSearch |
| **features/admin/** | ✅ Zmigrowane | AdminPanel, AddQuestion |
| **shared/ui/** | ✅ Utworzone | Button, Input, Card, Badge, Spinner, ProgressBar, Layout |
| **shared/components/** | ✅ Utworzone | ProtectedRoute, GuestRoute, Hero, ExperienceBar, StatsGrid, etc. |
| **shared/hooks/** | ✅ Utworzone | useLocalStorage, useDebounce, useAsync |
| **shared/utils/** | ✅ Utworzone | logger, format, validators |
| **layouts/** | ✅ Utworzone | MainLayout, Navbar, Sidebar |
| **api/modules/** | ⏳ Placeholder | Do migracji z services/ |
| **services/** | 🔶 Legacy | Do usunięcia po migracji do api/modules/ |
| **pages/** | 🔶 Częściowo | Pozostały: Home, Rules, Ranking, TopPlayers, Settings |
| **components/** | ✅ Usunięte | Przeniesione do shared/ i layouts/ |
| **contexts/** | ✅ Usunięte | Przeniesione do features/auth/contexts/ |

---

## 🎓 Best Practices

1. **Jeden folder = Jedna odpowiedzialność**
2. **Shared tylko dla truly reusable things**
3. **Features są izolowane** (nie importuj z innych features)
4. **API layer zawsze przez client** (nie bezpośrednio Supabase)
5. **Constants dla wartości, nie logiki**
6. **Hooks dla logiki, components dla UI**

---

## 📚 Dodatkowe Resources

- [Feature-Sliced Design](https://feature-sliced.design/)
- [Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/)
- [Vite Optimization Guide](https://vitejs.dev/guide/build.html)
- [React Best Practices 2024](https://react.dev/learn)

---

**Autor:** AI Assistant
**Data:** 2025-10-25
**Wersja:** 2.0 - Professional Structure
