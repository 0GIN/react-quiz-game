import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@features/auth/hooks/useAuth'
import { getProfile, updateBio, type FullUserProfile } from '@/services/profileService'
import { createDuelChallenge } from '@/services/duelService'
import { getGameHistory } from '@/services/gameService'
import { supabase } from '@/lib/supabase'
import { Layout, Card, MaterialIcon, Spinner } from '@shared/ui'
import BannerSelector from './BannerSelector'
import '@/styles/ui.css'

const AVATAR_OPTIONS = [
  { emoji: '😀', name: 'Uśmiech' },
  { emoji: '😎', name: 'Cool' },
  { emoji: '🤔', name: 'Myślący' },
  { emoji: '😊', name: 'Szczęśliwy' },
  { emoji: '🚀', name: 'Rakieta' },
  { emoji: '⚡', name: 'Błyskawica' },
  { emoji: '🎮', name: 'Gracz' },
  { emoji: '🏆', name: 'Trofeum' },
  { emoji: '🔥', name: 'Ogień' },
  { emoji: '💪', name: 'Siła' },
  { emoji: '🎯', name: 'Cel' },
  { emoji: '⭐', name: 'Gwiazda' },
]

export default function Profile() {
  const { userId } = useParams<{ userId?: string }>()
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState<FullUserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editedBio, setEditedBio] = useState('')
  const [editedUsername, setEditedUsername] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [guestPreview, setGuestPreview] = useState(false)
  const [isFriend, setIsFriend] = useState(false)
  const [gameHistory, setGameHistory] = useState<any[]>([])
  const [rankByFP, setRankByFP] = useState<number | null>(null)
  const [rankByLevel, setRankByLevel] = useState<number | null>(null)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [selectedBanner, setSelectedBanner] = useState('')
  const [showBannerSelector, setShowBannerSelector] = useState(false)

  const profileUserId = userId || user?.id
  const isOwnProfile = user?.id === profileUserId

  useEffect(() => {
    if (!profileUserId) {
      setError('User not found')
      setLoading(false)
      return
    }
    fetchProfile()
    checkFriendship()
    fetchGameHistory()
    fetchUserRanking()
  }, [profileUserId])

  useEffect(() => {
    if (profile) {
      setEditedBio(profile.bio || '')
      setEditedUsername(profile.user.username)
      setSelectedAvatar(profile.user.avatar_url || '😀')
      setSelectedBanner(profile.user.banner_url || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)')
    }
  }, [profile])

  const fetchProfile = async () => {
    if (!profileUserId) return
    setLoading(true)
    setError(null)
    const result = await getProfile(profileUserId, user?.id)
    if (result.success && result.data) {
      setProfile(result.data)
    } else {
      setError(result.error || 'Failed to load profile')
    }
    setLoading(false)
  }

  const checkFriendship = async () => {
    if (!user?.id || !profileUserId || isOwnProfile) {
      setIsFriend(false)
      return
    }
    try {
      const { data } = await supabase
        .from('friendships')
        .select('id')
        .eq('status', 'accepted')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${profileUserId}),and(user_id.eq.${profileUserId},friend_id.eq.${user.id})`)
        .single()
      setIsFriend(!!data)
    } catch (err) {
      console.error('Error checking friendship:', err)
      setIsFriend(false)
    }
  }

  const fetchGameHistory = async () => {
    if (!profileUserId) return
    try {
      // Pobierz gry Blitz
      const blitzResult = await getGameHistory(profileUserId, 10)
      
      // Pobierz duele (zwykłe i Master)
      const { data: duelMatches, error: duelError } = await supabase
        .from('duel_matches')
        .select(`
          *,
          player1:users!duel_matches_player1_id_fkey(id, username, avatar_url),
          player2:users!duel_matches_player2_id_fkey(id, username, avatar_url),
          master_category:categories!duel_matches_master_category_id_fkey(id, name, icon_emoji)
        `)
        .eq('status', 'completed')
        .or(`player1_id.eq.${profileUserId},player2_id.eq.${profileUserId}`)
        .order('completed_at', { ascending: false })
        .limit(10)

      if (duelError) {
        console.error('Error fetching duel history:', duelError)
      }

      const unified: any[] = []
      
      // Dodaj gry Blitz
      if (blitzResult.success) {
        const blitzGames = (blitzResult.data || []).map((game: any) => ({
          id: game.id,
          type: 'blitz',
          timestamp: game.games.ended_at || game.games.started_at,
          mode: game.games.game_modes.name,
          score: game.correct_answers,
          totalQuestions: game.games.total_questions,
          accuracy: game.games.total_questions > 0
            ? Math.round((game.correct_answers / game.games.total_questions) * 100)
            : 0,
          category: game.games.categories,
        }))
        unified.push(...blitzGames)
      }
      
      // Dodaj duele (zwykłe i Master)
      if (duelMatches) {
        duelMatches.forEach((duel: any) => {
          const isPlayer1 = profileUserId === duel.player1_id
          const myScore = isPlayer1 ? duel.player1_score : duel.player2_score
          const opponentScore = isPlayer1 ? duel.player2_score : duel.player1_score
          const opponent = isPlayer1 ? duel.player2 : duel.player1
          let result: 'win' | 'loss' | 'draw'
          if (myScore > opponentScore) result = 'win'
          else if (myScore < opponentScore) result = 'loss'
          else result = 'draw'
          
          unified.push({
            id: duel.id,
            type: duel.master_category_id ? 'master' : 'duel',
            timestamp: duel.completed_at || duel.created_at,
            mode: duel.master_category_id ? 'Master' : 'Duel',
            score: myScore,
            opponentScore,
            opponent,
            result,
            category: duel.master_category, // Kategoria dla Master Mode
          })
        })
      }
      
      unified.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setGameHistory(unified.slice(0, 7))
    } catch (err) {
      console.error('Error fetching game history:', err)
      setGameHistory([])
    }
  }

  const fetchUserRanking = async () => {
    if (!profileUserId) return
    try {
      // Pobierz ranking według FlashPoints (tak samo jak na stronie Ranking)
      const { data: fpData, error: fpError } = await supabase
        .from('users')
        .select('id, flash_points')
        .order('flash_points', { ascending: false })

      if (fpError) {
        console.error('Error fetching FP ranking:', fpError)
        setRankByFP(null)
      } else if (fpData) {
        const fpRank = fpData.findIndex(p => p.id === profileUserId) + 1
        setRankByFP(fpRank > 0 ? fpRank : null)
      }

      // Pobierz ranking według poziomu (z experience jako tiebreaker)
      const { data: levelData, error: levelError } = await supabase
        .from('users')
        .select('id, level, experience')
        .order('level', { ascending: false })
        .order('experience', { ascending: false })

      if (levelError) {
        console.error('Error fetching level ranking:', levelError)
        setRankByLevel(null)
      } else if (levelData) {
        const levelRank = levelData.findIndex(p => p.id === profileUserId) + 1
        setRankByLevel(levelRank > 0 ? levelRank : null)
      }
    } catch (err) {
      console.error('Error fetching user ranking:', err)
      setRankByFP(null)
      setRankByLevel(null)
    }
  }

  const handleSaveProfile = async () => {
    if (!user?.id) return
    setSaving(true)
    setSaveError(null)
    try {
      if (editedUsername !== profile?.user.username) {
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('id')
          .eq('username', editedUsername)
          .neq('id', user.id)
          .single()
        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError
        }
        if (existingUser) {
          setSaveError('Ta nazwa użytkownika jest już zajęta')
          setSaving(false)
          return
        }
        const { error: updateError } = await supabase
          .from('users')
          .update({ username: editedUsername })
          .eq('id', user.id)
        if (updateError) throw updateError
      }
      if (selectedAvatar !== profile?.user.avatar_url) {
        const { error: avatarError } = await supabase
          .from('users')
          .update({ avatar_url: selectedAvatar })
          .eq('id', user.id)
        if (avatarError) throw avatarError
      }
      if (selectedBanner !== profile?.user.banner_url) {
        const { error: bannerError } = await supabase
          .from('users')
          .update({ banner_url: selectedBanner })
          .eq('id', user.id)
        if (bannerError) throw bannerError
      }
      if (editedBio !== profile?.bio) {
        const bioResult = await updateBio(user.id, editedBio)
        if (!bioResult.success) {
          throw new Error(bioResult.error || 'Failed to update bio')
        }
      }
      await fetchProfile()
      if (refreshUser) await refreshUser()
      setIsEditMode(false)
      alert('Profil zapisany!')
    } catch (err: any) {
      console.error('Error saving profile:', err)
      setSaveError(err.message || 'Nie udało się zapisać profilu')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    if (profile) {
      setEditedBio(profile.bio || '')
      setEditedUsername(profile.user.username)
      setSelectedAvatar(profile.user.avatar_url || '😀')
      setSelectedBanner(profile.user.banner_url || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)')
    }
    setIsEditMode(false)
    setSaveError(null)
    setGuestPreview(false)
  }
  const handleChallengeUser = async () => {
    if (!user || !userId) return
    const message = prompt(`Wyślij wyzwanie do ${profile?.user.username}:\n(Opcjonalna wiadomość)`) 
    if (message === null) return
    try {
      const result = await createDuelChallenge(
        user.id,
        userId,
        message || undefined
      )
      if (result.success) {
        alert(`✅ Wyzwanie wysłane do ${profile?.user.username}!`)
        navigate('/duel')
      } else {
        alert(result.error || 'Nie udało się wysłać wyzwania')
      }
    } catch (error) {
      console.error('Error sending challenge:', error)
      alert('Wystąpił błąd podczas wysyłania wyzwania')
    }
  }

  const toggleGuestPreview = () => {
    if (!guestPreview) {
      setIsEditMode(false)
    }
    setGuestPreview(prev => !prev)
  }

  const showGuestView = guestPreview || !isOwnProfile
  const canShowStats = showGuestView ? !!profile?.show_stats : true
  const canShowAchievements = showGuestView ? !!profile?.show_achievements : true
  const canShowHistory = showGuestView ? !!profile?.show_game_history : true

  if (loading) {
    return (
      <Layout>
        <main className="main" role="main">
          <div className="flex flex-col justify-center items-center min-h-[60vh] gap-5">
            <Spinner />
            <p className="text-primary text-lg">Ładowanie profilu...</p>
          </div>
        </main>
      </Layout>
    )
  }

  if (error || !profile) {
    return (
      <Layout>
        <main className="main" role="main">
          <Card>
            <div className="text-center py-10 px-5">
              <MaterialIcon icon="error" size={64} className="text-red-500 mb-5" />
              <h2 className="text-red-500 mb-2.5 text-2xl font-bold">Błąd</h2>
              <p className="text-gray-300">
                {error || 'Nie można załadować profilu'}
              </p>
              <button onClick={() => navigate('/')} className="btn primary mt-5">
                <MaterialIcon icon="home" size={20} />
                Wróć do strony głównej
              </button>
            </div>
          </Card>
        </main>
      </Layout>
    )
  }

  const { user: userData } = profile
  const totalGames = userData.total_games_played || 0
  const totalQuestions = userData.total_questions_answered || 0
  const accuracy = totalQuestions > 0 ? Math.round((userData.total_correct_answers / totalQuestions) * 100) : 0

  return (
    <Layout>
      <main className="main" role="main">
        <div className="space-y-3">
          {guestPreview && (
            <div className="px-4 py-2 text-white text-center rounded-lg font-semibold shadow-lg flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <MaterialIcon icon="visibility" size={16} />
              <span className="text-sm">Podgląd jako gość</span>
            </div>
          )}

          {/* Profile Header */}
          <section className="hero relative overflow-hidden" style={{
            background: isEditMode ? selectedBanner : (userData.banner_url || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'),
            position: 'relative'
          }}>
            {/* Edit banner button */}
            {isEditMode && (
              <button
                onClick={() => setShowBannerSelector(true)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  padding: '8px 16px',
                  background: 'rgba(0, 0, 0, 0.6)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  zIndex: 10
                }}
                title="Zmień tło baneru"
              >
                <MaterialIcon icon="palette" size={18} />
                Zmień tło
              </button>
            )}
            <div className="hero-inner py-6">
            <div className="flex items-center justify-between">
              {/* Left side: Avatar + Info */}
              <div className="flex items-center gap-6">
                {/* Avatar - BIG */}
                <div className="shrink-0">
                  <div 
                    style={{
                      height: '96px',
                      width: '96px',
                      borderRadius: '50%',
                      placeItems: 'center',
                      fontSize: '3.5rem',
                      lineHeight: '0',
                      background: 'linear-gradient(to bottom right, rgba(0, 229, 255, 0.3), rgba(240, 43, 234, 0.3))',
                      border: '2px solid #00E5FF',
                      boxShadow: '0 0 30px rgba(0, 229, 255, 0.4)',
                      overflow: 'hidden',
                      position: 'relative',
                      cursor: isEditMode ? 'pointer' : 'default'
                    }}
                    onClick={() => isEditMode && setShowAvatarModal(true)}
                    title={isEditMode ? 'Kliknij aby zmienić avatar' : ''}
                  >
                    <span className="avatar-emoji" style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '3.5rem'
                    }}>
                      {isEditMode ? selectedAvatar : (userData.avatar_url || '😀')}
                    </span>
                    {isEditMode && (
                      <div style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '8px',
                        background: '#00E5FF',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid rgba(18, 18, 30, 1)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                      }}>
                        <MaterialIcon icon="edit" size={18} style={{color: '#000'}} />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* User info - inline with avatar */}
                <div>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={editedUsername}
                      onChange={(e) => setEditedUsername(e.target.value)}
                      placeholder="Nazwa użytkownika"
                      style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        background: 'rgba(18, 18, 30, 0.5)',
                        border: '1px solid rgba(0, 229, 255, 0.3)',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        color: '#E0E0E0',
                        outline: 'none',
                        marginBottom: '0.5rem'
                      }}
                    />
                  ) : (
                    <h1 style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: '#00E5FF',
                      marginBottom: '0.25rem',
                      textShadow: '0 0 20px rgba(0, 229, 255, 0.5)'
                    }}>{userData.username}</h1>
                  )}
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#E0E0E0',
                    marginBottom: '0.75rem',
                    opacity: 0.9
                  }}>Level {userData.level} | {userData.flash_points.toLocaleString()} FP</p>
                  
                  {/* Badges with inline styles */}
                  <div className="flex gap-2 flex-wrap">
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.375rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      borderRadius: '9999px',
                      border: '2px solid rgba(234, 179, 8, 0.5)',
                      background: 'rgba(234, 179, 8, 0.2)',
                      color: '#FACC15'
                    }}>
                      <MaterialIcon icon="emoji_events" size={14} />
                      Pro
                    </span>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.375rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      borderRadius: '9999px',
                      border: '2px solid rgba(34, 197, 94, 0.5)',
                      background: 'rgba(34, 197, 94, 0.2)',
                      color: '#4ADE80'
                    }}>
                      <MaterialIcon icon="check_circle" size={14} />
                      Verified
                    </span>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.375rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      borderRadius: '9999px',
                      border: '2px solid rgba(249, 115, 22, 0.5)',
                      background: 'rgba(249, 115, 22, 0.2)',
                      color: '#FB923C'
                    }}>
                      <MaterialIcon icon="local_fire_department" size={14} />
                      Hot
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Right side: Actions + Views */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="flex gap-2">
                  {isOwnProfile ? (
                    isEditMode ? (
                      <>
                        <button onClick={handleSaveProfile} className="btn primary" disabled={saving}>
                          <MaterialIcon icon="save" size={16} />
                          {saving ? 'Zapisywanie...' : 'Zapisz'}
                        </button>
                        <button onClick={handleCancelEdit} className="btn secondary" disabled={saving}>
                          <MaterialIcon icon="close" size={16} />
                          Anuluj
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setIsEditMode(true)} className="btn primary" disabled={guestPreview}>
                          <MaterialIcon icon="edit" size={16} />
                          Edytuj profil
                        </button>
                        <button onClick={toggleGuestPreview} className="btn accent">
                          <MaterialIcon icon={guestPreview ? 'close' : 'visibility'} size={16} />
                          Podgląd jako gość
                        </button>
                      </>
                    )
                  ) : (
                    <>
                      {!isFriend && (
                        <button className="btn primary" onClick={() => {/* TODO */}}>
                          <MaterialIcon icon="person_add" size={16} />
                          Dodaj znajomego
                        </button>
                      )}
                      <button className="btn accent" onClick={handleChallengeUser}>
                        <MaterialIcon icon="swords" size={16} />
                        Wyzwij na Duel
                      </button>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MaterialIcon icon="visibility" size={14} />
                  {profile.profile_views} odwiedzin
                </p>
              </div>
            </div>
            
            {/* Bio section */}
            {isEditMode && (
              <div style={{
                marginTop: '1.5rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid rgba(0, 229, 255, 0.3)'
              }}>
                <textarea
                  value={editedBio}
                  onChange={(e) => setEditedBio(e.target.value)}
                  rows={2}
                  maxLength={500}
                  placeholder="Napisz coś o sobie..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    background: 'rgba(18, 18, 30, 0.5)',
                    color: '#E0E0E0',
                    border: '2px solid rgba(0, 229, 255, 0.3)',
                    outline: 'none',
                    resize: 'none'
                  }}
                  onFocus={(e) => e.target.style.border = '2px solid rgba(0, 229, 255, 0.6)'}
                  onBlur={(e) => e.target.style.border = '2px solid rgba(0, 229, 255, 0.3)'}
                />
              </div>
            )}
            {!isEditMode && (
              <div style={{
                marginTop: '1.5rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid rgba(0, 229, 255, 0.3)'
              }}>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'rgba(224, 224, 224, 0.8)',
                  lineHeight: '1.6'
                }}>{profile.bio || 'Użytkownik nie dodał jeszcze opisu profilu.'}</p>
              </div>
            )}
            </div>
          </section>

          {/* Avatar Selection Modal */}
          {showAvatarModal && isEditMode && isOwnProfile && !guestPreview && (
            <div 
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '1rem'
              }}
              onClick={() => setShowAvatarModal(false)}
            >
              <div 
                style={{
                  background: 'rgba(18, 18, 30, 0.95)',
                  border: '2px solid rgba(0, 229, 255, 0.3)',
                  borderRadius: '1rem',
                  padding: '2rem',
                  maxWidth: '600px',
                  width: '100%',
                  maxHeight: '80vh',
                  overflowY: 'auto'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#00E5FF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <MaterialIcon icon="face" size={24} />
                    Wybierz avatar
                  </h3>
                  <button
                    onClick={() => setShowAvatarModal(false)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#E0E0E0',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '0.5rem',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <MaterialIcon icon="close" size={24} />
                  </button>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  gap: '1rem'
                }}>
                  {AVATAR_OPTIONS.map((avatar) => (
                    <div
                      key={avatar.emoji}
                      onClick={() => {
                        setSelectedAvatar(avatar.emoji);
                        setShowAvatarModal(false);
                      }}
                      style={{
                        aspectRatio: '1',
                        borderRadius: '0.75rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem',
                        background: selectedAvatar === avatar.emoji 
                          ? 'rgba(0, 229, 255, 0.2)' 
                          : 'rgba(255, 255, 255, 0.05)',
                        border: selectedAvatar === avatar.emoji 
                          ? '2px solid #00E5FF' 
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        transform: selectedAvatar === avatar.emoji ? 'scale(1.1)' : 'scale(1)'
                      }}
                      title={avatar.name}
                      onMouseEnter={(e) => {
                        if (selectedAvatar !== avatar.emoji) {
                          e.currentTarget.style.background = 'rgba(0, 229, 255, 0.1)';
                          e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.5)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedAvatar !== avatar.emoji) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        }
                      }}
                    >
                      <span className="avatar-emoji">{avatar.emoji}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {saveError && (
            <div className="card bg-red-500/10 border-red-500/30">
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <MaterialIcon icon="error" size={18} />
                {saveError}
              </div>
            </div>
          )}

          {/* Stats moved below About/Achievements */}

          {/* Achievements and Ranking */}
          <div style={{display: 'grid', gridTemplateColumns: canShowAchievements ? '1fr auto' : 'auto', gap: '1rem', alignItems: 'start', marginTop: '1.5rem', justifyContent: canShowAchievements ? 'normal' : 'flex-end'}}>
            {/* Achievements */}
            {canShowAchievements && (
              <div className="card" style={{background: 'rgba(18, 18, 30, 0.8)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '1.5rem'}}>
                <h2 style={{
                  marginBottom: '1.25rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#E0E0E0'
                }}>OSIĄGNIĘCIA</h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  gap: '1rem'
                }}>
                  {[
                    { icon: 'emoji_events', label: '1st Win', color: '#FACC15', description: 'Pierwsza wygrana', requirement: 'Wygraj swoją pierwszą grę' },
                    { icon: 'local_fire_department', label: 'Streak 5', color: '#F97316', description: 'Passa 5', requirement: 'Wygraj 5 gier z rzędu' },
                    { icon: 'check_circle', label: '100 Correct', color: '#22C55E', description: '100 poprawnych odpowiedzi', requirement: 'Odpowiedz poprawnie na 100 pytań' },
                    { icon: 'military_tech', label: 'Master', color: '#EC4899', description: 'Mistrz kategorii', requirement: 'Wygraj 10 gier Master Mode' },
                    { icon: 'bolt', label: 'Ranked', color: '#3B82F6', description: 'Gracz rankingowy', requirement: 'Zagraj 50 gier rankingowych' },
                    { icon: 'workspace_premium', label: 'Pro', color: '#A855F7', description: 'Profesjonalista', requirement: 'Osiągnij poziom 20' }
                  ].map((achievement, idx) => (
                    <div 
                      key={idx}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        background: 'rgba(18, 18, 30, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.3)';
                        const tooltip = e.currentTarget.querySelector('.achievement-tooltip') as HTMLElement;
                        if (tooltip) {
                          tooltip.style.display = 'block';
                          tooltip.style.visibility = 'visible';
                          setTimeout(() => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const tooltipWidth = tooltip.offsetWidth;
                            // Position tooltip well below the card (accounting for transform)
                            tooltip.style.top = `${rect.bottom + 16}px`;
                            tooltip.style.left = `${rect.left + rect.width / 2 - tooltipWidth / 2}px`;
                          }, 10);
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                        const tooltip = e.currentTarget.querySelector('.achievement-tooltip') as HTMLElement;
                        if (tooltip) {
                          tooltip.style.display = 'none';
                          tooltip.style.visibility = 'hidden';
                        }
                      }}
                    >
                      <MaterialIcon icon={achievement.icon} size={32} style={{color: achievement.color}} />
                      <span style={{
                        textAlign: 'center',
                        fontSize: '0.6875rem',
                        color: 'rgba(184, 184, 208, 0.8)',
                        fontWeight: '500'
                      }}>{achievement.label}</span>
                      
                      {/* Tooltip */}
                      <div 
                        className="achievement-tooltip"
                        style={{
                          display: 'none',
                          visibility: 'hidden',
                          position: 'fixed',
                          padding: '0.875rem',
                          background: 'rgba(12, 12, 20, 0.98)',
                          border: '2px solid rgba(0, 229, 255, 0.5)',
                          borderRadius: '0.625rem',
                          width: '220px',
                          zIndex: 99999,
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)',
                          pointerEvents: 'none',
                          whiteSpace: 'normal'
                        }}
                      >
                        <div style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: achievement.color,
                          marginBottom: '0.5rem',
                          textAlign: 'center',
                          whiteSpace: 'normal'
                        }}>
                          {achievement.description}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: 'rgba(184, 184, 208, 0.9)',
                          textAlign: 'center',
                          lineHeight: '1.4',
                          whiteSpace: 'normal'
                        }}>
                          {achievement.requirement}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {isEditMode && isOwnProfile && !guestPreview && (
                  <button className="btn text-sm mt-3" onClick={() => { /* TODO: Modal wyboru osiągnięć */ }}>
                    <MaterialIcon icon="star" size={14} />
                    Wybierz osiągnięcia
                  </button>
                )}
              </div>
            )}

            {/* Ranking Box */}
            <div className="card" style={{
              background: 'linear-gradient(135deg, rgba(0,229,255,0.1) 0%, rgba(138,43,226,0.1) 100%)',
              border: '2px solid rgba(0,229,255,0.3)',
              borderRadius: '0.75rem',
              padding: '1rem',
              textAlign: 'center',
              minWidth: '200px'
            }}>
              <h3 style={{
                fontSize: '0.7rem',
                color: '#B8B8D0',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: '600'
              }}>Ranking gracza</h3>
              
              {/* Ranking według FlashPoints */}
              <div style={{marginBottom: '0.75rem'}}>
                <div style={{
                  fontSize: '0.6rem',
                  color: 'rgba(184, 184, 208, 0.7)',
                  marginBottom: '0.2rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>FlashPoints</div>
                <div style={{
                  fontSize: '1.75rem',
                  fontWeight: '800',
                  color: '#00E5FF',
                  lineHeight: '1'
                }}>
                  #{rankByFP || '—'}
                </div>
                <div style={{
                  fontSize: '0.6rem',
                  color: 'rgba(184, 184, 208, 0.6)',
                  marginTop: '0.2rem'
                }}>
                </div>
              </div>

              {/* Ranking według poziomu */}
              <div>
                <div style={{
                  fontSize: '0.6rem',
                  color: 'rgba(184, 184, 208, 0.7)',
                  marginBottom: '0.2rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>Poziom</div>
                <div style={{
                  fontSize: '1.75rem',
                  fontWeight: '800',
                  color: '#8A2BE2',
                  lineHeight: '1'
                }}>
                  #{rankByLevel || '—'}
                </div>
                <div style={{
                  fontSize: '0.6rem',
                  color: 'rgba(184, 184, 208, 0.6)',
                  marginTop: '0.2rem'
                }}>
                </div>
              </div>
            </div>
          </div>

          {/* Stats and Game History Grid (moved below) */}
          <div className="grid grid-cols-3" style={{marginTop: '1.5rem', gap: '1.5rem'}}>
            {/* Game History Section */}
            {canShowHistory && (
              <div className="col-span-1">
                <div className="card" style={{background: 'rgba(18, 18, 30, 0.8)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '1rem'}}>
                  <h2 style={{
                    marginBottom: '0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#E0E0E0'
                  }}>HISTORIA GIER</h2>
                  <div style={{
                    display: 'flex',
                    gap: '0.75rem',
                    overflowX: 'auto',
                    paddingBottom: '0.5rem',
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(0, 229, 255, 0.3) rgba(18, 18, 30, 0.5)'
                  }}>
                    {gameHistory.length > 0 ? (
                      gameHistory.slice(0, 7).map((game) => {
                        const isDuelType = game.type === 'duel' || game.type === 'master';
                        const isWin = isDuelType ? game.result === 'win' : game.accuracy >= 70;
                        const isDraw = isDuelType && game.result === 'draw';
                        return (
                          <div
                            key={game.id}
                            style={{
                              minWidth: '110px',
                              padding: '0.75rem',
                              borderRadius: '0.625rem',
                              background: 'rgba(18, 18, 30, 0.8)',
                              border: '1px solid rgba(255, 255, 255, 0.05)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '0.5rem',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                            }}
                          >
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.25rem',
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '2px solid rgba(0, 229, 255, 0.2)'
                            }}>
                              <span className="avatar-emoji">
                                {game.type === 'master' 
                                  ? (game.category?.icon_emoji || '🏆')
                                  : game.type === 'duel' 
                                    ? (game.opponent?.avatar_url || '😀') 
                                    : (game.category?.icon_emoji || '🎮')}
                              </span>
                            </div>
                            <p style={{
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              color: '#E0E0E0',
                              textAlign: 'center',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              width: '100%'
                            }}>
                              {game.type === 'duel' || game.type === 'master' 
                                ? `@${game.opponent?.username || 'Nieznany'}` 
                                : 'BLITZ'}
                            </p>
                            <p style={{
                              fontSize: '0.5625rem',
                              color: 'rgba(184, 184, 208, 0.7)',
                              textTransform: 'uppercase'
                            }}>{game.type === 'master' ? 'MASTER' : game.type === 'duel' ? 'DUEL' : game.mode}</p>
                            <div style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.375rem',
                              fontSize: '0.6875rem',
                              fontWeight: '700',
                              background: isWin ? 'rgba(34, 197, 94, 0.2)' : isDraw ? 'rgba(156, 163, 175, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                              color: isWin ? '#4ADE80' : isDraw ? '#9CA3AF' : '#EF4444',
                              border: `1px solid ${isWin ? 'rgba(34, 197, 94, 0.3)' : isDraw ? 'rgba(156, 163, 175, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                            }}>
                              {game.type === 'duel' || game.type === 'master'
                                ? (game.result === 'win' ? 'WIN' : game.result === 'loss' ? 'LOSS' : 'DRAW')
                                : `${game.accuracy}%`}
                            </div>
                            <p style={{
                              fontSize: '0.625rem',
                              color: 'rgba(160, 160, 184, 0.6)'
                            }}>
                              {game.type === 'duel' || game.type === 'master' ? `${game.score}-${game.opponentScore}` : `${game.score}/${game.totalQuestions}`}
                            </p>
                          </div>
                        )
                      })
                    ) : (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem',
                        width: '100%',
                        color: 'rgba(184, 184, 208, 0.5)'
                      }}>
                        <MaterialIcon icon="sports_esports" size={48} style={{opacity: 0.3, marginBottom: '0.5rem'}} />
                        <p style={{fontSize: '0.875rem'}}>Brak historii gier</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Stats Section */}
            {canShowStats && (
              <div className="col-span-2">
                <div className="card" style={{background: 'rgba(18, 18, 30, 0.8)', border: '1px solid rgba(255, 255, 255, 0.05)'}}>
                  <h2 style={{
                    marginBottom: '1rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#E0E0E0'
                  }}>STATYSTYKI</h2>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '1rem'
                  }}>
                    {[
                      { icon: 'sports_esports', label: 'ROZEGRANE', value: totalGames, iconColor: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.1)' },
                      { icon: 'gps_fixed', label: 'CELNOŚĆ', value: `${accuracy}%`, iconColor: '#EC4899', bgColor: 'rgba(236, 72, 153, 0.1)' },
                      { icon: 'local_fire_department', label: 'PASSA', value: userData.current_streak, iconColor: '#F97316', bgColor: 'rgba(249, 115, 22, 0.1)' },
                      { icon: 'emoji_events', label: 'WYGRANE', value: userData.total_wins, iconColor: '#FACC15', bgColor: 'rgba(250, 204, 21, 0.1)' }
                    ].map((stat, idx) => (
                      <div
                        key={idx}
                        style={{
                          textAlign: 'center',
                          padding: '1.5rem 1rem',
                          background: stat.bgColor,
                          borderRadius: '0.75rem',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <MaterialIcon icon={stat.icon} size={32} style={{color: stat.iconColor, marginBottom: '0.5rem'}} />
                        <div style={{
                          fontSize: '1.75rem',
                          fontWeight: '700',
                          color: stat.iconColor,
                          marginBottom: '0.25rem'
                        }}>{stat.value}</div>
                        <div style={{
                          fontSize: '0.6875rem',
                          color: 'rgba(160, 160, 184, 0.8)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Banner Selector Modal */}
      {showBannerSelector && (
        <BannerSelector
          currentBanner={selectedBanner}
          onSelect={(banner) => setSelectedBanner(banner)}
          onClose={() => setShowBannerSelector(false)}
        />
      )}
    </Layout>
  )
}
