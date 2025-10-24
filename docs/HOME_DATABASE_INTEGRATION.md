# 🏠 Integracja Strony Głównej z Bazą Danych

## ✅ Zrealizowane Funkcje

### Dla Gości (Niezalogowanych)
- **Top 3 Graczy** - Wyświetlanie najlepszych graczy z bazy danych w czasie rzeczywistym
- **4 Tryby Gry** - Prezentacja dostępnych trybów z badge'ami "🔒 Wymagane konto"
- **CTA Banner** - Gradient call-to-action zachęcający do rejestracji

### Dla Zalogowanych Użytkowników
- **Codzienne Misje** - Dynamiczne pobieranie i wyświetlanie misji z tabeli `daily_missions`
  - Progress bar z postępem
  - Status ukończenia (✓)
  - Wyświetlanie nagrody FP
- **Ranking** - Top 3 graczy z bazy danych
  - Sortowanie po `flash_points`
  - Formatowanie liczb (np. 9,200)
- **Poziom i XP** - Integracja z danymi użytkownika z `AuthContext`
- **Statystyki Użytkownika** - Prawdziwe dane z bazy:
  - 🎮 Rozegrane gry (`total_games_played`)
  - 🎯 Celność (`total_correct_answers / total_questions_answered`)
  - 🔥 Passa (`current_streak`)
  - ⭐ Poziom (`level`)

---

## 🗄️ Struktura Bazy Danych

### Tabele Wykorzystane

#### `users`
```sql
- id (UUID)
- username (VARCHAR)
- flash_points (INTEGER)
- level (INTEGER)
- experience (INTEGER)
- experience_to_next_level (INTEGER)
- total_games_played (INTEGER)
- total_wins (INTEGER)
- total_losses (INTEGER)
- total_correct_answers (INTEGER)
- total_questions_answered (INTEGER)
- current_streak (INTEGER)
- best_streak (INTEGER)
```

#### `daily_missions`
```sql
- id (SERIAL)
- name (VARCHAR) - tytuł misji
- description (TEXT) - opis misji
- mission_type (VARCHAR) - typ: 'win_games', 'answer_category', etc.
- target_value (INTEGER) - cel do osiągnięcia
- flash_points_reward (INTEGER) - nagroda FP
- experience_reward (INTEGER) - nagroda XP
- valid_date (DATE) - data ważności
- is_active (BOOLEAN) - czy aktywna
```

#### `user_daily_missions`
```sql
- id (UUID)
- user_id (UUID) - odniesienie do users
- mission_id (INTEGER) - odniesienie do daily_missions
- current_progress (INTEGER) - obecny postęp
- is_completed (BOOLEAN) - czy ukończona
- completed_at (TIMESTAMP) - kiedy ukończona
```

---

## 📝 Setup Misji w Bazie

### 1. Dodaj Przykładowe Misje

Otwórz SQL Editor w Supabase i wykonaj:

```sql
-- database/seed-missions.sql
INSERT INTO daily_missions (name, description, mission_type, target_value, flash_points_reward, experience_reward, valid_date, is_active) VALUES
('Wygraj 3 pojedynki', 'Zdobądź 3 zwycięstwa w trybie Duel', 'win_games', 3, 50, 100, CURRENT_DATE, true),
('Odpowiedz na 10 pytań z geografii', 'Zagraj pytania z kategorii Geografia', 'answer_category', 10, 30, 50, CURRENT_DATE, true),
('Ukończ 1 pojedynek bezbłędnie', 'Wygraj grę bez żadnej błędnej odpowiedzi', 'perfect_game', 1, 100, 200, CURRENT_DATE, true);
```

### 2. Sprawdź Misje

```sql
SELECT * FROM daily_missions WHERE valid_date = CURRENT_DATE ORDER BY id;
```

### 3. Dodaj Postęp dla Testowego Użytkownika (Opcjonalne)

```sql
-- Pobierz swoje user_id (zaloguj się i sprawdź w Supabase → Authentication → Users)
-- Lub użyj tego zapytania aby znaleźć swoje ID:
SELECT id, username FROM users WHERE username = 'TwojaNazwa';

-- Dodaj postęp dla misji
INSERT INTO user_daily_missions (user_id, mission_id, current_progress, is_completed)
VALUES ('twoje-user-id', 1, 2, false);

-- Lub zaktualizuj istniejący postęp
UPDATE user_daily_missions 
SET current_progress = 2 
WHERE user_id = 'twoje-user-id' AND mission_id = 1;
```

### 4. Dodaj Testowe Statystyki (Opcjonalne)

```sql
-- Zaktualizuj statystyki swojego użytkownika
UPDATE users 
SET 
  total_games_played = 127,
  total_wins = 85,
  total_losses = 42,
  total_questions_answered = 1270,
  total_correct_answers = 1041,
  current_streak = 5,
  best_streak = 12,
  flash_points = 5420,
  experience = 340,
  level = 12
WHERE username = 'TwojaNazwa';
```

---

## 🔧 Jak to Działa

### Pobieranie Top Graczy
```typescript
useEffect(() => {
  const fetchTopPlayers = async () => {
    const { data } = await supabase
      .from('users')
      .select('id, username, flash_points')
      .order('flash_points', { ascending: false })
      .limit(3);
    
    setTopPlayers(data || []);
  };
  fetchTopPlayers();
}, []);
```

### Obliczanie Statystyk Użytkownika
```typescript
const userData = {
  level: user?.level || 1,
  currentXP: user?.experience || 0,
  xpToNextLevel: user?.experience_to_next_level || 100,
  gamesPlayed: user?.total_games_played || 0,
  totalCorrectAnswers: user?.total_correct_answers || 0,
  totalQuestionsAnswered: user?.total_questions_answered || 0,
  currentStreak: user?.current_streak || 0
}

// Oblicz celność (accuracy)
const accuracy = userData.totalQuestionsAnswered > 0 
  ? Math.round((userData.totalCorrectAnswers / userData.totalQuestionsAnswered) * 100)
  : 0;
```

### Wyświetlanie Statystyk
```tsx
<StatsGrid 
  gamesPlayed={userData.gamesPlayed}
  accuracy={accuracy}
  streak={userData.currentStreak}
  level={userData.level}
/>
```

### Pobieranie Misji Użytkownika
```typescript
useEffect(() => {
  if (!isGuest && user) {
    // 1. Pobierz aktywne misje na dziś
    const { data: activeMissions } = await supabase
      .from('daily_missions')
      .eq('is_active', true)
      .eq('valid_date', today);
    
    // 2. Dla każdej misji pobierz postęp użytkownika
    const { data: userMission } = await supabase
      .from('user_daily_missions')
      .eq('user_id', user.id)
      .eq('mission_id', mission.id);
    
    // 3. Połącz dane i wyświetl
  }
}, [isGuest, user]);
```

---

## 🎨 Komponenty UI

### Progress Bar
```tsx
<ProgressBar value={mission.current_progress} max={mission.target_value} />
```

### Mission Row
```tsx
<div className="mission-row">
  <div className="mission-title">
    {mission.title}
    <span>+{mission.reward_flash_points} FP</span>
  </div>
  <ProgressBar value={mission.current_progress} max={mission.target_value} />
  <div className="small">
    {mission.current_progress}/{mission.target_value}
    {mission.is_completed && ' ✓'}
  </div>
</div>
```

---

## 🚀 Testowanie

### 1. Sprawdź jako Gość
- Otwórz stronę główną bez logowania
- Powinieneś zobaczyć:
  - Top 3 graczy z bazy (ProGamer123, QuizMaster99, TwojaGra)
  - CTA do rejestracji
  - 🔒 Badge'e na trybach gry

### 2. Sprawdź jako Zalogowany
- Zaloguj się na konto
- Powinieneś zobaczyć:
  - Codzienne misje z bazyn (jeśli dodałeś seed-missions.sql)
  - Ranking top 3 graczy
  - Progress bary z postępem (początkowo 0/X)

### 3. Dodaj Postęp (Testowe)
```sql
-- Ustaw postęp dla zalogowanego użytkownika
UPDATE user_daily_missions 
SET current_progress = 2 
WHERE user_id = 'twoje-uuid' AND mission_id = 1;
```

---

## 📊 Stany Ładowania

- **Loading**: Wyświetla "Ładowanie misji..."
- **Empty**: "Brak aktywnych misji na dziś"
- **Data**: Lista misji z progress barami

---

## 🔄 Auto-Refresh (Przyszłość)

Możesz dodać auto-refresh co X sekund:

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    fetchDailyMissions();
    fetchTopPlayers();
  }, 30000); // co 30 sekund
  
  return () => clearInterval(interval);
}, []);
```

---

## ✅ Checklist

- [x] Pobieranie top 3 graczy z bazy
- [x] Wyświetlanie dla gości i zalogowanych
- [x] Integracja z daily_missions
- [x] Progress bary dla misji
- [x] Loading states
- [x] Formatowanie liczb (toLocaleString)
- [x] Status ukończenia (✓)
- [x] **Prawdziwe statystyki użytkownika z bazy**
- [x] **Obliczanie celności (accuracy) dynamicznie**
- [x] **Integracja z User interface w AuthContext**
- [ ] Real-time updates (Supabase Realtime)
- [ ] Filtrowanie rankingu znajomych vs globalny

---

## 🐛 Troubleshooting

### Brak Misji
**Problem**: Nie widzę żadnych misji  
**Rozwiązanie**: 
1. Sprawdź czy wykonałeś `database/seed-missions.sql`
2. Upewnij się, że `valid_date = CURRENT_DATE`
3. Sprawdź `is_active = true`

### Top Gracze są puste
**Problem**: Ranking jest pusty  
**Rozwiązanie**: 
1. Sprawdź czy w bazie są użytkownicy (SELECT * FROM users)
2. Użytkownicy muszą mieć flash_points > 0

### TypeScript Errors
**Problem**: Property does not exist  
**Rozwiązanie**: 
1. Sprawdź interfejsy `TopPlayer` i `DailyMission`
2. Upewnij się, że nazwy kolumn w bazie pasują do kodu

---

**Ostatnia aktualizacja**: 2025-10-24  
**Status**: ✅ Gotowe do użycia
