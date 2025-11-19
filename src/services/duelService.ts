/**
 * @fileoverview Serwis zarządzania pojedynkami Duel (1v1)
 * 
 * Struktura pojedynku:
 * - 5 rund po 3 pytania = 15 pytań łącznie
 * - Gracze na zmianę wybierają kategorie
 * - Turowa rozgrywka (asynchroniczna)
 * - Te same pytania dla obu graczy w rundzie
 */

import { supabase } from '@/lib/supabase';

// ========================================
// TYPY
// ========================================

export interface DuelMatch {
  id: string;
  player1_id: string;
  player2_id: string;
  status: 'pending' | 'active' | 'completed' | 'declined' | 'cancelled';
  current_round: number;
  current_turn_player_id: string | null;
  player1_score: number;
  player2_score: number;
  winner_id: string | null;
  challenge_message: string | null;
  created_at: string;
  accepted_at: string | null;
  completed_at: string | null;
  last_activity_at: string;
  is_ranked?: boolean;
  master_category_id?: number | null;
  // Relations
  player1?: {
    id: string;
    username: string;
    avatar_url: string;
  };
  player2?: {
    id: string;
    username: string;
    avatar_url: string;
  };
}

export interface DuelRound {
  id: string;
  match_id: string;
  round_number: number;
  category_chooser_id: string;
  category_id: number;
  question1_id: string;
  question2_id: string;
  question3_id: string;
  player1_answered: boolean;
  player2_answered: boolean;
  player1_correct: number;
  player2_correct: number;
  created_at: string;
  player1_answered_at: string | null;
  player2_answered_at: string | null;
  // Randomized answers stored as JSONB
  answers_q1?: {
    A: string;
    B: string;
    C: string;
    D: string;
    correct: string;
  };
  answers_q2?: {
    A: string;
    B: string;
    C: string;
    D: string;
    correct: string;
  };
  answers_q3?: {
    A: string;
    B: string;
    C: string;
    D: string;
    correct: string;
  };
  // Relations
  category?: {
    id: number;
    name: string;
    icon_emoji: string;
  };
}

export interface DuelAnswer {
  id: string;
  round_id: string;
  player_id: string;
  question_id: string;
  selected_answer: 'A' | 'B' | 'C' | 'D';
  is_correct: boolean;
  time_taken: number | null;
  answered_at: string;
}

export interface DuelQuestion {
  id: string;
  content: string;
  answer_a: string;
  answer_b: string;
  answer_c: string;
  answer_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  category_id: number;
  difficulty: string;
  answersJson?: {
    A: string;
    B: string;
    C: string;
    D: string;
    correct: string;
  };
}

export interface DuelQueueEntry {
  id: string;
  user_id: string;
  level: number;
  flash_points: number;
  preferred_categories: number[] | null;
  message: string | null;
  created_at: string;
  expires_at: string;
  // Relations
  user_data?: {
    id: string;
    username: string;
    avatar_url: string;
    level: number;
  };
}

// ========================================
// TWORZENIE I ZARZĄDZANIE POJEDYNKAMI
// ========================================

/**
 * Wysyła wyzwanie do pojedynku
 */
export async function createDuelChallenge(
  challengerId: string,
  challengedId: string,
  message?: string,
  masterCategoryId?: number
): Promise<{ success: boolean; matchId?: string; error?: string }> {
  try {
    // Sprawdź czy nie ma już aktywnego pojedynku między tymi graczami
    const { data: existing } = await supabase
      .from('duel_matches')
      .select('id')
      .or(`player1_id.eq.${challengerId},player2_id.eq.${challengerId}`)
      .or(`player1_id.eq.${challengedId},player2_id.eq.${challengedId}`)
      .in('status', ['pending', 'active'])
      .single();

    if (existing) {
      return { success: false, error: 'Masz już aktywny pojedynek z tym graczem' };
    }

    // Utwórz pojedynek - dodajemy tylko zdefiniowane pola
    const insertData: any = {
      player1_id: challengerId,
      player2_id: challengedId,
      status: 'pending',
      current_round: 0,
    };

    // Dodaj opcjonalne pola tylko jeśli są zdefiniowane
    if (message !== undefined && message !== null && message !== '') {
      insertData.challenge_message = message;
    }
    
    if (masterCategoryId !== undefined && masterCategoryId !== null) {
      insertData.master_category_id = masterCategoryId;
    }

    console.log('📤 Inserting duel match:', insertData);

    const { data, error } = await supabase
      .from('duel_matches')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    return { success: true, matchId: data.id };
  } catch (error) {
    console.error('❌ Error creating duel challenge:', error);
    return { success: false, error: 'Nie udało się wysłać wyzwania' };
  }
}

/**
 * Akceptuje wyzwanie do pojedynku
 */
export async function acceptDuelChallenge(
  matchId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Wyrzuć gracza z kolejki (jeśli jest)
    await leaveDuelQueue(userId);
    
    // 2. Zaakceptuj wyzwanie
    const { error } = await supabase
      .from('duel_matches')
      .update({
        status: 'active',
        accepted_at: new Date().toISOString(),
        current_round: 1,
        current_turn_player_id: null, // Player1 zaczyna (wybiera kategorię)
      })
      .eq('id', matchId)
      .eq('player2_id', userId)
      .eq('status', 'pending');

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('❌ Error accepting duel:', error);
    return { success: false, error: 'Nie udało się zaakceptować wyzwania' };
  }
}

/**
 * Odrzuca wyzwanie do pojedynku
 */
export async function declineDuelChallenge(
  matchId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('duel_matches')
      .update({
        status: 'declined',
      })
      .eq('id', matchId)
      .eq('player2_id', userId)
      .eq('status', 'pending');

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('❌ Error declining duel:', error);
    return { success: false, error: 'Nie udało się odrzucić wyzwania' };
  }
}

/**
 * Poddaje pojedynek (gracious exit)
 */
export async function surrenderDuel(
  matchId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Pobierz dane meczu
    const { data: match, error: fetchError } = await supabase
      .from('duel_matches')
      .select('player1_id, player2_id, status')
      .eq('id', matchId)
      .single();

    if (fetchError) throw fetchError;
    if (!match) return { success: false, error: 'Mecz nie został znaleziony' };
    if (match.status !== 'active') return { success: false, error: 'Możesz się poddać tylko w aktywnym meczu' };

    // Określ zwycięzcę (przeciwnik)
    const winnerId = match.player1_id === userId ? match.player2_id : match.player1_id;

    // Zaktualizuj mecz
    const { error: updateError } = await supabase
      .from('duel_matches')
      .update({
        status: 'completed',
        winner_id: winnerId,
        completed_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', matchId);

    if (updateError) throw updateError;

    // Wywołaj funkcję obliczającą statystyki (doda wygraną dla przeciwnika)
    console.log('🏳️ Surrendering - calling complete_duel_match...', { matchId });
    
    const { data: completeData, error: completeError } = await supabase.rpc('complete_duel_match', { p_match_id: matchId });
    
    if (completeError) {
      console.error('❌ Error in complete_duel_match during surrender:', completeError);
      // Nie rzucaj błędu - mecz jest już zakończony
    } else {
      console.log('✅ complete_duel_match succeeded during surrender', { completeData });
      console.log('💰 Rewards should be added - winner gets +100 FP, +150 XP');
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Error surrendering duel:', error);
    return { success: false, error: 'Nie udało się poddać meczu' };
  }
}

// ========================================
// POBIERANIE DANYCH
// ========================================

/**
 * Pobiera listę pojedynków użytkownika
 */
export async function getUserDuels(
  userId: string,
  status?: 'pending' | 'active' | 'completed'
): Promise<DuelMatch[]> {
  try {
    let query = supabase
      .from('duel_matches')
      .select(`
        *,
        player1:users!duel_matches_player1_id_fkey(id, username, avatar_url),
        player2:users!duel_matches_player2_id_fkey(id, username, avatar_url)
      `)
      .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
      .order('last_activity_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('❌ Error fetching duels:', error);
    return [];
  }
}

/**
 * Pobiera szczegóły pojedynku
 */
export async function getDuelDetails(matchId: string): Promise<DuelMatch | null> {
  try {
    const { data, error } = await supabase
      .from('duel_matches')
      .select(`
        *,
        player1:users!duel_matches_player1_id_fkey(id, username, avatar_url),
        player2:users!duel_matches_player2_id_fkey(id, username, avatar_url)
      `)
      .eq('id', matchId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('❌ Error fetching duel details:', error);
    return null;
  }
}

/**
 * Pobiera rundy pojedynku
 */
export async function getDuelRounds(matchId: string): Promise<DuelRound[]> {
  try {
    const { data, error } = await supabase
      .from('duel_rounds')
      .select(`
        *,
        category:categories(id, name, icon_emoji)
      `)
      .eq('match_id', matchId)
      .order('round_number', { ascending: true });

    if (error) throw error;

    if (data && data.length > 0) {
      console.log('🔄 getDuelRounds - FULL ROUND DATA:');
      data.forEach(r => {
        console.log(`  Round ${r.round_number}:`, {
          id: r.id,
          has_answers_q1: !!r.answers_q1,
          has_answers_q2: !!r.answers_q2,
          has_answers_q3: !!r.answers_q3,
          answers_q1: r.answers_q1,
          answers_q2: r.answers_q2,
          answers_q3: r.answers_q3,
        });
      });
    }

    return data || [];
  } catch (error) {
    console.error('❌ Error fetching duel rounds:', error);
    return [];
  }
}

/**
 * Pobiera odpowiedzi gracza w rundzie
 */
export async function getRoundAnswers(
  roundId: string,
  playerId: string
): Promise<DuelAnswer[]> {
  try {
    const { data, error } = await supabase
      .from('duel_answers')
      .select('*')
      .eq('round_id', roundId)
      .eq('player_id', playerId)
      .order('answered_at', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('❌ Error fetching round answers:', error);
    return [];
  }
}

// ========================================
// ROZGRYWKA
// ========================================

/**
 * Wybiera kategorię dla rundy (rozpoczyna rundę)
 */
export async function selectCategoryForRound(
  matchId: string,
  roundNumber: number,
  categoryId: number,
  chooserId: string
): Promise<{ success: boolean; roundId?: string; questions?: DuelQuestion[]; error?: string }> {
  try {
    // Sprawdź czy runda już nie istnieje
    const { data: existingRound } = await supabase
      .from('duel_rounds')
      .select('id')
      .eq('match_id', matchId)
      .eq('round_number', roundNumber)
      .single();

    if (existingRound) {
      console.log('⚠️ Round already exists:', existingRound);
      return { success: false, error: 'Ta runda już została rozpoczęta' };
    }

    // Losuj 3 pytania z wybranej kategorii
    const { data: rawQuestions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_approved', true)
      .eq('is_active', true)
      .limit(100); // Pobierz więcej, żeby wylosować

    if (questionsError || !rawQuestions || rawQuestions.length < 3) {
      console.error('❌ Questions error:', questionsError);
      return { success: false, error: 'Brak wystarczającej liczby pytań w tej kategorii' };
    }

    // Losuj 3 pytania
    const shuffled = [...rawQuestions];
    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const selectedRaw = shuffled.slice(0, 3);

    // Przekształć pytania do formatu DuelQuestion
    const selectedQuestions: DuelQuestion[] = selectedRaw.map((q, index) => {
      // Losuj kolejność odpowiedzi - Fisher-Yates
      const answers = [
        { text: q.correct_answer, isCorrect: true },
        { text: q.wrong_answer_1, isCorrect: false },
        { text: q.wrong_answer_2, isCorrect: false },
        { text: q.wrong_answer_3, isCorrect: false },
      ];
      
      console.log(`🎲 BEFORE shuffle Q${index + 1}:`, {
        '0': answers[0].text.substring(0, 20) + '...',
        '1': answers[1].text.substring(0, 20) + '...',
        '2': answers[2].text.substring(0, 20) + '...',
        '3': answers[3].text.substring(0, 20) + '...',
        correct_is_at_index: answers.findIndex(a => a.isCorrect),
      });
      
      // Fisher-Yates shuffle dla odpowiedzi
      for (let i = answers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [answers[i], answers[j]] = [answers[j], answers[i]];
      }

      // Przypisz litery A, B, C, D DOPIERO PO shuffle
      const shuffledAnswers = [
        { letter: 'A' as const, text: answers[0].text, isCorrect: answers[0].isCorrect },
        { letter: 'B' as const, text: answers[1].text, isCorrect: answers[1].isCorrect },
        { letter: 'C' as const, text: answers[2].text, isCorrect: answers[2].isCorrect },
        { letter: 'D' as const, text: answers[3].text, isCorrect: answers[3].isCorrect },
      ];
      
      const correctLetter = shuffledAnswers.find(a => a.isCorrect)!.letter;
      
      console.log(`🎲 AFTER shuffle Q${index + 1}:`, {
        A: shuffledAnswers[0].text.substring(0, 20) + '...',
        B: shuffledAnswers[1].text.substring(0, 20) + '...',
        C: shuffledAnswers[2].text.substring(0, 20) + '...',
        D: shuffledAnswers[3].text.substring(0, 20) + '...',
        correct_is_now: correctLetter,
        correct_at_index: shuffledAnswers.findIndex(a => a.isCorrect),
      });

      return {
        id: q.id,
        content: q.question_text,
        answer_a: shuffledAnswers[0].text,
        answer_b: shuffledAnswers[1].text,
        answer_c: shuffledAnswers[2].text,
        answer_d: shuffledAnswers[3].text,
        correct_answer: correctLetter,
        category_id: q.category_id,
        difficulty: q.difficulty_level,
        // Store the randomized answers for database
        answersJson: {
          A: shuffledAnswers[0].text,
          B: shuffledAnswers[1].text,
          C: shuffledAnswers[2].text,
          D: shuffledAnswers[3].text,
          correct: correctLetter,
        },
      };
    });

    console.log('✅ Selected questions:', selectedQuestions);

    // Utwórz rundę z zapisanymi wylosowanymi odpowiedziami
    console.log('💾 Inserting round with answers:', {
      answers_q1: selectedQuestions[0].answersJson,
      answers_q2: selectedQuestions[1].answersJson,
      answers_q3: selectedQuestions[2].answersJson,
    });
    
    const { data: round, error: roundError } = await supabase
      .from('duel_rounds')
      .insert({
        match_id: matchId,
        round_number: roundNumber,
        category_chooser_id: chooserId,
        category_id: categoryId,
        question1_id: selectedQuestions[0].id,
        question2_id: selectedQuestions[1].id,
        question3_id: selectedQuestions[2].id,
        answers_q1: selectedQuestions[0].answersJson,
        answers_q2: selectedQuestions[1].answersJson,
        answers_q3: selectedQuestions[2].answersJson,
      })
      .select()
      .single();

    if (roundError) {
      console.error('❌ Round insert error:', roundError);
      throw roundError;
    }
    
    console.log('✅ Round inserted with answers:', {
      round_id: round?.id,
      has_answers_q1: !!round?.answers_q1,
      has_answers_q2: !!round?.answers_q2,
      has_answers_q3: !!round?.answers_q3,
    });

    // Ustaw turę na gracza, który wybrał kategorię (odpowiada pierwszy)
    await supabase
      .from('duel_matches')
      .update({
        current_turn_player_id: chooserId,
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', matchId);

    return {
      success: true,
      roundId: round.id,
      questions: selectedQuestions,
    };
  } catch (error) {
    console.error('❌ Error selecting category:', error);
    return { success: false, error: 'Nie udało się wybrać kategorii' };
  }
}

/**
 * Zapisuje odpowiedzi gracza na pytania w rundzie
 */
export async function submitRoundAnswers(
  roundId: string,
  matchId: string,
  playerId: string,
  answers: Array<{
    questionId: string;
    selectedAnswer: 'A' | 'B' | 'C' | 'D';
    isCorrect: boolean;
    timeTaken?: number;
  }>
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('📝 Submitting round answers:', {
      roundId,
      matchId,
      playerId,
      answersCount: answers.length,
    });

    // Zapisz odpowiedzi (upsert aby uniknąć błędów duplicate key)
    const answerRecords = answers.map(ans => ({
      round_id: roundId,
      player_id: playerId,
      question_id: ans.questionId,
      selected_answer: ans.selectedAnswer,
      is_correct: ans.isCorrect,
      time_taken: ans.timeTaken,
    }));

    console.log('📝 Answer records to insert:', answerRecords);

    // Najpierw sprawdź czy odpowiedzi już istnieją
    const { data: existingAnswers } = await supabase
      .from('duel_answers')
      .select('question_id')
      .eq('round_id', roundId)
      .eq('player_id', playerId);

    if (existingAnswers && existingAnswers.length > 0) {
      console.log('⚠️ Answers already exist for this round, skipping insert');
      // Odpowiedzi już zapisane - kontynuuj bez próby ponownego zapisu
    } else {
      // Zapisz nowe odpowiedzi
      const { error: answersError } = await supabase
        .from('duel_answers')
        .insert(answerRecords);

      if (answersError) {
        console.error('❌ Error inserting answers:', answersError);
        throw answersError;
      }

      console.log('✅ Answers inserted successfully');
    }

    // Pobierz dane rundy
    const { data: roundData, error: roundError } = await supabase
      .from('duel_rounds')
      .select('*, match_id')
      .eq('id', roundId)
      .single();

    if (roundError) {
      console.error('❌ Error fetching round:', roundError);
      throw roundError;
    }

    console.log('📊 Round data:', roundData);

    // Pobierz dane meczu
    const { data: match, error: matchError } = await supabase
      .from('duel_matches')
      .select('player1_id, player2_id, current_round')
      .eq('id', matchId)
      .single();

    if (matchError) {
      console.error('❌ Error fetching match:', matchError);
      throw matchError;
    }

    console.log('🎮 Match data:', match);

    const isPlayer1 = playerId === match.player1_id;

    // Sprawdź czy gracz już nie odpowiedział wcześniej
    const playerAnsweredField = isPlayer1 ? 'player1_answered' : 'player2_answered';
    if (roundData[playerAnsweredField]) {
      console.log('⚠️ Player already answered this round, skipping update');
      return { success: true }; // Już odpowiedział, sukces
    }

    // Zaktualizuj rundę - oznacz że gracz odpowiedział
    const updateData: any = {
      [`player${isPlayer1 ? '1' : '2'}_answered`]: true,
      [`player${isPlayer1 ? '1' : '2'}_answered_at`]: new Date().toISOString(),
    };

    console.log('📝 Updating round with:', updateData);

    const { error: updateError } = await supabase
      .from('duel_rounds')
      .update(updateData)
      .eq('id', roundId);

    if (updateError) {
      console.error('❌ Error updating round:', updateError);
      throw updateError;
    }

    console.log('✅ Round updated successfully');

    // Oblicz wyniki rundy
    console.log('🧮 Calculating round scores...');
    const { error: calcError } = await supabase.rpc('calculate_round_scores', { p_round_id: roundId });

    if (calcError) {
      console.error('❌ Error calculating scores:', calcError);
      // Nie rzucaj błędu - kontynuuj mimo problemu z obliczaniem
    } else {
      console.log('✅ Scores calculated successfully');
    }

    // Sprawdź czy obaj gracze odpowiedzieli
    console.log('🔍 Checking if both players answered...');
    const { data: updatedRound, error: checkError } = await supabase
      .from('duel_rounds')
      .select('player1_answered, player2_answered, round_number, player1_correct, player2_correct')
      .eq('id', roundId)
      .single();

    if (checkError) {
      console.error('❌ Error checking round status:', checkError);
      throw checkError;
    }

    if (updatedRound) {
      const bothAnswered = updatedRound.player1_answered && updatedRound.player2_answered;
      const roundNumber = updatedRound.round_number;

      console.log('📊 Round status:', {
        roundNumber,
        bothAnswered,
        player1: {
          answered: updatedRound.player1_answered,
          correct: updatedRound.player1_correct,
        },
        player2: {
          answered: updatedRound.player2_answered,
          correct: updatedRound.player2_correct,
        },
      });

      if (bothAnswered) {
        // Obaj odpowiedzieli - przejdź do następnej rundy lub zakończ
        if (roundNumber >= 5) {
          // Koniec pojedynku (5 rund)
          console.log('🏁 Final round completed, finishing duel...', { matchId });
          
          const { data: completeData, error: completeError } = await supabase.rpc('complete_duel_match', { p_match_id: matchId });
          
          if (completeError) {
            console.error('❌ Error completing duel:', completeError);
            throw completeError;
          }
          
          console.log('✅ Duel completed successfully', { completeData });
          console.log('💰 Rewards should now be added to users table');
        } else {
          // Następna runda - tylko zwiększ numer rundy
          // Nowa runda zostanie stworzona gdy gracz wybierze kategorię
          console.log(`➡️ Moving to round ${roundNumber + 1}...`);
          const { error: nextRoundError } = await supabase
            .from('duel_matches')
            .update({
              current_round: roundNumber + 1,
              current_turn_player_id: null, // NULL = czeka na wybór kategorii
              last_activity_at: new Date().toISOString(),
            })
            .eq('id', matchId);

          if (nextRoundError) {
            console.error('❌ Error moving to next round:', nextRoundError);
            throw nextRoundError;
          }
          console.log('✅ Moved to next round successfully - waiting for category selection');
        }
      } else {
        // Ustaw turę na drugiego gracza (będzie odpowiadał)
        console.log('⏳ Setting turn to other player...');
        const otherPlayer = isPlayer1 ? match.player2_id : match.player1_id;
        const { error: turnError } = await supabase
          .from('duel_matches')
          .update({
            current_turn_player_id: otherPlayer,
            last_activity_at: new Date().toISOString(),
          })
          .eq('id', matchId);

        if (turnError) {
          console.error('❌ Error setting turn:', turnError);
          throw turnError;
        }
        console.log('✅ Turn set successfully');
      }
    }

    console.log('✅ submitRoundAnswers completed successfully');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error submitting answers:', error);
    
    // Bardziej szczegółowy komunikat błędu
    let errorMessage = 'Nie udało się zapisać odpowiedzi';
    if (error.message) {
      errorMessage += `: ${error.message}`;
    }
    if (error.code) {
      errorMessage += ` (kod: ${error.code})`;
    }
    
    return { success: false, error: errorMessage };
  }
}

// ========================================
// REALTIME SUBSCRIPTIONS
// ========================================

/**
 * Subskrybuje zmiany w pojedynku
 */
export function subscribeToDuelMatch(
  matchId: string,
  callback: (match: DuelMatch) => void
) {
  const channel = supabase
    .channel(`duel-match:${matchId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'duel_matches',
        filter: `id=eq.${matchId}`,
      },
      async (payload) => {
        console.log('🔄 Duel match update:', payload);
        // Pobierz pełne dane z relacjami
        const match = await getDuelDetails(matchId);
        if (match) {
          callback(match);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subskrybuje nowe wyzwania dla użytkownika
 */
export function subscribeToNewChallenges(
  userId: string,
  callback: (match: DuelMatch) => void
) {
  const channel = supabase
    .channel(`duel-challenges:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'duel_matches',
        filter: `player2_id=eq.${userId}`,
      },
      async (payload) => {
        console.log('🎯 New duel challenge:', payload);
        const match = await getDuelDetails(payload.new.id);
        if (match) {
          callback(match);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ========================================
// MATCHMAKING / KOLEJKA
// ========================================

/**
 * Dodaje gracza do kolejki matchmakingu
 */
export async function joinDuelQueue(
  userId: string,
  level: number,
  flashPoints: number,
  message?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Sprawdź czy gracz nie ma już aktywnego pojedynku
    const { data: activeDuel } = await supabase
      .from('duel_matches')
      .select('id')
      .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
      .in('status', ['pending', 'active'])
      .single();

    if (activeDuel) {
      return { success: false, error: 'Masz już aktywny pojedynek' };
    }

    // Dodaj do kolejki (UPSERT - nadpisze jeśli już istnieje)
    const { data, error } = await supabase
      .from('duel_queue')
      .upsert({
        user_id: userId,
        level,
        flash_points: flashPoints,
        message,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minut
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Queue insert error:', error);
      throw error;
    }

    console.log('✅ Joined queue:', data);
    return { success: true };
  } catch (error) {
    console.error('❌ Error joining queue:', error);
    return { success: false, error: 'Nie udało się dołączyć do kolejki' };
  }
}

/**
 * Usuwa gracza z kolejki matchmakingu
 */
export async function leaveDuelQueue(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('duel_queue')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('❌ Error leaving queue:', error);
    return { success: false, error: 'Nie udało się opuścić kolejki' };
  }
}

/**
 * Pobiera listę graczy w kolejce (oprócz siebie)
 */
export async function getDuelQueue(userId: string): Promise<DuelQueueEntry[]> {
  try {
    const { data: queueData, error } = await supabase
      .from('duel_queue')
      .select('*')
      .neq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Queue fetch error:', error);
      throw error;
    }

    console.log('📋 Raw queue data:', queueData);

    if (!queueData || queueData.length === 0) {
      return [];
    }

    // Pobierz dane użytkowników osobno
    const userIds = queueData.map(q => q.user_id);
    console.log('👥 Fetching users:', userIds);
    
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, username, avatar_url, level')
      .in('id', userIds);

    if (usersError) {
      console.error('❌ Users fetch error:', usersError);
      throw usersError;
    }

    console.log('👥 Users data:', usersData);

    // Połącz dane
    const result: DuelQueueEntry[] = queueData.map(queue => ({
      ...queue,
      user_data: usersData?.find(u => u.id === queue.user_id) || undefined,
    }));

    console.log('✅ Final queue result:', result);
    return result;
  } catch (error) {
    console.error('❌ Error fetching queue:', error);
    return [];
  }
}

/**
 * Sprawdza czy użytkownik jest w kolejce
 */
export async function isInQueue(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('duel_queue')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" error

    return !!data;
  } catch (error) {
    console.error('❌ Error checking queue status:', error);
    return false;
  }
}

/**
 * Wyzwij gracza z kolejki
 */
export async function challengeFromQueue(
  challengerId: string,
  queueEntryId: string
): Promise<{ success: boolean; matchId?: string; error?: string }> {
  try {
    // Pobierz dane z kolejki
    const { data: queueEntry, error: queueError } = await supabase
      .from('duel_queue')
      .select('user_id, message')
      .eq('id', queueEntryId)
      .single();

    if (queueError || !queueEntry) {
      return { success: false, error: 'Gracz nie jest już w kolejce' };
    }

    // Utwórz wyzwanie
    const result = await createDuelChallenge(
      challengerId,
      queueEntry.user_id,
      queueEntry.message || undefined
    );

    // Usuń obu graczy z kolejki
    if (result.success) {
      await leaveDuelQueue(challengerId);
      await leaveDuelQueue(queueEntry.user_id);
    }

    return result;
  } catch (error) {
    console.error('❌ Error challenging from queue:', error);
    return { success: false, error: 'Nie udało się wysłać wyzwania' };
  }
}

/**
 * Subskrybuje zmiany w kolejce
 */
export function subscribeToQueue(callback: () => void) {
  const channel = supabase
    .channel('duel-queue-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'duel_queue',
      },
      () => {
        console.log('🔄 Queue updated');
        callback();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ========================================
// HISTORIA
// ========================================

/**
 * Pobiera historię pojedynków użytkownika
 */
export async function getDuelHistory(userId: string, limit = 20) {
  try {
    const { data, error } = await supabase
      .from('duel_matches')
      .select(`
        *,
        player1:users!duel_matches_player1_id_fkey(id, username, avatar_url),
        player2:users!duel_matches_player2_id_fkey(id, username, avatar_url)
      `)
      .eq('status', 'completed')
      .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('❌ Error fetching duel history:', error);
    return [];
  }
}

// ========================================
// KATEGORIE
// ========================================

/**
 * Losuje 2 kategorie do wyboru
 */
export async function getRandomCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*');

    if (error) throw error;

    // Losuj 2 kategorie
    const shuffled = [...(data || [])].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 2);
  } catch (error) {
    console.error('❌ Error fetching random categories:', error);
    return [];
  }
}

// ========================================
// RANKED MATCHMAKING
// ========================================

export interface RankedQueueEntry {
  id: string;
  user_id: string;
  level: number;
  flash_points: number;
  message: string | null;
  created_at: string;
  user_data?: {
    id: string;
    username: string;
    avatar_url: string;
    level: number;
  };
}

export interface RankedMatchResult {
  success: boolean;
  match_found: boolean;
  match_id?: string;
  opponent_id?: string;
  opponent_username?: string;
  opponent_level?: number;
  opponent_avatar?: string;
  error?: string;
}

/**
 * Dołącz do kolejki rankingowej (automatyczny matchmaking)
 */
export async function joinRankedQueue(
  userId: string,
  level: number,
  flashPoints: number,
  message?: string,
  masterCategoryId?: number
): Promise<RankedMatchResult> {
  try {
    console.log('🎯 Joining ranked queue:', { userId, level, flashPoints, message, masterCategoryId });

    const { data, error } = await supabase.rpc('join_ranked_queue', {
      p_user_id: userId,
      p_level: level,
      p_flash_points: flashPoints,
      p_master_category_id: masterCategoryId || null,
    });

    if (error) {
      console.error('❌ Error joining ranked queue:', error);
      return { success: false, match_found: false, error: error.message };
    }

    const result = data?.[0];
    console.log('✅ Ranked queue result:', result);

    if (!result?.success) {
      return { success: false, match_found: false, error: result?.error || 'Unknown error' };
    }

    if (result.match_found) {
      // Natychmiast znaleziono mecz!
      return {
        success: true,
        match_found: true,
        match_id: result.match_id,
        opponent_id: result.opponent_id,
        opponent_username: result.opponent_username,
        opponent_level: result.opponent_level,
        opponent_avatar: result.opponent_avatar,
      };
    } else {
      // Czekamy w kolejce
      return { success: true, match_found: false };
    }
  } catch (error: any) {
    console.error('❌ Exception joining ranked queue:', error);
    return { success: false, match_found: false, error: error.message };
  }
}

/**
 * Opuść kolejkę rankingową
 */
export async function leaveRankedQueue(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('leave_ranked_queue', {
      p_user_id: userId,
    });

    if (error) {
      console.error('❌ Error leaving ranked queue:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Left ranked queue');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Exception leaving ranked queue:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Sprawdź czy użytkownik jest w kolejce rankingowej
 */
export async function isInRankedQueue(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('ranked_queue')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('❌ Error checking ranked queue status:', error);
    return false;
  }
}

/**
 * Pobierz liczbę graczy w kolejce rankingowej
 */
export async function getRankedQueueCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('ranked_queue')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('❌ Error getting ranked queue count:', error);
    return 0;
  }
}

/**
 * Subskrybuj zmiany w kolejce rankingowej (dla powiadomień o znalezionym meczu)
 */
export function subscribeToRankedMatches(userId: string, onMatchFound: (matchId: string) => void) {
  console.log('📡 Subscribing to ranked matches for user:', userId);

  const channel = supabase
    .channel(`ranked-matches:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'duel_matches',
        filter: `player1_id=eq.${userId}`,
      },
      (payload: any) => {
        console.log('🎮 New ranked match (as player1):', payload.new);
        if (payload.new.is_ranked) {
          onMatchFound(payload.new.id);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'duel_matches',
        filter: `player2_id=eq.${userId}`,
      },
      (payload: any) => {
        console.log('🎮 New ranked match (as player2):', payload.new);
        if (payload.new.is_ranked) {
          onMatchFound(payload.new.id);
        }
      }
    )
    .subscribe();

  return () => {
    console.log('🔌 Unsubscribing from ranked matches');
    supabase.removeChannel(channel);
  };
}
