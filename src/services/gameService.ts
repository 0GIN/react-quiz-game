/**
 * @fileoverview Serwis zarządzający logiką gier i zapisywaniem wyników
 * 
 * Ten serwis odpowiada za:
 * - Obliczanie Flash Points i Experience Points na podstawie wyników gry
 * - Zapisywanie wyników gier do bazy danych
 * - Aktualizację statystyk użytkownika (poziom, XP, streak, win/loss ratio)
 * - Integrację z systemem osiągnięć
 * - Zarządzanie poziomami i wymaganym XP do awansu
 * 
 * @module services/gameService
 */

import { supabase } from '../lib/supabase';

export interface GameResult {
  gameMode: 'blitz' | 'duel' | 'squad' | 'master';
  questionsAnswered: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  bestStreak: number;
  livesRemaining?: number;
  categoryId?: number;
  usedFallbackQuestions?: boolean;
  questions: Array<{
    questionId: string;
    answer: string;
    isCorrect: boolean;
    timeTaken?: number;
  }>;
}

export interface GameStats {
  flashPointsEarned: number;
  experienceEarned: number;
  leveledUp: boolean;
  newLevel?: number;
}

/**
 * Oblicza Flash Points na podstawie wyników gry
 */
export function calculateFlashPoints(result: GameResult): number {
  let points = result.score; // Bazowe punkty ze score

  // Bonus za streak
  if (result.bestStreak >= 10) points += 50;
  else if (result.bestStreak >= 5) points += 25;
  else if (result.bestStreak >= 3) points += 10;

  // Bonus za accuracy
  const accuracy = result.correctAnswers / result.questionsAnswered;
  if (accuracy === 1.0) points += 100; // Perfect score!
  else if (accuracy >= 0.9) points += 50;
  else if (accuracy >= 0.75) points += 25;

  // Bonus za tryb Blitz (przetrwanie)
  if (result.gameMode === 'blitz' && result.livesRemaining && result.livesRemaining > 0) {
    points += result.livesRemaining * 20;
  }

  return Math.floor(points);
}

/**
 * Oblicza Experience Points
 */
export function calculateExperience(result: GameResult): number {
  let xp = result.questionsAnswered * 10; // 10 XP za każde pytanie

  // Bonus za poprawne odpowiedzi
  xp += result.correctAnswers * 15;

  // Bonus za streak
  xp += result.bestStreak * 5;

  // Bonus za tryb gry (trudniejsze tryby = więcej XP)
  const modeMultiplier = {
    blitz: 1.2,
    duel: 1.5,
    squad: 1.3,
    master: 1.8,
  };
  xp *= modeMultiplier[result.gameMode];

  return Math.floor(xp);
}

/**
 * Oblicza wymagane XP do następnego poziomu
 */
export function calculateRequiredXP(level: number): number {
  // Wzór: 100 * (1.5 ^ (level - 1))
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

/**
 * Zapisuje wynik gry do bazy danych i aktualizuje statystyki użytkownika
 */
export async function saveGameResult(
  userId: string,
  result: GameResult
): Promise<{ success: boolean; stats?: GameStats; error?: string }> {
  try {
    console.log('💾 Zapisywanie wyniku gry...', result);

    // 1. Pobierz aktualne statystyki użytkownika
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return { success: false, error: 'Nie znaleziono użytkownika' };
    }

    console.log('👤 Aktualne dane użytkownika:', userData);

    // 2. Oblicz punkty i XP
    const flashPointsEarned = calculateFlashPoints(result);
    const experienceEarned = calculateExperience(result);

    console.log(`💰 Flash Points: +${flashPointsEarned}`);
    console.log(`⭐ Experience: +${experienceEarned}`);

    // 3. Oblicz nowy poziom
    const newExperience = userData.experience + experienceEarned;
    
    let newLevel = userData.level;
    let remainingXP = newExperience;
    let leveledUp = false;

    // Sprawdź czy gracz awansował (może być kilka poziomów naraz!)
    while (remainingXP >= calculateRequiredXP(newLevel)) {
      remainingXP -= calculateRequiredXP(newLevel);
      newLevel++;
      leveledUp = true;
    }

    const newRequiredXP = calculateRequiredXP(newLevel);

    console.log(`📊 Poziom: ${userData.level} → ${newLevel} ${leveledUp ? '🎉' : ''}`);
    console.log(`📈 XP: ${remainingXP} / ${newRequiredXP}`);

    // 4. Znajdź ID trybu gry
    const { data: gameModeData } = await supabase
      .from('game_modes')
      .select('id')
      .eq('code', result.gameMode)
      .single();

    const gameModeId = gameModeData?.id || 3; // Default: Blitz

    // 5. Utwórz rekord gry
    const { data: gameData, error: gameError } = await supabase
      .from('games')
      .insert([
        {
          game_mode_id: gameModeId,
          category_id: result.categoryId || null,
          status: 'completed',
          winner_user_id: userId,
          total_questions: result.questionsAnswered,
          ended_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (gameError || !gameData) {
      console.error('❌ Błąd tworzenia gry:', gameError);
      return { success: false, error: 'Nie udało się zapisać gry' };
    }

    const gameId = gameData.id;
    console.log(`🎮 Gra utworzona: ${gameId}`);

    // 6. Dodaj gracza do game_participants
    const { error: participantError } = await supabase
      .from('game_participants')
      .insert([
        {
          game_id: gameId,
          user_id: userId,
          score: result.score,
          correct_answers: result.correctAnswers,
          wrong_answers: result.wrongAnswers,
          lives_remaining: result.livesRemaining || 0,
          placement: 1,
          flash_points_earned: flashPointsEarned,
          experience_earned: experienceEarned,
        },
      ]);

    if (participantError) {
      console.error('❌ Błąd dodawania uczestnika:', participantError);
    }

    // 7. Zapisz pytania i odpowiedzi
    const isValidUUID = (value: string | null | undefined) =>
      typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

    const persistedQuestions = result.questions
      .map((q, index) => ({
        game_id: gameId,
        question_id: isValidUUID(q.questionId) ? q.questionId : null,
        question_order: index + 1,
      }))
      .filter((entry) => entry.question_id !== null);

    if (persistedQuestions.length > 0) {
      const { error: questionsError } = await supabase
        .from('game_questions')
        .insert(persistedQuestions);

      if (questionsError) {
        console.error('❌ Błąd zapisywania pytań:', questionsError);
      }
    } else if (result.usedFallbackQuestions) {
      console.log('ℹ️ Pomijam zapisywanie pytań – gra korzystała z fallbackowych danych.');
    }

    const persistedAnswers = result.questions
      .map((q) => ({
        game_id: gameId,
        user_id: userId,
        question_id: isValidUUID(q.questionId) ? q.questionId : null,
        answer_given: q.answer,
        is_correct: q.isCorrect,
        time_taken_seconds: q.timeTaken || null,
      }))
      .filter((answer) => answer.question_id !== null);

    if (persistedAnswers.length > 0) {
      const { error: answersError } = await supabase
        .from('game_answers')
        .insert(persistedAnswers);

      if (answersError) {
        console.error('❌ Błąd zapisywania odpowiedzi:', answersError);
      }
    } else if (result.usedFallbackQuestions) {
      console.log('ℹ️ Pomijam zapisywanie odpowiedzi – gra korzystała z fallbackowych danych.');
    }

    // 8. Oblicz nowy streak (tylko dla trybów PvP, nie dla Blitz!)
    const isWin = result.gameMode === 'blitz' 
      ? result.questionsAnswered >= 10 // Blitz: wygrana jeśli odpowiedział na min. 10 pytań
      : result.correctAnswers > result.wrongAnswers; // Inne tryby: więcej poprawnych
    
    const shouldCountToWinRate = result.gameMode !== 'blitz'; // Blitz nie liczy się do win rate
    
    const newCurrentStreak = isWin ? userData.current_streak + 1 : 0;
    const newBestStreak = Math.max(userData.best_streak, result.bestStreak, newCurrentStreak);

    // 9. Aktualizuj statystyki użytkownika
    const { error: updateError } = await supabase
      .from('users')
      .update({
        flash_points: userData.flash_points + flashPointsEarned,
        level: newLevel,
        experience: remainingXP,
        experience_to_next_level: newRequiredXP,
        total_games_played: userData.total_games_played + 1,
        // Blitz nie liczy się do win/loss statistics
        total_wins: shouldCountToWinRate && isWin ? userData.total_wins + 1 : userData.total_wins,
        total_losses: shouldCountToWinRate && !isWin ? userData.total_losses + 1 : userData.total_losses,
        total_correct_answers: userData.total_correct_answers + result.correctAnswers,
        total_questions_answered: userData.total_questions_answered + result.questionsAnswered,
        current_streak: newCurrentStreak,
        best_streak: newBestStreak,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ Błąd aktualizacji użytkownika:', updateError);
      return { success: false, error: 'Nie udało się zaktualizować statystyk' };
    }

    console.log('✅ Gra zapisana pomyślnie!');
    console.table({
      'Flash Points dodane': flashPointsEarned,
      'Doświadczenie dodane': experienceEarned,
      'Poziom przed': userData.level,
      'Poziom po': newLevel,
      'Awans': leveledUp ? '⬆️ TAK' : 'nie',
      'Wygrana': isWin ? '✅ TAK' : 'nie',
      'Perfekcyjna gra': (result.correctAnswers === result.questionsAnswered && result.questionsAnswered > 0) ? '🎯 TAK' : 'nie'
    });

    // 10. Sprawdź i odblokuj nowe osiągnięcia (ASYNC - nie blokuj)
    // Uruchom w tle, nie czekaj na wynik
    import('./achievementService')
      .then(({ checkAndUnlockAchievements }) => checkAndUnlockAchievements(userId))
      .then(() => console.log('✅ Osiągnięcia sprawdzone'))
      .catch((err) => console.error('⚠️ Błąd osiągnięć (nie krytyczny):', err));

    return {
      success: true,
      stats: {
        flashPointsEarned,
        experienceEarned,
        leveledUp,
        newLevel: leveledUp ? newLevel : undefined,
      },
    };
  } catch (error) {
    console.error('❌ Nieoczekiwany błąd:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Nieznany błąd' 
    };
  }
}

/**
 * Pobiera historię gier użytkownika
 */
export async function getGameHistory(userId: string, limit = 20) {
  try {
    const { data, error } = await supabase
      .from('game_participants')
      .select(`
        *,
        games (
          id,
          game_mode_id,
          category_id,
          started_at,
          ended_at,
          total_questions,
          game_modes (
            name,
            code
          ),
          categories (
            name,
            icon_emoji
          )
        )
      `)
      .eq('user_id', userId)
      .order('joined_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Błąd pobierania historii:', error);
      return { success: false, data: [], error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('❌ Nieoczekiwany błąd:', error);
    return { success: false, data: [], error: 'Nieznany błąd' };
  }
}
