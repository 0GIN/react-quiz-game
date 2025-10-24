/**
 * Synchronizuje milestone'y osiągnięć z aktualnymi statystykami użytkownika
 */
export async function synchronizeAchievementsProgress(userId: string): Promise<void> {
  // Pobierz dane użytkownika
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  if (userError || !user) return;

  // Pobierz już odblokowane osiągnięcia
  const { data: unlockedAchievements } = await supabase
    .from('user_achievements')
    .select('achievement_id, milestone_level')
    .eq('user_id', userId);
  const unlocked = new Set(
    (unlockedAchievements || []).map(a => `${a.achievement_id}_${a.milestone_level}`)
  );

  // Sprawdź każdą kategorię i milestone
  for (const category of ACHIEVEMENT_CATEGORIES) {
    const currentProgress = category.getCurrentProgress(user);
    for (const milestone of category.milestones) {
      const achievementKey = `${category.id}_${milestone.level}`;
      if (!unlocked.has(achievementKey) && currentProgress >= milestone.target) {
        await unlockAchievement(userId, category, milestone);
      }
    }
  }
}
import { supabase } from '../lib/supabase';

/**
 * Kategorie osiągnięć z milestones
 */
export interface AchievementMilestone {
  level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  target: number;
  reward_fp: number;
  reward_xp: number;
  icon: string;
  name: string;
}

export interface AchievementCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  milestones: AchievementMilestone[];
  getCurrentProgress: (user: any) => number;
}

/**
 * Definicje wszystkich kategorii osiągnięć
 */
export const ACHIEVEMENT_CATEGORIES: AchievementCategory[] = [
  {
    id: 'total_games',
    title: '🎮 Mistrz Gry',
    description: 'Zagraj określoną liczbę gier',
    icon: '🎮',
    getCurrentProgress: (user) => user?.total_games_played || 0,
    milestones: [
      { level: 'bronze', target: 10, reward_fp: 50, reward_xp: 100, icon: '🥉', name: 'Debiutant' },
      { level: 'silver', target: 50, reward_fp: 150, reward_xp: 300, icon: '🥈', name: 'Gracz' },
      { level: 'gold', target: 100, reward_fp: 300, reward_xp: 600, icon: '🥇', name: 'Weteran' },
      { level: 'platinum', target: 500, reward_fp: 1000, reward_xp: 2000, icon: '💎', name: 'Mistrz' },
      { level: 'diamond', target: 1000, reward_fp: 2500, reward_xp: 5000, icon: '💠', name: 'Legenda' },
    ],
  },
  {
    id: 'total_wins',
    title: '🏆 Legenda Wygranych',
    description: 'Wygraj określoną liczbę gier',
    icon: '🏆',
    getCurrentProgress: (user) => user?.total_wins || 0,
    milestones: [
      { level: 'bronze', target: 5, reward_fp: 75, reward_xp: 150, icon: '🥉', name: 'Zwycięzca' },
      { level: 'silver', target: 25, reward_fp: 200, reward_xp: 400, icon: '🥈', name: 'Champion' },
      { level: 'gold', target: 100, reward_fp: 500, reward_xp: 1000, icon: '🥇', name: 'Triumfator' },
      { level: 'platinum', target: 250, reward_fp: 1500, reward_xp: 3000, icon: '💎', name: 'Niepokonany' },
      { level: 'diamond', target: 500, reward_fp: 3000, reward_xp: 6000, icon: '💠', name: 'Bóg Gry' },
    ],
  },
  {
    id: 'flash_points',
    title: '💎 Kolekcjoner Flash Points',
    description: 'Zdobądź określoną liczbę Flash Points',
    icon: '💎',
    getCurrentProgress: (user) => user?.flash_points || 0,
    milestones: [
      { level: 'bronze', target: 1000, reward_fp: 100, reward_xp: 200, icon: '🥉', name: 'Zbieracz' },
      { level: 'silver', target: 5000, reward_fp: 300, reward_xp: 600, icon: '🥈', name: 'Handlarz' },
      { level: 'gold', target: 25000, reward_fp: 1000, reward_xp: 2000, icon: '🥇', name: 'Bogacz' },
      { level: 'platinum', target: 100000, reward_fp: 3000, reward_xp: 6000, icon: '💎', name: 'Milioner' },
      { level: 'diamond', target: 500000, reward_fp: 10000, reward_xp: 20000, icon: '💠', name: 'Multimilioner' },
    ],
  },
  {
    id: 'correct_answers',
    title: '📊 Ekspert Wiedzy',
    description: 'Odpowiedz poprawnie na pytania',
    icon: '📊',
    getCurrentProgress: (user) => user?.total_correct_answers || 0,
    milestones: [
      { level: 'bronze', target: 100, reward_fp: 50, reward_xp: 100, icon: '🥉', name: 'Uczeń' },
      { level: 'silver', target: 500, reward_fp: 200, reward_xp: 400, icon: '🥈', name: 'Student' },
      { level: 'gold', target: 2500, reward_fp: 600, reward_xp: 1200, icon: '🥇', name: 'Profesor' },
      { level: 'platinum', target: 10000, reward_fp: 2000, reward_xp: 4000, icon: '💎', name: 'Geniusz' },
      { level: 'diamond', target: 50000, reward_fp: 5000, reward_xp: 10000, icon: '💠', name: 'Wszechwiedzący' },
    ],
  },
  {
    id: 'best_streak',
    title: '🔥 Mistrz Streaka',
    description: 'Osiągnij najdłuższy streak poprawnych odpowiedzi',
    icon: '🔥',
    getCurrentProgress: (user) => user?.best_streak || 0,
    milestones: [
      { level: 'bronze', target: 5, reward_fp: 100, reward_xp: 200, icon: '🥉', name: 'Zapalnik' },
      { level: 'silver', target: 10, reward_fp: 250, reward_xp: 500, icon: '🥈', name: 'Płomień' },
      { level: 'gold', target: 25, reward_fp: 600, reward_xp: 1200, icon: '🥇', name: 'Inferno' },
      { level: 'platinum', target: 50, reward_fp: 1500, reward_xp: 3000, icon: '💎', name: 'Piekło' },
      { level: 'diamond', target: 100, reward_fp: 3500, reward_xp: 7000, icon: '💠', name: 'Supernowa' },
    ],
  },
  {
    id: 'level',
    title: '📈 Wspinacz Poziomów',
    description: 'Osiągnij określony poziom',
    icon: '📈',
    getCurrentProgress: (user) => user?.level || 1,
    milestones: [
      { level: 'bronze', target: 5, reward_fp: 50, reward_xp: 0, icon: '🥉', name: 'Nowicjusz' },
      { level: 'silver', target: 10, reward_fp: 150, reward_xp: 0, icon: '🥈', name: 'Podróżnik' },
      { level: 'gold', target: 25, reward_fp: 500, reward_xp: 0, icon: '🥇', name: 'Odkrywca' },
      { level: 'platinum', target: 50, reward_fp: 1500, reward_xp: 0, icon: '💎', name: 'Pionier' },
      { level: 'diamond', target: 100, reward_fp: 5000, reward_xp: 0, icon: '💠', name: 'Kosmonau ta' },
    ],
  },
  {
    id: 'questions_answered',
    title: '🧠 Encyklopedia',
    description: 'Odpowiedz na pytania (łącznie ze złymi)',
    icon: '🧠',
    getCurrentProgress: (user) => user?.total_questions_answered || 0,
    milestones: [
      { level: 'bronze', target: 200, reward_fp: 50, reward_xp: 100, icon: '🥉', name: 'Czytelnik' },
      { level: 'silver', target: 1000, reward_fp: 200, reward_xp: 400, icon: '🥈', name: 'Badacz' },
      { level: 'gold', target: 5000, reward_fp: 700, reward_xp: 1400, icon: '🥇', name: 'Naukowiec' },
      { level: 'platinum', target: 20000, reward_fp: 2500, reward_xp: 5000, icon: '💎', name: 'Mędrzec' },
      { level: 'diamond', target: 100000, reward_fp: 7500, reward_xp: 15000, icon: '💠', name: 'Orakuł' },
    ],
  },
  {
    id: 'win_rate_80',
    title: '🎯 Snajper',
    description: 'Utrzymuj 80%+ win rate przez 50+ gier',
    icon: '🎯',
    getCurrentProgress: (user) => {
      const total = (user?.total_wins || 0) + (user?.total_losses || 0);
      if (total < 50) return 0;
      const winRate = (user?.total_wins || 0) / total;
      return winRate >= 0.8 ? 1 : 0;
    },
    milestones: [
      { level: 'gold', target: 1, reward_fp: 1000, reward_xp: 2000, icon: '🥇', name: 'Snajper Elitarny' },
    ],
  },
  {
    id: 'current_streak_10',
    title: '⚡ Błyskawica',
    description: 'Utrzymaj aktywny streak na poziomie 10+',
    icon: '⚡',
    getCurrentProgress: (user) => user?.current_streak >= 10 ? 1 : 0,
    milestones: [
      { level: 'silver', target: 1, reward_fp: 300, reward_xp: 600, icon: '🥈', name: 'Nieustępliwy' },
    ],
  },
  {
    id: 'perfect_accuracy',
    title: '💯 Perfekcjonista',
    description: 'Osiągnij 100% celność w grze z min. 20 pytaniami',
    icon: '💯',
    getCurrentProgress: (user) => 0, // Trzeba sprawdzać w historii gier
    milestones: [
      { level: 'bronze', target: 1, reward_fp: 200, reward_xp: 400, icon: '🥉', name: 'Bez Błędu' },
      { level: 'silver', target: 10, reward_fp: 500, reward_xp: 1000, icon: '🥈', name: 'Idealista' },
      { level: 'gold', target: 50, reward_fp: 1500, reward_xp: 3000, icon: '🥇', name: 'Perfekcja' },
      { level: 'platinum', target: 100, reward_fp: 3000, reward_xp: 6000, icon: '💎', name: 'Bezbłędny' },
      { level: 'diamond', target: 500, reward_fp: 10000, reward_xp: 20000, icon: '💠', name: 'Boski' },
    ],
  },
];

/**
 * Sprawdza i odblokowuje nowe osiągnięcia dla użytkownika
 */
export async function checkAndUnlockAchievements(userId: string): Promise<void> {
  try {
    // Pobierz dane użytkownika
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('Błąd pobierania użytkownika:', userError);
      return;
    }

    // Pobierz już odblokowane osiągnięcia
    const { data: unlockedAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id, milestone_level')
      .eq('user_id', userId);

    const unlocked = new Set(
      (unlockedAchievements || []).map(a => `${a.achievement_id}_${a.milestone_level}`)
    );

    // Sprawdź każdą kategorię
    for (const category of ACHIEVEMENT_CATEGORIES) {
      const currentProgress = category.getCurrentProgress(user);

      for (const milestone of category.milestones) {
        const achievementKey = `${category.id}_${milestone.level}`;

        // Jeśli nie odblokowane i osiągnięto cel
        if (!unlocked.has(achievementKey) && currentProgress >= milestone.target) {
          await unlockAchievement(userId, category, milestone);
        }
      }
    }
  } catch (error) {
    console.error('Błąd sprawdzania osiągnięć:', error);
  }
}

/**
 * Odblokowuje osiągnięcie i przyznaje nagrody
 */
async function unlockAchievement(
  userId: string,
  category: AchievementCategory,
  milestone: AchievementMilestone
): Promise<void> {
  try {
    // Zapisz osiągnięcie
    const { error: insertError } = await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: category.id,
        milestone_level: milestone.level,
        unlocked_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Błąd zapisywania osiągnięcia:', insertError);
      return;
    }

    // Przyznaj nagrody
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
        flash_points: userData.flash_points + milestone.reward_fp,
        experience: userData.experience + milestone.reward_xp,
      })
      .eq('id', userId);

    if (rewardError) {
      console.error('Błąd przyznawania nagród:', rewardError);
      return;
    }

    console.log(
      `🎖️ Osiągnięcie odblokowane! ${milestone.icon} ${category.title} - ${milestone.name}
      +${milestone.reward_fp} FP, +${milestone.reward_xp} XP`
    );
  } catch (error) {
    console.error('Błąd odblokowywania osiągnięcia:', error);
  }
}

/**
 * Pobiera osiągnięcia użytkownika
 */
export async function getUserAchievements(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) {
      console.error('Błąd pobierania osiągnięć:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Błąd pobierania osiągnięć:', error);
    return [];
  }
}
