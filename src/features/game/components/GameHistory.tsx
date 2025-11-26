import { useState, useEffect } from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { getGameHistory } from '@/services/gameService';
import { getDuelHistory, type DuelMatch } from '@/services/duelService';
import { supabase } from '@/lib/supabase';
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

// Ujednolicony typ dla historii (Blitz + Duel + Master)
interface UnifiedHistoryItem {
  id: string;
  type: 'blitz' | 'duel' | 'master';
  timestamp: string;
  isWin: boolean;
  isDraw: boolean;
  mode: string;
  modeCode: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  flashPoints: number;
  experience: number;
  opponentName?: string;
  opponentAvatar?: string;
  category?: {
    name: string;
    icon_emoji: string;
  };
}

export default function GameHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<UnifiedHistoryItem[]>([]);
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
    
    // Pobierz gry Blitz
    const blitzResult = await getGameHistory(user.id, 15);
    
    // Pobierz duele (zwykłe i Master) z kategorią
    const { data: duelMatches, error: duelError } = await supabase
      .from('duel_matches')
      .select(`
        *,
        player1:users!duel_matches_player1_id_fkey(id, username, avatar_url),
        player2:users!duel_matches_player2_id_fkey(id, username, avatar_url),
        master_category:categories!duel_matches_master_category_id_fkey(id, name, icon_emoji)
      `)
      .eq('status', 'completed')
      .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
      .order('completed_at', { ascending: false })
      .limit(15);

    if (duelError) {
      console.error('Error fetching duel history:', duelError);
    }
    
    const unified: UnifiedHistoryItem[] = [];
    
    // Konwertuj Blitz (bez wyniku - nie pokazujemy w historii)
    if (blitzResult.success) {
      const blitzGames = (blitzResult.data as GameHistoryItem[]).map(game => ({
        id: game.id,
        type: 'blitz' as const,
        timestamp: game.games.ended_at || game.games.started_at,
        isWin: false,
        isDraw: false, // Blitz nie jest remisem
        mode: game.games.game_modes.name,
        modeCode: game.games.game_modes.code,
        score: game.score,
        totalQuestions: game.games.total_questions,
        correctAnswers: game.correct_answers,
        accuracy: game.games.total_questions > 0
          ? Math.round((game.correct_answers / game.games.total_questions) * 100)
          : 0,
        flashPoints: game.flash_points_earned,
        experience: game.experience_earned,
        category: game.games.categories || undefined,
      }));
      unified.push(...blitzGames);
    }
    
    // Konwertuj Duel i Master
    if (duelMatches) {
      duelMatches.forEach((duel: any) => {
        const isPlayer1 = user.id === duel.player1_id;
        const myScore = isPlayer1 ? duel.player1_score : duel.player2_score;
        const isWin = duel.winner_id === user.id;
        const isDraw = duel.winner_id === null;
        const opponent = isPlayer1 ? duel.player2 : duel.player1;
        const isMasterMode = !!duel.master_category_id;
        
        // Nagród: wygraną 100 FP, remis 50 FP, przegrana 0 FP
        const flashPoints = isWin ? 100 : (isDraw ? 50 : 0);
        
        // Szacunkowe XP (możesz dostosować)
        const experience = isWin ? 150 : (isDraw ? 75 : 50);
        
        unified.push({
          id: duel.id,
          type: isMasterMode ? 'master' : 'duel',
          timestamp: duel.completed_at || duel.created_at,
          isWin: isWin && !isDraw,
          isDraw: isDraw,
          mode: isMasterMode ? 'Master' : 'Duel',
          modeCode: isMasterMode ? 'master' : 'duel',
          score: myScore,
          totalQuestions: 15, // 5 rund × 3 pytania
          correctAnswers: myScore,
          accuracy: Math.round((myScore / 15) * 100),
          flashPoints,
          experience,
          opponentName: opponent?.username,
          opponentAvatar: opponent?.avatar_url,
          category: duel.master_category || undefined,
        });
      });
    }
    
    // Sortuj po czasie (najnowsze pierwsze) i ogranicz do 15
    unified.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    unified.splice(15); // Zachowaj tylko pierwsze 15
    
    setHistory(unified);
    setLoading(false);
  };

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const absSeconds = Math.abs(Math.floor(diffMs / 1000));
    
    // Jeśli różnica jest mniejsza niż 5 minut (w dowolnym kierunku), pokaż "przed chwilą"
    if (absSeconds < 300) return 'przed chwilą';
    
    // Dla pozostałych używaj wartości bezwzględnej (ignoruj niewielkie przesunięcia czasowe)
    if (absSeconds < 3600) return `${Math.floor(absSeconds / 60)} min temu`;
    if (absSeconds < 86400) return `${Math.floor(absSeconds / 3600)} godz. temu`;
    if (absSeconds < 604800) return `${Math.floor(absSeconds / 86400)} dni temu`;
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
    if (filter === 'wins') return item.isWin;
    if (filter === 'losses') return !item.isWin && !item.isDraw;
    return true;
  });

  const totalGames = history.length;
  const wins = history.filter(g => g.isWin).length;
  const draws = history.filter(g => g.isDraw).length;
  const losses = totalGames - wins - draws;
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
          <div className="summary-stat">
            <span className="stat-value">{draws}</span>
            <span className="stat-label">Remisy</span>
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

        {/* Lista gier - z scrollowaniem */}
        <div 
          className="history-list"
          style={{
            maxHeight: '600px',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {filteredHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#8b949e' }}>
              <p>Brak gier w historii</p>
              <p style={{ fontSize: '14px', marginTop: '10px' }}>
                Zagraj swoją pierwszą grę!
              </p>
            </div>
          ) : (
            filteredHistory.map((game) => {
              const isBlitz = game.type === 'blitz';
              const resultClass = isBlitz ? 'neutral' : (game.isDraw ? 'draw' : (game.isWin ? 'win' : 'loss'));
              const resultLabel = isBlitz ? 'Zagrano' : (game.isDraw ? 'Remis' : (game.isWin ? 'Wygrana' : 'Przegrana'));
              
              return (
                <div key={game.id} className={`history-item ${resultClass}`}>
                  <div className="history-result">
                    <span className={`result-badge ${resultClass}`}>
                      {resultLabel}
                    </span>
                  </div>
                  
                  <div className="history-mode">
                    <span className="mode-icon">
                      {getModeIcon(game.modeCode)}
                    </span>
                    <span>{game.mode}</span>
                    {(game.type === 'duel' || game.type === 'master') && game.opponentName && (
                      <span style={{ marginLeft: '8px', color: '#888', fontSize: '13px' }}>
                        vs {game.opponentName}
                      </span>
                    )}
                  </div>
                  
                  {game.category && (
                    <div className="history-category">
                      <MaterialIcon icon={game.category.icon_emoji} size={20} />
                      <span>{game.category.name}</span>
                    </div>
                  )}
                  
                  <div className="history-score">
                    <span className="score-main">{game.score}</span>
                    <span className="score-label">{(game.type === 'duel' || game.type === 'master') ? 'prawidłowych' : 'punktów'}</span>
                  </div>
                  
                  <div className="history-stats">
                    <span>✅ {game.correctAnswers}/{game.totalQuestions}</span>
                    <span>📊 {game.accuracy}%</span>
                  </div>
                  
                  <div className="history-rewards">
                    <span className="xp-gain">+{game.experience} XP</span>
                    <span className="pts-gain">+{game.flashPoints} FP</span>
                  </div>
                  
                  <div className="history-time">
                    {getTimeSince(game.timestamp)}
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
