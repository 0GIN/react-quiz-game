/**
 * @fileoverview Rozgrywka Duel - wybór kategorii i odpowiadanie na pytania
 * 
 * Obsługuje:
 * - Wyświetlanie stanu pojedynku (rundy, wyniki)
 * - Wybór kategorii (gdy twoja kolej)
 * - Odpowiadanie na 3 pytania
 * - Real-time updates od przeciwnika
 * - Wynik końcowy
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@features/auth';
import { Card, MaterialIcon, Spinner } from '@shared/ui';
import {
  getDuelDetails,
  getDuelRounds,
  selectCategoryForRound,
  submitRoundAnswers,
  subscribeToDuelMatch,
  getRandomCategories,
  surrenderDuel,
  type DuelMatch,
  type DuelRound,
  type DuelQuestion,
} from '@/services/duelService';
import { type Category } from '@/types';
import { getDisplayAvatar } from '@/utils/avatar';
import { supabase } from '@/lib/supabase';
import '@/styles/ui.css';

type GamePhase = 
  | 'loading'
  | 'waiting_opponent'
  | 'select_category'
  | 'answering'
  | 'round_result'
  | 'final_result';

export default function DuelGame() {
  const { matchId } = useParams<{ matchId: string }>();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  
  const [phase, setPhase] = useState<GamePhase>('loading');
  const [duel, setDuel] = useState<DuelMatch | null>(null);
  const [rounds, setRounds] = useState<DuelRound[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Stan odpowiadania na pytania
  const [questions, setQuestions] = useState<DuelQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<{
    questionId: string;
    selectedAnswer: 'A' | 'B' | 'C' | 'D';
    isCorrect: boolean;
    timeTaken?: number;
  }>>([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const [answerSelected, setAnswerSelected] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Lokalne cache wyników dla aktualnej rundy (żeby uniknąć problemów z realtime updates)
  const [currentRoundResults, setCurrentRoundResults] = useState<{
    roundId: string;
    correctCount: number;
  } | null>(null);

  // Flaga zapobiegająca wielokrotnemu wysyłaniu
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Odśwież użytkownika gdy gra się kończy (tylko raz)
  useEffect(() => {
    if (phase === 'final_result') {
      console.log('🎮 Game finished - refreshing user data...');
      refreshUser().then(() => {
        console.log('✅ User data refreshed after game completion');
      });
    }
  }, [phase]); // Uruchom tylko gdy faza zmieni się na final_result

  // Załaduj dane pojedynku
  useEffect(() => {
    if (!matchId || !user) return;

    loadDuelData();

    // Subskrybuj zmiany w pojedynku
    const unsubscribe = subscribeToDuelMatch(matchId, async (updatedDuel) => {
      console.log('🔄 Duel updated via realtime:', updatedDuel);
      
      // Jeśli gra już zakończona, nie rób nic więcej (zapobiega zapętleniu)
      if (updatedDuel.status === 'completed') {
        console.log('✅ Match already completed, skipping phase determination');
        setDuel(updatedDuel);
        setPhase('final_result');
        return;
      }
      
      setDuel(updatedDuel);
      
      // Przeładuj rundy żeby mieć aktualne dane
      const updatedRounds = await getDuelRounds(matchId);
      console.log('🔄 Rounds reloaded:', updatedRounds);
      setRounds(updatedRounds);
      
      await determinePhase(updatedDuel, updatedRounds);
    });

    return () => unsubscribe();
  }, [matchId, user]);

  // Timer dla pytań
  useEffect(() => {
    if (phase !== 'answering' || answerSelected || showFeedback) return;

    // Resetuj timer przy zmianie pytania
    setTimeLeft(15);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Czas minął - automatyczna błędna odpowiedź
          clearInterval(timer);
          handleAnswerSelect('A', true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, answerSelected, showFeedback, currentQuestionIndex]);

  const loadDuelData = async () => {
    if (!matchId || !user) return;

    try {
      const [duelData, roundsData, categoriesData] = await Promise.all([
        getDuelDetails(matchId),
        getDuelRounds(matchId),
        getRandomCategories(), // 2 losowe kategorie
      ]);

      if (!duelData) {
        navigate('/duel');
        return;
      }

      setDuel(duelData);
      setRounds(roundsData);
      setCategories(categoriesData);
      
      await determinePhase(duelData, roundsData);
    } catch (error) {
      console.error('Error loading duel:', error);
      navigate('/duel');
    }
  };

  const determinePhase = async (duelData: DuelMatch, roundsData?: DuelRound[]) => {
    if (!user) return;

    const currentRounds = roundsData || rounds;

    console.log('🎮 Determining phase:', {
      status: duelData.status,
      currentRound: duelData.current_round,
      currentTurnPlayer: duelData.current_turn_player_id,
      userId: user.id,
      roundsCount: currentRounds.length,
    });

    // Sprawdź czy pojedynek jest zakończony
    if (duelData.status === 'completed') {
      console.log('✅ Match completed');
      setPhase('final_result');
      return;
    }

    // Sprawdź czy to moja tura
    const isPlayer1 = user.id === duelData.player1_id;
    const currentRoundNumber = duelData.current_round;

    // Znajdź aktualną rundę
    const currentRound = currentRounds.find(r => r.round_number === currentRoundNumber);

    console.log('🎯 Current round:', currentRound);

    if (!currentRound) {
      // Brak rundy - trzeba wybrać kategorię
      const isMyTurnToChoose = currentRoundNumber % 2 === 1 ? isPlayer1 : !isPlayer1;
      
      console.log('📝 No round found, my turn to choose?', isMyTurnToChoose);
      
      if (isMyTurnToChoose) {
        setPhase('select_category');
      } else {
        setPhase('waiting_opponent');
      }
      return;
    }

    // Runda istnieje - sprawdź czy już odpowiedziałem
    const iAnswered = isPlayer1 ? currentRound.player1_answered : currentRound.player2_answered;
    const opponentAnswered = isPlayer1 ? currentRound.player2_answered : currentRound.player1_answered;

    console.log('✍️ Answers status:', { iAnswered, opponentAnswered });

    if (iAnswered && opponentAnswered) {
      // Obaj odpowiedzieli - pokaż wynik rundy
      console.log('🏁 Both answered - showing round result');
      setPhase('round_result');
    } else if (iAnswered) {
      // Ja odpowiedziałem, czekam na przeciwnika
      console.log('⏳ I answered, waiting for opponent');
      setPhase('waiting_opponent');
    } else if (opponentAnswered && duelData.current_turn_player_id === user.id) {
      // Przeciwnik odpowiedział, moja kolej - czekaj na kliknięcie "Zagraj"
      console.log('👉 Opponent answered, my turn - waiting for player to click Play');
      setPhase('waiting_opponent');
      // Pre-loaduj pytania w tle
      if (questions.length === 0 && currentRound) {
        console.log('📚 Pre-loading questions for round:', currentRound.round_number);
        loadRoundQuestions(currentRound);
      }
    } else if (duelData.current_turn_player_id === user.id) {
      // Moja tura odpowiadania (pierwszy gracz w rundzie)
      console.log('🎯 My turn to answer first');
      setPhase('answering');
      // Załaduj pytania jeśli jeszcze nie ma
      if (questions.length === 0 && currentRound) {
        console.log('📚 Loading questions for round:', currentRound.round_number);
        loadRoundQuestions(currentRound);
      } else if (questions.length > 0) {
        console.log('✅ Questions already loaded:', questions.length);
      }
    } else {
      console.log('⏳ Waiting for opponent');
      setPhase('waiting_opponent');
    }
  };

  const loadRoundQuestions = async (round: DuelRound) => {
    try {
      // Sprawdź czy runda ma zapisane wylosowane odpowiedzi
      if (round.answers_q1 && round.answers_q2 && round.answers_q3) {
        console.log('✅ Using stored randomized answers');
        // Użyj zapisanych odpowiedzi
        const { data: rawQuestions, error } = await supabase
          .from('questions')
          .select('id, question_text, category_id, difficulty_level')
          .in('id', [round.question1_id, round.question2_id, round.question3_id]);

        if (error) throw error;
        if (!rawQuestions || rawQuestions.length === 0) {
          console.error('❌ No questions found');
          return;
        }

        // Utwórz mapę pytań według ID
        const questionsMap = new Map(rawQuestions.map(q => [q.id, q]));

        // Przekształć pytania używając zapisanych odpowiedzi
        const transformedQuestions: DuelQuestion[] = [
          {
            id: round.question1_id,
            content: questionsMap.get(round.question1_id)!.question_text,
            answer_a: round.answers_q1.A,
            answer_b: round.answers_q1.B,
            answer_c: round.answers_q1.C,
            answer_d: round.answers_q1.D,
            correct_answer: round.answers_q1.correct as 'A' | 'B' | 'C' | 'D',
            category_id: questionsMap.get(round.question1_id)!.category_id,
            difficulty: questionsMap.get(round.question1_id)!.difficulty_level,
          },
          {
            id: round.question2_id,
            content: questionsMap.get(round.question2_id)!.question_text,
            answer_a: round.answers_q2.A,
            answer_b: round.answers_q2.B,
            answer_c: round.answers_q2.C,
            answer_d: round.answers_q2.D,
            correct_answer: round.answers_q2.correct as 'A' | 'B' | 'C' | 'D',
            category_id: questionsMap.get(round.question2_id)!.category_id,
            difficulty: questionsMap.get(round.question2_id)!.difficulty_level,
          },
          {
            id: round.question3_id,
            content: questionsMap.get(round.question3_id)!.question_text,
            answer_a: round.answers_q3.A,
            answer_b: round.answers_q3.B,
            answer_c: round.answers_q3.C,
            answer_d: round.answers_q3.D,
            correct_answer: round.answers_q3.correct as 'A' | 'B' | 'C' | 'D',
            category_id: questionsMap.get(round.question3_id)!.category_id,
            difficulty: questionsMap.get(round.question3_id)!.difficulty_level,
          },
        ];

        console.log('✅ Loaded questions with stored answers:', transformedQuestions);
        setQuestions(transformedQuestions);
        setCurrentQuestionIndex(0);
        setTimeLeft(15);
        setAnswerSelected(null);
        setShowFeedback(false);
      } else {
        // Stare rundy bez zapisanych odpowiedzi - użyj deterministycznego seedu
        console.log('⚠️ Legacy round without stored answers, using deterministic seed');
        
        const { data: rawQuestions, error } = await supabase
          .from('questions')
          .select('*')
          .in('id', [round.question1_id, round.question2_id, round.question3_id]);

        if (error) throw error;
        if (!rawQuestions || rawQuestions.length === 0) {
          console.error('❌ No questions found');
          return;
        }

        // Funkcja hashująca string do liczby (dla deterministycznego seedu)
        const hashString = (str: string): number => {
          let hash = 0;
          for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
          }
          return Math.abs(hash);
        };

        // Seeded random generator (LCG - Linear Congruential Generator)
        const seededRandom = (seed: number) => {
          let state = seed;
          return () => {
            state = (state * 1664525 + 1013904223) % 4294967296;
            return state / 4294967296;
          };
        };

        // Przekształć pytania do formatu DuelQuestion z deterministycznym shufflem
        const transformedQuestions = rawQuestions.map((q, index) => {
          // Użyj kombinacji round.id i question.id jako seed
          const seed = hashString(round.id + q.id + index.toString());
          const random = seededRandom(seed);
          
          // Deterministyczny shuffle używając seeded random
          const answers = [
            { letter: 'A' as const, text: q.correct_answer, isCorrect: true },
            { letter: 'B' as const, text: q.wrong_answer_1, isCorrect: false },
            { letter: 'C' as const, text: q.wrong_answer_2, isCorrect: false },
            { letter: 'D' as const, text: q.wrong_answer_3, isCorrect: false },
          ];

          // Fisher-Yates shuffle z seeded random
          for (let i = answers.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [answers[i], answers[j]] = [answers[j], answers[i]];
          }

          const correctLetter = answers.find(a => a.isCorrect)!.letter;

          return {
            id: q.id,
            content: q.question_text,
            answer_a: answers.find(a => a.letter === 'A')!.text,
            answer_b: answers.find(a => a.letter === 'B')!.text,
            answer_c: answers.find(a => a.letter === 'C')!.text,
            answer_d: answers.find(a => a.letter === 'D')!.text,
            correct_answer: correctLetter,
            category_id: q.category_id,
            difficulty: q.difficulty_level,
          };
        });

        console.log('✅ Transformed questions (legacy with deterministic seed):', transformedQuestions);
        setQuestions(transformedQuestions);
        setCurrentQuestionIndex(0);
        setTimeLeft(15);
        setAnswerSelected(null);
        setShowFeedback(false);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const handleCategorySelect = async (category: Category) => {
    if (!matchId || !user || !duel) return;

    console.log('🎯 Selecting category:', category.name);
    setPhase('loading');

    try {
      const result = await selectCategoryForRound(
        matchId,
        duel.current_round,
        category.id,
        user.id
      );

      if (result.success && result.questions) {
        console.log('✅ Category selected, got questions:', result.questions);
        // Zapisz pytania lokalnie
        setQuestions(result.questions);
        setCurrentQuestionIndex(0);
        setTimeLeft(15);
        setAnswerSelected(null);
        setShowFeedback(false);
        
        // Przeładuj dane - realtime powinien zaktualizować stan
        await loadDuelData();
      } else {
        alert(result.error || 'Nie udało się wybrać kategorii');
        await loadDuelData();
      }
    } catch (error) {
      console.error('Error selecting category:', error);
      alert('Wystąpił błąd');
      await loadDuelData();
    }
  };

  const handleAnswerSelect = async (answer: 'A' | 'B' | 'C' | 'D', timeout = false) => {
    if (answerSelected || !questions[currentQuestionIndex]) return;

    const question = questions[currentQuestionIndex];
    const isCorrect = !timeout && answer === question.correct_answer;
    const timeTaken = 15 - timeLeft;

    console.log('🎯 Answer selected:', {
      questionId: question.id,
      selectedLetter: answer,
      correctLetter: question.correct_answer,
      isCorrect: isCorrect,
      questionText: question.content,
      answerA: question.answer_a,
      answerB: question.answer_b,
      answerC: question.answer_c,
      answerD: question.answer_d,
    });

    setAnswerSelected(answer);
    setShowFeedback(true);

    // Dodaj odpowiedź do listy
    const newAnswer = {
      questionId: question.id,
      selectedAnswer: answer,
      isCorrect,
      timeTaken,
    };
    setAnswers(prev => [...prev, newAnswer]);

    // Po 2 sekundach przejdź do następnego pytania lub zakończ
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        // Następne pytanie
        setCurrentQuestionIndex(prev => prev + 1);
        setTimeLeft(15);
        setAnswerSelected(null);
        setShowFeedback(false);
      } else {
        // Wszystkie pytania odpowiedziane - wyślij odpowiedzi
        submitAnswers([...answers, newAnswer]);
      }
    }, 2000);
  };

  const submitAnswers = async (allAnswers: typeof answers) => {
    if (!matchId || !user || !duel) return;

    // Zapobiegaj wielokrotnemu wysyłaniu
    if (isSubmitting) {
      console.log('⚠️ Already submitting, skipping...');
      return;
    }

    const currentRound = rounds.find(r => r.round_number === duel.current_round);
    if (!currentRound) {
      console.error('❌ Current round not found');
      return;
    }

    // Sprawdź czy gracz już odpowiedział na tę rundę
    const isPlayer1 = user.id === duel.player1_id;
    const alreadyAnswered = isPlayer1 ? currentRound.player1_answered : currentRound.player2_answered;
    
    if (alreadyAnswered) {
      console.log('⚠️ Player already answered this round, skipping...');
      return;
    }

    setIsSubmitting(true);
    setPhase('loading');

    try {

      // Zapisz wynik lokalnie PRZED wysłaniem (żeby nie stracić go przy realtime update)
      const correctCount = allAnswers.filter(a => a.isCorrect).length;
      setCurrentRoundResults({
        roundId: currentRound.id,
        correctCount: correctCount,
      });

      console.log('📤 Submitting answers:', { 
        roundId: currentRound.id, 
        answers: allAnswers, 
        correctCount,
        answersLength: allAnswers.length
      });

      // Sprawdź czy to są dokładnie 3 odpowiedzi
      if (allAnswers.length !== 3) {
        console.error('❌ Invalid answers count:', allAnswers.length, 'Expected: 3');
        alert('Błąd: nieprawidłowa liczba odpowiedzi. Spróbuj ponownie.');
        setIsSubmitting(false);
        return;
      }

      const result = await submitRoundAnswers(
        currentRound.id,
        matchId,
        user.id,
        allAnswers
      );

      if (result.success) {
        console.log('✅ Answers submitted successfully');
        // Wyczyść odpowiedzi zaraz po wysłaniu
        setAnswers([]);
        setQuestions([]);
        setCurrentQuestionIndex(0);
        // Odśwież dane - ale lokalny wynik jest już zapisany
        await loadDuelData();
        setIsSubmitting(false);
      } else {
        console.error('❌ Failed to submit answers:', result.error);
        alert(result.error || 'Nie udało się zapisać odpowiedzi');
        // Wyczyść lokalny cache przy błędzie
        setCurrentRoundResults(null);
        await loadDuelData();
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error submitting answers:', error);
      alert('Wystąpił błąd podczas zapisywania odpowiedzi');
      setCurrentRoundResults(null);
      await loadDuelData();
      setIsSubmitting(false);
    }
  };

  const handleNextRound = () => {
    setAnswers([]);
    setQuestions([]);
    setCurrentRoundResults(null); // Wyczyść cache przy nowej rundzie
    setIsSubmitting(false); // Zresetuj flagę submitting
    loadDuelData();
  };

  const handleSurrender = async () => {
    if (!matchId || !user || !duel) return;

    const confirmSurrender = window.confirm(
      'Czy na pewno chcesz się poddać? Przeciwnik zostanie uznany za zwycięzcę.'
    );

    if (!confirmSurrender) return;

    const result = await surrenderDuel(matchId, user.id);
    if (result.success) {
      console.log('🏳️ Surrendered successfully');
      // Przeładuj dane aby pokazać wynik
      await loadDuelData();
      setPhase('final_result');
    } else {
      alert(result.error || 'Nie udało się poddać meczu');
    }
  };

  const getOpponent = () => {
    if (!user || !duel) return null;
    return user.id === duel.player1_id ? duel.player2 : duel.player1;
  };

  const getMyScore = () => {
    if (!user || !duel) return 0;
    return user.id === duel.player1_id ? duel.player1_score : duel.player2_score;
  };

  const getOpponentScore = () => {
    if (!user || !duel) return 0;
    return user.id === duel.player1_id ? duel.player2_score : duel.player1_score;
  };

  if (phase === 'loading' || !duel) {
    return (
      <main className="main">
        <div style={{ gridColumn: 'span 12' }}>
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Spinner />
              <p style={{ color: '#B0B0B0', marginTop: '16px' }}>Ładowanie pojedynku...</p>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  const opponent = getOpponent();
  const myScore = getMyScore();
  const opponentScore = getOpponentScore();

  // Sprawdź czy aktualna runda jest zakończona
  const currentRound = rounds.find(r => r.round_number === duel.current_round);
  const isCurrentRoundComplete = currentRound 
    ? currentRound.player1_answered && currentRound.player2_answered 
    : false;

  return (
    <main className="main">
      <div style={{ gridColumn: 'span 12' }}>
        <Card>
          <div style={{ padding: '24px' }}>
            {/* Header - wynik i runda - pokazuj od początku */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              padding: '20px',
              background: 'rgba(0,229,255,0.05)',
              borderRadius: '16px',
              border: '1px solid rgba(0,229,255,0.2)',
            }}>
              {/* Ja */}
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  margin: '0 auto 12px',
                  borderRadius: '50%',
                  background: 'rgba(0,229,255,0.1)',
                  border: '3px solid rgba(0,229,255,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                }}>
                  {getDisplayAvatar(user?.avatar_url)}
                </div>
                <div style={{ color: '#E0E0E0', fontWeight: 600, marginBottom: '8px' }}>
                  {user?.username}
                </div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#00E5FF' }}>
                  {myScore}
                </div>
              </div>

              {/* Środek - runda i status przeciwnika */}
              <div style={{ textAlign: 'center', padding: '0 40px', minWidth: '250px' }}>
                {/* Status przeciwnika */}
                {phase === 'waiting_opponent' && (
                  <div style={{ 
                    marginBottom: '16px',
                    padding: '8px 16px',
                    background: 'rgba(255,193,7,0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,193,7,0.3)',
                  }}>
                    <div style={{ fontSize: '12px', color: '#FFC107', fontWeight: 600 }}>
                      {currentRound 
                        ? `${opponent?.username} odpowiada...` 
                        : `${opponent?.username} wybiera kategorię...`}
                    </div>
                  </div>
                )}
                
                {/* Numer rundy */}
                <div style={{ color: '#B0B0B0', fontSize: '14px', marginBottom: '8px' }}>
                  Runda
                </div>
                <div style={{ fontSize: '36px', fontWeight: 700, color: '#E0E0E0' }}>
                  {duel.current_round}/5
                </div>
              </div>

              {/* Przeciwnik */}
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  margin: '0 auto 12px',
                  borderRadius: '50%',
                  background: 'rgba(255,0,0,0.1)',
                  border: '3px solid rgba(255,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                }}>
                  {opponent ? getDisplayAvatar(opponent.avatar_url) : '👤'}
                </div>
                <div style={{ color: '#E0E0E0', fontWeight: 600, marginBottom: '8px' }}>
                  {opponent?.username || 'Przeciwnik'}
                </div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#f87171' }}>
                  {isCurrentRoundComplete || phase === 'round_result' || phase === 'final_result' 
                    ? opponentScore 
                    : '?'}
                </div>
              </div>
            </div>

            {/* Przycisk Poddaj się - tylko w aktywnym meczu */}
            {duel.status === 'active' && (phase === 'select_category' || phase === 'answering' || phase === 'waiting_opponent') && (
              <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                <button
                  onClick={handleSurrender}
                  style={{
                    padding: '8px 20px',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '8px',
                    color: '#ef4444',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
                    e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                    e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
                  }}
                >
                  Poddaj się
                </button>
              </div>
            )}

            {/* Szkielet 5 rund - ukryj podczas wyboru kategorii i odpowiadania na pytania */}
            {phase !== 'select_category' && phase !== 'answering' && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  borderRadius: '16px', 
                  padding: '20px',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  {[1, 2, 3, 4, 5].map((roundNum) => {
                  const round = rounds.find(r => r.round_number === roundNum);
                  const isPlayer1 = user?.id === duel.player1_id;
                  const isCurrentRound = roundNum === duel.current_round;
                  
                  // Jeśli runda nie istnieje, pokaż szare neutralne kropki
                  if (!round) {
                    return (
                      <div
                        key={roundNum}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '12px 0',
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                        }}
                      >
                        {/* Moje odpowiedzi (lewo) - neutralne */}
                        <div style={{ 
                          display: 'flex', 
                          gap: '6px', 
                          flex: 1,
                          justifyContent: 'flex-end',
                          paddingRight: '16px',
                        }}>
                          {[0, 1, 2].map(i => (
                            <div
                              key={i}
                              style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: 'rgba(180,180,180,0.2)', // Jasny szary neutralny
                                border: '1px solid rgba(180,180,180,0.3)',
                              }}
                            />
                          ))}
                        </div>

                        {/* Środek - numer rundy */}
                        <div style={{ 
                          textAlign: 'center',
                          minWidth: '180px',
                          padding: '8px 16px',
                          background: 'rgba(255,255,255,0.02)',
                          borderRadius: '12px',
                          border: '1px solid rgba(255,255,255,0.05)',
                        }}>
                          <div style={{ 
                            fontSize: '13px', 
                            color: '#888',
                            fontWeight: 600,
                          }}>
                            Runda {roundNum}
                          </div>
                        </div>

                        {/* Odpowiedzi przeciwnika (prawo) - neutralne */}
                        <div style={{ 
                          display: 'flex', 
                          gap: '6px', 
                          flex: 1,
                          paddingLeft: '16px',
                        }}>
                          {[0, 1, 2].map(i => (
                            <div
                              key={i}
                              style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: 'rgba(180,180,180,0.2)', // Jasny szary neutralny
                                border: '1px solid rgba(180,180,180,0.3)',
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  }
                  
                  const bothAnswered = round.player1_answered && round.player2_answered;
                  const iAnswered = isPlayer1 ? round.player1_answered : round.player2_answered;
                  const opponentAnswered = isPlayer1 ? round.player2_answered : round.player1_answered;

                  // Dla aktualnej rundy użyj lokalnego cache jeśli dostępny
                  let myCorrectCount: number;
                  if (currentRoundResults && currentRoundResults.roundId === round.id) {
                    // Użyj lokalnie zapisanego wyniku
                    console.log(`📊 Using cached result for round ${round.round_number}:`, currentRoundResults.correctCount);
                    myCorrectCount = currentRoundResults.correctCount;
                  } else if (isCurrentRound && iAnswered && answers.length > 0) {
                    // Oblicz z lokalnych odpowiedzi (podczas odpowiadania)
                    const calculated = answers.filter(a => a.isCorrect).length;
                    console.log(`📊 Calculating from local answers for round ${round.round_number}:`, calculated, answers);
                    myCorrectCount = calculated;
                  } else {
                    // Użyj danych z bazy
                    const fromDB = isPlayer1 ? round.player1_correct : round.player2_correct;
                    console.log(`📊 Using DB value for round ${round.round_number}:`, fromDB, {
                      player1_correct: round.player1_correct,
                      player2_correct: round.player2_correct,
                      player1_answered: round.player1_answered,
                      player2_answered: round.player2_answered,
                    });
                    myCorrectCount = fromDB;
                  }

                    // Renderuj 3 kropki dla każdego gracza
                    // isForPlayer - czy to kropki gracza (true) czy przeciwnika (false)
                    const renderAnswerDots = (answered: boolean, correct?: number, isForPlayer: boolean = false) => {
                      if (!answered) {
                        // Nie odpowiedziano - ciemno szare kropki
                        return [0, 1, 2].map(i => (
                          <div
                            key={i}
                            style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              background: 'rgba(80,80,80,0.5)', // Ciemny szary
                              border: '1px solid rgba(80,80,80,0.7)',
                            }}
                          />
                        ));
                      }

                      if (!bothAnswered && answered) {
                        // Runda niezakończona - gracz widzi swoje wyniki, przeciwnik ma żółte
                        if (isForPlayer) {
                          // Gracz widzi swoje wyniki (zielone/czerwone)
                          const correctCount = correct || 0;
                          return [0, 1, 2].map(i => (
                            <div
                              key={i}
                              style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: i < correctCount 
                                  ? 'rgba(0,255,0,0.3)' // Zielony = prawidłowa
                                  : 'rgba(255,0,0,0.3)', // Czerwony = nieprawidłowa
                                border: i < correctCount
                                  ? '2px solid rgba(0,255,0,0.6)'
                                  : '2px solid rgba(255,0,0,0.6)',
                              }}
                            />
                          ));
                        } else {
                          // Przeciwnik ma żółte kropki (ukryte wyniki)
                          return [0, 1, 2].map(i => (
                            <div
                              key={i}
                              style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: 'rgba(255,193,7,0.4)', // Żółty
                                border: '2px solid rgba(255,193,7,0.7)',
                              }}
                            />
                          ));
                        }
                      }

                      // Runda zakończona - pokaż wynik (zielone/czerwone)
                      const correctCount = correct || 0;
                      return [0, 1, 2].map(i => (
                        <div
                          key={i}
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: i < correctCount 
                              ? 'rgba(0,255,0,0.3)' // Zielony = prawidłowa
                              : 'rgba(255,0,0,0.3)', // Czerwony = nieprawidłowa
                            border: i < correctCount
                              ? '2px solid rgba(0,255,0,0.6)'
                              : '2px solid rgba(255,0,0,0.6)',
                          }}
                        />
                      ));
                    };

                    return (
                      <div
                        key={round.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '12px 0',
                          borderBottom: isCurrentRound ? 'none' : '1px solid rgba(255,255,255,0.05)',
                        }}
                      >
                        {/* Moje odpowiedzi (lewo) */}
                        <div style={{ 
                          display: 'flex', 
                          gap: '6px', 
                          flex: 1,
                          justifyContent: 'flex-end',
                          paddingRight: '16px',
                        }}>
                          {renderAnswerDots(
                            iAnswered, 
                            myCorrectCount,
                            true // To moje kropki - zawsze pokazuj wynik
                          )}
                        </div>

                        {/* Środek - numer rundy i kategoria */}
                        <div style={{ 
                          textAlign: 'center',
                          minWidth: '180px',
                          padding: '8px 16px',
                          background: isCurrentRound 
                            ? 'rgba(0,229,255,0.1)' 
                            : 'rgba(255,255,255,0.02)',
                          borderRadius: '12px',
                          border: isCurrentRound
                            ? '2px solid rgba(0,229,255,0.5)'
                            : '1px solid rgba(255,255,255,0.05)',
                        }}>
                          <div style={{ 
                            fontSize: '13px', 
                            color: isCurrentRound ? '#00E5FF' : '#B0B0B0',
                            fontWeight: 600,
                            marginBottom: '4px',
                          }}>
                            Runda {round.round_number}
                          </div>
                          {round.category && (
                            <div style={{ 
                              fontSize: '11px', 
                              color: '#888',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                            }}>
                              <span>{round.category.icon_emoji}</span>
                              <span>{round.category.name}</span>
                            </div>
                          )}
                        </div>

                        {/* Odpowiedzi przeciwnika (prawo) */}
                        <div style={{ 
                          display: 'flex', 
                          gap: '6px', 
                          flex: 1,
                          paddingLeft: '16px',
                        }}>
                          {renderAnswerDots(
                            opponentAnswered,
                            bothAnswered ? (isPlayer1 ? round.player2_correct : round.player1_correct) : undefined,
                            false // To kropki przeciwnika - ukryj jeśli runda niezakończona
                          )}
                        </div>

                        {/* Przycisk "Zagraj" dla aktualnej rundy gdy przeciwnik odpowiedział */}
                        {isCurrentRound && opponentAnswered && !iAnswered && (
                          <button
                            onClick={() => {
                              if (questions.length === 0) {
                                loadRoundQuestions(round);
                              }
                              setPhase('answering');
                            }}
                            style={{
                              marginLeft: '12px',
                              padding: '8px 16px',
                              background: 'linear-gradient(135deg, #00E5FF 0%, #00B8D4 100%)',
                              border: 'none',
                              borderRadius: '8px',
                              color: '#0A0A1A',
                              fontWeight: 600,
                              fontSize: '13px',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            ▶ Zagraj
                          </button>
                        )}

                        {/* Status dla aktualnej rundy */}
                        {isCurrentRound && opponentAnswered && iAnswered && !bothAnswered && (
                          <div style={{
                            marginLeft: '12px',
                            padding: '8px 16px',
                            background: 'rgba(150,150,150,0.1)',
                            border: '1px solid rgba(150,150,150,0.3)',
                            borderRadius: '8px',
                            fontSize: '12px',
                            color: '#999',
                            whiteSpace: 'nowrap',
                          }}>
                            Odpowiedziano
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Wybór kategorii */}
            {phase === 'select_category' && (
              <div>
                <h2 style={{ 
                  fontSize: '24px', 
                  color: '#E0E0E0', 
                  textAlign: 'center',
                  marginBottom: '24px'
                }}>
                  📚 Wybierz kategorię dla rundy {duel.current_round}
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '16px',
                }}>
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category)}
                      style={{
                        padding: '20px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '2px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'center',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(0,229,255,0.1)';
                        e.currentTarget.style.borderColor = 'rgba(0,229,255,0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                      }}
                    >
                      <div style={{ fontSize: '32px', marginBottom: '12px' }}>
                        {category.icon_emoji}
                      </div>
                      <div style={{ color: '#E0E0E0', fontWeight: 600 }}>
                        {category.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Odpowiadanie na pytania */}
            {phase === 'answering' && questions[currentQuestionIndex] && (
              <div>
                {/* Progress bar */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}>
                    <span style={{ color: '#B0B0B0', fontSize: '14px' }}>
                      Pytanie {currentQuestionIndex + 1} / 3
                    </span>
                    <span style={{ 
                      color: timeLeft <= 5 ? '#f87171' : '#00E5FF',
                      fontSize: '16px',
                      fontWeight: 700,
                    }}>
                      ⏱️ {timeLeft}s
                    </span>
                  </div>
                  <div style={{
                    height: '8px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${((currentQuestionIndex + 1) / 3) * 100}%`,
                      background: 'linear-gradient(90deg, #00E5FF, #00B8D4)',
                      transition: 'width 0.3s',
                    }} />
                  </div>
                </div>

                {/* Pytanie */}
                <div style={{
                  padding: '32px',
                  background: 'rgba(0,229,255,0.05)',
                  borderRadius: '16px',
                  marginBottom: '24px',
                  textAlign: 'center',
                }}>
                  <h3 style={{ 
                    fontSize: '22px', 
                    color: '#E0E0E0',
                    lineHeight: 1.6,
                  }}>
                    {questions[currentQuestionIndex].content}
                  </h3>
                </div>

                {/* Odpowiedzi */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '16px',
                }}>
                  {(['A', 'B', 'C', 'D'] as const).map(letter => {
                    const question = questions[currentQuestionIndex];
                    const answerText = question[`answer_${letter.toLowerCase()}` as keyof DuelQuestion];
                    const isSelected = answerSelected === letter;
                    const isCorrect = question.correct_answer === letter;
                    
                    let bgColor = 'rgba(255,255,255,0.02)';
                    let borderColor = 'rgba(255,255,255,0.1)';
                    
                    // Pokazuj tylko czy wybrana odpowiedź była dobra/zła
                    // NIE pokazuj poprawnej odpowiedzi
                    if (showFeedback && isSelected) {
                      if (isCorrect) {
                        bgColor = 'rgba(0,255,0,0.1)';
                        borderColor = 'rgba(0,255,0,0.5)';
                      } else {
                        bgColor = 'rgba(255,0,0,0.1)';
                        borderColor = 'rgba(255,0,0,0.5)';
                      }
                    }

                    return (
                      <button
                        key={letter}
                        onClick={() => handleAnswerSelect(letter)}
                        disabled={!!answerSelected}
                        style={{
                          padding: '24px',
                          background: bgColor,
                          border: `2px solid ${borderColor}`,
                          borderRadius: '16px',
                          cursor: answerSelected ? 'not-allowed' : 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                        }}
                        onMouseEnter={(e) => {
                          if (!answerSelected) {
                            e.currentTarget.style.background = 'rgba(0,229,255,0.1)';
                            e.currentTarget.style.borderColor = 'rgba(0,229,255,0.5)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!answerSelected) {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                          } else if (showFeedback && isSelected) {
                            // Przywróć kolory tylko dla wybranej odpowiedzi
                            if (isCorrect) {
                              e.currentTarget.style.background = 'rgba(0,255,0,0.1)';
                              e.currentTarget.style.borderColor = 'rgba(0,255,0,0.5)';
                            } else {
                              e.currentTarget.style.background = 'rgba(255,0,0,0.1)';
                              e.currentTarget.style.borderColor = 'rgba(255,0,0,0.5)';
                            }
                          }
                        }}
                      >
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: showFeedback && isSelected && isCorrect
                            ? 'rgba(0,255,0,0.2)'
                            : showFeedback && isSelected
                              ? 'rgba(255,0,0,0.2)'
                              : 'rgba(0,229,255,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                          fontWeight: 700,
                          color: showFeedback && isSelected && isCorrect
                            ? '#4ade80'
                            : showFeedback && isSelected
                              ? '#f87171'
                              : '#00E5FF',
                          flexShrink: 0,
                        }}>
                          {letter}
                        </div>
                        <div style={{ 
                          color: '#E0E0E0', 
                          fontSize: '16px',
                          lineHeight: 1.4,
                        }}>
                          {answerText as string}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Czekanie na przeciwnika - prosty komunikat */}
            {phase === 'waiting_opponent' && (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.05)',
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  margin: '0 auto 20px',
                  border: '3px solid rgba(0,229,255,0.3)',
                  borderTopColor: '#00E5FF',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }} />
                <p style={{ color: '#B0B0B0', fontSize: '16px' }}>
                  Oczekiwanie na ruch przeciwnika...
                </p>
              </div>
            )}

            {/* Wynik rundy */}
            {phase === 'round_result' && (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <MaterialIcon icon="emoji_events" size={80} style={{ color: '#fbbf24', marginBottom: '24px' }} />
                <h2 style={{ fontSize: '28px', color: '#E0E0E0', marginBottom: '24px' }}>
                  Runda {duel.current_round} zakończona!
                </h2>
                
                {rounds.filter(r => r.round_number === duel.current_round).map(round => {
                  const isPlayer1 = user?.id === duel.player1_id;
                  const myCorrect = isPlayer1 ? round.player1_correct : round.player2_correct;
                  const opponentCorrect = isPlayer1 ? round.player2_correct : round.player1_correct;
                  
                  return (
                    <div key={round.id} style={{
                      padding: '24px',
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: '16px',
                      marginBottom: '24px',
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        alignItems: 'center',
                      }}>
                        <div>
                          <div style={{ color: '#B0B0B0', fontSize: '14px', marginBottom: '8px' }}>
                            Ty
                          </div>
                          <div style={{ fontSize: '36px', fontWeight: 700, color: '#00E5FF' }}>
                            {myCorrect}/3
                          </div>
                        </div>
                        <MaterialIcon icon="close" size={32} style={{ color: '#666' }} />
                        <div>
                          <div style={{ color: '#B0B0B0', fontSize: '14px', marginBottom: '8px' }}>
                            {opponent?.username}
                          </div>
                          <div style={{ fontSize: '36px', fontWeight: 700, color: '#f87171' }}>
                            {opponentCorrect}/3
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <button
                  onClick={handleNextRound}
                  style={{
                    padding: '16px 32px',
                    background: 'linear-gradient(135deg, #00E5FF 0%, #00B8D4 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#0A0A1A',
                    fontWeight: 600,
                    fontSize: '16px',
                    cursor: 'pointer',
                  }}
                >
                  {duel.current_round < 5 ? 'Następna runda' : 'Zobacz wynik końcowy'}
                </button>
              </div>
            )}

            {/* Wynik końcowy */}
            {phase === 'final_result' && (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                {duel.winner_id === user?.id ? (
                  <>
                    <MaterialIcon icon="emoji_events" size={120} style={{ color: '#fbbf24', marginBottom: '24px' }} />
                    <h1 style={{ fontSize: '36px', color: '#fbbf24', marginBottom: '16px' }}>
                      🎉 ZWYCIĘSTWO! 🎉
                    </h1>
                    <p style={{ color: '#B0B0B0', fontSize: '18px', marginBottom: '32px' }}>
                      +100 FlashPoints
                    </p>
                  </>
                ) : duel.winner_id === null ? (
                  <>
                    <MaterialIcon icon="handshake" size={120} style={{ color: '#fbbf24', marginBottom: '24px' }} />
                    <h1 style={{ fontSize: '36px', color: '#fbbf24', marginBottom: '16px' }}>
                      REMIS!
                    </h1>
                    <p style={{ color: '#B0B0B0', fontSize: '18px', marginBottom: '32px' }}>
                      +50 FlashPoints
                    </p>
                  </>
                ) : (
                  <>
                    <MaterialIcon icon="sentiment_dissatisfied" size={120} style={{ color: '#888', marginBottom: '24px' }} />
                    <h1 style={{ fontSize: '36px', color: '#B0B0B0', marginBottom: '16px' }}>
                      Porażka
                    </h1>
                    <p style={{ color: '#B0B0B0', fontSize: '18px', marginBottom: '32px' }}>
                      Następnym razem będzie lepiej!
                    </p>
                  </>
                )}

                <div style={{
                  padding: '32px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '16px',
                  marginBottom: '32px',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ color: '#B0B0B0', fontSize: '14px', marginBottom: '8px' }}>
                        {user?.username}
                      </div>
                      <div style={{ fontSize: '48px', fontWeight: 700, color: '#00E5FF' }}>
                        {myScore}
                      </div>
                    </div>
                    <div style={{ fontSize: '36px', color: '#666' }}>:</div>
                    <div>
                      <div style={{ color: '#B0B0B0', fontSize: '14px', marginBottom: '8px' }}>
                        {opponent?.username}
                      </div>
                      <div style={{ fontSize: '48px', fontWeight: 700, color: '#f87171' }}>
                        {opponentScore}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/duel')}
                  style={{
                    padding: '16px 32px',
                    background: 'linear-gradient(135deg, #00E5FF 0%, #00B8D4 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#0A0A1A',
                    fontWeight: 600,
                    fontSize: '16px',
                    cursor: 'pointer',
                  }}
                >
                  Powrót do lobby
                </button>
              </div>
            )}
          </div>
        </Card>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
