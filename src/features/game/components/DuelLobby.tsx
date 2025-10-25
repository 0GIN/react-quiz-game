/**
 * @fileoverview Lobby pojedynków Duel
 * 
 * Wyświetla:
 * - Oczekujące wyzwania (do akceptacji/odrzucenia)
 * - Aktywne pojedynki (twoja tura / oczekiwanie)
 * - Historia zakończonych pojedynków
 * - Przycisk do wysłania nowego wyzwania
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@features/auth';
import { Card, MaterialIcon, Spinner } from '@shared/ui';
import {
  getUserDuels,
  acceptDuelChallenge,
  declineDuelChallenge,
  subscribeToNewChallenges,
  getDuelQueue,
  isInQueue,
  joinDuelQueue,
  leaveDuelQueue,
  challengeFromQueue,
  subscribeToQueue,
  type DuelMatch,
  type DuelQueueEntry,
} from '@/services/duelService';
import { supabase } from '@/lib/supabase';
import { getDisplayAvatar } from '@/utils/avatar';
import '@/styles/ui.css';

export default function DuelLobby() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'queue'>('active');
  const [activeDuels, setActiveDuels] = useState<DuelMatch[]>([]);
  const [pendingDuels, setPendingDuels] = useState<DuelMatch[]>([]);
  const [queuePlayers, setQueuePlayers] = useState<DuelQueueEntry[]>([]);
  const [inQueue, setInQueue] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadDuels();
    loadQueue();
    checkQueueStatus();

    // Subskrybuj nowe wyzwania (INSERT)
    const unsubscribeChallenges = subscribeToNewChallenges(user.id, (newChallenge) => {
      console.log('🎯 Nowe wyzwanie:', newChallenge);
      setPendingDuels(prev => [newChallenge, ...prev]);
      // Pokaż powiadomienie
      window.dispatchEvent(new Event('refreshUnreadCount'));
    });

    // Subskrybuj zmiany statusu meczów (UPDATE) - np. pending -> active
    const unsubscribeMatchUpdates = supabase
      .channel(`duel-match-updates:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'duel_matches',
          filter: `player1_id=eq.${user.id}`,
        },
        () => {
          console.log('🔄 Match updated (player1)');
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
          console.log('🔄 Match updated (player2)');
          loadDuels();
        }
      )
      .subscribe();

    // Subskrybuj zmiany w kolejce
    const unsubscribeQueue = subscribeToQueue(() => {
      loadQueue();
    });

    return () => {
      unsubscribeChallenges();
      supabase.removeChannel(unsubscribeMatchUpdates);
      unsubscribeQueue();
    };
  }, [user]);

  const loadDuels = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [active, pending] = await Promise.all([
        getUserDuels(user.id, 'active'),
        getUserDuels(user.id, 'pending'),
      ]);

      setActiveDuels(active);
      setPendingDuels(pending);
    } catch (error) {
      console.error('Error loading duels:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadQueue = async () => {
    if (!user) return;

    try {
      const queue = await getDuelQueue(user.id);
      console.log('🔍 Loaded queue:', queue);
      setQueuePlayers(queue);
    } catch (error) {
      console.error('Error loading queue:', error);
    }
  };

  const checkQueueStatus = async () => {
    if (!user) return;

    try {
      const status = await isInQueue(user.id);
      setInQueue(status);
    } catch (error) {
      console.error('Error checking queue status:', error);
    }
  };

  const handleJoinQueue = async () => {
    if (!user) return;

    console.log('🎯 Joining queue with:', { userId: user.id, level: user.level, fp: user.flash_points });
    const result = await joinDuelQueue(user.id, user.level || 1, user.flash_points || 0);
    console.log('🎯 Join result:', result);
    if (result.success) {
      setInQueue(true);
      await loadQueue(); // Odśwież kolejkę
      alert('Dołączyłeś do kolejki! Inni gracze mogą Cię teraz wyzwać.');
    } else {
      alert(result.error || 'Nie udało się dołączyć do kolejki');
    }
  };

  const handleLeaveQueue = async () => {
    if (!user) return;

    const result = await leaveDuelQueue(user.id);
    if (result.success) {
      setInQueue(false);
    }
  };

  const handleChallengeFromQueue = async (queueEntryId: string) => {
    if (!user) return;

    const result = await challengeFromQueue(user.id, queueEntryId);
    if (result.success) {
      alert('Wyzwanie wysłane!');
      loadQueue();
      checkQueueStatus();
    } else {
      alert(result.error || 'Nie udało się wysłać wyzwania');
    }
  };

  const handleAccept = async (matchId: string) => {
    if (!user) return;

    const result = await acceptDuelChallenge(matchId, user.id);
    if (result.success) {
      // Przenieś z pending do active
      const accepted = pendingDuels.find(d => d.id === matchId);
      if (accepted) {
        setPendingDuels(prev => prev.filter(d => d.id !== matchId));
        setActiveDuels(prev => [{ ...accepted, status: 'active' }, ...prev]);
      }
      // Przejdź do gry
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
    
    // Jeśli current_turn_player_id jest null, to znaczy że czekamy na wybór kategorii
    if (duel.current_turn_player_id === null) {
      // Sprawdź kto powinien wybierać kategorię w bieżącej rundzie
      const isOddRound = duel.current_round % 2 === 1;
      return isOddRound ? user.id === duel.player1_id : user.id === duel.player2_id;
    }
    
    // W przeciwnym razie sprawdź czy to moja tura odpowiadania
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
      // Czeka na wybór kategorii
      return myTurn ? 'Wybierz kategorię' : 'Przeciwnik wybiera kategorię';
    } else {
      // Czeka na odpowiedzi
      return myTurn ? 'Odpowiedz na pytania' : 'Przeciwnik odpowiada';
    }
  };

  if (loading) {
    return (
      <main className="main">
        <div style={{ gridColumn: 'span 12' }}>
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Spinner />
              <p style={{ color: '#B0B0B0', marginTop: '16px' }}>Ładowanie pojedynków...</p>
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
                <h1 style={{ fontSize: '28px', color: '#E0E0E0', marginBottom: '8px' }}>
                  ⚔️ Pojedynki Duel
                </h1>
                <p style={{ color: '#B0B0B0', fontSize: '14px' }}>
                  5 rund, po 3 pytania. Najlepszy wygrywa!
                </p>
              </div>
              <button
                onClick={() => navigate('/duel/challenge')}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #00E5FF 0%, #00B8D4 100%)',
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
                  color: activeTab === 'active' ? '#00E5FF' : '#B0B0B0',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderBottom: activeTab === 'active' ? '2px solid #00E5FF' : '2px solid transparent',
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
                  color: activeTab === 'pending' ? '#00E5FF' : '#B0B0B0',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderBottom: activeTab === 'pending' ? '2px solid #00E5FF' : '2px solid transparent',
                  marginBottom: '-2px',
                }}
              >
                Wyzwania ({pendingDuels.length})
              </button>
              <button
                onClick={() => setActiveTab('queue')}
                style={{
                  padding: '12px 24px',
                  background: 'none',
                  border: 'none',
                  color: activeTab === 'queue' ? '#00E5FF' : '#B0B0B0',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderBottom: activeTab === 'queue' ? '2px solid #00E5FF' : '2px solid transparent',
                  marginBottom: '-2px',
                }}
              >
                🔍 Szukaj ({queuePlayers.length})
              </button>
            </div>

            {/* Content */}
            <div>
              {/* Aktywne pojedynki */}
              {activeTab === 'active' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {activeDuels.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                      <MaterialIcon icon="sports_mma" size={64} style={{ opacity: 0.3 }} />
                      <p style={{ color: '#B0B0B0', marginTop: '16px' }}>
                        Brak aktywnych pojedynków
                      </p>
                      <button
                        onClick={() => navigate('/duel/challenge')}
                        style={{
                          marginTop: '16px',
                          padding: '10px 20px',
                          background: 'rgba(0,229,255,0.1)',
                          border: '1px solid rgba(0,229,255,0.3)',
                          borderRadius: '8px',
                          color: '#00E5FF',
                          cursor: 'pointer',
                        }}
                      >
                        Wyślij pierwsze wyzwanie
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
                            padding: '16px',
                            background: myTurn 
                              ? 'rgba(0,229,255,0.05)'
                              : 'rgba(255,255,255,0.02)',
                            border: myTurn
                              ? '2px solid rgba(0,229,255,0.3)'
                              : '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = myTurn
                              ? 'rgba(0,229,255,0.1)'
                              : 'rgba(255,255,255,0.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = myTurn
                              ? 'rgba(0,229,255,0.05)'
                              : 'rgba(255,255,255,0.02)';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            {/* Avatar przeciwnika */}
                            <div style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '50%',
                              background: 'rgba(0,229,255,0.1)',
                              border: '2px solid rgba(0,229,255,0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '24px',
                            }}>
                              {opponent ? getDisplayAvatar(opponent.avatar_url) : '👤'}
                            </div>

                            {/* Info */}
                            <div style={{ flex: 1 }}>
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px',
                                marginBottom: '4px'
                              }}>
                                <span style={{ color: '#E0E0E0', fontWeight: 600 }}>
                                  {opponent?.username || 'Nieznany'}
                                </span>
                                {myTurn && (
                                  <span style={{
                                    padding: '2px 8px',
                                    background: 'rgba(0,229,255,0.2)',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    color: '#00E5FF',
                                    fontWeight: 600,
                                  }}>
                                    TWOJA TURA
                                  </span>
                                )}
                              </div>
                              <div style={{ color: '#B0B0B0', fontSize: '13px' }}>
                                Runda {duel.current_round}/5 • {getTurnStatus(duel)}
                              </div>
                            </div>

                            {/* Wynik */}
                            <div style={{ 
                              textAlign: 'center',
                              padding: '8px 16px',
                              background: 'rgba(255,255,255,0.05)',
                              borderRadius: '8px',
                            }}>
                              <div style={{ fontSize: '20px', fontWeight: 700, color: '#E0E0E0' }}>
                                {user?.id === duel.player1_id ? duel.player1_score : duel.player2_score}
                                {' : '}
                                {user?.id === duel.player1_id ? duel.player2_score : duel.player1_score}
                              </div>
                            </div>

                            <MaterialIcon icon="chevron_right" size={24} style={{ color: '#B0B0B0' }} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Oczekujące wyzwania */}
              {activeTab === 'pending' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {pendingDuels.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                      <MaterialIcon icon="schedule" size={64} style={{ opacity: 0.3 }} />
                      <p style={{ color: '#B0B0B0', marginTop: '16px' }}>
                        Brak oczekujących wyzwań
                      </p>
                    </div>
                  ) : (
                    pendingDuels.map(duel => {
                      const opponent = getOpponent(duel);
                      const isSent = user?.id === duel.player1_id;
                      
                      return (
                        <div
                          key={duel.id}
                          style={{
                            padding: '16px',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '50%',
                              background: 'rgba(0,229,255,0.1)',
                              border: '2px solid rgba(0,229,255,0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '24px',
                            }}>
                              {opponent ? getDisplayAvatar(opponent.avatar_url) : '👤'}
                            </div>

                            <div style={{ flex: 1 }}>
                              <div style={{ color: '#E0E0E0', fontWeight: 600, marginBottom: '4px' }}>
                                {isSent ? 'Wysłano do: ' : 'Wyzwanie od: '}
                                {opponent?.username || 'Nieznany'}
                              </div>
                              {duel.challenge_message && (
                                <div style={{ color: '#B0B0B0', fontSize: '13px' }}>
                                  "{duel.challenge_message}"
                                </div>
                              )}
                              <div style={{ color: '#888', fontSize: '12px', marginTop: '4px' }}>
                                {new Date(duel.created_at).toLocaleString('pl-PL')}
                              </div>
                            </div>

                            {!isSent && (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  onClick={() => handleAccept(duel.id)}
                                  style={{
                                    padding: '8px 16px',
                                    background: 'rgba(0,229,255,0.1)',
                                    border: '1px solid rgba(0,229,255,0.3)',
                                    borderRadius: '8px',
                                    color: '#00E5FF',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                  }}
                                >
                                  Akceptuj
                                </button>
                                <button
                                  onClick={() => handleDecline(duel.id)}
                                  style={{
                                    padding: '8px 16px',
                                    background: 'rgba(255,0,0,0.1)',
                                    border: '1px solid rgba(255,0,0,0.3)',
                                    borderRadius: '8px',
                                    color: '#FF6B6B',
                                    fontWeight: 600,
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

              {/* Kolejka matchmakingu */}
              {activeTab === 'queue' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Status gracza */}
                  <div style={{
                    padding: '16px',
                    background: inQueue ? 'rgba(0,229,255,0.1)' : 'rgba(255,255,255,0.02)',
                    border: inQueue ? '2px solid rgba(0,229,255,0.3)' : '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ color: '#E0E0E0', fontWeight: 600, marginBottom: '4px' }}>
                        {inQueue ? '🟢 Jesteś w kolejce' : '⚪ Nie jesteś w kolejce'}
                      </div>
                      <div style={{ color: '#B0B0B0', fontSize: '14px' }}>
                        {inQueue 
                          ? 'Inni gracze mogą Cię wyzwać. Możesz też wyzwać ich!' 
                          : 'Dołącz do kolejki, aby inni gracze mogli Cię wyzwać'}
                      </div>
                    </div>
                    <button
                      onClick={inQueue ? handleLeaveQueue : handleJoinQueue}
                      style={{
                        padding: '12px 24px',
                        background: inQueue 
                          ? 'rgba(255,0,0,0.1)' 
                          : 'linear-gradient(135deg, #00E5FF 0%, #00B8D4 100%)',
                        border: inQueue ? '1px solid rgba(255,0,0,0.3)' : 'none',
                        borderRadius: '12px',
                        color: inQueue ? '#f87171' : '#0A0A1A',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {inQueue ? 'Opuść kolejkę' : 'Dołącz do kolejki'}
                    </button>
                  </div>

                  {/* Lista graczy szukających */}
                  <div>
                    <h3 style={{ color: '#E0E0E0', marginBottom: '16px', fontSize: '18px' }}>
                      Gracze szukający przeciwnika ({queuePlayers.length})
                    </h3>

                    {queuePlayers.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <MaterialIcon icon="search_off" size={64} style={{ opacity: 0.3 }} />
                        <p style={{ color: '#B0B0B0', marginTop: '16px' }}>
                          Brak graczy w kolejce
                        </p>
                        <p style={{ color: '#888', fontSize: '14px', marginTop: '8px' }}>
                          Bądź pierwszym! Dołącz do kolejki aby inni mogli Cię wyzwać.
                        </p>
                      </div>
                    ) : (
                      queuePlayers.map((player) => (
                        <div
                          key={player.id}
                          style={{
                            padding: '16px',
                            marginBottom: '12px',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                          }}
                        >
                          <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            background: 'rgba(0,229,255,0.1)',
                            border: '2px solid rgba(0,229,255,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '28px',
                          }}>
                            {player.user_data ? getDisplayAvatar(player.user_data.avatar_url) : '👤'}
                          </div>

                          <div style={{ flex: 1 }}>
                            <div style={{ color: '#E0E0E0', fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>
                              {player.user_data?.username || 'Nieznany'}
                            </div>
                            <div style={{ color: '#B0B0B0', fontSize: '13px', marginBottom: '4px' }}>
                              Level {player.level} • {player.flash_points} FP
                            </div>
                            {player.message && (
                              <div style={{
                                color: '#888',
                                fontSize: '13px',
                                fontStyle: 'italic',
                                marginTop: '8px',
                                padding: '8px',
                                background: 'rgba(0,0,0,0.2)',
                                borderRadius: '6px',
                                borderLeft: '3px solid rgba(0,229,255,0.3)',
                              }}>
                                "{player.message}"
                              </div>
                            )}
                            <div style={{ color: '#666', fontSize: '11px', marginTop: '4px' }}>
                              W kolejce od {new Date(player.created_at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>

                          <button
                            onClick={() => handleChallengeFromQueue(player.id)}
                            style={{
                              padding: '10px 20px',
                              background: 'linear-gradient(135deg, #00E5FF 0%, #00B8D4 100%)',
                              border: 'none',
                              borderRadius: '10px',
                              color: '#0A0A1A',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                          >
                            <MaterialIcon icon="bolt" size={20} />
                            Wyzwij
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
