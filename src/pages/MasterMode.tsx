/**
 * @fileoverview Lobby trybu Master
 * 
 * Master to ranked duel w jednej wybranej kategorii.
 * Wyświetla te same zakładki co Duel (Aktywne, Wyzwania, Ranked),
 * ale mecze Master są tylko w wybranej kategorii.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@features/auth';
import { Card, MaterialIcon, Spinner } from '@shared/ui';
import {
  getUserDuels,
  acceptDuelChallenge,
  declineDuelChallenge,
  subscribeToNewChallenges,
  joinRankedQueue,
  leaveRankedQueue,
  isInRankedQueue,
  getRankedQueueCount,
  subscribeToRankedMatches,
  type DuelMatch,
} from '@/services/duelService';
import { supabase } from '@/lib/supabase';
import { getDisplayAvatar } from '@/utils/avatar';
import { type Category } from '@/types';
import { getCategories } from '@/services/questionService';

export default function MasterMode() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'ranked'>('ranked');
  const [activeDuels, setActiveDuels] = useState<DuelMatch[]>([]);
  const [pendingDuels, setPendingDuels] = useState<DuelMatch[]>([]);
  const [inRankedQueue, setInRankedQueue] = useState(false);
  const [rankedQueueCount, setRankedQueueCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchingRanked, setSearchingRanked] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showCategorySelect, setShowCategorySelect] = useState(false);

  // Ustaw aktywną zakładkę
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Pobierz kategorie
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Błąd ładowania kategorii:', error);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    if (!user) return;
    loadDuels();
    checkRankedQueueStatus();
    loadRankedQueueCount();

    // Subskrybuj nowe wyzwania Master
    const unsubscribeChallenges = subscribeToNewChallenges(user.id, (newChallenge) => {
      // Tylko mecze Master (z master_category_id)
      if (newChallenge.master_category_id) {
        console.log('🎯 Nowe wyzwanie Master:', newChallenge);
        setPendingDuels(prev => [newChallenge, ...prev]);
        window.dispatchEvent(new Event('refreshUnreadCount'));
      }
    });

    // Subskrybuj zmiany statusu meczów
    const unsubscribeMatchUpdates = supabase
      .channel(`master-match-updates:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'duel_matches',
          filter: `player1_id=eq.${user.id}`,
        },
        () => {
          console.log('🔄 Master match updated (player1)');
          loadDuels();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'duel_matches',
          filter: `player2_id=eq.${user.id}`,
        },
        () => {
          console.log('🔄 Master match updated (player2)');
          loadDuels();
        }
      )
      .subscribe();

    // Subskrybuj znalezione mecze Master rankingowe
    const unsubscribeRankedMatches = subscribeToRankedMatches(user.id, (matchId) => {
      console.log('🎮 Master ranked match found:', matchId);
      setSearchingRanked(false);
      setInRankedQueue(false);
      setShowCategorySelect(false);
      alert('Znaleziono przeciwnika! Rozpoczynamy mecz Master...');
      navigate(`/duel/${matchId}`);
    });

    return () => {
      unsubscribeChallenges();
      supabase.removeChannel(unsubscribeMatchUpdates);
      unsubscribeRankedMatches();
    };
  }, [user, navigate]);

  const loadDuels = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [active, pending] = await Promise.all([
        getUserDuels(user.id, 'active'),
        getUserDuels(user.id, 'pending'),
      ]);

      // Filtruj tylko mecze Master (z master_category_id)
      setActiveDuels(active.filter(d => d.master_category_id));
      setPendingDuels(pending.filter(d => d.master_category_id));
    } catch (error) {
      console.error('Error loading master duels:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkRankedQueueStatus = async () => {
    if (!user) return;

    try {
      const status = await isInRankedQueue(user.id);
      setInRankedQueue(status);
      if (status) {
        setSearchingRanked(true);
      }
    } catch (error) {
      console.error('Error checking ranked queue status:', error);
    }
  };

  const loadRankedQueueCount = async () => {
    try {
      const count = await getRankedQueueCount();
      setRankedQueueCount(count);
    } catch (error) {
      console.error('Error loading ranked queue count:', error);
    }
  };

  const handleCategorySelect = async (category: Category) => {
    if (!user) return;

    setSelectedCategory(category);
    setSearchingRanked(true);
    setShowCategorySelect(false);

    console.log('🎯 Joining Master ranked queue:', {
      userId: user.id,
      level: user.level,
      fp: user.flash_points,
      masterCategoryId: category.id
    });

    const result = await joinRankedQueue(
      user.id,
      user.level || 1,
      user.flash_points || 0,
      undefined, // no message
      category.id // Master category
    );

    console.log('🎯 Master ranked queue result:', result);

    if (!result.success) {
      setSearchingRanked(false);
      alert(result.error || 'Nie udało się dołączyć do kolejki');
      return;
    }

    if (result.match_found && result.match_id) {
      setSearchingRanked(false);
      alert(`Znaleziono przeciwnika: ${result.opponent_username} (Level ${result.opponent_level})!`);
      navigate(`/duel/${result.match_id}`);
    } else {
      setInRankedQueue(true);
      loadRankedQueueCount();
    }
  };

  const handleLeaveRankedQueue = async () => {
    if (!user) return;

    setSearchingRanked(false);
    setShowCategorySelect(false);
    const result = await leaveRankedQueue(user.id);
    if (result.success) {
      setInRankedQueue(false);
      setSelectedCategory(null);
      loadRankedQueueCount();
    }
  };

  const handleAccept = async (matchId: string) => {
    if (!user) return;

    if (inRankedQueue) {
      await leaveRankedQueue(user.id);
      setInRankedQueue(false);
      setSearchingRanked(false);
    }

    const result = await acceptDuelChallenge(matchId, user.id);
    if (result.success) {
      const accepted = pendingDuels.find(d => d.id === matchId);
      if (accepted) {
        setPendingDuels(prev => prev.filter(d => d.id !== matchId));
        setActiveDuels(prev => [{ ...accepted, status: 'active' }, ...prev]);
      }
      navigate(`/duel/${matchId}`);
    }
  };

  const handleDecline = async (matchId: string) => {
    if (!user) return;

    const result = await declineDuelChallenge(matchId, user.id);
    if (result.success) {
      setPendingDuels(prev => prev.filter(d => d.id !== matchId));
    }
  };

  const isMyTurn = (duel: DuelMatch): boolean => {
    if (!user) return false;
    
    if (duel.current_turn_player_id === null) {
      const isOddRound = duel.current_round % 2 === 1;
      return isOddRound ? user.id === duel.player1_id : user.id === duel.player2_id;
    }
    
    return duel.current_turn_player_id === user.id;
  };

  const getOpponent = (duel: DuelMatch) => {
    if (!user) return null;
    return user.id === duel.player1_id ? duel.player2 : duel.player1;
  };

  const getTurnStatus = (duel: DuelMatch): string => {
    if (!user) return '';
    
    const myTurn = isMyTurn(duel);
    
    if (duel.current_turn_player_id === null) {
      return myTurn ? 'Wybierz kategorię' : 'Przeciwnik wybiera kategorię';
    } else {
      return myTurn ? 'Odpowiedz na pytania' : 'Przeciwnik odpowiada';
    }
  };

  const getCategoryName = (categoryId: number): string => {
    const cat = categories.find(c => c.id === categoryId);
    return cat?.name || 'Nieznana kategoria';
  };

  if (loading) {
    return (
      <main className="main">
        <div style={{ gridColumn: 'span 12' }}>
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Spinner />
              <p style={{ color: '#B0B0B0', marginTop: '16px' }}>Ładowanie Master Mode...</p>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="main">
      <div style={{ gridColumn: 'span 12' }}>
        <Card>
          <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <div>
                <h1 style={{ fontSize: '28px', color: '#FFD700', marginBottom: '8px' }}>
                  🏆 Master Mode
                </h1>
                <p style={{ color: '#B0B0B0', fontSize: '14px' }}>
                  Rankingowy pojedynek w jednej kategorii wiedzy
                </p>
              </div>
              <button
                onClick={() => navigate('/duel/challenge', { state: { isMaster: true } })}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#0A0A1A',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <MaterialIcon icon="add_circle" size={20} />
                Nowe Wyzwanie
              </button>
            </div>

            {/* Tabs */}
            <div style={{ 
              display: 'flex', 
              gap: '16px', 
              borderBottom: '2px solid rgba(255,255,255,0.1)',
              marginBottom: '24px'
            }}>
              <button
                onClick={() => setActiveTab('active')}
                style={{
                  padding: '12px 24px',
                  background: 'none',
                  border: 'none',
                  color: activeTab === 'active' ? '#FFD700' : '#B0B0B0',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderBottom: activeTab === 'active' ? '2px solid #FFD700' : '2px solid transparent',
                  marginBottom: '-2px',
                }}
              >
                Aktywne ({activeDuels.length})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                style={{
                  padding: '12px 24px',
                  background: 'none',
                  border: 'none',
                  color: activeTab === 'pending' ? '#FFD700' : '#B0B0B0',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderBottom: activeTab === 'pending' ? '2px solid #FFD700' : '2px solid transparent',
                  marginBottom: '-2px',
                }}
              >
                Wyzwania ({pendingDuels.length})
              </button>
              <button
                onClick={() => setActiveTab('ranked')}
                style={{
                  padding: '12px 24px',
                  background: 'none',
                  border: 'none',
                  color: activeTab === 'ranked' ? '#FFD700' : '#B0B0B0',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderBottom: activeTab === 'ranked' ? '2px solid #FFD700' : '2px solid transparent',
                  marginBottom: '-2px',
                }}
              >
                🏆 Ranked ({rankedQueueCount})
              </button>
            </div>

            {/* Content */}
            <div>
              {/* Aktywne pojedynki Master */}
              {activeTab === 'active' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {activeDuels.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                      <MaterialIcon icon="emoji_events" size={64} style={{ opacity: 0.3, color: '#FFD700' }} />
                      <p style={{ color: '#B0B0B0', marginTop: '16px' }}>
                        Brak aktywnych meczów Master
                      </p>
                      <button
                        onClick={() => setActiveTab('ranked')}
                        style={{
                          marginTop: '16px',
                          padding: '10px 20px',
                          background: 'rgba(255,215,0,0.1)',
                          border: '1px solid rgba(255,215,0,0.3)',
                          borderRadius: '8px',
                          color: '#FFD700',
                          cursor: 'pointer',
                        }}
                      >
                        Dołącz do Ranked
                      </button>
                    </div>
                  ) : (
                    activeDuels.map(duel => {
                      const opponent = getOpponent(duel);
                      const myTurn = isMyTurn(duel);
                      
                      return (
                        <div
                          key={duel.id}
                          onClick={() => navigate(`/duel/${duel.id}`)}
                          style={{
                            padding: '20px',
                            background: myTurn 
                              ? 'linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(255,193,7,0.05) 100%)'
                              : 'rgba(255,255,255,0.03)',
                            border: myTurn 
                              ? '2px solid rgba(255,215,0,0.4)'
                              : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,215,0,0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <div style={{ fontSize: '40px' }}>
                                {opponent?.avatar_url ? getDisplayAvatar(opponent.avatar_url) : '👤'}
                              </div>
                              <div>
                                <div style={{ fontSize: '18px', color: '#E0E0E0', fontWeight: 600 }}>
                                  vs {opponent?.username || 'Unknown'}
                                </div>
                                <div style={{ fontSize: '14px', color: '#B0B0B0', marginTop: '4px' }}>
                                  Kategoria: {getCategoryName(duel.master_category_id!)}
                                </div>
                                <div style={{ fontSize: '14px', color: '#B0B0B0', marginTop: '4px' }}>
                                  Runda {duel.current_round}/5
                                </div>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{
                                padding: '8px 16px',
                                background: myTurn ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                fontSize: '14px',
                                color: myTurn ? '#FFD700' : '#B0B0B0',
                                fontWeight: 600,
                                marginBottom: '8px',
                              }}>
                                {getTurnStatus(duel)}
                              </div>
                              <div style={{ fontSize: '24px', color: '#E0E0E0' }}>
                                {duel.player1_id === user?.id ? duel.player1_score : duel.player2_score} : {duel.player1_id === user?.id ? duel.player2_score : duel.player1_score}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Wyzwania Master */}
              {activeTab === 'pending' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {pendingDuels.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                      <MaterialIcon icon="inbox" size={64} style={{ opacity: 0.3 }} />
                      <p style={{ color: '#B0B0B0', marginTop: '16px' }}>
                        Brak oczekujących wyzwań Master
                      </p>
                    </div>
                  ) : (
                    pendingDuels.map(duel => {
                      const opponent = getOpponent(duel);
                      const iAmChallenger = duel.player1_id === user?.id;

                      return (
                        <div
                          key={duel.id}
                          style={{
                            padding: '20px',
                            background: 'rgba(255,215,0,0.05)',
                            border: '1px solid rgba(255,215,0,0.2)',
                            borderRadius: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <div style={{ fontSize: '40px' }}>
                                {opponent?.avatar_url ? getDisplayAvatar(opponent.avatar_url) : '👤'}
                              </div>
                              <div>
                                <div style={{ fontSize: '18px', color: '#E0E0E0', fontWeight: 600 }}>
                                  {iAmChallenger ? 'Wysłane do:' : 'Wyzwanie od:'} {opponent?.username || 'Unknown'}
                                </div>
                                <div style={{ fontSize: '14px', color: '#FFD700', marginTop: '4px' }}>
                                  Kategoria: {getCategoryName(duel.master_category_id!)}
                                </div>
                              </div>
                            </div>
                            {!iAmChallenger && (
                              <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                  onClick={() => handleAccept(duel.id)}
                                  style={{
                                    padding: '10px 20px',
                                    background: 'linear-gradient(135deg, #4CAF50 0%, #45A049 100%)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                  }}
                                >
                                  Akceptuj
                                </button>
                                <button
                                  onClick={() => handleDecline(duel.id)}
                                  style={{
                                    padding: '10px 20px',
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '8px',
                                    color: '#B0B0B0',
                                    cursor: 'pointer',
                                  }}
                                >
                                  Odrzuć
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Ranked Queue */}
              {activeTab === 'ranked' && (
                <div>
                  {!searchingRanked && !showCategorySelect && (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                      <MaterialIcon icon="emoji_events" size={64} style={{ color: '#FFD700', marginBottom: '16px' }} />
                      <h2 style={{ fontSize: '24px', color: '#FFD700', marginBottom: '12px' }}>
                        Tryb Master Ranked
                      </h2>
                      <p style={{ color: '#B0B0B0', marginBottom: '24px', maxWidth: '500px', margin: '0 auto' }}>
                        Wybierz kategorię i zmierz się z przeciwnikiem na podobnym poziomie w rankingowym pojedynku!
                      </p>
                      <p style={{ color: '#808080', fontSize: '14px', marginBottom: '24px' }}>
                        Graczy w kolejce: {rankedQueueCount}
                      </p>
                      <button
                        onClick={() => setShowCategorySelect(true)}
                        style={{
                          padding: '16px 32px',
                          background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 100%)',
                          border: 'none',
                          borderRadius: '12px',
                          color: '#0A0A1A',
                          fontSize: '16px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <MaterialIcon icon="search" size={20} />
                        Wybierz kategorię
                      </button>
                    </div>
                  )}

                  {showCategorySelect && !searchingRanked && (
                    <div>
                      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '20px', color: '#FFD700', marginBottom: '8px' }}>
                          Wybierz kategorię dla Master Mode
                        </h3>
                        <p style={{ color: '#B0B0B0', fontSize: '14px' }}>
                          Zmierzysz się tylko w tej kategorii
                        </p>
                      </div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                        gap: '16px',
                        marginBottom: '24px'
                      }}>
                        {categories.map(category => (
                          <div
                            key={category.id}
                            onClick={() => handleCategorySelect(category)}
                            style={{
                              padding: '20px',
                              background: 'rgba(255,215,0,0.1)',
                              border: '2px solid rgba(255,215,0,0.3)',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              textAlign: 'center',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-4px)';
                              e.currentTarget.style.borderColor = '#FFD700';
                              e.currentTarget.style.background = 'rgba(255,215,0,0.2)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.borderColor = 'rgba(255,215,0,0.3)';
                              e.currentTarget.style.background = 'rgba(255,215,0,0.1)';
                            }}
                          >
                            <MaterialIcon 
                              icon={category.icon || 'category'} 
                              size={40} 
                              style={{ color: '#FFD700', marginBottom: '8px' }}
                            />
                            <div style={{ fontSize: '14px', color: '#E0E0E0', fontWeight: 600 }}>
                              {category.name}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => setShowCategorySelect(false)}
                          style={{
                            padding: '10px 20px',
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            color: '#B0B0B0',
                            cursor: 'pointer',
                          }}
                        >
                          Anuluj
                        </button>
                      </div>
                    </div>
                  )}

                  {searchingRanked && (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                      <div style={{
                        width: '80px',
                        height: '80px',
                        margin: '0 auto 24px',
                        borderRadius: '50%',
                        border: '4px solid rgba(255,215,0,0.3)',
                        borderTopColor: '#FFD700',
                        animation: 'spin 1s linear infinite',
                      }} />
                      <h3 style={{ fontSize: '20px', color: '#FFD700', marginBottom: '8px' }}>
                        Szukam przeciwnika...
                      </h3>
                      {selectedCategory && (
                        <p style={{ color: '#B0B0B0', marginBottom: '16px' }}>
                          Kategoria: {selectedCategory.name}
                        </p>
                      )}
                      <p style={{ color: '#808080', fontSize: '14px', marginBottom: '24px' }}>
                        Graczy w kolejce: {rankedQueueCount}
                      </p>
                      <button
                        onClick={handleLeaveRankedQueue}
                        style={{
                          padding: '12px 24px',
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '8px',
                          color: '#B0B0B0',
                          cursor: 'pointer',
                        }}
                      >
                        Anuluj szukanie
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </main>
  );
}
