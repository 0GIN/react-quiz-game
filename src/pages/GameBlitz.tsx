import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRandomQuestions } from '../services/questionService';
import type { QuestionWithAnswers } from '../services/questionService';
import '../styles/GameBlitz.css';

interface GameStats {
  questionsAnswered: number;
  correctAnswers: number;
  wrongAnswers: number;
  currentStreak: number;
  bestStreak: number;
  score: number;
  livesRemaining: number;
}

export default function GameBlitz() {
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [stats, setStats] = useState<GameStats>({
    questionsAnswered: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    currentStreak: 0,
    bestStreak: 0,
    score: 0,
    livesRemaining: 3,
  });

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

    setIsAnswerChecked(true);

    // Aktualizuj statystyki
    setStats(prev => {
      const newStats = { ...prev };
      newStats.questionsAnswered++;

      if (isCorrect) {
        newStats.correctAnswers++;
        newStats.currentStreak++;
        newStats.bestStreak = Math.max(newStats.bestStreak, newStats.currentStreak);
        
        // Oblicz punkty: bazowe + bonus za streak
        const basePoints = currentQuestion.points_value;
        const streakBonus = Math.floor(newStats.currentStreak / 3) * 5;
        newStats.score += basePoints + streakBonus;
      } else {
        newStats.wrongAnswers++;
        newStats.currentStreak = 0;
        newStats.livesRemaining--;
      }

      return newStats;
    });

    // Auto-przejdź do następnego pytania po 1.5s
    setTimeout(() => {
      handleNextQuestion();
    }, 1500);
  };

  const handleNextQuestion = () => {
    // Sprawdź czy gra się skończyła (po aktualizacji statystyk)
    if (stats.livesRemaining === 0) {
      endGame();
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
    } else {
      // Koniec pytań - załaduj więcej
      loadQuestions();
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
    }
  };

  const endGame = () => {
    // Przejdź do ekranu wyników
    navigate('/game-result', {
      state: {
        gameMode: 'blitz',
        stats: {
          ...stats,
          livesRemaining: Math.max(0, stats.livesRemaining - (isAnswerChecked && selectedAnswer !== questions[currentQuestionIndex].answers.find(a => a.isCorrect)?.text ? 1 : 0))
        },
      },
    });
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
  const progress = (stats.questionsAnswered / (stats.questionsAnswered + 1)) * 100;

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
            <span className="stat-label">Pytanie</span>
            <span className="stat-value">{stats.questionsAnswered + 1}</span>
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

        <button onClick={endGame} className="btn-quit">
          ❌ Zakończ
        </button>
      </div>

      {/* Pasek postępu */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      {/* Pytanie */}
      <div className="question-container">
        <div className="question-header">
          <span className="difficulty-badge difficulty-{currentQuestion.difficulty_level}">
            {currentQuestion.difficulty_level === 'easy' && '⭐ Łatwe'}
            {currentQuestion.difficulty_level === 'medium' && '⭐⭐ Średnie'}
            {currentQuestion.difficulty_level === 'hard' && '⭐⭐⭐ Trudne'}
          </span>
          <span className="points-badge">+{currentQuestion.points_value} pkt</span>
        </div>

        <h2 className="question-text">{currentQuestion.question_text}</h2>

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

        {/* Feedback po odpowiedzi */}
        {isAnswerChecked && stats.livesRemaining > 0 && (
          <div className={`feedback ${
            selectedAnswer === currentQuestion.answers.find(a => a.isCorrect)?.text
              ? 'correct'
              : 'wrong'
          }`}>
            {selectedAnswer === currentQuestion.answers.find(a => a.isCorrect)?.text ? (
              <>
                <span className="feedback-icon">🎉</span>
                <p className="feedback-text">
                  Świetnie! +{currentQuestion.points_value} punktów
                  {stats.currentStreak >= 3 && (
                    <span className="streak-bonus">
                      {' '}+ bonus za streak ({stats.currentStreak})
                    </span>
                  )}
                </p>
              </>
            ) : (
              <>
                <span className="feedback-icon">�</span>
                <p className="feedback-text">
                  Straciłeś życie!
                  <br />
                  <small>
                    Poprawna: {currentQuestion.answers.find(a => a.isCorrect)?.text}
                  </small>
                </p>
              </>
            )}
          </div>
        )}

        {/* Komunikat Game Over */}
        {stats.livesRemaining === 0 && (
          <div className="feedback wrong">
            <span className="feedback-icon">💀</span>
            <p className="feedback-text">
              GAME OVER!
              <br />
              <small>Przekierowywanie do wyników...</small>
            </p>
          </div>
        )}
      </div>

      {/* Mini statystyki */}
      <div className="mini-stats">
        <div className="mini-stat">
          <span className="mini-stat-icon">✅</span>
          <span>{stats.correctAnswers}</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat-icon">❌</span>
          <span>{stats.wrongAnswers}</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat-icon">🏆</span>
          <span>Best: {stats.bestStreak}</span>
        </div>
      </div>
    </div>
  );
}
