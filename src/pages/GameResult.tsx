import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import '../styles/GameResult.css';

export default function GameResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { gameMode, stats } = location.state || {};

  useEffect(() => {
    // Jeśli brak danych, przekieruj do home
    if (!stats) {
      navigate('/');
    }
  }, [stats, navigate]);

  if (!stats) {
    return null;
  }

  const accuracy = stats.questionsAnswered > 0
    ? Math.round((stats.correctAnswers / stats.questionsAnswered) * 100)
    : 0;

  const getPerformanceMessage = () => {
    if (accuracy >= 90) return { emoji: '🏆', text: 'Doskonale!', color: '#fbbf24' };
    if (accuracy >= 70) return { emoji: '🎉', text: 'Świetnie!', color: '#4ade80' };
    if (accuracy >= 50) return { emoji: '👍', text: 'Dobra robota!', color: '#60a5fa' };
    return { emoji: '💪', text: 'Możesz lepiej!', color: '#f87171' };
  };

  const performance = getPerformanceMessage();

  return (
    <div className="game-result">
      <div className="result-container">
        {/* Header */}
        <div className="result-header" style={{ borderColor: performance.color }}>
          <span className="result-emoji">{performance.emoji}</span>
          <h1 className="result-title">{performance.text}</h1>
          <p className="result-subtitle">
            {gameMode === 'blitz' && 'Tryb Blitz'}
          </p>
        </div>

        {/* Main Score */}
        <div className="main-score">
          <div className="score-circle" style={{ borderColor: performance.color }}>
            <span className="score-value">{stats.score}</span>
            <span className="score-label">Punktów</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <span className="stat-label">Celność</span>
              <span className="stat-value">{accuracy}%</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <span className="stat-label">Poprawne</span>
              <span className="stat-value">{stats.correctAnswers}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">❌</div>
            <div className="stat-info">
              <span className="stat-label">Błędne</span>
              <span className="stat-value">{stats.wrongAnswers}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-info">
              <span className="stat-label">Najlepsza seria</span>
              <span className="stat-value">{stats.bestStreak}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">❓</div>
            <div className="stat-info">
              <span className="stat-label">Pytań</span>
              <span className="stat-value">{stats.questionsAnswered}</span>
            </div>
          </div>

          {gameMode === 'blitz' && (
            <div className="stat-card">
              <div className="stat-icon">❤️</div>
              <div className="stat-info">
                <span className="stat-label">Pozostałe życia</span>
                <span className="stat-value">{stats.livesRemaining}</span>
              </div>
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="achievements">
          <h3 className="achievements-title">🏅 Osiągnięcia</h3>
          <div className="achievements-list">
            {stats.bestStreak >= 5 && (
              <div className="achievement">
                <span className="achievement-icon">🔥</span>
                <span className="achievement-name">Hot Streak!</span>
                <span className="achievement-desc">5+ poprawnych z rzędu</span>
              </div>
            )}
            {stats.bestStreak >= 10 && (
              <div className="achievement">
                <span className="achievement-icon">⚡</span>
                <span className="achievement-name">Niesamowite!</span>
                <span className="achievement-desc">10+ poprawnych z rzędu</span>
              </div>
            )}
            {accuracy === 100 && (
              <div className="achievement">
                <span className="achievement-icon">💯</span>
                <span className="achievement-name">Perfekcja!</span>
                <span className="achievement-desc">100% celności</span>
              </div>
            )}
            {stats.questionsAnswered >= 20 && (
              <div className="achievement">
                <span className="achievement-icon">📚</span>
                <span className="achievement-name">Wiedza</span>
                <span className="achievement-desc">20+ pytań</span>
              </div>
            )}
            {gameMode === 'blitz' && stats.livesRemaining === 3 && (
              <div className="achievement">
                <span className="achievement-icon">🛡️</span>
                <span className="achievement-name">Niezniszczalny!</span>
                <span className="achievement-desc">Bez straconych żyć</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            onClick={() => navigate('/game-blitz')}
            className="btn-primary"
          >
            🔄 Zagraj ponownie
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            🏠 Strona główna
          </button>
        </div>
      </div>
    </div>
  );
}
