import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@features/auth'
import { supabase } from '@/lib/supabase'
import { Card } from '@shared/ui'
import {
  joinSquadQueue,
  leaveSquadQueue,
  getQueueEntry,
  getSquadMatchDetails,
  subscribeToSquadQueue,
  createSquadRounds,
  startSquadMatch,

  type SquadMatchDetails
} from '@services/squadService'
interface Friend {
  id: string
  user_id: string
  friend_id: string
  status: string
  friend_data: {
    id: string
    username: string
    avatar_url: string
    level: number
  }
  friend: {
    id: string
    username: string
    avatar: string
    level: number
  }
}
import type { RealtimeChannel } from '@supabase/supabase-js'

export default function SquadLobby() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [inQueue, setInQueue] = useState(false)
  const [matchFound, setMatchFound] = useState(false)
  const [matchDetails, setMatchDetails] = useState<SquadMatchDetails | null>(null)

  const [friends, setFriends] = useState<Friend[]>([])
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [showFriendSelector, setShowFriendSelector] = useState(false)

  const [queueSubscription, setQueueSubscription] = useState<RealtimeChannel | null>(null)

  // Load friends
  useEffect(() => {
    const loadFriends = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('friendships')
          .select(`
            id,
            user_id,
            friend_id,
            status,
            friend_data:users!friendships_friend_id_fkey(
              id,
              username,
              avatar_url,
              level
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'accepted')
        
        if (error) throw error
        
        // Map to expected format
        const mapped = (data || []).map((f: any) => ({
          ...f,
          friend: {
            id: f.friend_data.id,
            username: f.friend_data.username,
            avatar: f.friend_data.avatar_url,
            level: f.friend_data.level
          }
        }))
        
        setFriends(mapped)
      } catch (error) {
        console.error('Error loading friends:', error)
      }
    }

    loadFriends()
  }, [user])

  // Check if already in queue
  useEffect(() => {
    if (user) {
      checkQueueStatus()
    }
  }, [user])

  // Subscribe to queue updates
  useEffect(() => {
    if (!user || !inQueue) return

    const subscription = subscribeToSquadQueue(user.id, async () => {
      setMatchFound(true)
      
      // Find the match that was created
      // The queue entry doesn't have match_id, so we need to poll for the match
      setTimeout(async () => {
        try {
          const { data: matches } = await supabase
            .from('squad_matches')
            .select('id')
            .or(
              `team_a_player1_id.eq.${user.id},` +
              `team_a_player2_id.eq.${user.id},` +
              `team_b_player1_id.eq.${user.id},` +
              `team_b_player2_id.eq.${user.id}`
            )
            .eq('status', 'waiting')
            .order('created_at', { ascending: false })
            .limit(1)

          if (matches && matches.length > 0) {
            const details = await getSquadMatchDetails(matches[0].id)
            setMatchDetails(details)
          }
        } catch (error) {
          console.error('Error loading match:', error)
        }
      }, 1000)
    })

    setQueueSubscription(subscription)

    return () => {
      subscription.unsubscribe()
    }
  }, [user, inQueue])

  async function checkQueueStatus() {
    if (!user) return

    try {
      const entry = await getQueueEntry(user.id)
      if (entry) {
        setInQueue(true)
        // Entry saved to database
        
        if (entry.player2_id) {
          const friend = friends.find(
            f => f.friend_id === entry.player2_id || f.user_id === entry.player2_id
          )
          if (friend) {
            setSelectedFriend(friend)
          }
        }
      }
    } catch (error) {
      console.error('Error checking queue:', error)
    }
  }

  async function handleJoinQueue() {
    if (!user) return

    setLoading(true)
    try {
      await joinSquadQueue(
        user.id,
        selectedFriend ? selectedFriend.friend_id : undefined,
        undefined // No category selection
      )
      setInQueue(true)
      await checkQueueStatus()
    } catch (error: any) {
      console.error('Error joining queue:', error)
      alert(error.message || 'Nie udało się dołączyć do kolejki')
    } finally {
      setLoading(false)
    }
  }

  async function handleLeaveQueue() {
    if (!user) return

    setLoading(true)
    try {
      await leaveSquadQueue(user.id)
      setInQueue(false)
      // Entry removed from database
      setMatchFound(false)
      setMatchDetails(null)
      if (queueSubscription) {
        queueSubscription.unsubscribe()
        setQueueSubscription(null)
      }
    } catch (error) {
      console.error('Error leaving queue:', error)
      alert('Nie udało się opuścić kolejki')
    } finally {
      setLoading(false)
    }
  }

  async function handleStartMatch() {
    if (!matchDetails) return

    setLoading(true)
    try {
      // Create rounds for the match
      await createSquadRounds(matchDetails.id, matchDetails.category_id, 10)
      
      // Start the match
      await startSquadMatch(matchDetails.id)
      
      // Navigate to game
      navigate(`/squad/${matchDetails.id}`)
    } catch (error) {
      console.error('Error starting match:', error)
      alert('Nie udało się rozpocząć meczu')
    } finally {
      setLoading(false)
    }
  }

  function handleInviteFriend() {
    setShowFriendSelector(true)
  }

  function handleSelectFriend(friend: Friend) {
    setSelectedFriend(friend)
    setShowFriendSelector(false)
  }

  if (!user) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff'
      }}>
        Musisz być zalogowany, aby grać w Squad Mode
      </div>
    )
  }

  // Match found - waiting for all players
  if (matchFound && matchDetails) {
    const isTeamA = 
      matchDetails.team_a_player1_id === user.id ||
      matchDetails.team_a_player2_id === user.id

    const myTeam = isTeamA
      ? [matchDetails.team_a_player1, matchDetails.team_a_player2]
      : [matchDetails.team_b_player1, matchDetails.team_b_player2]

    const enemyTeam = isTeamA
      ? [matchDetails.team_b_player1, matchDetails.team_b_player2]
      : [matchDetails.team_a_player1, matchDetails.team_a_player2]

    return (
      <div style={{
        minHeight: '80vh',
        padding: '40px 20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
          borderRadius: '24px',
          padding: '40px',
          border: '2px solid rgba(59, 130, 246, 0.3)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '12px',
            background: 'linear-gradient(to right, #3b82f6, #9333ea)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            MECZ ZNALEZIONY!
          </h1>

          <p style={{
            textAlign: 'center',
            color: '#94a3b8',
            marginBottom: '40px',
            fontSize: '18px'
          }}>
            Przygotuj się do walki 2v2
          </p>

          {/* Teams display */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: '40px',
            alignItems: 'center',
            marginBottom: '40px'
          }}>
            {/* Your Team */}
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              borderRadius: '16px',
              padding: '24px',
              border: '2px solid rgba(34, 197, 94, 0.3)'
            }}>
              <h3 style={{
                color: '#22c55e',
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                Twoja Drużyna
              </h3>

              {myTeam.map((player, index) => (
                <div
                  key={player.id}
                  style={{
                    background: player.id === user.id
                      ? 'rgba(34, 197, 94, 0.2)'
                      : 'rgba(255, 255, 255, 0.05)',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: index === 0 ? '12px' : '0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div className="avatar-emoji" style={{ fontSize: '32px' }}>
                    {player.avatar || '👤'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: '16px'
                    }}>
                      {player.username}
                      {player.id === user.id && (
                        <span style={{
                          color: '#22c55e',
                          fontSize: '14px',
                          marginLeft: '8px'
                        }}>
                          (Ty)
                        </span>
                      )}
                    </div>
                    <div style={{
                      color: '#94a3b8',
                      fontSize: '14px'
                    }}>
                      Poziom {player.level}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* VS */}
            <div style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#ef4444',
              textShadow: '0 0 20px rgba(239, 68, 68, 0.5)'
            }}>
              VS
            </div>

            {/* Enemy Team */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '16px',
              padding: '24px',
              border: '2px solid rgba(239, 68, 68, 0.3)'
            }}>
              <h3 style={{
                color: '#ef4444',
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                Przeciwnicy
              </h3>

              {enemyTeam.map((player, index) => (
                <div
                  key={player.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: index === 0 ? '12px' : '0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div className="avatar-emoji" style={{ fontSize: '32px' }}>
                    {player.avatar || '👤'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: '16px'
                    }}>
                      {player.username}
                    </div>
                    <div style={{
                      color: '#94a3b8',
                      fontSize: '14px'
                    }}>
                      Poziom {player.level}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category info */}
          {matchDetails.category && (
            <div style={{
              textAlign: 'center',
              marginBottom: '32px',
              padding: '16px',
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '4px' }}>
                Kategoria
              </div>
              <div style={{ color: '#3b82f6', fontSize: '18px', fontWeight: 'bold' }}>
                {matchDetails.category.name}
              </div>
            </div>
          )}

          {/* Start button */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleStartMatch}
              disabled={loading}
              style={{
                background: 'linear-gradient(to right, #22c55e, #10b981)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 48px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 16px rgba(34, 197, 94, 0.3)',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(34, 197, 94, 0.3)'
              }}
            >
              {loading ? 'Rozpoczynanie...' : 'ROZPOCZNIJ WALKĘ'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // In queue - searching
  if (inQueue) {
    return (
      <div style={{
        minHeight: '80vh',
        padding: '40px 20px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
          borderRadius: '24px',
          padding: '60px 40px',
          textAlign: 'center',
          border: '2px solid rgba(59, 130, 246, 0.3)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}>
          {/* Animated searching indicator */}
          <div style={{
            width: '120px',
            height: '120px',
            margin: '0 auto 32px',
            borderRadius: '50%',
            border: '4px solid rgba(59, 130, 246, 0.2)',
            borderTopColor: '#3b82f6',
            animation: 'spin 1s linear infinite',
            boxShadow: '0 0 40px rgba(59, 130, 246, 0.3)'
          }} />

          <h2 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#fff',
            marginBottom: '16px'
          }}>
            Szukamy przeciwników...
          </h2>

          <p style={{
            color: '#94a3b8',
            fontSize: '16px',
            marginBottom: '32px'
          }}>
            {selectedFriend
              ? `Ty i ${selectedFriend.friend.username} czekają na mecz`
              : 'Szukamy partnera i przeciwników dla Ciebie'}
          </p>

          {/* Queue info */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '32px'
          }}>
            <div style={{
              color: '#94a3b8'
            }}>
              <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>Tryb:</span>{' '}
              {selectedFriend ? 'Gra z przyjacielem' : 'Losowe dopasowanie'}
            </div>
          </div>

          <button
            onClick={handleLeaveQueue}
            disabled={loading}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              border: '2px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '14px 32px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
            }}
          >
            Opuść kolejkę
          </button>
        </div>

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // Main lobby - similar to Duel interface
  return (
    <main className="main">
      <div style={{ gridColumn: 'span 12' }}>
        <Card>
          <div style={{ padding: '24px' }}>
            <h1 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '12px',
              background: 'linear-gradient(to right, #3b82f6, #9333ea)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              ⚔️ SQUAD MODE
            </h1>

        <p style={{
          textAlign: 'center',
          color: '#94a3b8',
          marginBottom: '40px',
          fontSize: '16px'
        }}>
          Walka 2v2 • 10 pytań • Wyg

rywają najlepsi!
        </p>

            {/* Status panel - similar to Duel */}
            <div style={{
              padding: '16px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ color: '#E0E0E0', fontWeight: 600, marginBottom: '4px' }}>
                    {selectedFriend 
                      ? `👥 W drużynie z: ${selectedFriend.friend.username}` 
                      : '🎲 Losowe dopasowanie'}
                  </div>
                  <div style={{ color: '#B0B0B0', fontSize: '14px' }}>
                    {selectedFriend 
                      ? 'Gotowi do walki 2v2' 
                      : 'Znajdziemy dla Ciebie partnera i przeciwników'}
                  </div>
                </div>
                {!selectedFriend ? (
                  <button
                    onClick={handleInviteFriend}
                    style={{
                      padding: '10px 20px',
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#3b82f6',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    👥 Zaproś znajomego
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedFriend(null)}
                    style={{
                      padding: '10px 20px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '8px',
                      color: '#ef4444',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    ✕ Usuń z drużyny
                  </button>
                )}
              </div>
            </div>

            {/* Start button */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={handleJoinQueue}
                disabled={loading}
                style={{
                  background: 'linear-gradient(to right, #22c55e, #10b981)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '18px 60px',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 4px 16px rgba(34, 197, 94, 0.3)',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.4)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(34, 197, 94, 0.3)'
                }}
              >
                {loading ? 'Dołączanie...' : 'DOŁĄCZ DO KOLEJKI'}
              </button>
            </div>

            {/* Friend selector modal */}
            {showFriendSelector && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000,
                  padding: '20px'
                }}
                onClick={() => setShowFriendSelector(false)}
              >
          <div
            style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '70vh',
              overflow: 'auto',
              border: '2px solid rgba(59, 130, 246, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#fff',
              marginBottom: '20px'
            }}>
              Wybierz partnera
            </h3>

            {friends.length === 0 ? (
              <p style={{
                color: '#94a3b8',
                textAlign: 'center',
                padding: '40px 20px'
              }}>
                Nie masz jeszcze znajomych
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {friends.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => handleSelectFriend(friend)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '2px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'
                      e.currentTarget.style.borderColor = '#3b82f6'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <div className="avatar-emoji" style={{ fontSize: '32px' }}>
                      {friend.friend.avatar || '👤'}
                    </div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}>
                        {friend.friend.username}
                      </div>
                      <div style={{
                        color: '#94a3b8',
                        fontSize: '14px'
                      }}>
                        Poziom {friend.friend.level || 1}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowFriendSelector(false)}
              style={{
                marginTop: '20px',
                width: '100%',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '2px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                padding: '12px',
                color: '#ef4444',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              Anuluj
            </button>
          </div>
        </div>
      )}
          </div>
        </Card>
      </div>
    </main>
  )
}
