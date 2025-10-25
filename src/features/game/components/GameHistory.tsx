import { useState, useEffect } from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { getGameHistory } from '@/services/gameService';
import { Card, MaterialIcon } from '@shared/ui';
import '@/styles/ui.css';
import '@/styles/GameHistory.css';

interface GameHistoryItem {
  id: string;
  score: number;
  correct_answers: number;
  wrong_answers: number;
  flash_points_earned: number;
  experience_earned: number;
  placement: number;
  joined_at: string;
  games: {
    id: string;
    started_at: string;
    ended_at: string;
    total_questions: number;
    game_modes: {
      name: string;
      code: string;
    };
    categories: {
      name: string;
      icon_emoji: string;
    } | null;
  };
}

export default function GameHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<GameHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'wins' | 'losses'>('all');

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    
    setLoading(true);
    const result = await getGameHistory(user.id, 50);
    
    if (result.success) {
      setHistory(result.data as GameHistoryItem[]);
    }
    setLoading(false);
  };

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'przed chwilą';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min temu`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} godz. temu`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} dni temu`;
    return date.toLocaleDateString('pl-PL');
  };

  const getModeIcon = (code: string) => {
    const icons: Record<string, string> = {
      duel: '⚔️',
      squad: '👥',
      blitz: '⚡',
      master: '🎓',
    };
    return icons[code] || '🎮';
  };

  const filteredHistory = history.filter(item => {
    if (filter === 'wins') return item.placement === 1;
    if (filter === 'losses') return item.placement !== 1;
    return true;
  });

  const totalGames = history.length;
  const wins = history.filter(g => g.placement === 1).length;
  const losses = totalGames - wins;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

  if (loading) {
    return (
      <main className="main" role="main">
        <Card title="📋 Historia Gier" className="history-page">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Ładowanie historii...</p>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="main" role="main">
      <Card title="📋 Historia Gier" className="history-page">
        {/* Statystyki ogólne */}
        <div className="history-summary">
          <div className="summary-stat">
            <span className="stat-value">{totalGames}</span>
            <span className="stat-label">Gier</span>
          </div>
          <div className="summary-stat success">
            <span className="stat-value">{wins}</span>
            <span className="stat-label">Wygrane</span>
          </div>
          <div className="summary-stat error">
            <span className="stat-value">{losses}</span>
            <span className="stat-label">Przegrane</span>
          </div>
          <div className="summary-stat">
            <span className="stat-value">{winRate}%</span>
            <span className="stat-label">Win Rate</span>
          </div>
        </div>

        {/* Filtry */}
        <div className="history-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Wszystkie ({totalGames})
          </button>
          <button 
            className={`filter-btn ${filter === 'wins' ? 'active' : ''}`}
            onClick={() => setFilter('wins')}
          >
            Wygrane ({wins})
          </button>
          <button 
            className={`filter-btn ${filter === 'losses' ? 'active' : ''}`}
            onClick={() => setFilter('losses')}
          >
            Przegrane ({losses})
          </button>
        </div>

        {/* Lista gier */}
        <div className="history-list">
          {filteredHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#8b949e' }}>
              <p>Brak gier w historii</p>
              <p style={{ fontSize: '14px', marginTop: '10px' }}>
                Zagraj swoją pierwszą grę w trybie Blitz!
              </p>
            </div>
          ) : (
            filteredHistory.map((game) => {
              const isWin = game.placement === 1;
              const accuracy = game.games.total_questions > 0
                ? Math.round((game.correct_answers / game.games.total_questions) * 100)
                : 0;

              return (
                <div key={game.id} className={`history-item ${isWin ? 'win' : 'loss'}`}>
                  <div className="history-result">
                    <span className={`result-badge ${isWin ? 'win' : 'loss'}`}>
                      {isWin ? 'Wygrana' : 'Przegrana'}
                    </span>
                  </div>
                  
                  <div className="history-mode">
                    <span className="mode-icon">
                      {getModeIcon(game.games.game_modes.code)}
                    </span>
                    <span>{game.games.game_modes.name}</span>
                  </div>
                  
                  {game.games.categories && (
                    <div className="history-category">
                      <MaterialIcon icon={game.games.categories.icon_emoji} size={20} />
                      <span>{game.games.categories.name}</span>
                    </div>
                  )}
                  
                  <div className="history-score">
                    <span className="score-main">{game.score}</span>
                    <span className="score-label">punktów</span>
                  </div>
                  
                  <div className="history-stats">
                    <span>✅ {game.correct_answers}/{game.games.total_questions}</span>
                    <span>📊 {accuracy}%</span>
                  </div>
                  
                  <div className="history-rewards">
                    <span className="xp-gain">+{game.experience_earned} XP</span>
                    <span className="pts-gain">+{game.flash_points_earned} FP</span>
                  </div>
                  
                  <div className="history-time">
                    {getTimeSince(game.games.ended_at || game.games.started_at)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </main>
  );
}
