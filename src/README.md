# Struktura projektu SynapseClash / QuizRush

## 📁 Organizacja folderów

```
src/
├── assets/          # Zasoby graficzne (loga, avatary)
├── components/      # Komponenty React wielokrotnego użytku
├── pages/          # Komponenty stron/widoków
├── styles/         # Globalne style CSS
├── App.tsx         # Główny komponent aplikacji
└── main.tsx        # Entry point aplikacji
```

## 📂 Szczegółowy opis

### `/assets`
Pliki graficzne używane w aplikacji:
- `notext_logo.png` - Logo aplikacji bez tekstu (ikona)
- `text_logo.png` - Pełne logo z tekstem
- `guest_avatar.png` - Avatar domyślny dla użytkownika

### `/components`
Komponenty wielokrotnego użytku:
- `Navbar.tsx` - Górny pasek nawigacyjny
- `Sidebar.tsx` - Boczne menu nawigacyjne
- `Hero.tsx` - Sekcja hero z przyciskami CTA
- `Card.tsx` - Uniwersalna karta z tytułem
- `ProgressBar.tsx` - Pasek postępu dla misji

### `/pages`
Komponenty głównych widoków:
- `Home.tsx` - Strona główna (dashboard)

### `/styles`
Globalne style:
- `tokens.css` - Zmienne CSS (kolory, cienie, radiusy)
- `ui.css` - Style komponentów i layoutu

## 🎨 System stylowania

### Zmienne CSS (tokens)
```css
--bg: #0A0A1A          /* Tło główne */
--card-bg: #1A1A2E     /* Tło kart */
--cyane: #00E5FF       /* Neon cyan */
--purple: #B400FF      /* Neon fiolet */
--green: #00FF8C       /* Neon zielony */
```

### Konwencje nazewnicze
- Komponenty: PascalCase (`Navbar.tsx`)
- Style: kebab-case (`.hero-cta`)
- Zmienne CSS: kebab-case z prefiksem (`--cyane`)

## 🚀 Dodawanie nowych komponentów

1. Utwórz plik w `/components/NazwaKomponentu.tsx`
2. Dodaj style w `/styles/ui.css`
3. Zaimportuj w odpowiedniej stronie

## 📝 Notatki
- Używamy emoji dla ikon menu (wydajność + prostota)
- Glassmorphism + neon glow dla efektów wizualnych
- Responsywność: mobile-first approach
- Accessibility: aria-labels, role attributes
