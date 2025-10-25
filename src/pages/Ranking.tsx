import '@/styles/ui.css'
import { Card } from '@shared/ui'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@features/auth/hooks/useAuth'
import flashPoint from '@/assets/flash_point.png'

interface RankedPlayer {
  id: string;
  username: string;
  level: number;
  flash_points: number;
  total_games_played: number;
  total_wins: number;
  total_losses: number;
  current_streak: number;
  best_streak: number;
}

type SortField = 'flash_points' | 'level' | 'total_wins' | 'total_games_played';
type SortOrder = 'desc' | 'asc';

export default function Ranking() {
  const { user } = useAuth();
  const [players, setPlayers] = useState<RankedPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('flash_points');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const playersPerPage = 20;

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('id, username, level, flash_points, total_games_played, total_wins, total_losses, current_streak, best_streak')
        .order('flash_points', { ascending: false });

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getSortedPlayers = () => {
    let filtered = players;

    // Filtrowanie po wyszukiwanej frazie
    if (searchQuery.trim()) {
      filtered = filtered.filter(player =>
        player.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sortowanie
    return [...filtered].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });
  };

  const sortedPlayers = getSortedPlayers();
  const totalPages = Math.ceil(sortedPlayers.length / playersPerPage);
  const startIndex = (currentPage - 1) * playersPerPage;
  const paginatedPlayers = sortedPlayers.slice(startIndex, startIndex + playersPerPage);

  const calculateWinRate = (wins: number, losses: number) => {
    const total = wins + losses;
    if (total === 0) return 0;
    return Math.round((wins / total) * 100);
  };

  const getUserRank = () => {
    if (!user) return null;
    const index = sortedPlayers.findIndex(p => p.id === user.id);
    return index >= 0 ? index + 1 : null;
  };

  return (
    <main className="main" role="main">
      <Card title="🏆 Ranking Globalny" className="ranking-page">
        {/* Search & Stats */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            alignItems: 'center',
            flexWrap: 'wrap',
            marginBottom: '16px'
          }}>
            <input
              type="text"
              placeholder="🔍 Szukaj gracza po nazwie..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                flex: '1',
                minWidth: '250px',
                padding: '12px 16px',
                background: 'rgba(18, 18, 30, 0.6)',
                border: '2px solid rgba(0,229,255,0.3)',
                borderRadius: '8px',
                color: '#E0E0E0',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(0,229,255,0.8)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0,229,255,0.3)'}
            />
            
            {user && getUserRank() && (
              <div style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, rgba(0,229,255,0.1) 0%, rgba(138,43,226,0.1) 100%)',
                border: '2px solid rgba(0,229,255,0.3)',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', color: '#B8B8D0', marginBottom: '4px' }}>Twoja pozycja</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#00E5FF' }}>#{getUserRank()}</div>
              </div>
            )}
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            fontSize: '13px', 
            color: '#B8B8D0',
            flexWrap: 'wrap'
          }}>
            <span>📊 Łącznie graczy: <strong style={{ color: '#00E5FF' }}>{players.length}</strong></span>
            <span>•</span>
            <span>🔍 Wyniki: <strong style={{ color: '#00E5FF' }}>{sortedPlayers.length}</strong></span>
            <span>•</span>
            <span>📄 Strona: <strong style={{ color: '#00E5FF' }}>{currentPage}/{totalPages}</strong></span>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#B8B8D0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <div>Ładowanie rankingu...</div>
          </div>
        ) : sortedPlayers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#B8B8D0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <div>Nie znaleziono graczy pasujących do "{searchQuery}"</div>
          </div>
        ) : (
          <>
            <div className="ranking-table">
              <div className="ranking-header">
                <div className="rank-col">#</div>
                <div className="player-col">Gracz</div>
                <div 
                  className="level-col" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('level')}
                >
                  Poziom {sortField === 'level' && (sortOrder === 'desc' ? '▼' : '▲')}
                </div>
                <div 
                  className="points-col" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('flash_points')}
                >
                  Flash Points {sortField === 'flash_points' && (sortOrder === 'desc' ? '▼' : '▲')}
                </div>
                <div 
                  className="games-col" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('total_games_played')}
                >
                  Gry {sortField === 'total_games_played' && (sortOrder === 'desc' ? '▼' : '▲')}
                </div>
                <div 
                  className="winrate-col" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('total_wins')}
                >
                  Win Rate {sortField === 'total_wins' && (sortOrder === 'desc' ? '▼' : '▲')}
                </div>
              </div>

              {paginatedPlayers.map((player, index) => {
                const globalRank = startIndex + index + 1;
                const isCurrentUser = user?.id === player.id;
                const winRate = calculateWinRate(player.total_wins, player.total_losses);

                return (
                  <div 
                    key={player.id} 
                    className="ranking-row"
                    style={{
                      background: isCurrentUser 
                        ? 'linear-gradient(90deg, rgba(0,229,255,0.15) 0%, rgba(138,43,226,0.15) 100%)'
                        : undefined,
                      border: isCurrentUser 
                        ? '2px solid rgba(0,229,255,0.5)'
                        : undefined,
                      transform: isCurrentUser ? 'scale(1.02)' : undefined,
                      boxShadow: isCurrentUser 
                        ? '0 4px 20px rgba(0,229,255,0.3)'
                        : undefined
                    }}
                  >
                    <div className="rank-col">
                      <span className={`rank-badge ${globalRank <= 3 ? 'top-3' : ''}`}>
                        {globalRank === 1 ? '🥇' : globalRank === 2 ? '🥈' : globalRank === 3 ? '🥉' : globalRank}
                      </span>
                    </div>
                    <div className="player-col">
                      <div className="player-info">
                        <div className="player-avatar">
                          {isCurrentUser ? '👑' : '👤'}
                        </div>
                        <span style={{ 
                          fontWeight: isCurrentUser ? 700 : 400,
                          color: isCurrentUser ? '#00E5FF' : '#E0E0E0'
                        }}>
                          {player.username}
                          {isCurrentUser && <span style={{ marginLeft: '8px', fontSize: '12px' }}>(Ty)</span>}
                        </span>
                      </div>
                    </div>
                    <div className="level-col">
                      <span style={{ 
                        padding: '4px 12px',
                        background: 'rgba(0,229,255,0.1)',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#00E5FF'
                      }}>
                        Level {player.level}
                      </span>
                    </div>
                    <div className="points-col highlight">
                      <img src={flashPoint} alt="" style={{ width: '18px', height: '18px', marginRight: '6px', verticalAlign: 'middle' }} />
                      {player.flash_points.toLocaleString()}
                    </div>
                    <div className="games-col">{player.total_games_played}</div>
                    <div className="winrate-col">
                      <span style={{
                        color: winRate >= 70 ? '#4ade80' : winRate >= 50 ? '#FFD700' : '#f87171',
                        fontWeight: 600
                      }}>
                        {winRate}%
                      </span>
                      <div style={{ fontSize: '11px', color: '#B8B8D0', marginTop: '2px' }}>
                        {player.total_wins}W / {player.total_losses}L
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Paginacja */}
            {totalPages > 1 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                gap: '8px',
                marginTop: '24px',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 16px',
                    background: currentPage === 1 ? 'rgba(18,18,30,0.4)' : 'rgba(0,229,255,0.1)',
                    border: '2px solid rgba(0,229,255,0.3)',
                    borderRadius: '8px',
                    color: currentPage === 1 ? '#666' : '#00E5FF',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    transition: 'all 0.3s'
                  }}
                >
                  ««
                </button>
                
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 16px',
                    background: currentPage === 1 ? 'rgba(18,18,30,0.4)' : 'rgba(0,229,255,0.1)',
                    border: '2px solid rgba(0,229,255,0.3)',
                    borderRadius: '8px',
                    color: currentPage === 1 ? '#666' : '#00E5FF',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    transition: 'all 0.3s'
                  }}
                >
                  « Poprzednia
                </button>

                <div style={{ 
                  padding: '8px 16px',
                  background: 'rgba(0,229,255,0.2)',
                  border: '2px solid rgba(0,229,255,0.5)',
                  borderRadius: '8px',
                  color: '#00E5FF',
                  fontSize: '14px',
                  fontWeight: 700
                }}>
                  {currentPage} / {totalPages}
                </div>

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '8px 16px',
                    background: currentPage === totalPages ? 'rgba(18,18,30,0.4)' : 'rgba(0,229,255,0.1)',
                    border: '2px solid rgba(0,229,255,0.3)',
                    borderRadius: '8px',
                    color: currentPage === totalPages ? '#666' : '#00E5FF',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    transition: 'all 0.3s'
                  }}
                >
                  Następna »
                </button>

                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '8px 16px',
                    background: currentPage === totalPages ? 'rgba(18,18,30,0.4)' : 'rgba(0,229,255,0.1)',
                    border: '2px solid rgba(0,229,255,0.3)',
                    borderRadius: '8px',
                    color: currentPage === totalPages ? '#666' : '#00E5FF',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    transition: 'all 0.3s'
                  }}
                >
                  »»
                </button>
              </div>
            )}
          </>
        )}
      </Card>
    </main>
  )
}
