# 🎨 Material Icons Migration

## ✅ Zakończone

Aplikacja została zmigrowana z emoji na profesjonalne **Google Material Symbols**.

### Zmiany w kodzie:

1. **Nowy komponent:** `src/shared/ui/MaterialIcon.tsx`
   - Prosty wrapper dla Material Symbols
   - Props: `icon`, `size`, `filled`, `className`

2. **Zaktualizowane komponenty:**
   - ✅ `Home.tsx` - tryby gry używają Material Icons
   - ✅ `GameResult.tsx` - ikony wyników (trophy, celebration, thumb_up, fitness_center)
   - ✅ `GameHistory.tsx` - ikony kategorii z bazy danych

3. **Zaktualizowane style:**
   - ✅ `ui.css` - dodane style dla `.material-symbols-outlined`
   - ✅ `GameResult.css` - `.result-icon` z animacją bounce

4. **Baza danych:**
   - ✅ `quick-setup.sql` - kategorie używają Material Icons
   - ✅ `complete-setup.sql` - kategorie używają Material Icons
   - ✅ `update-categories-material-icons.sql` - skrypt do aktualizacji istniejącej bazy

---

## 📦 Material Icons zamiast emoji:

| Kategoria | Stara emoji | Nowa ikona |
|-----------|-------------|------------|
| Historia | 📜 | `history_edu` |
| Geografia | 🌍 | `public` |
| Nauka | 🔬 | `science` |
| Sport | ⚽ | `sports_soccer` |
| Kultura | 🎭 | `theater_comedy` |
| Przyroda | 🌿 | `nature` |
| Technologia | 💻 | `computer` |
| Matematyka | 🔢 | `calculate` |

| Tryb gry | Stara emoji | Nowa ikona |
|----------|-------------|------------|
| Blitz | ⚡ | `bolt` |
| Duel | 🥊 | `sports_mma` |
| Squad | 👥 | `groups` |
| Master | 🧠 | `psychology` |

| Wynik | Stara emoji | Nowa ikona |
|-------|-------------|------------|
| Doskonale (≥90%) | 🏆 | `emoji_events` |
| Świetnie (≥70%) | 🎉 | `celebration` |
| Dobra robota (≥50%) | 👍 | `thumb_up` |
| Możesz lepiej | 💪 | `fitness_center` |

---

## 🔧 Jak używać Material Icons:

### Podstawowe użycie:
```tsx
import { MaterialIcon } from '@shared/ui';

<MaterialIcon icon="science" />
<MaterialIcon icon="public" size={32} />
<MaterialIcon icon="emoji_events" filled />
```

### Props:
- `icon` (string, wymagane) - nazwa ikony z Material Symbols
- `size` (number, opcjonalne) - rozmiar w pikselach (domyślnie: 24)
- `filled` (boolean, opcjonalne) - wypełniona wersja ikony
- `className` (string, opcjonalne) - dodatkowe klasy CSS
- `style` (object, opcjonalne) - inline styles

---

## 📚 Źródła ikon:

Wszystkie ikony dostępne na: **https://fonts.google.com/icons**

Przykłady popularnych ikon:
- **Edukacja:** `school`, `menu_book`, `quiz`, `psychology`
- **Sport:** `sports_soccer`, `sports_basketball`, `sports_tennis`, `fitness_center`
- **Nauka:** `science`, `biotech`, `calculate`, `functions`
- **Technologia:** `computer`, `smartphone`, `memory`, `code`
- **UI:** `home`, `settings`, `notifications`, `person`
- **Akcje:** `play_arrow`, `pause`, `check`, `close`

---

## 🔄 Aktualizacja istniejącej bazy danych:

Jeśli masz już dane w bazie z emoji, uruchom:

```sql
-- W Supabase SQL Editor
/database/update-categories-material-icons.sql
```

To zamieni wszystkie emoji na Material Icons bez utraty danych.

---

## ✅ Zalety Material Icons:

1. **Profesjonalny wygląd** - spójne, nowoczesne ikony
2. **Skalowalne** - wektorowe, ostre na każdym rozmiarze
3. **Kolorowanie** - łatwe stylowanie przez CSS
4. **Wypełnienie** - warianty filled/outlined
5. **8000+ ikon** - ogromna biblioteka
6. **Darmowe** - Apache License 2.0

---

## 🎨 Customizacja:

### Zmiana koloru:
```css
.my-icon {
  color: #00E5FF;
}
```

### Drop shadow:
```css
.glowing-icon {
  filter: drop-shadow(0 0 8px rgba(0,229,255,0.5));
}
```

### Animacje:
```css
.spinning-icon {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

## 📝 TODO (opcjonalnie):

- [ ] Zamienić pozostałe emoji w kodzie (jeśli są)
- [ ] Dodać ikony do przycisków akcji
- [ ] Ikony w nawigacji (sidebar)
- [ ] Ikony osiągnięć (achievements)
- [ ] Ikony w sklepie (shop items)
