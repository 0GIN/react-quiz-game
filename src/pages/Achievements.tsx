/**
 * @fileoverview Strona osiągnięć użytkownika
 * Wyświetla wszystkie dostępne osiągnięcia i postęp gracza
 */

import { useState, useEffect } from 'react'
import { useAuth } from '@features/auth'
import { Card, MaterialIcon } from '@shared/ui'
import { supabase } from '@/lib/supabase'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: string
  requirement: number
  reward_coins: number
  reward_exp: number
  is_unlocked?: boolean
  progress?: number
  unlocked_at?: string
}

const ACHIEVEMENT_CATEGORIES = {
  games: '🎮 Rozgrywki',
  wins: '🏆 Zwycięstwa',
  streaks: '🔥 Serie',
  social: '👥 Społeczność',
  learning: '📚 Nauka',
  special: '⭐ Specjalne'
}

export default function Achievements() {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [stats, setStats] = useState({
    total: 0,
    unlocked: 0,
    totalCoins: 0,
    totalExp: 0
  })

  useEffect(() => {
    loadAchievements()
  }, [user])

  async function loadAchievements() {
    if (!user) return

    try {
      // Pobierz wszystkie osiągnięcia
      const { data: allAchievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('category', { ascending: true })
        .order('requirement', { ascending: true })

      if (achievementsError) throw achievementsError

      // Pobierz odblokowane osiągnięcia użytkownika
      const { data: userAchievements, error: userError } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at')
        .eq('user_id', user.id)

      if (userError) throw userError

      // Pobierz statystyki użytkownika do obliczenia postępu
      const { data: userStats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single()

      const unlockedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || [])
      const unlockedMap = new Map(userAchievements?.map(ua => [ua.achievement_id, ua.unlocked_at]) || [])

      // Połącz dane
      const enrichedAchievements = allAchievements?.map(ach => {
        const isUnlocked = unlockedIds.has(ach.id)
        let progress = 0

        // Oblicz postęp na podstawie kategorii
        if (userStats && !isUnlocked) {
          switch (ach.category) {
            case 'games':
              progress = Math.min((userStats.total_games_played / ach.requirement) * 100, 100)
              break
            case 'wins':
              progress = Math.min((userStats.total_wins / ach.requirement) * 100, 100)
              break
            case 'streaks':
              progress = Math.min((userStats.current_streak / ach.requirement) * 100, 100)
              break
            default:
              progress = 0
          }
        }

        return {
          ...ach,
          is_unlocked: isUnlocked,
          unlocked_at: unlockedMap.get(ach.id),
          progress: isUnlocked ? 100 : progress
        }
      }) || []

      setAchievements(enrichedAchievements)

      // Oblicz statystyki
      const unlocked = enrichedAchievements.filter(a => a.is_unlocked)
      setStats({
        total: enrichedAchievements.length,
        unlocked: unlocked.length,
        totalCoins: unlocked.reduce((sum, a) => sum + a.reward_coins, 0),
        totalExp: unlocked.reduce((sum, a) => sum + a.reward_exp, 0)
      })

    } catch (error) {
      console.error('Error loading achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === selectedCategory)

  if (!user) {
    return (
      <main className="main">
        <div style={{ gridColumn: 'span 12', textAlign: 'center', padding: '60px 20px' }}>
          <MaterialIcon icon="lock" size={80} style={{ opacity: 0.3 }} />
          <h2 style={{ color: '#E0E0E0', marginTop: '20px' }}>Zaloguj się aby zobaczyć osiągnięcia</h2>
        </div>
      </main>
    )
  }

  return (
    <main className="main">
      {/* Header */}
      <div style={{ gridColumn: 'span 12' }}>
        <Card>
          <div style={{ padding: '32px' }}>
            <h1 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              background: 'linear-gradient(to right, #FFD700, #FFA500)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '16px'
            }}>
              🏆 Osiągnięcia
            </h1>
            <p style={{ color: '#B0B0B0', fontSize: '16px' }}>
              Zdobywaj osiągnięcia i odblokowuj nagrody!
            </p>
          </div>
        </Card>
      </div>

      {/* Stats Cards */}
      <div style={{ gridColumn: 'span 3' }}>
        <Card>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <MaterialIcon icon="emoji_events" size={48} style={{ color: '#FFD700', marginBottom: '12px' }} />
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#FFD700', marginBottom: '4px' }}>
              {stats.unlocked}/{stats.total}
            </div>
            <div style={{ color: '#B0B0B0', fontSize: '14px' }}>
              Odblokowane
            </div>
          </div>
        </Card>
      </div>

      <div style={{ gridColumn: 'span 3' }}>
        <Card>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <MaterialIcon icon="paid" size={48} style={{ color: '#00E5FF', marginBottom: '12px' }} />
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#00E5FF', marginBottom: '4px' }}>
              {stats.totalCoins}
            </div>
            <div style={{ color: '#B0B0B0', fontSize: '14px' }}>
              Zdobyte monety
            </div>
          </div>
        </Card>
      </div>

      <div style={{ gridColumn: 'span 3' }}>
        <Card>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <MaterialIcon icon="stars" size={48} style={{ color: '#9333ea', marginBottom: '12px' }} />
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#9333ea', marginBottom: '4px' }}>
              {stats.totalExp}
            </div>
            <div style={{ color: '#B0B0B0', fontSize: '14px' }}>
              Zdobyte EXP
            </div>
          </div>
        </Card>
      </div>

      <div style={{ gridColumn: 'span 3' }}>
        <Card>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <MaterialIcon icon="percent" size={48} style={{ color: '#22c55e', marginBottom: '12px' }} />
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#22c55e', marginBottom: '4px' }}>
              {stats.total > 0 ? Math.round((stats.unlocked / stats.total) * 100) : 0}%
            </div>
            <div style={{ color: '#B0B0B0', fontSize: '14px' }}>
              Ukończone
            </div>
          </div>
        </Card>
      </div>

      {/* Category Filter */}
      <div style={{ gridColumn: 'span 12' }}>
        <Card>
          <div style={{ padding: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedCategory('all')}
              style={{
                padding: '10px 20px',
                background: selectedCategory === 'all' ? 'linear-gradient(135deg, #00E5FF 0%, #00B8D4 100%)' : 'rgba(255,255,255,0.05)',
                border: selectedCategory === 'all' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: selectedCategory === 'all' ? '#0A0A1A' : '#B0B0B0',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Wszystkie ({achievements.length})
            </button>
            {Object.entries(ACHIEVEMENT_CATEGORIES).map(([key, label]) => {
              const count = achievements.filter(a => a.category === key).length
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  style={{
                    padding: '10px 20px',
                    background: selectedCategory === key ? 'linear-gradient(135deg, #00E5FF 0%, #00B8D4 100())' : 'rgba(255,255,255,0.05)',
                    border: selectedCategory === key ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: selectedCategory === key ? '#0A0A1A' : '#B0B0B0',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {label} ({count})
                </button>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Achievements Grid */}
      <div style={{ gridColumn: 'span 12' }}>
        {loading ? (
          <Card>
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                margin: '0 auto 20px',
                border: '4px solid rgba(0,229,255,0.3)',
                borderTop: '4px solid #00E5FF',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <p style={{ color: '#B0B0B0' }}>Ładowanie osiągnięć...</p>
            </div>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {filteredAchievements.map(achievement => (
              <Card key={achievement.id}>
                <div style={{
                  padding: '24px',
                  opacity: achievement.is_unlocked ? 1 : 0.6,
                  position: 'relative'
                }}>
                  {/* Badge for unlocked */}
                  {achievement.is_unlocked && (
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      background: '#22c55e',
                      color: '#fff',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      ✓ Odblokowane
                    </div>
                  )}

                  {/* Icon */}
                  <div style={{
                    fontSize: '64px',
                    textAlign: 'center',
                    marginBottom: '16px',
                    filter: achievement.is_unlocked ? 'none' : 'grayscale(100%)'
                  }}>
                    {achievement.icon}
                  </div>

                  {/* Name */}
                  <h3 style={{
                    color: achievement.is_unlocked ? '#FFD700' : '#B0B0B0',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    textAlign: 'center'
                  }}>
                    {achievement.name}
                  </h3>

                  {/* Description */}
                  <p style={{
                    color: '#888',
                    fontSize: '14px',
                    textAlign: 'center',
                    marginBottom: '16px',
                    minHeight: '40px'
                  }}>
                    {achievement.description}
                  </p>

                  {/* Progress bar */}
                  {!achievement.is_unlocked && achievement.progress !== undefined && achievement.progress > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        height: '8px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          background: 'linear-gradient(90deg, #00E5FF 0%, #00B8D4 100%)',
                          height: '100%',
                          width: `${achievement.progress}%`,
                          transition: 'width 0.3s'
                        }} />
                      </div>
                      <div style={{
                        color: '#888',
                        fontSize: '12px',
                        textAlign: 'center',
                        marginTop: '4px'
                      }}>
                        {Math.round(achievement.progress)}% ukończone
                      </div>
                    </div>
                  )}

                  {/* Rewards */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '16px',
                    padding: '12px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MaterialIcon icon="paid" size={20} style={{ color: '#00E5FF' }} />
                      <span style={{ color: '#00E5FF', fontWeight: 600 }}>
                        +{achievement.reward_coins}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MaterialIcon icon="stars" size={20} style={{ color: '#9333ea' }} />
                      <span style={{ color: '#9333ea', fontWeight: 600 }}>
                        +{achievement.reward_exp} XP
                      </span>
                    </div>
                  </div>

                  {/* Unlocked date */}
                  {achievement.unlocked_at && (
                    <div style={{
                      marginTop: '12px',
                      textAlign: 'center',
                      color: '#666',
                      fontSize: '12px'
                    }}>
                      Odblokowane {new Date(achievement.unlocked_at).toLocaleDateString('pl-PL')}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredAchievements.length === 0 && (
          <Card>
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <MaterialIcon icon="search_off" size={64} style={{ opacity: 0.3 }} />
              <p style={{ color: '#B0B0B0', marginTop: '16px' }}>
                Brak osiągnięć w tej kategorii
              </p>
            </div>
          </Card>
        )}
      </div>
    </main>
  )
}
