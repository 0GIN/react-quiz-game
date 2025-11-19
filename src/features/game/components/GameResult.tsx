import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { MaterialIcon } from '@shared/ui';
import '@/styles/GameResult.css';

export default function GameResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { gameMode, stats, message } = location.state || {};

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
    if (accuracy >= 90) return { icon: 'emoji_events', text: 'Doskonale!', color: '#fbbf24' };
    if (accuracy >= 70) return { icon: 'celebration', text: 'Świetnie!', color: '#4ade80' };
    if (accuracy >= 50) return { icon: 'thumb_up', text: 'Dobra robota!', color: '#60a5fa' };
    return { icon: 'fitness_center', text: 'Możesz lepiej!', color: '#f87171' };
  };

  const performance = getPerformanceMessage();

  return (
    <div className="game-result">
      <div className="result-container">
        {/* Header */}
        <div className="result-header" style={{ borderColor: performance.color }}>
          <MaterialIcon icon={performance.icon} size={64} className="result-icon" filled />
          <h1 className="result-title">{performance.text}</h1>
          <p className="result-subtitle">
            {gameMode === 'blitz' && 'Tryb Blitz'}
          </p>
          {message && (
            <p className="result-message">
              {message}
            </p>
          )}
        </div>

        {/* Main Score */}
        <div className="main-score">
          <div className="score-circle" style={{ borderColor: performance.color }}>
            <span className="score-value">{stats.score}</span>
            <span className="score-label">Punktów</span>
          </div>
        </div>

        {/* Rewards Section - pokazuj tylko gdy są dostępne */}
        {(stats.experienceEarned !== undefined || stats.flashPointsEarned !== undefined) && (
          <div className="rewards-section" style={{ 
            marginBottom: '24px', 
            padding: '20px',
            background: 'rgba(0,229,255,0.05)',
            borderRadius: '12px',
            border: '2px solid rgba(0,229,255,0.2)'
          }}>
            <h3 style={{ 
              textAlign: 'center', 
              color: '#00E5FF', 
              fontSize: '18px', 
              marginBottom: '16px',
              fontWeight: 600
            }}>
              💰 Nagrody
            </h3>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {stats.flashPointsEarned !== undefined && (
                <div style={{
                  padding: '16px 24px',
                  background: 'rgba(255,215,0,0.1)',
                  borderRadius: '8px',
                  border: '2px solid rgba(255,215,0,0.3)',
                  textAlign: 'center',
                  minWidth: '140px'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>⚡</div>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 700, 
                    color: stats.flashPointsEarned > 0 ? '#FFD700' : '#f87171',
                    marginBottom: '4px'
                  }}>
                    {stats.flashPointsEarned > 0 ? '+' : ''}{stats.flashPointsEarned}
                  </div>
                  <div style={{ fontSize: '12px', color: '#B8B8D0' }}>FlashPoints</div>
                </div>
              )}
              
              {stats.experienceEarned !== undefined && (
                <div style={{
                  padding: '16px 24px',
                  background: stats.experienceEarned >= 0 
                    ? 'rgba(138,43,226,0.1)' 
                    : 'rgba(239,68,68,0.1)',
                  borderRadius: '8px',
                  border: stats.experienceEarned >= 0 
                    ? '2px solid rgba(138,43,226,0.3)' 
                    : '2px solid rgba(239,68,68,0.3)',
                  textAlign: 'center',
                  minWidth: '140px'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>
                    {stats.experienceEarned >= 0 ? '⭐' : '⚠️'}
                  </div>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 700, 
                    color: stats.experienceEarned >= 0 ? '#8A2BE2' : '#ef4444',
                    marginBottom: '4px'
                  }}>
                    {stats.experienceEarned > 0 ? '+' : ''}{stats.experienceEarned}
                  </div>
                  <div style={{ fontSize: '12px', color: '#B8B8D0' }}>Experience</div>
                  {stats.experienceEarned < 0 && (
                    <div style={{ 
                      fontSize: '11px', 
                      color: '#ef4444', 
                      marginTop: '4px',
                      fontWeight: 600
                    }}>
                      Kara za słaby wynik
                    </div>
                  )}
                </div>
              )}

              {stats.leveledUp && stats.newLevel && (
                <div style={{
                  padding: '16px 24px',
                  background: 'linear-gradient(135deg, rgba(0,229,255,0.2) 0%, rgba(138,43,226,0.2) 100%)',
                  borderRadius: '8px',
                  border: '2px solid #00E5FF',
                  textAlign: 'center',
                  minWidth: '140px',
                  boxShadow: '0 0 20px rgba(0,229,255,0.3)'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>🎉</div>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 700, 
                    color: '#00E5FF',
                    marginBottom: '4px'
                  }}>
                    Level {stats.newLevel}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#00E5FF',
                    fontWeight: 600
                  }}>
                    Awans! 🎊
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
