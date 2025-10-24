# 🎯 System Misji - Dokumentacja Techniczna

## 📊 Jak Działa Obecnie (TYLKO WYŚWIETLANIE)

### Aktualna Implementacja

System misji **obecnie NIE DZIAŁA automatycznie**. Jest to tylko **interfejs do wyświetlania** danych z bazy.

#### Co Jest Zrobione ✅
1. **Baza danych** - Tabele `daily_missions` i `user_daily_missions`
2. **Wyświetlanie** - Pobieranie i pokazywanie misji w Home.tsx
3. **Progress bar** - Wizualizacja postępu (ale postęp trzeba ustawić RĘCZNIE w bazie)

#### Co NIE Jest Zrobione ❌
1. **Automatyczne śledzenie** - Gry nie aktualizują postępu misji
2. **Sprawdzanie warunków** - System nie wie, czy gracz wygrał 3 pojedynki
3. **Przyznawanie nagród** - FlashPoints i XP nie są dodawane automatycznie
4. **Odblokowywanie misji** - Nowi użytkownicy nie dostają automatycznie misji

---

## 🔧 Jak To POWINNO Działać (Docelowo)

### Przepływ Danych

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Gracz Kończy Grę                                         │
│    - Wygrana w Duel                                         │
│    - Odpowiedź na pytanie z geografii                      │
│    - Bezbłędna gra                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Backend/Trigger Sprawdza Misje                          │
│    SELECT * FROM user_daily_missions                        │
│    WHERE user_id = ... AND is_completed = false             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Aktualizacja Postępu                                     │
│    UPDATE user_daily_missions                               │
│    SET current_progress = current_progress + 1              │
│    WHERE mission_type MATCHES current_action                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Sprawdzenie Ukończenia                                   │
│    IF current_progress >= target_value THEN                 │
│      - SET is_completed = true                              │
│      - SET completed_at = NOW()                             │
│      - Przyznaj nagrody (FP + XP)                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Frontend Odświeża                                        │
│    - Pokazuje ✓ przy misji                                  │
│    - Aktualizuje progress bar                               │
│    - Wyświetla powiadomienie "Misja ukończona! +50 FP"     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗃️ Typy Misji (mission_type)

### Zdefiniowane w Bazie

| Typ | Opis | Jak Sprawdzać |
|-----|------|---------------|
| `win_games` | Wygraj X gier | Po każdej wygranej grze: `current_progress++` |
| `answer_category` | Odpowiedz na X pytań z kategorii | Po każdym pytaniu z danej kategorii: `current_progress++` |
| `perfect_game` | Ukończ X gier bezbłędnie | Po grze z 100% poprawnością: `current_progress++` |
| `play_games` | Zagraj X gier | Po każdej skończonej grze: `current_progress++` |
| `earn_flash_points` | Zdobądź X FlashPoints | Po każdej wygranej: `current_progress += earned_fp` |

---

## 💻 Implementacja - 3 Podejścia

### Podejście 1: PostgreSQL Triggers (Najlepsze dla Supabase)

**Zalety:** Automatyczne, nie wymaga logiki w frontendzie  
**Wady:** Wymaga SQL, trudniejsze w debugowaniu

```sql
-- Trigger po zakończeniu gry
CREATE OR REPLACE FUNCTION check_missions_after_game()
RETURNS TRIGGER AS $$
BEGIN
    -- Aktualizuj misję "Wygraj 3 gry" jeśli gracz wygrał
    IF NEW.winner_id IS NOT NULL THEN
        UPDATE user_daily_missions
        SET current_progress = current_progress + 1
        WHERE user_id = NEW.winner_id
          AND mission_id IN (
              SELECT id FROM daily_missions 
              WHERE mission_type = 'win_games' 
              AND valid_date = CURRENT_DATE
          )
          AND is_completed = false;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_game_insert
AFTER INSERT ON games
FOR EACH ROW
EXECUTE FUNCTION check_missions_after_game();
```

### Podejście 2: Backend API (Zalecane dla Produkcji)

**Zalety:** Pełna kontrola, łatwe testowanie  
**Wady:** Wymaga własnego backendu (Node.js, Python)

```typescript
// api/game/complete.ts
export async function completeGame(gameData: GameResult) {
  // 1. Zapisz wynik gry
  const game = await saveGameToDatabase(gameData);
  
  // 2. Sprawdź misje użytkownika
  await updateUserMissions(gameData.userId, {
    type: 'win_games',
    increment: gameData.isWinner ? 1 : 0
  });
  
  // 3. Sprawdź czy misja ukończona
  await checkMissionCompletion(gameData.userId);
  
  return game;
}
```

### Podejście 3: Frontend (Tymczasowe, dla prototypu)

**Zalety:** Szybkie do zaimplementowania  
**Wady:** Łatwe do zhackowania, nie persistent

```typescript
// src/services/missionService.ts
export async function updateMissionProgress(
  userId: string, 
  missionType: string, 
  increment: number = 1
) {
  // Pobierz aktywne misje użytkownika
  const { data: missions } = await supabase
    .from('user_daily_missions')
    .select('*, daily_missions(*)')
    .eq('user_id', userId)
    .eq('daily_missions.mission_type', missionType)
    .eq('is_completed', false);
  
  if (!missions || missions.length === 0) return;
  
  // Aktualizuj postęp
  for (const mission of missions) {
    const newProgress = mission.current_progress + increment;
    
    await supabase
      .from('user_daily_missions')
      .update({ current_progress: newProgress })
      .eq('id', mission.id);
    
    // Sprawdź ukończenie
    if (newProgress >= mission.daily_missions.target_value) {
      await completeMission(mission.id, userId, mission.daily_missions);
    }
  }
}

async function completeMission(
  missionId: string, 
  userId: string, 
  missionData: DailyMission
) {
  // 1. Oznacz jako ukończoną
  await supabase
    .from('user_daily_missions')
    .update({ 
      is_completed: true, 
      completed_at: new Date().toISOString() 
    })
    .eq('id', missionId);
  
  // 2. Przyznaj nagrody
  await supabase.rpc('add_mission_rewards', {
    p_user_id: userId,
    p_flash_points: missionData.flash_points_reward,
    p_experience: missionData.experience_reward
  });
  
  // 3. Pokaż notyfikację
  showNotification(`Misja ukończona! +${missionData.flash_points_reward} FP`);
}
```

---

## 🛠️ Funkcja PostgreSQL do Przyznawania Nagród

```sql
-- Funkcja RPC do dodawania nagród
CREATE OR REPLACE FUNCTION add_mission_rewards(
    p_user_id UUID,
    p_flash_points INTEGER,
    p_experience INTEGER
)
RETURNS void AS $$
BEGIN
    UPDATE users
    SET 
        flash_points = flash_points + p_flash_points,
        experience = experience + p_experience
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;
```

---

## 🚀 Quick Start - Implementacja Podstawowa

### Krok 1: Utwórz Serwis Misji

```typescript
// src/services/missionService.ts
import { supabase } from '../lib/supabase';

export interface MissionProgress {
  missionType: string;
  increment?: number;
  categoryId?: number; // dla answer_category
}

export async function trackMissionProgress(
  userId: string,
  progress: MissionProgress
) {
  try {
    // Pobierz misje tego typu
    const { data: userMissions, error } = await supabase
      .from('user_daily_missions')
      .select(`
        id,
        current_progress,
        is_completed,
        daily_missions (
          id,
          mission_type,
          target_value,
          flash_points_reward,
          experience_reward
        )
      `)
      .eq('user_id', userId)
      .eq('is_completed', false)
      .eq('daily_missions.mission_type', progress.missionType)
      .eq('daily_missions.valid_date', new Date().toISOString().split('T')[0]);

    if (error || !userMissions) return;

    // Aktualizuj postęp dla każdej pasującej misji
    for (const mission of userMissions) {
      const newProgress = mission.current_progress + (progress.increment || 1);
      
      // Update progress
      await supabase
        .from('user_daily_missions')
        .update({ current_progress: newProgress })
        .eq('id', mission.id);

      // Check completion
      if (newProgress >= mission.daily_missions.target_value) {
        await completeMission(mission.id, userId, mission.daily_missions);
      }
    }
  } catch (err) {
    console.error('Mission tracking error:', err);
  }
}

async function completeMission(missionId: string, userId: string, mission: any) {
  // Mark as completed
  await supabase
    .from('user_daily_missions')
    .update({ 
      is_completed: true, 
      completed_at: new Date().toISOString() 
    })
    .eq('id', missionId);

  // Award rewards (you need to implement this)
  // await giveRewards(userId, mission.flash_points_reward, mission.experience_reward);
}
```

### Krok 2: Użyj w Grze

```typescript
// Po zakończeniu gry
async function handleGameEnd(gameResult: GameResult) {
  const userId = user.id;
  
  // Śledź postęp misji
  await trackMissionProgress(userId, { missionType: 'play_games' });
  
  if (gameResult.isWinner) {
    await trackMissionProgress(userId, { missionType: 'win_games' });
  }
  
  if (gameResult.accuracy === 100) {
    await trackMissionProgress(userId, { missionType: 'perfect_game' });
  }
  
  // Odśwież UI
  refreshMissions();
}
```

---

## 📋 Checklist Implementacji

### Minimum Viable Product (MVP)
- [ ] Utworzyć `src/services/missionService.ts`
- [ ] Funkcja `trackMissionProgress()`
- [ ] Funkcja `completeMission()`
- [ ] Wywołania w miejscach akcji (po grze, po pytaniu)
- [ ] Odświeżanie UI po update

### Funkcje Dodatkowe
- [ ] Powiadomienia o ukończeniu misji
- [ ] Animacje progress bara
- [ ] Auto-odblokowywanie misji dla nowych użytkowników
- [ ] PostgreSQL triggers (zaawansowane)
- [ ] Real-time updates (Supabase Realtime)

### Testy
- [ ] Test: Wygrana aktualizuje "win_games"
- [ ] Test: Bezbłędna gra aktualizuje "perfect_game"
- [ ] Test: Nagrody są przyznawane
- [ ] Test: Misja oznaczona jako ukończona

---

## ⚠️ Obecny Stan

**Status:** 🟡 CZĘŚCIOWO DZIAŁAJĄCY

- ✅ Struktura bazy danych
- ✅ Wyświetlanie misji
- ✅ Progress bar
- ❌ Automatyczne śledzenie
- ❌ Sprawdzanie warunków
- ❌ Przyznawanie nagród
- ❌ Powiadomienia

**Aby system działał w 100%, trzeba:**
1. Stworzyć `missionService.ts`
2. Dodać wywołania po akcjach gracza
3. Zaimplementować przyznawanie nagród

---

**Data utworzenia:** 2025-10-24  
**Autor:** System Dokumentacji
