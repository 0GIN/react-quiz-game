import { supabase } from '../lib/supabase';

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
 * Inicjalizuje misje dla użytkownika na dany dzień
 * Wywołaj przy pierwszym logowaniu użytkownika w dniu
 */
export async function initializeDailyMissions(userId: string): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
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
