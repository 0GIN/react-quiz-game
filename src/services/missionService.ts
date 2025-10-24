/**
 * @fileoverview Serwis zarządzający systemem dziennych misji
 * 
 * Ten serwis odpowiada za:
 * - Generowanie losowych dziennych misji dla wszystkich użytkowników
 * - Inicjalizację misji dla użytkownika przy pierwszym logowaniu w danym dniu
 * - Śledzenie postępu użytkownika w misjach w czasie rzeczywistym
 * - Automatyczne oznaczanie misji jako ukończonych po osiągnięciu celu
 * - Przyznawanie nagród za ukończone misje (Flash Points, Experience Points)
 * - Synchronizację postępu misji z aktualnymi statystykami użytkownika
 * - System odbierania nagród (claim rewards)
 * 
 * Typy misji:
 * - play_games: Zagraj X gier
 * - win_games: Wygraj X gier
 * - perfect_game: Ukończ grę bezbłędnie
 * - earn_flash_points: Zdobądź X Flash Points
 * - answer_category: Odpowiedz na X pytań z kategorii
 * 
 * Użycie:
 * - Po zakończeniu gry: MissionTracker.onGamePlayed(userId)
 * - Po wygranej: MissionTracker.onGameWon(userId)
 * - Po perfekcyjnej grze: MissionTracker.onPerfectGame(userId)
 * - Po zdobyciu punktów: MissionTracker.onFlashPointsEarned(userId, amount)
 * 
 * @module services/missionService
 */

import { supabase } from '../lib/supabase';

/**
 * Synchronizuje current_progress misji z rzeczywistymi statystykami użytkownika
 */
export async function synchronizeMissionProgress(userId: string, userStats: {
  total_games_played: number;
  total_wins: number;
  best_streak: number;
  flash_points: number;
  total_correct_answers: number;
  total_questions_answered: number;
}): Promise<void> {
  // Pobierz wszystkie aktywne misje użytkownika
  const { data: userMissions, error } = await supabase
    .from('user_daily_missions')
    .select('id, mission_id, current_progress')
    .eq('user_id', userId);
  if (error || !userMissions) return;

  // Pobierz dane misji
  const { data: missionsData, error: missionsError } = await supabase
    .from('daily_missions')
    .select('id, mission_type')
    .in('id', userMissions.map(m => m.mission_id));
  if (missionsError || !missionsData) return;

  for (const userMission of userMissions) {
    const missionData = missionsData.find(m => m.id === userMission.mission_id);
    if (!missionData) continue;
    let realProgress = 0;
    switch (missionData.mission_type) {
      case 'play_games':
        realProgress = userStats.total_games_played;
        break;
      case 'win_games':
        realProgress = userStats.total_wins;
        break;
      case 'perfect_game':
        realProgress = userStats.best_streak;
        break;
      case 'earn_flash_points':
        realProgress = userStats.flash_points;
        break;
      case 'answer_category':
        realProgress = userStats.total_questions_answered;
        break;
      default:
        continue;
    }
    if (realProgress > userMission.current_progress) {
      await supabase
        .from('user_daily_missions')
        .update({ current_progress: realProgress })
        .eq('id', userMission.id);
    }
  }
}

/**
 * Sprawdza i nadrabia zaległe misje (ustawia is_completed jeśli progres >= target)
 */
export async function catchUpDailyMissions(userId: string): Promise<void> {
  // Pobierz wszystkie nieukończone misje użytkownika
  const { data: userMissions, error } = await supabase
    .from('user_daily_missions')
    .select('id, mission_id, current_progress, is_completed')
    .eq('user_id', userId)
    .eq('is_completed', false);

  if (error || !userMissions) return;

  // Pobierz dane misji
  const { data: missionsData, error: missionsError } = await supabase
    .from('daily_missions')
    .select('id, target_value')
    .in('id', userMissions.map(m => m.mission_id));

  if (missionsError || !missionsData) return;

  for (const userMission of userMissions) {
    const missionData = missionsData.find(m => m.id === userMission.mission_id);
    if (!missionData) continue;
    if (userMission.current_progress >= missionData.target_value) {
      // Oznacz jako ukończoną
      await supabase
        .from('user_daily_missions')
        .update({ is_completed: true, completed_at: new Date().toISOString() })
        .eq('id', userMission.id);
    }
  }
}

/**
 * Typy misji dostępne w systemie
 */
export type MissionType = 
  | 'win_games'           // Wygraj X gier
  | 'answer_category'     // Odpowiedz na X pytań z kategorii
  | 'perfect_game'        // Ukończ X gier bezbłędnie
  | 'play_games'          // Zagraj X gier
  | 'earn_flash_points';  // Zdobądź X FlashPoints

/**
 * Parametry śledzenia postępu misji
 */
export interface MissionProgress {
  missionType: MissionType;
  increment?: number;      // Ile dodać do postępu (domyślnie 1)
  categoryId?: number;     // Dla misji 'answer_category'
}

/**
 * Dane misji z bazy
 */
interface DailyMissionData {
  id: number;
  mission_type: string;
  target_value: number;
  flash_points_reward: number;
  experience_reward: number;
}

/**
 * Główna funkcja śledząca postęp misji
 * Wywołuj ją po każdej akcji gracza (wygrana, odpowiedź, etc.)
 */
export async function trackMissionProgress(
  userId: string,
  progress: MissionProgress
): Promise<boolean> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Pobierz aktywne misje użytkownika tego typu
    const { data: userMissions, error } = await supabase
      .from('user_daily_missions')
      .select(`
        id,
        current_progress,
        is_completed,
        mission_id
      `)
      .eq('user_id', userId)
      .eq('is_completed', false);
    
    if (error || !userMissions || userMissions.length === 0) {
      if (error) console.error('Błąd pobierania misji:', error);
      return true;
    }

    // Pobierz dane misji osobno
    const { data: missionsData, error: missionsError } = await supabase
      .from('daily_missions')
      .select('*')
      .in('id', userMissions.map(m => m.mission_id))
      .eq('mission_type', progress.missionType)
      .eq('valid_date', today)
      .eq('is_active', true);

    if (missionsError || !missionsData) {
      console.error('Błąd pobierania danych misji:', missionsError);
      return false;
    }

    // Aktualizuj postęp dla każdej pasującej misji
    for (const userMission of userMissions) {
      // Znajdź odpowiadającą misję
      const missionData = missionsData.find(m => m.id === userMission.mission_id);
      if (!missionData) continue;

      const increment = progress.increment || 1;
      const newProgress = userMission.current_progress + increment;
      
      // Aktualizuj postęp w bazie
      const { error: updateError } = await supabase
        .from('user_daily_missions')
        .update({ current_progress: newProgress })
        .eq('id', userMission.id);

      if (updateError) {
        console.error('Błąd aktualizacji postępu:', updateError);
        continue;
      }

      console.log(`✅ Misja ${missionData.name}: ${newProgress}/${missionData.target_value}`);

      // Sprawdź czy misja została ukończona
      if (newProgress >= missionData.target_value && !userMission.is_completed) {
        await completeMission(
          userMission.id, 
          userId, 
          missionData as DailyMissionData
        );
      }
    }

    return true;
  } catch (err) {
    console.error('Błąd śledzenia misji:', err);
    return false;
  }
}

/**
 * Oznacza misję jako ukończoną i przyznaje nagrody
 */
async function completeMission(
  userMissionId: string,
  userId: string,
  missionData: DailyMissionData
): Promise<void> {
  try {
    // 1. Oznacz misję jako ukończoną
    const { error: completeError } = await supabase
      .from('user_daily_missions')
      .update({ 
        is_completed: true, 
        completed_at: new Date().toISOString() 
      })
      .eq('id', userMissionId);

    if (completeError) {
      console.error('Błąd oznaczania misji jako ukończonej:', completeError);
      return;
    }

    // 2. Przyznaj nagrody - najpierw pobierz aktualne wartości
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('flash_points, experience')
      .eq('id', userId)
      .single();

    if (fetchError || !userData) {
      console.error('Błąd pobierania danych użytkownika:', fetchError);
      return;
    }

    const { error: rewardError } = await supabase
      .from('users')
      .update({
        flash_points: userData.flash_points + missionData.flash_points_reward,
        experience: userData.experience + missionData.experience_reward
      })
      .eq('id', userId);

    if (rewardError) {
      console.error('Błąd przyznawania nagród:', rewardError);
      return;
    }

    console.log(`🎉 Misja ukończona! +${missionData.flash_points_reward} FP, +${missionData.experience_reward} XP`);
    
    // TODO: Wyświetl powiadomienie użytkownikowi
    // showNotification(`Misja ukończona! +${missionData.flash_points_reward} FP`);
    
  } catch (err) {
    console.error('Błąd ukończenia misji:', err);
  }
}

/**
 * Generuje nowe misje na dany dzień (wywołuj o północy lub przy pierwszym logowaniu w dniu)
 */
export async function generateDailyMissions(): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Sprawdź czy misje na dziś już istnieją
    const { data: existing } = await supabase
      .from('daily_missions')
      .select('id')
      .eq('valid_date', today)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log('Misje na dziś już istnieją');
      return;
    }

    // Definicje możliwych misji (losujemy 3-4 dziennie)
    const missionTemplates = [
      {
        name: '🎮 Zagraj 5 gier',
        description: 'Ukończ 5 gier w dowolnym trybie',
        mission_type: 'play_games',
        target_value: 5,
        flash_points_reward: 50,
        experience_reward: 25
      },
      {
        name: '🏆 Wygraj 3 gry',
        description: 'Wygraj 3 gry w trybie Blitz',
        mission_type: 'win_games',
        target_value: 3,
        flash_points_reward: 100,
        experience_reward: 50
      },
      {
        name: '💯 Perfekcyjna gra',
        description: 'Ukończ grę bez jednego błędu',
        mission_type: 'perfect_game',
        target_value: 1,
        flash_points_reward: 150,
        experience_reward: 75
      },
      {
        name: '📚 Odpowiedz na 20 pytań',
        description: 'Odpowiedz poprawnie na 20 pytań',
        mission_type: 'play_games',
        target_value: 20,
        flash_points_reward: 75,
        experience_reward: 40
      },
      {
        name: '💎 Zdobądź 200 Flash Points',
        description: 'Zbierz łącznie 200 Flash Points',
        mission_type: 'earn_flash_points',
        target_value: 200,
        flash_points_reward: 100,
        experience_reward: 50
      }
    ];

    // Losuj 3 misje
    const shuffled = missionTemplates.sort(() => 0.5 - Math.random());
    const selectedMissions = shuffled.slice(0, 3);

    // Zapisz misje do bazy
    for (const mission of selectedMissions) {
      await supabase
        .from('daily_missions')
        .insert({
          ...mission,
          valid_date: today,
          is_active: true
        });
    }

    console.log(`✅ Wygenerowano ${selectedMissions.length} misji na ${today}`);
  } catch (err) {
    console.error('Błąd generowania misji:', err);
  }
}

/**
 * Inicjalizuje misje dla użytkownika na dany dzień
 * Wywołaj przy pierwszym logowaniu użytkownika w dniu
 */
export async function initializeDailyMissions(userId: string): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Najpierw upewnij się, że misje na dziś istnieją
    await generateDailyMissions();

    // Pobierz wszystkie aktywne misje na dziś
    const { data: dailyMissions, error: missionsError } = await supabase
      .from('daily_missions')
      .select('id')
      .eq('valid_date', today)
      .eq('is_active', true);

    if (missionsError || !dailyMissions) {
      console.error('Błąd pobierania misji:', missionsError);
      return;
    }

    // Dla każdej misji, sprawdź czy użytkownik już ją ma
    for (const mission of dailyMissions) {
      const { data: existing } = await supabase
        .from('user_daily_missions')
        .select('id')
        .eq('user_id', userId)
        .eq('mission_id', mission.id)
        .single();

      // Jeśli nie ma, utwórz
      if (!existing) {
        await supabase
          .from('user_daily_missions')
          .insert({
            user_id: userId,
            mission_id: mission.id,
            current_progress: 0,
            is_completed: false
          });
      }
    }

    console.log(`✅ Misje zainicjalizowane dla użytkownika ${userId}`);
  } catch (err) {
    console.error('Błąd inicjalizacji misji:', err);
  }
}

/**
 * Pomocnicze funkcje do szybkiego śledzenia konkretnych akcji
 */

export const MissionTracker = {
  // Gracz ukończył grę
  async onGamePlayed(userId: string) {
    return trackMissionProgress(userId, { missionType: 'play_games' });
  },

  // Gracz wygrał grę
  async onGameWon(userId: string) {
    return trackMissionProgress(userId, { missionType: 'win_games' });
  },

  // Gracz ukończył grę bezbłędnie (100% poprawnych odpowiedzi)
  async onPerfectGame(userId: string) {
    return trackMissionProgress(userId, { missionType: 'perfect_game' });
  },

  // Gracz odpowiedział na pytanie z danej kategorii
  async onCategoryAnswered(userId: string, categoryId: number) {
    return trackMissionProgress(userId, { 
      missionType: 'answer_category',
      categoryId 
    });
  },

  // Gracz zdobył FlashPoints
  async onFlashPointsEarned(userId: string, amount: number) {
    return trackMissionProgress(userId, { 
      missionType: 'earn_flash_points',
      increment: amount 
    });
  }
};

/**
 * Odbiera nagrodę za ukończoną misję
 */
export async function claimMissionReward(
  userId: string,
  userMissionId: string
): Promise<{ success: boolean; reward?: { fp: number; xp: number }; error?: string }> {
  try {
    // Pobierz dane misji użytkownika
    const { data: userMission, error: fetchError } = await supabase
      .from('user_daily_missions')
      .select(`
        id,
        is_completed,
        is_claimed,
        mission_id,
        current_progress
      `)
      .eq('id', userMissionId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !userMission) {
      return { success: false, error: 'Nie znaleziono misji' };
    }

    if (!userMission.is_completed) {
      return { success: false, error: 'Misja nie została ukończona' };
    }

    if (userMission.is_claimed) {
      return { success: false, error: 'Nagroda została już odebrana' };
    }

    // Pobierz dane misji (nagrody)
    const { data: missionData, error: missionError } = await supabase
      .from('daily_missions')
      .select('flash_points_reward, experience_reward')
      .eq('id', userMission.mission_id)
      .single();

    if (missionError || !missionData) {
      return { success: false, error: 'Błąd pobierania danych misji' };
    }

    // Pobierz aktualne dane użytkownika
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('flash_points, experience')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return { success: false, error: 'Błąd pobierania danych użytkownika' };
    }

    // Przyznaj nagrody
    const { error: updateError } = await supabase
      .from('users')
      .update({
        flash_points: userData.flash_points + missionData.flash_points_reward,
        experience: userData.experience + missionData.experience_reward
      })
      .eq('id', userId);

    if (updateError) {
      return { success: false, error: 'Błąd przyznawania nagród' };
    }

    // Oznacz misję jako odebraną
    const { error: claimError } = await supabase
      .from('user_daily_missions')
      .update({ 
        is_claimed: true,
        claimed_at: new Date().toISOString()
      })
      .eq('id', userMissionId);

    if (claimError) {
      return { success: false, error: 'Błąd oznaczania nagrody jako odebranej' };
    }

    console.log(`🎁 Nagroda odebrana! +${missionData.flash_points_reward} FP, +${missionData.experience_reward} XP`);

    return {
      success: true,
      reward: {
        fp: missionData.flash_points_reward,
        xp: missionData.experience_reward
      }
    };
  } catch (err) {
    console.error('Błąd odbierania nagrody:', err);
    return { success: false, error: 'Nieoczekiwany błąd' };
  }
}
