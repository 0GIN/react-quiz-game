# 🎯 Plan Rozwoju Projektu QuizRush - Roadmap

> **Analiza kompletna** - Stan na 24.10.2025  
> **Cel:** Stworzenie w pełni funkcjonalnej gry quizowej z systemem społecznościowym

---

## 📊 Stan Obecny Projektu

### ✅ Co Działa (ZROBIONE):
1. **Autentykacja** - Login, rejestracja, logout, sesje
2. **Role użytkowników** - Guest, User, Admin z kontrolą dostępu
3. **Baza danych** - 20 tabel PostgreSQL w Supabase
4. **UI/UX** - 15 stron, komponenty, responsywny design
5. **Strona główna** - Integracja z bazą (top gracze, misje, statystyki)
6. **System misji** - Struktura bazy + serwis (NIE podpięty)
7. **Dokumentacja** - Kompletna (DATABASE, AUTH, ROLES, MISSIONS)

### ❌ Co NIE Działa (DO ZROBIENIA):
1. **Gry** - Brak mechaniki rozgrywki (Duel, Squad, Blitz, Master)
2. **Pytania** - Brak systemu wyświetlania i odpowiadania
3. **System punktacji** - Brak logiki przyznawania FP i XP
4. **Znajomi** - Tylko UI, brak funkcjonalności
5. **Czat** - Tylko mockup
6. **Osiągnięcia** - Brak implementacji
7. **Sklep** - Brak logiki zakupów
8. **Admin Panel** - Brak funkcjonalności zarządzania

---

## 🚀 ROADMAP - Etapy Rozwoju

### 📍 **FAZA 1: FUNDAMENT GRY** (Priorytet: 🔴 KRYTYCZNY)
**Cel:** Podstawowa mechanika rozgrywki - można zagrać quiz

#### 1.1 System Pytań (2-3 dni)
- [ ] **Seed pytań do bazy** (database/seed-questions.sql)
  - Minimum 100 pytań w 6 kategoriach
  - Format: pytanie, 4 odpowiedzi (1 poprawna)
  - Różne poziomy trudności
  
- [ ] **Serwis pytań** (src/services/questionService.ts)
  ```typescript
  - getRandomQuestions(categoryId?, count, difficulty?)
  - checkAnswer(questionId, userAnswer)
  - submitQuestion(questionData) // dla użytkowników
  ```

- [ ] **Hook useQuestions**
  ```typescript
  - Pobieranie pytań
  - Walidacja odpowiedzi
  - Śledzenie postępu
  ```

**Pliki do utworzenia:**
```
database/
  └── seed-questions.sql
src/
  ├── services/
  │   └── questionService.ts
  ├── hooks/
  │   └── useQuestions.ts
  └── types/
      └── Question.ts
```

---

#### 1.2 Tryb SOLO/PRACTICE (3-4 dni)
**Dlaczego najpierw Solo:** Prościej niż multiplayer, testuje całą logikę

- [ ] **Strona: GameSolo.tsx**
  - Wybór kategorii
  - 10 pytań
  - Timer na pytanie (30 sek)
  - Wyświetlanie wyniku
  
- [ ] **Komponent: QuestionCard.tsx**
  ```tsx
  - Wyświetlanie pytania
  - 4 przyciski odpowiedzi
  - Countdown timer
  - Feedback (poprawna/błędna)
  - Przejście do kolejnego
  ```

- [ ] **Logika gry**
  ```typescript
  - useGameState hook
  - Punktacja: +10 za poprawną, -0 za błędną
  - Czas bonusowy: +5 FP za szybką odpowiedź (<10s)
  - Combo system: x2 za 3 poprawne z rzędu
  ```

- [ ] **Ekran wyników**
  ```tsx
  - Podsumowanie: X/10 poprawnych
  - Zdobyte FP i XP
  - Przyznanie nagród
  - Przycisk: Zagraj ponownie / Wróć
  ```

**Pliki do utworzenia:**
```
src/
  ├── pages/
  │   ├── GameSolo.tsx
  │   └── GameResult.tsx
  ├── components/
  │   ├── QuestionCard.tsx
  │   ├── AnswerButton.tsx
  │   ├── GameTimer.tsx
  │   └── ScoreSummary.tsx
  ├── hooks/
  │   └── useGameState.ts
  └── services/
      └── gameService.ts
```

---

#### 1.3 Integracja z Bazą - Zapis Gier (2 dni)

- [ ] **GameService - zapis wyników**
  ```typescript
  - createGame(userId, categoryId, mode)
  - saveGameResult(gameId, score, answers)
  - updateUserStats(userId, gameResult)
  - awardRewards(userId, flashPoints, xp)
  ```

- [ ] **Aktualizacja statystyk**
  ```sql
  UPDATE users SET
    total_games_played++,
    total_wins++ (jeśli >50%),
    total_correct_answers += correct,
    total_questions_answered += total,
    flash_points += earned_fp,
    experience += earned_xp
  ```

- [ ] **Tabele do wykorzystania:**
  - `games` - zapis gry
  - `game_participants` - uczestnik (solo = 1 gracz)
  - `game_questions` - pytania w grze
  - `game_answers` - odpowiedzi gracza

**Efekt:** Po grze użytkownik widzi zaktualizowane statystyki na Home!

---

#### 1.4 System Poziomów i XP (1 dzień)

- [ ] **Level-up logika**
  ```typescript
  - Formuła: XP_needed = 100 + (level - 1) * 50
  - Po przekroczeniu: level++, experience = pozostałe
  - Notyfikacja "Awansowałeś na poziom X!"
  ```

- [ ] **Komponent: LevelUpModal.tsx**
  - Animacja poziomu
  - Gratulacje
  - Nowy level + nagrody

---

### 📍 **FAZA 2: TRYBY GRY** (Priorytet: 🟠 WYSOKI)

#### 2.1 Duel 1v1 (5-7 dni)

**Architektura:**
```
User A wybiera kategorię → Tworzy wyzwanie
                           ↓
                    Zapisuje w challenges
                           ↓
User B widzi wyzwanie → Akceptuje
                           ↓
                Tworzy game, oba dostają te same pytania
                           ↓
          Obaj odpowiadają (async lub sync)
                           ↓
             Porównanie wyników → Winner
```

- [ ] **Strona: GameDuel.tsx**
  - Wybór przeciwnika (znajomi / random)
  - Wybór kategorii
  - Wysłanie wyzwania
  
- [ ] **System wyzwań**
  ```typescript
  - createChallenge(challengerId, challengedId, category)
  - acceptChallenge(challengeId)
  - declineChallenge(challengeId)
  - getPendingChallenges(userId)
  ```

- [ ] **Live game state** (opcja sync)
  - Supabase Realtime subscriptions
  - Oba graczy widzą postęp na żywo
  - Notyfikacje: "Przeciwnik odpowiedział!"

- [ ] **Asynchroniczne wyzwanie** (prostsze)
  - User A rozwiązuje → wynik zapisany
  - User B rozwiązuje → porównanie
  - Email/powiadomienie o wyniku

**Tabele:**
- `challenges` - zaproszenia
- `games` - gra 1v1
- `game_participants` - 2 graczy

---

#### 2.2 Blitz Mode (2-3 dni)

**Mechanika:**
- 1 gracz
- 3 życia
- 3 minuty
- Ile zdąży odpowiedzieć poprawnie?

- [ ] **Komponent: BlitzGame.tsx**
  - Timer 3:00 countdown
  - Lives counter (❤️❤️❤️)
  - Błędna odpowiedź = -1 życie
  - 0 żyć lub czas = koniec

- [ ] **Punktacja:**
  - +20 FP za pytanie (szybsze = więcej)
  - Streak bonus: +50 FP za 10 z rzędu

---

#### 2.3 Squad 2v2 (5-7 dni)

**Najbardziej złożony tryb:**

- [ ] **Matchmaking**
  - Znajdź 3 innych graczy
  - Podział na drużyny (team_number: 1 lub 2)

- [ ] **Wspólny wynik drużyny**
  ```sql
  SELECT SUM(score) as team_score
  FROM game_participants
  WHERE game_id = ? AND team_number = ?
  ```

- [ ] **Synchronizacja**
  - Wszyscy 4 gracze muszą być online
  - Supabase Realtime dla live updates

---

#### 2.4 Master Mode (3 dni)

- Wybór jednej kategorii
- 1v1 ekspercki pojedynek
- Tylko trudne pytania
- Wyższe nagrody (+200 FP)

---

### 📍 **FAZA 3: SYSTEM SPOŁECZNOŚCIOWY** (Priorytet: 🟡 ŚREDNI)

#### 3.1 System Znajomych (3-4 dni)

- [ ] **FriendService**
  ```typescript
  - sendFriendRequest(userId, friendId)
  - acceptRequest(requestId)
  - rejectRequest(requestId)
  - removeFriend(friendshipId)
  - getFriends(userId)
  - searchUsers(query)
  ```

- [ ] **Strona: Friends.tsx** (podpięcie do bazy)
  - Lista znajomych z bazy
  - Przycisk "Wyzwij"
  - Status online/offline

- [ ] **Strona: FriendSearch.tsx**
  - Wyszukiwanie użytkowników
  - Wysyłanie zaproszeń
  - Oczekujące zaproszenia

**Tabele:** `friendships`

---

#### 3.2 Czat (5-7 dni)

**Opcja 1: Prosty (bez Realtime)**
- Odświeżanie co 3 sekundy
- Podstawowe wiadomości

**Opcja 2: Realtime (lepsze UX)**
- Supabase Realtime subscriptions
- Instant messages

- [ ] **ChatService**
  ```typescript
  - getConversation(userId, friendId)
  - sendMessage(conversationId, text)
  - markAsRead(messageId)
  ```

- [ ] **Strona: Chat.tsx**
  - Lista konwersacji
  - Okno czatu
  - Wysyłanie wiadomości

**Tabele:**
- `conversations`
- `conversation_participants`
- `chat_messages`

---

### 📍 **FAZA 4: PROGRESJA GRACZA** (Priorytet: 🟡 ŚREDNI)

#### 4.1 System Misji - Podpięcie (2-3 dni)

**Mamy już:** `missionService.ts` (gotowy)

- [ ] **Integracja z GameService**
  ```typescript
  // Po zakończeniu gry:
  await MissionTracker.onGamePlayed(userId);
  await MissionTracker.onGameWon(userId); // jeśli wygrał
  await MissionTracker.onPerfectGame(userId); // jeśli 100%
  ```

- [ ] **Inicjalizacja przy logowaniu**
  ```typescript
  // W AuthContext po login:
  await initializeDailyMissions(userId);
  ```

- [ ] **Notyfikacje**
  - Toast: "Misja ukończona! +50 FP"
  - Modal z gratulacjami

- [ ] **Strona: DailyMissions.tsx**
  - Podpięcie do bazy
  - Live progress
  - Odbieranie nagród

---

#### 4.2 System Osiągnięć (3-4 dni)

- [ ] **AchievementService**
  ```typescript
  - checkAchievements(userId)
  - unlockAchievement(userId, achievementId)
  - getUnlockedAchievements(userId)
  ```

- [ ] **Typy osiągnięć:**
  ```
  - first_win: Pierwsza wygrana
  - win_10: Wygraj 10 gier
  - perfect_10: 10 bezbłędnych gier
  - streak_5: Passa 5 wygranych
  - category_master: 50 pytań z jednej kategorii
  - level_10: Osiągnij 10 poziom
  ```

- [ ] **Unlock logic** (po każdej grze)
  ```typescript
  await checkAchievements(userId);
  // Sprawdza wszystkie warunki i odblokowuje
  ```

**Tabele:**
- `achievements` - definicje
- `user_achievements` - zdobyte

---

#### 4.3 Ranking - Rozbudowa (2 dni)

- [ ] **Strona: Ranking.tsx**
  - Zakładki: Globalny / Znajomi / Tygodniowy
  - Paginacja (po 50)
  - Filtrowanie po poziomie

- [ ] **TopPlayers.tsx**
  - Hall of Fame
  - Top 100 wszech czasów
  - Podium (1-2-3 miejsce)

---

### 📍 **FAZA 5: MONETYZACJA I PREMIUM** (Priorytet: 🟢 NISKI)

#### 5.1 Sklep (4-5 dni)

- [ ] **ShopService**
  ```typescript
  - getShopItems()
  - purchaseItem(userId, itemId)
  - checkBalance(userId, cost)
  - applyPurchase(userId, item)
  ```

- [ ] **Produkty:**
  - Awatary (100-500 FP)
  - Motywy kolorystyczne (300 FP)
  - Boosty XP (500 FP, +50% XP przez 24h)
  - Premium: Double FP (1000 FP, 7 dni)

- [ ] **Strona: Shop.tsx**
  - Grid z produktami
  - Koszyk
  - Potwierdzenie zakupu

**Tabele:**
- `shop_items`
- `user_purchases`

---

### 📍 **FAZA 6: ADMINISTRACJA** (Priorytet: 🟢 NISKI)

#### 6.1 Panel Admina (5-7 dni)

- [ ] **Zarządzanie pytaniami**
  - Przeglądanie wszystkich pytań
  - Edycja pytań
  - Usuwanie pytań
  - Zmiana kategorii/trudności

- [ ] **Akceptacja pytań użytkowników**
  ```typescript
  - getPendingQuestions()
  - approveQuestion(questionId)
  - rejectQuestion(questionId)
  ```

- [ ] **Zarządzanie użytkownikami**
  - Lista użytkowników
  - Ban/Unban
  - Nadawanie admina
  - Resetowanie statystyk

- [ ] **Statystyki platformy**
  - Liczba użytkowników
  - Rozegrane gry (dziś/tydzień/miesiąc)
  - Najpopularniejsze kategorie
  - Wykresy Chart.js

---

### 📍 **FAZA 7: OPTYMALIZACJA** (Priorytet: 🔵 OPCJONALNY)

#### 7.1 Performance

- [ ] **Caching**
  - Top gracze (cache 5 min)
  - Ranking (cache 10 min)
  - Kategorie (cache 1h)

- [ ] **Lazy loading**
  - Komponenty stron
  - Obrazy

- [ ] **Code splitting**
  - React.lazy() dla routes

#### 7.2 Real-time Features

- [ ] **Supabase Realtime**
  - Live ranking updates
  - Live chat
  - Live game progress (Duel)

#### 7.3 PWA

- [ ] **Progressive Web App**
  - Service Worker
  - Offline mode
  - Install prompt

---

## 📅 Rekomendowany Harmonogram

### Tydzień 1-2: FUNDAMENT
- ✅ System pytań
- ✅ Game Solo/Practice
- ✅ Zapis do bazy
- ✅ Poziomy i XP

**Efekt:** Można zagrać solo quiz i zobaczyć statystyki!

### Tydzień 3-4: MULTIPLAYER
- ✅ Duel 1v1 (async)
- ✅ Blitz Mode
- ✅ System wyzwań

**Efekt:** Rywalizacja z innymi graczami!

### Tydzień 5-6: SOCIAL
- ✅ Znajomi
- ✅ Czat
- ✅ Ranking rozbudowany

**Efekt:** Społeczność i interakcje!

### Tydzień 7-8: PROGRESJA
- ✅ Misje (podpięcie)
- ✅ Osiągnięcia
- ✅ Sklep

**Efekt:** Long-term engagement!

### Tydzień 9+: POLISH
- Admin panel
- Optymalizacje
- Real-time
- PWA

---

## 🎯 Priorytety - Co NAJPIERW?

### 1️⃣ **Seed Pytań** (1 dzień)
Bez pytań nie ma gry - to fundament

### 2️⃣ **QuestionService** (1 dzień)
Logika pobierania i walidacji pytań

### 3️⃣ **GameSolo** (3 dni)
Pierwsza grywalna wersja - proof of concept

### 4️⃣ **Zapis do bazy** (2 dni)
Statystyki i progresja - motywacja do gry

### 5️⃣ **Duel 1v1** (5 dni)
Core feature - to czego oczekują użytkownicy

---

## 📋 TODO - Najbliższe Kroki

### Dzień 1: Pytania
```bash
1. Utwórz database/seed-questions.sql (100 pytań)
2. Wykonaj w Supabase SQL Editor
3. Sprawdź: SELECT COUNT(*) FROM questions
```

### Dzień 2: Serwis
```bash
1. Utwórz src/services/questionService.ts
2. Utwórz src/types/Question.ts
3. Przetestuj: getRandomQuestions(1, 10)
```

### Dzień 3-5: Gra Solo
```bash
1. Utwórz src/pages/GameSolo.tsx
2. Utwórz src/components/QuestionCard.tsx
3. Utwórz src/hooks/useGameState.ts
4. Dodaj routing: /game/solo
5. Test: Zagraj pełną grę 10 pytań
```

### Dzień 6-7: Zapis
```bash
1. Rozbuduj gameService.ts
2. saveGameResult() - zapis do games, game_participants
3. updateUserStats() - aktualizacja users
4. Test: Statystyki się aktualizują
```

---

## 🔧 Narzędzia Pomocnicze

### Generowanie Pytań (AI)
Użyj ChatGPT/Claude do wygenerowania pytań:

```
Prompt:
"Wygeneruj 50 pytań quizowych z kategorii GEOGRAFIA w formacie SQL INSERT:
- 4 odpowiedzi (1 poprawna)
- Różne poziomy trudności
- Format INSERT INTO questions..."
```

### Testowanie
```bash
# Unit tests
npm install vitest @testing-library/react

# E2E tests
npm install playwright
```

### Monitoring
```bash
# Logi i debugging
npm install react-query-devtools
```

---

## ✅ Metryki Sukcesu

### MVP (Minimum Viable Product):
- [x] Rejestracja i login działa
- [ ] Można zagrać solo quiz (10 pytań)
- [ ] Wyniki zapisują się do bazy
- [ ] Statystyki się aktualizują
- [ ] Ranking pokazuje prawdziwych graczy

### v1.0 (Pełna Gra):
- [ ] Wszystkie 4 tryby gry działają
- [ ] System znajomych
- [ ] Czat
- [ ] Misje + Osiągnięcia
- [ ] Sklep

### v2.0 (Advanced):
- [ ] Real-time features
- [ ] Admin panel
- [ ] PWA
- [ ] Ligi i sezony

---

## 📞 Wsparcie

**Dokumentacja gotowa:**
- ✅ `docs/DATABASE_SETUP_GUIDE.md`
- ✅ `docs/AUTH_SETUP_GUIDE.md`
- ✅ `docs/MISSION_SYSTEM.md`
- ✅ `docs/HOME_DATABASE_INTEGRATION.md`

**Do utworzenia:**
- [ ] `docs/GAME_DEVELOPMENT.md`
- [ ] `docs/MULTIPLAYER_GUIDE.md`
- [ ] `docs/API_REFERENCE.md`

---

**Ostatnia aktualizacja:** 2025-10-24  
**Status:** 📋 Roadmap gotowy - czas na implementację!

**Powodzenia! 🚀**
