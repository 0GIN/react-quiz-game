# 🎮 System Balansowania Doświadczenia (XP)

## 📋 Przegląd

Nowy system balansuje rozgrywkę poprzez progresywne nagrody i kary w zależności od wyniku gry. System jest zaprojektowany tak, aby:
- **Motywować** do lepszej gry poprzez rosnące nagrody
- **Karać** bardzo słabe wyniki, aby utrzymać poziomy rzetelne
- **Umożliwić utratę poziomu** przy przegranych w trybach PVP

---

## ⚡ BLITZ (Solo) - Progresywny System

### Mechanika Nagród/Kar:

| Poprawne odpowiedzi | XP Reward | Opis |
|---|---|---|
| **0-3** | `-50 do -20 XP` | ❌ Kara za bardzo słabą grę (utrata wszystkich żyć szybko) |
| **4-7** | `-15 do 0 XP` | ⚠️ Słaby wynik - bez zysków lub lekka kara |
| **8-12** | `0 do +30 XP` | 📈 Średni wynik - zaczyna się nagroda |
| **13-20** | `+40 do +100 XP` | ✅ Dobry wynik - solidna nagroda |
| **21+** | `+110 do +200 XP` | 🌟 Świetny wynik - maksymalna nagroda (cap) |

### Dodatkowe Bonusy:
- **Accuracy 80%+**: +20 XP
- **Accuracy 90%+**: +30 XP  
- **Perfekcja (100%)**: +50 XP (min. 10 pytań)
- **Pozostałe życia**: +10 XP za każde
- **Streak**: +3 XP za każdy (max +30)

### FlashPoints:
- Zakres: **50-200 FP** zależnie od wyniku
- Bonusy za streak, accuracy, przetrwanie

---

## 🥊 DUEL (PVP) - System Kar i Nagród

### Wyniki:

| Wynik | FlashPoints | Experience | Streak | Uwagi |
|---|---|---|---|---|
| **🏆 Wygrana** | `+100 FP` | `+150 XP` | +1 | Pozytywna presja |
| **💔 Przegrana** | `+0 FP` | **`-30 XP`** | Reset | ⚠️ **Możliwa utrata poziomu!** |
| **🤝 Remis** | `+50 FP` | `+75 XP` | Bez zmian | Uczciwy kompromis |

### Konsekwencje Przegranych:
- **-30 XP może spowodować spadek poziomu** jeśli XP spadnie poniżej 0
- System automatycznie cofa poziomy do momentu, aż XP będzie >= 0
- **Minimalny poziom to 1** (nie można spaść niżej)
- **Przykład**: Gracz Level 5 z 10/506 XP → przegrywa → -30 XP = -20 XP → spada do Level 4 z 486/339 XP

---

## 📊 System Poziomów

### Formuła wymaganego XP:
```
XP_required = 100 × (1.5 ^ (level - 1))
```

### Przykłady wymagań:
| Poziom | XP Required | Skumulowane XP |
|---|---|---|
| 1 → 2 | 100 | 100 |
| 2 → 3 | 150 | 250 |
| 3 → 4 | 225 | 475 |
| 5 → 6 | 506 | 1,394 |
| 10 → 11 | 3,844 | 25,253 |
| 20 → 21 | 292,382 | 2,908,751 |

---

## 🔄 Instalacja w Bazie Danych

### Krok 1: Uruchom skrypt SQL
```bash
# W Supabase SQL Editor:
```
1. Otwórz: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
2. Wklej zawartość pliku `update-exp-balancing-system.sql`
3. Kliknij **Run**

### Krok 2: Weryfikacja
Skrypt automatycznie:
- ✅ Tworzy/aktualizuje funkcję `calculate_required_xp()`
- ✅ Tworzy/aktualizuje funkcję `update_user_level()`
- ✅ Aktualizuje funkcję `complete_duel_match()`
- ✅ Pokazuje przykładowe wymagania XP dla poziomów 1-10

---

## 🎯 Strategia dla Graczy

### BLITZ:
- **Cel**: Minimum 13 poprawnych odpowiedzi dla pozytywnego XP
- **Bezpiecznie**: 8-12 poprawnych to 0-30 XP (bez ryzyka)
- **Ryzyko**: Poniżej 8 poprawnych = kara XP

### DUEL:
- **Granie ostrożne**: Wybieraj kategorie, które znasz
- **Ryzyko**: Każda przegrana to -30 XP → możliwa utrata poziomu
- **Nagroda**: Wygrana daje +150 XP → szybki awans
- **Strategia**: Nie wyzywaj graczy znacznie wyżej poziomem!

---

## 🧪 Testowanie

### Test 1: Blitz - Bardzo słaby wynik
```
Poprawne: 2, Błędne: 3, Życia: 0
Oczekiwane: ~-40 XP
```

### Test 2: Blitz - Średni wynik
```
Poprawne: 10, Błędne: 5, Życia: 1
Oczekiwane: ~25-35 XP (z bonusami)
```

### Test 3: Blitz - Świetny wynik
```
Poprawne: 25, Błędne: 2, Życia: 3, Streak: 10
Oczekiwane: ~200 XP (cap)
```

### Test 4: Duel - Przegrana na niskim XP
```
Gracz: Level 3, XP: 20/225
Przegrana: -30 XP
Oczekiwane: Level 2, XP: 140/150 (cofnięcie poziomu)
```

---

## 📝 Notatki dla Deweloperów

### Frontend (TypeScript):
- `calculateExperience()` w `gameService.ts` - **już zaktualizowane** ✅
- Obsługa ujemnych wartości XP
- Display negative XP w UI jako czerwony tekst

### Backend (SQL):
- `update_user_level()` - obsługuje zarówno zyski jak i straty XP
- `complete_duel_match()` - przyznaje -30 XP dla przegranego
- Automatyczne przeliczanie poziomów

### UI/UX:
- Pokazuj **ostrzeżenie** przed wyzwaniem na duel: "Możesz stracić poziom!"
- Wyświetlaj zmianę XP w kolorach:
  - Zielony: +XP
  - Czerwony: -XP
  - Żółty: 0 XP

---

## 🐛 Troubleshooting

### Problem: Funkcja nie działa po aktualizacji
**Rozwiązanie**: Upewnij się, że uruchomiłeś cały skrypt SQL, nie tylko fragmenty

### Problem: Gracze tracą zbyt dużo XP
**Rozwiązanie**: System jest zbalansowany. -30 XP w Duel to ~20% wymaganego XP na niskich poziomach

### Problem: Level nie spada mimo ujemnego XP
**Rozwiązanie**: Sprawdź czy funkcja `update_user_level()` została zaktualizowana w bazie

---

## 📅 Historia Zmian

### v2.0 (Listopad 2025)
- ✨ Nowy progresywny system XP dla Blitz
- ⚠️ Kary XP dla przegranych w Duel (-30 XP)
- 📉 Możliwość utraty poziomu
- 🎯 Cap na +200 XP w Blitz
- 📊 Zaktualizowany regulamin w grze

### v1.0 (Październik 2025)
- Bazowy system XP (tylko pozytywne wartości)
- Brak kar za przegrane

---

## 🤝 Feedback

System został zaprojektowany aby być sprawiedliwym i motywującym. Jeśli uważasz, że wymaga dostrojenia:
- Zbyt łatwo stracić XP? → Zmniejsz karę w `complete_duel_match()`
- Za trudno zdobyć XP? → Dostosuj progi w `calculateExperience()`

**Kontakt**: support@quizrush.com
