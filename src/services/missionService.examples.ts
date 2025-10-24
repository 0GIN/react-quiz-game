/**
 * PRZYKŁADY UŻYCIA - Mission Service
 * 
 * Ten plik pokazuje jak używać missionService.ts w różnych częściach aplikacji
 */

import { MissionTracker, initializeDailyMissions } from '../services/missionService';

// ========================================
// PRZYKŁAD 1: Po Ukończeniu Gry
// ========================================

async function handleGameEnd(gameResult: any, userId: string) {
  // 1. Zapisz grę do bazy (twoja logika)
  // await saveGame(gameResult);
  
  // 2. Śledź misję "Zagraj X gier"
  await MissionTracker.onGamePlayed(userId);
  
  // 3. Jeśli wygrał, śledź misję "Wygraj X gier"
  if (gameResult.isWinner) {
    await MissionTracker.onGameWon(userId);
    
    // 4. Śledź FlashPoints
    await MissionTracker.onFlashPointsEarned(userId, gameResult.flashPointsEarned);
  }
  
  // 5. Jeśli bezbłędna gra
  if (gameResult.accuracy === 100) {
    await MissionTracker.onPerfectGame(userId);
  }
  
  // 6. Odśwież UI (twoja logika)
  // refreshMissions();
  // refreshUserStats();
}

// ========================================
// PRZYKŁAD 2: Po Odpowiedzi na Pytanie
// ========================================

async function handleQuestionAnswered(questionData: any, userId: string) {
  // Śledź misję "Odpowiedz na X pytań z kategorii Y"
  await MissionTracker.onCategoryAnswered(userId, questionData.category_id);
}

// ========================================
// PRZYKŁAD 3: Inicjalizacja przy Logowaniu
// ========================================

async function onUserLogin(userId: string) {
  // Zainicjuj misje na dziś (jeśli jeszcze nie istnieją)
  await initializeDailyMissions(userId);
  
  // Pobierz i wyświetl misje (twoja logika)
  // fetchAndDisplayMissions(userId);
}

// ========================================
// PRZYKŁAD 4: Komponent Gry (React)
// ========================================

/*
// W komponencie gry np. GameDuel.tsx

import { useAuth } from '../contexts/AuthContext';
import { MissionTracker } from '../services/missionService';

function GameDuel() {
  const { user } = useAuth();
  
  const handleFinishGame = async (result: GameResult) => {
    if (!user) return;
    
    // Aktualizuj misje
    await MissionTracker.onGamePlayed(user.id);
    
    if (result.won) {
      await MissionTracker.onGameWon(user.id);
      await MissionTracker.onFlashPointsEarned(user.id, 100); // +100 FP za wygraną
    }
    
    if (result.perfectScore) {
      await MissionTracker.onPerfectGame(user.id);
    }
    
    // Odśwież dane użytkownika i misje
    await refreshUser();
    // Opcjonalnie: pokaż powiadomienie
    // toast.success('Postęp misji zaktualizowany!');
  };
  
  return (
    // ... komponent gry
  );
}
*/

// ========================================
// PRZYKŁAD 5: Integracja z AuthContext
// ========================================

/*
// W AuthContext.tsx przy logowaniu:

async login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (!error && data.user) {
    await fetchUserData(data.user.id);
    
    // Inicjalizuj misje na dziś
    await initializeDailyMissions(data.user.id);
    
    return { success: true };
  }
  
  return { success: false, error: error?.message };
}
*/

// ========================================
// PRZYKŁAD 6: Manualne Użycie
// ========================================

/*
import { trackMissionProgress } from '../services/missionService';

// W dowolnym miejscu:
await trackMissionProgress(userId, {
  missionType: 'win_games',
  increment: 1  // +1 do licznika
});

// Lub dla FlashPoints:
await trackMissionProgress(userId, {
  missionType: 'earn_flash_points',
  increment: 250  // +250 FP
});

// Dla kategorii:
await trackMissionProgress(userId, {
  missionType: 'answer_category',
  categoryId: 2  // Geografia
});
*/

// ========================================
// PRZYKŁAD 7: Hook React do Misji
// ========================================

/*
// Utwórz custom hook: src/hooks/useMissions.ts

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { initializeDailyMissions } from '../services/missionService';

export function useMissions() {
  const { user } = useAuth();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      fetchMissions();
      initializeDailyMissions(user.id);
    }
  }, [user]);
  
  const fetchMissions = async () => {
    // ... pobierz misje z bazy
  };
  
  const refresh = () => {
    fetchMissions();
  };
  
  return { missions, loading, refresh };
}

// Użycie w komponencie:
function MissionsPage() {
  const { missions, loading, refresh } = useMissions();
  
  if (loading) return <div>Ładowanie...</div>;
  
  return (
    <div>
      {missions.map(mission => (
        <MissionCard key={mission.id} mission={mission} />
      ))}
    </div>
  );
}
*/

export {
  handleGameEnd,
  handleQuestionAnswered,
  onUserLogin
};
