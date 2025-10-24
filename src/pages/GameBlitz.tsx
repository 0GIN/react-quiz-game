/**
 * @fileoverview Tryb gry Blitz - Solo z 3 życiami
 * 
 * Główny tryb gry, w którym użytkownik odpowiada na losowe pytania
 * mając do dyspozycji 3 życia. Gra kończy się gdy:
 * - Użytkownik straci wszystkie życia (3 błędne odpowiedzi)
 * - Użytkownik dobrowolnie zakończy grę przyciskiem "Zakończ"
 * 
 * Funkcjonalność:
 * - Losowanie pytań z różnych kategorii i poziomów trudności
 * - System 3 żyć (błędna odpowiedź = -1 życie)
 * - Zliczanie punktów (poprawne odpowiedzi, streak)
 * - Mierzenie czasu odpowiedzi
 * - Wizualne feedback (poprawna/błędna odpowiedź)
 * - Automatyczne zapisywanie wyniku do bazy
 * - Aktualizacja statystyk użytkownika
 * - Integracja z systemem misji
 * - Integracja z systemem osiągnięć
 * 
 * Scoring:
 * - Poprawna odpowiedź: +10 pkt
 * - Streak bonus: dodatkowe punkty za serie
 * - Czas nie wpływa na punkty (stress-free)
 * 
 * Po zakończeniu:
 * - Zapis wyniku do bazy (games, game_participants, game_questions, game_answers)
 * - Aktualizacja statystyk (level, XP, Flash Points, streak, win/loss)
 * - Aktualizacja postępu misji dziennych
 * - Sprawdzenie i odblokowanie osiągnięć
 * - Przekierowanie do GameResult z podsumowaniem
 * 
 * @page
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRandomQuestions } from '../services/questionService';
import type { QuestionWithAnswers } from '../services/questionService';
import { useAuth } from '../contexts/AuthContext';
import { saveGameResult } from '../services/gameService';
import type { GameResult, GameStats as PersistedGameStats } from '../services/gameService';
import '../styles/GameBlitz.css';

interface BlitzStats {
  questionsAnswered: number;
  correctAnswers: number;
  wrongAnswers: number;
  currentStreak: number;
  bestStreak: number;
  score: number;
  livesRemaining: number;
}

interface AnsweredQuestion {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  timeTaken?: number;
}

export default function GameBlitz() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredQuestion[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [usingFallbackQuestions, setUsingFallbackQuestions] = useState(false);
  
  const [stats, setStats] = useState<BlitzStats>({
    questionsAnswered: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    currentStreak: 0,
    bestStreak: 0,
    score: 0,
    livesRemaining: 3,
  });

  const hasEndedRef = useRef(false);

  // Załaduj pytania przy starcie
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      console.log('🎮 GameBlitz: Starting to load questions...');
      setLoading(true);
      setError(null);
      
      // Pobierz 50 losowych pytań z wszystkich kategorii
      console.log('📡 Fetching 50 random questions...');
      const fetchedQuestions = await getRandomQuestions(50);
      console.log('✅ Received questions:', fetchedQuestions.length);
      
      if (fetchedQuestions.length === 0) {
        console.error('❌ No questions returned from database');
        setError('Brak dostępnych pytań w bazie danych.');
        return;
      }
      
      console.log('📝 First question:', fetchedQuestions[0]);
      setQuestions(fetchedQuestions);
      const fallbackDetected = fetchedQuestions.some(q => q.id.startsWith('fallback-'));
      setUsingFallbackQuestions(fallbackDetected);
      console.log('✅ Questions loaded successfully');
    } catch (err) {
      console.error('❌ Error loading questions:', err);
      setError(`Nie udało się załadować pytań: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerClick = (answer: string) => {
    if (isAnswerChecked) return;
    
    setSelectedAnswer(answer);
    
    const currentQuestion = questions[currentQuestionIndex];
    const correctAnswer = currentQuestion.answers.find(a => a.isCorrect);
    const isCorrect = answer === correctAnswer?.text;
    
    // Oblicz czas odpowiedzi
    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);

    setIsAnswerChecked(true);

    // Zapisz odpowiedź
    setAnsweredQuestions(prev => [
      ...prev,
      {
        questionId: currentQuestion.id,
        answer,
        isCorrect,
        timeTaken,
      },
    ]);

    // Aktualizuj statystyki i sprawdź czy gra się kończy
    const updatedStats = { ...stats };
    updatedStats.questionsAnswered++;

    if (isCorrect) {
      updatedStats.correctAnswers++;
      updatedStats.currentStreak++;
      updatedStats.bestStreak = Math.max(updatedStats.bestStreak, updatedStats.currentStreak);
      
      // Oblicz punkty: bazowe + bonus za streak
      const basePoints = currentQuestion.points_value;
      const streakBonus = Math.floor(updatedStats.currentStreak / 3) * 5;
      updatedStats.score += basePoints + streakBonus;
    } else {
      updatedStats.wrongAnswers++;
      updatedStats.currentStreak = 0;
      updatedStats.livesRemaining--;
    }

    setStats(updatedStats);

    // Jeśli stracono ostatnie życie - natychmiast kończymy grę
    if (updatedStats.livesRemaining === 0) {
      // Nie ustawiamy isAnswerChecked, żeby nie pokazywać pytania
      // Zapisujemy tylko statystyki i kończymy
      setTimeout(() => {
        endGame();
      }, 500);
      return;
    }

    // W przeciwnym razie pokazujemy odpowiedź i przechodzimy dalej
    // Auto-przejdź do następnego pytania po 1.5s
    setTimeout(() => {
      handleNextQuestion();
    }, 1500);
  };

  const handleNextQuestion = () => {
    if (hasEndedRef.current) {
      return;
    }
    // Sprawdź czy gra się skończyła (po aktualizacji statystyk)
    if (stats.livesRemaining === 0) {
      endGame();
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
      setQuestionStartTime(Date.now()); // Reset timera
    } else {
      // Koniec pytań - załaduj więcej
      loadQuestions();
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
      setQuestionStartTime(Date.now()); // Reset timera
    }
  };

  const endGame = async () => {
    if (hasEndedRef.current) {
      return;
    }
    hasEndedRef.current = true;
    console.log('🏁 Kończy się gra...');
    
    // Jeśli użytkownik zalogowany - zapisz wynik
    if (user) {
      console.log('💾 Zapisywanie wyniku do bazy...');
      
      const gameResult: GameResult = {
        gameMode: 'blitz',
        questionsAnswered: stats.questionsAnswered,
        correctAnswers: stats.correctAnswers,
        wrongAnswers: stats.wrongAnswers,
        score: stats.score,
        bestStreak: stats.bestStreak,
        livesRemaining: stats.livesRemaining,
        questions: answeredQuestions,
        usedFallbackQuestions: usingFallbackQuestions,
      };

      const SAVE_TIMEOUT_MS = 8000;

      const timeoutPromise = new Promise<{ success: boolean; stats?: PersistedGameStats; error?: string }>((resolve) => {
        setTimeout(() => resolve({ success: false, error: 'Przekroczono czas zapisu wyników (Supabase).' }), SAVE_TIMEOUT_MS);
      });

      const result = await Promise.race([
        saveGameResult(user.id, gameResult),
        timeoutPromise,
      ]);
      
      if (result.success) {
        console.log('✅ Wynik zapisany!', result.stats);
        
        // Odśwież dane użytkownika żeby zaktualizować XP i Flash Points
        await refreshUser();
        console.log('🔄 Dane użytkownika odświeżone');
        
        const fallbackMessage = usingFallbackQuestions
          ? 'Gra korzystała z trybu offline – zapisano tylko podsumowanie bez szczegółów odpowiedzi.'
          : undefined;

        // Przejdź do ekranu wyników z dodatkowymi danymi
        navigate('/game-result', {
          state: {
            gameMode: 'blitz',
            stats: {
              ...stats,
              flashPointsEarned: result.stats?.flashPointsEarned,
              experienceEarned: result.stats?.experienceEarned,
              leveledUp: result.stats?.leveledUp,
              newLevel: result.stats?.newLevel,
            },
            message: fallbackMessage,
          },
        });
      } else {
        console.error('❌ Błąd zapisu:', result.error);
        // Mimo błędu przejdź do wyników
        navigate('/game-result', {
          state: {
            gameMode: 'blitz',
            stats,
            message: result.error || 'Nie udało się zapisać wyników w bazie danych.',
          },
        });
      }
    } else {
      // Użytkownik niezalogowany - tylko pokaż wyniki
      console.log('👤 Tryb gościa - bez zapisu');
      navigate('/game-result', {
        state: {
          gameMode: 'blitz',
          stats,
        },
      });
    }
  };

  // Auto-zakończ grę gdy życia = 0
  useEffect(() => {
    if (stats.livesRemaining === 0 && stats.questionsAnswered > 0) {
      setTimeout(() => {
        endGame();
      }, 2000);
    }
  }, [stats.livesRemaining, stats.questionsAnswered]);

  if (loading) {
    return (
      <div className="game-blitz">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Ładowanie pytań...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="game-blitz">
        <div className="error-screen">
          <h2>😔 Ups!</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="btn-home">
            Powrót do menu
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="game-blitz">
        <div className="error-screen">
          <h2>Brak pytań</h2>
          <p>Nie znaleziono pytań do gry.</p>
          <button onClick={() => navigate('/')} className="btn-home">
            Powrót do menu
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="game-blitz">
      {/* Header z życiami i statystykami */}
      <div className="game-header">
        <div className="lives-container">
          <span className="lives-label">❤️ Życia:</span>
          <div className="lives">
            {Array.from({ length: 3 }).map((_, i) => (
              <span
                key={i}
                className={`life ${i < stats.livesRemaining ? 'active' : 'lost'}`}
              >
                {i < stats.livesRemaining ? '❤️' : '🖤'}
              </span>
            ))}
          </div>
        </div>

        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">Poprawne</span>
            <span className="stat-value correct-answers">{stats.correctAnswers}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Streak</span>
            <span className="stat-value streak">
              {stats.currentStreak > 0 && '🔥'} {stats.currentStreak}
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Punkty</span>
            <span className="stat-value score">{stats.score}</span>
          </div>
        </div>
      </div>

      {/* Kontener quizu */}
      <div className="question-container">
        {/* Pytanie w osobnym boxie */}
        <div className="question-box">
          <div className="question-header">
            <span className="difficulty-badge">
              {currentQuestion.difficulty_level === 'easy' && '⭐ Łatwe'}
              {currentQuestion.difficulty_level === 'medium' && '⭐⭐ Średnie'}
              {currentQuestion.difficulty_level === 'hard' && '⭐⭐⭐ Trudne'}
            </span>
            <span className="points-badge">+{currentQuestion.points_value} pkt</span>
          </div>

          <h2 className="question-text">{currentQuestion.question_text}</h2>
        </div>

        {/* Odpowiedzi */}
        <div className="answers-grid">
          {currentQuestion.answers.map((answer, index) => {
            const isSelected = selectedAnswer === answer.text;
            const isCorrect = answer.isCorrect;
            const showCorrect = isAnswerChecked && isCorrect;
            const showWrong = isAnswerChecked && isSelected && !isCorrect;

            return (
              <button
                key={index}
                onClick={() => handleAnswerClick(answer.text)}
                disabled={isAnswerChecked}
                className={`answer-btn ${isSelected ? 'selected' : ''} ${
                  showCorrect ? 'correct' : ''
                } ${showWrong ? 'wrong' : ''}`}
              >
                <span className="answer-letter">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="answer-text">{answer.text}</span>
                {showCorrect && <span className="answer-icon">✓</span>}
                {showWrong && <span className="answer-icon">✗</span>}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
