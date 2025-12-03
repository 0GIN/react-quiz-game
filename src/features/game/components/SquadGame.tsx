import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@features/auth'
import {
  getSquadMatchDetails,
  getSquadRound,
  submitSquadAnswer,
  calculateSquadRoundResults,
  completeSquadMatch,
  subscribeToSquadMatch,
  subscribeToSquadRound,
  type SquadMatchDetails,
  type SquadRound
} from '@services/squadService'
import type { RealtimeChannel } from '@supabase/supabase-js'
interface Question {
  id: string
  question_text: string
  correct_answer: string
  incorrect_answer1: string
  incorrect_answer2: string
  incorrect_answer3: string
}

type GamePhase = 'waiting' | 'question' | 'results' | 'final'

export default function SquadGame() {
  const { matchId } = useParams<{ matchId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [match, setMatch] = useState<SquadMatchDetails | null>(null)
  const [currentRound, setCurrentRound] = useState<(SquadRound & { question: Question }) | null>(null)
  const [phase, setPhase] = useState<GamePhase>('waiting')

  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [hasAnswered, setHasAnswered] = useState(false)
  const [timeLeft, setTimeLeft] = useState(10)

  const [matchSubscription, setMatchSubscription] = useState<RealtimeChannel | null>(null)
  const [roundSubscription, setRoundSubscription] = useState<RealtimeChannel | null>(null)

  const timerRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)

  // Load initial data
  useEffect(() => {
    if (matchId && user) {
      loadMatch()
    }
  }, [matchId, user])

  // Subscribe to match updates
  useEffect(() => {
    if (!matchId || !match) return

    const subscription = subscribeToSquadMatch(matchId, (payload) => {
      const updated = payload.new as SquadMatchDetails
      setMatch(updated)

      if (updated.status === 'completed') {
        setPhase('final')
        cleanup()
      }
    })

    setMatchSubscription(subscription)

    return () => {
      subscription.unsubscribe()
    }
  }, [matchId, match])

  // Subscribe to round updates
  useEffect(() => {
    if (!matchId || !match || phase !== 'question') return

    const subscription = subscribeToSquadRound(
      matchId,
      match.current_round,
      async (payload) => {
        const updatedRound = payload.new as SquadRound

        // Check if all players have answered
        const allAnswered =
          updatedRound.team_a_player1_answer !== null &&
          updatedRound.team_a_player2_answer !== null &&
          updatedRound.team_b_player1_answer !== null &&
          updatedRound.team_b_player2_answer !== null

        if (allAnswered) {
          // Calculate results
          await calculateSquadRoundResults(matchId, match.current_round)
          
          // Reload round with results
          const roundWithResults = await getSquadRound(matchId, match.current_round)
          setCurrentRound(roundWithResults)
          
          setPhase('results')
          cleanup()
        }
      }
    )

    setRoundSubscription(subscription)

    return () => {
      subscription.unsubscribe()
    }
  }, [matchId, match, phase])

  // Timer for questions
  useEffect(() => {
    if (phase === 'question' && !hasAnswered) {
      startTimeRef.current = Date.now()
      
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeout()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
    }
  }, [phase, hasAnswered])

  async function loadMatch() {
    if (!matchId) return

    try {
      setLoading(true)
      const matchData = await getSquadMatchDetails(matchId!)
      setMatch(matchData)

      if (matchData.status === 'in_progress') {
        await loadCurrentRound(matchData)
      } else if (matchData.status === 'completed') {
        setPhase('final')
      }
    } catch (error) {
      console.error('Error loading match:', error)
      alert('Nie udało się załadować meczu')
      navigate('/squad')
    } finally {
      setLoading(false)
    }
  }

  async function loadCurrentRound(matchData: SquadMatchDetails) {
    if (!matchId) return

    try {
      const round = await getSquadRound(matchId!, matchData.current_round)
      setCurrentRound(round)
      setPhase('question')
      setTimeLeft(10)
      setSelectedAnswer('')
      setHasAnswered(false)

      // Check if player already answered
      if (user) {
        const playerPosition = getPlayerPosition(matchData, user.id)
        if (playerPosition) {
          const answer = (round as any)[`${playerPosition}_answer`]
          if (answer !== null) {
            setHasAnswered(true)
            setSelectedAnswer(answer)
          }
        }
      }
    } catch (error) {
      console.error('Error loading round:', error)
    }
  }

  function getPlayerPosition(matchData: SquadMatchDetails, playerId: string): string | null {
    if (matchData.team_a_player1_id === playerId) return 'team_a_player1'
    if (matchData.team_a_player2_id === playerId) return 'team_a_player2'
    if (matchData.team_b_player1_id === playerId) return 'team_b_player1'
    if (matchData.team_b_player2_id === playerId) return 'team_b_player2'
    return null
  }

  function getPlayerTeam(matchData: SquadMatchDetails, playerId: string): 'team_a' | 'team_b' | null {
    if (matchData.team_a_player1_id === playerId || matchData.team_a_player2_id === playerId) {
      return 'team_a'
    }
    if (matchData.team_b_player1_id === playerId || matchData.team_b_player2_id === playerId) {
      return 'team_b'
    }
    return null
  }

  async function handleAnswer(answer: string) {
    if (!user || !matchId || !match || hasAnswered) return

    const elapsed = Date.now() - startTimeRef.current
    setSelectedAnswer(answer)
    setHasAnswered(true)

    try {
      await submitSquadAnswer(
        matchId!,
        match.current_round,
        user.id,
        answer,
        elapsed
      )
    } catch (error) {
      console.error('Error submitting answer:', error)
    }
  }

  async function handleTimeout() {
    if (!user || !matchId || !match || hasAnswered) return

    setHasAnswered(true)

    try {
      await submitSquadAnswer(
        matchId!,
        match.current_round,
        user.id,
        '',
        10000
      )
    } catch (error) {
      console.error('Error submitting timeout:', error)
    }
  }

  async function handleNextRound() {
    if (!match || !matchId) return

    cleanup()

    if (match.current_round >= match.total_rounds) {
      // Match finished
      await completeSquadMatch(matchId!)
      setPhase('final')
    } else {
      // Load next round
      const updatedMatch = await getSquadMatchDetails(matchId!)
      setMatch(updatedMatch)
      await loadCurrentRound(updatedMatch)
    }
  }

  function cleanup() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (roundSubscription) {
      roundSubscription.unsubscribe()
      setRoundSubscription(null)
    }
  }

  function handleBackToLobby() {
    cleanup()
    if (matchSubscription) {
      matchSubscription.unsubscribe()
    }
    navigate('/squad')
  }

  if (loading || !match || !user) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff'
      }}>
        <div style={{
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid rgba(59, 130, 246, 0.2)',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <div>Ładowanie meczu...</div>
        </div>

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  const playerTeam = getPlayerTeam(match, user.id)
  const isTeamA = playerTeam === 'team_a'

  const myTeam = isTeamA
    ? [match.team_a_player1, match.team_a_player2]
    : [match.team_b_player1, match.team_b_player2]

  const enemyTeam = isTeamA
    ? [match.team_b_player1, match.team_b_player2]
    : [match.team_a_player1, match.team_a_player2]

  const myScore = isTeamA ? match.team_a_score : match.team_b_score
  const enemyScore = isTeamA ? match.team_b_score : match.team_a_score

  // Final results
  if (phase === 'final') {
    const winner = match.winning_team
    const didWin = 
      (winner === 'team_a' && isTeamA) ||
      (winner === 'team_b' && !isTeamA)
    const isDraw = winner === 'draw'

    return (
      <div style={{
        minHeight: '80vh',
        padding: '40px 20px',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        <div style={{
          background: isDraw
            ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1))'
            : didWin
            ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1))'
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1))',
          borderRadius: '24px',
          padding: '60px 40px',
          textAlign: 'center',
          border: isDraw
            ? '2px solid rgba(251, 191, 36, 0.3)'
            : didWin
            ? '2px solid rgba(34, 197, 94, 0.3)'
            : '2px solid rgba(239, 68, 68, 0.3)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}>
          <div style={{ fontSize: '80px', marginBottom: '24px' }}>
            {isDraw ? '🤝' : didWin ? '🏆' : '💔'}
          </div>

          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            marginBottom: '16px',
            color: isDraw ? '#fbbf24' : didWin ? '#22c55e' : '#ef4444'
          }}>
            {isDraw ? 'REMIS!' : didWin ? 'ZWYCIĘSTWO!' : 'PORAŻKA'}
          </h1>

          {/* Scores */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '40px',
            marginBottom: '40px',
            fontSize: '48px',
            fontWeight: 'bold'
          }}>
            <div style={{
              color: didWin ? '#22c55e' : '#ef4444'
            }}>
              {myScore}
            </div>
            <div style={{ color: '#64748b' }}>:</div>
            <div style={{
              color: !didWin && !isDraw ? '#22c55e' : '#ef4444'
            }}>
              {enemyScore}
            </div>
          </div>

          {/* Teams */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '40px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <h3 style={{
                color: '#fff',
                fontSize: '18px',
                fontWeight: 'bold',
                marginBottom: '16px'
              }}>
                Twoja Drużyna
              </h3>
              {myTeam.map((player) => (
                <div
                  key={player.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px'
                  }}
                >
                  <div className="avatar-emoji" style={{ fontSize: '24px' }}>
                    {player.avatar || '👤'}
                  </div>
                  <div style={{
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    {player.username}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <h3 style={{
                color: '#fff',
                fontSize: '18px',
                fontWeight: 'bold',
                marginBottom: '16px'
              }}>
                Przeciwnicy
              </h3>
              {enemyTeam.map((player) => (
                <div
                  key={player.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px'
                  }}
                >
                  <div className="avatar-emoji" style={{ fontSize: '24px' }}>
                    {player.avatar || '👤'}
                  </div>
                  <div style={{
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    {player.username}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rewards info */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '32px'
          }}>
            <div style={{
              color: '#94a3b8',
              marginBottom: '8px'
            }}>
              Nagrody:
            </div>
            <div style={{
              color: '#fff',
              fontSize: '20px',
              fontWeight: 'bold'
            }}>
              {isDraw
                ? '+75 XP, +50 monet'
                : didWin
                ? '+150 XP, +100 monet'
                : '+75 XP, +50 monet'}
            </div>
          </div>

          <button
            onClick={handleBackToLobby}
            style={{
              background: 'linear-gradient(to right, #3b82f6, #2563eb)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 48px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.3)'
            }}
          >
            Wróć do lobby
          </button>
        </div>
      </div>
    )
  }

  // Results after round
  if (phase === 'results' && currentRound) {
    const myTeamPoints = isTeamA ? currentRound.team_a_round_points : currentRound.team_b_round_points
    const enemyTeamPoints = isTeamA ? currentRound.team_b_round_points : currentRound.team_a_round_points

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
          <h2 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '32px',
            color: '#fff'
          }}>
            Wyniki rundy {match.current_round}
          </h2>

          {/* Round scores */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '40px',
            marginBottom: '40px',
            fontSize: '36px',
            fontWeight: 'bold'
          }}>
            <div style={{
              color: myTeamPoints > enemyTeamPoints ? '#22c55e' : myTeamPoints < enemyTeamPoints ? '#ef4444' : '#fbbf24'
            }}>
              {myTeamPoints}
            </div>
            <div style={{ color: '#64748b' }}>:</div>
            <div style={{
              color: enemyTeamPoints > myTeamPoints ? '#22c55e' : enemyTeamPoints < myTeamPoints ? '#ef4444' : '#fbbf24'
            }}>
              {enemyTeamPoints}
            </div>
          </div>

          {/* Total scores */}
          <div style={{
            textAlign: 'center',
            marginBottom: '40px',
            padding: '20px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px'
          }}>
            <div style={{ color: '#94a3b8', marginBottom: '8px', fontSize: '14px' }}>
              Wynik całkowity
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#fff'
            }}>
              {myScore} : {enemyScore}
            </div>
          </div>

          {/* Correct answer */}
          <div style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border: '2px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '32px',
            textAlign: 'center'
          }}>
            <div style={{ color: '#94a3b8', marginBottom: '8px' }}>
              Prawidłowa odpowiedź:
            </div>
            <div style={{
              color: '#22c55e',
              fontSize: '20px',
              fontWeight: 'bold'
            }}>
              {currentRound.question.correct_answer}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleNextRound}
              style={{
                background: 'linear-gradient(to right, #3b82f6, #2563eb)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 48px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.3)'
              }}
            >
              {match.current_round >= match.total_rounds ? 'Zobacz wyniki' : 'Następna runda'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Question phase
  if (phase === 'question' && currentRound) {
    const answers = [
      currentRound.question.correct_answer,
      currentRound.question.incorrect_answer1,
      currentRound.question.incorrect_answer2,
      currentRound.question.incorrect_answer3
    ].sort(() => Math.random() - 0.5)

    return (
      <div style={{
        minHeight: '80vh',
        padding: '40px 20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Score header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          padding: '20px',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
          borderRadius: '16px',
          border: '2px solid rgba(59, 130, 246, 0.3)'
        }}>
          {/* Your team */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#22c55e'
            }}>
              {myScore}
            </div>
            <div>
              {myTeam.map((player) => (
                <div
                  key={player.id}
                  style={{
                    fontSize: '12px',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span className="avatar-emoji" style={{ fontSize: '16px' }}>
                    {player.avatar || '👤'}
                  </span>
                  {player.username}
                </div>
              ))}
            </div>
          </div>

          {/* Round indicator */}
          <div style={{
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '14px',
              color: '#94a3b8',
              marginBottom: '4px'
            }}>
              Runda
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#fff'
            }}>
              {match.current_round} / {match.total_rounds}
            </div>
          </div>

          {/* Enemy team */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div>
              {enemyTeam.map((player) => (
                <div
                  key={player.id}
                  style={{
                    fontSize: '12px',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    justifyContent: 'flex-end'
                  }}
                >
                  {player.username}
                  <span className="avatar-emoji" style={{ fontSize: '16px' }}>
                    {player.avatar || '👤'}
                  </span>
                </div>
              ))}
            </div>
            <div style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#ef4444'
            }}>
              {enemyScore}
            </div>
          </div>
        </div>

        {/* Question card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
          borderRadius: '24px',
          padding: '40px',
          border: '2px solid rgba(59, 130, 246, 0.3)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          marginBottom: '32px'
        }}>
          {/* Timer */}
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 32px',
            borderRadius: '50%',
            border: '4px solid rgba(59, 130, 246, 0.2)',
            borderTopColor: timeLeft <= 3 ? '#ef4444' : '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            fontWeight: 'bold',
            color: timeLeft <= 3 ? '#ef4444' : '#fff',
            animation: timeLeft <= 3 ? 'pulse 0.5s ease-in-out infinite' : 'none'
          }}>
            {timeLeft}
          </div>

          {/* Question */}
          <h2 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '40px',
            color: '#fff',
            lineHeight: 1.4
          }}>
            {currentRound.question.question_text}
          </h2>

          {/* Answers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px'
          }}>
            {answers.map((answer, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(answer)}
                disabled={hasAnswered}
                style={{
                  background: selectedAnswer === answer
                    ? 'linear-gradient(to right, #3b82f6, #2563eb)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: selectedAnswer === answer
                    ? '2px solid #3b82f6'
                    : '2px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '24px',
                  color: '#fff',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: hasAnswered ? 'not-allowed' : 'pointer',
                  opacity: hasAnswered && selectedAnswer !== answer ? 0.5 : 1,
                  transition: 'all 0.3s',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  if (!hasAnswered) {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.3)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {answer}
              </button>
            ))}
          </div>

          {hasAnswered && (
            <div style={{
              textAlign: 'center',
              marginTop: '32px',
              color: '#94a3b8',
              fontSize: '16px'
            }}>
              Czekamy na pozostałych graczy...
            </div>
          )}
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        `}</style>
      </div>
    )
  }

  return null
}
