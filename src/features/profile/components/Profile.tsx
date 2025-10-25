/**
 * @fileoverview Strona profilu użytkownika
 * 
 * Wizytówka użytkownika z możliwością customizacji.
 * 
 * Funkcjonalność:
 * - Widok własnego profilu (/profile) - edytowalne
 * - Widok profilu innego gracza (/profile/:userId) - readonly
 * - Banner + Avatar + Tytuł + Poziom
 * - Statystyki (gry, wygra              <div
                className="profile-avatar"
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '60px',
                  border: profile.avatar_frame ? `4px solid ${profile.avatar_frame.icon_url}` : '4px solid #00E5FF',
                  background: '#0f0f23'
                }}
              >
                {isEditMode ? selectedAvatar : (userData.avatar_url || '😀')}
              </div>
            </div> streak)
 * - Showcase osiągnięć (wybrane 5)
 * - Bio/opis
 * - Historia ostatnich gier
 * - Edycja profilu (username, bio, avatar)
 * 
 * @page
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@features/auth/hooks/useAuth';
import { getProfile, updateBio, type FullUserProfile } from '@/services/profileService';
import { supabase } from '@/lib/supabase';
import { Layout, Card, MaterialIcon, Spinner } from '@shared/ui';
import '@/styles/ui.css';
import '@/styles/Profile.css';

// Pula avatarów do wyboru (emoji)
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
];

export default function Profile() {
  const { userId } = useParams<{ userId?: string }>();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<FullUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Tryb edycji
  const [isEditMode, setIsEditMode] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editedBio, setEditedBio] = useState('');
  const [editedUsername, setEditedUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Status znajomości
  const [isFriend, setIsFriend] = useState(false);

  // Określ czyj profil oglądamy
  const profileUserId = userId || user?.id;
  const isOwnProfile = user?.id === profileUserId;

  // Pobierz profil
  useEffect(() => {
    if (!profileUserId) {
      setError('User not found');
      setLoading(false);
      return;
    }

    fetchProfile();
    checkFriendship();
  }, [profileUserId]);

  // Zaktualizuj edited fields gdy profil się załaduje
  useEffect(() => {
    if (profile) {
      setEditedBio(profile.bio || '');
      setEditedUsername(profile.user.username);
      setSelectedAvatar(profile.user.avatar_url || '😀');
    }
  }, [profile]);

  const fetchProfile = async () => {
    if (!profileUserId) return;

    setLoading(true);
    setError(null);

    const result = await getProfile(profileUserId, user?.id);

    if (result.success && result.data) {
      setProfile(result.data);
    } else {
      setError(result.error || 'Failed to load profile');
    }

    setLoading(false);
  };

  const checkFriendship = async () => {
    if (!user?.id || !profileUserId || isOwnProfile) {
      setIsFriend(false);
      return;
    }

    try {
      const { data } = await supabase
        .from('friendships')
        .select('id')
        .eq('status', 'accepted')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${profileUserId}),and(user_id.eq.${profileUserId},friend_id.eq.${user.id})`)
        .single();

      setIsFriend(!!data);
    } catch (err) {
      console.error('Error checking friendship:', err);
      setIsFriend(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;

    setSaving(true);
    setSaveError(null);

    try {
      // 1. Sprawdź czy username jest unikalny (jeśli został zmieniony)
      if (editedUsername !== profile?.user.username) {
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('id')
          .eq('username', editedUsername)
          .neq('id', user.id)
          .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows
          throw checkError;
        }

        if (existingUser) {
          setSaveError('Ta nazwa użytkownika jest już zajęta');
          setSaving(false);
          return;
        }

        // Aktualizuj username
        const { error: updateError } = await supabase
          .from('users')
          .update({ username: editedUsername })
          .eq('id', user.id);

        if (updateError) throw updateError;
      }

      // 2. Aktualizuj avatar
      if (selectedAvatar !== profile?.user.avatar_url) {
        const { error: avatarError } = await supabase
          .from('users')
          .update({ avatar_url: selectedAvatar })
          .eq('id', user.id);

        if (avatarError) throw avatarError;
      }

      // 3. Aktualizuj bio
      if (editedBio !== profile?.bio) {
        const bioResult = await updateBio(user.id, editedBio);
        if (!bioResult.success) {
          throw new Error(bioResult.error || 'Failed to update bio');
        }
      }

      // Odśwież profil i wyłącz tryb edycji
      await fetchProfile();
      if (refreshUser) await refreshUser();
      setIsEditMode(false);
      alert('Profil zapisany!');

    } catch (err: any) {
      console.error('Error saving profile:', err);
      setSaveError(err.message || 'Nie udało się zapisać profilu');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setEditedBio(profile.bio || '');
      setEditedUsername(profile.user.username);
      setSelectedAvatar(profile.user.avatar_url || '😀');
    }
    setIsEditMode(false);
    setIsEditingBio(false);
    setSaveError(null);
  };

  const handleSaveBio = async () => {
    if (!user?.id) return;

    const result = await updateBio(user.id, editedBio);

    if (result.success) {
      setIsEditingBio(false);
      fetchProfile();
    } else {
      alert(result.error || 'Failed to update bio');
    }
  };

  if (loading) {
    return (
      <Layout>
        <main className="main" role="main">
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '60vh',
            gap: '20px'
          }}>
            <Spinner />
            <p style={{ color: '#00E5FF', fontSize: '18px' }}>Ładowanie profilu...</p>
          </div>
        </main>
      </Layout>
    );
  }

  if (error || !profile) {
    return (
      <Layout>
        <main className="main" role="main">
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <MaterialIcon icon="error" size={64} style={{ color: '#ff4444', marginBottom: '20px' }} />
              <h2 style={{ color: '#ff4444', marginBottom: '10px' }}>Błąd</h2>
              <p style={{ color: '#ccc' }}>
                {error || 'Nie można załadować profilu'}
              </p>
              <button 
                onClick={() => navigate('/')} 
                className="btn primary"
                style={{ marginTop: '20px' }}
              >
                <MaterialIcon icon="home" size={20} />
                Wróć do strony głównej
              </button>
            </div>
          </Card>
        </main>
      </Layout>
    );
  }

  const { user: userData } = profile;

  // Oblicz Win Rate
  const totalGames = userData.total_games_played || 0;
  const winRate = totalGames > 0 
    ? Math.round((userData.total_wins / totalGames) * 100) 
    : 0;

  // Oblicz Accuracy
  const totalQuestions = userData.total_questions_answered || 0;
  const accuracy = totalQuestions > 0
    ? Math.round((userData.total_correct_answers / totalQuestions) * 100)
    : 0;

  return (
    <Layout>
      <main className="main profile-page" role="main">
        {/* Banner / Header */}
        <div 
          className="profile-banner"
          style={{
            background: profile.profile_background?.image_url
              ? `url(${profile.profile_background.image_url}) center/cover`
              : profile.profile_banner_color || '#1a1a2e',
            padding: '40px 20px',
            borderRadius: '12px',
            marginBottom: '20px',
            position: 'relative'
          }}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            {/* Avatar z ramką */}
            <div style={{ position: 'relative' }}>
              <div
                className="profile-avatar"
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '60px',
                  border: profile.avatar_frame ? `4px solid ${profile.avatar_frame.icon_url}` : '4px solid #00E5FF',
                  background: '#0f0f23'
                }}
              >
                {isEditMode ? selectedAvatar : (userData.avatar_url || '😀')}
              </div>
            </div>

            {/* Informacje użytkownika */}
            <div style={{ flex: 1 }}>
              {isEditMode ? (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', color: '#ccc', marginBottom: '8px', fontSize: '14px' }}>
                    Nazwa użytkownika
                  </label>
                  <input
                    type="text"
                    value={editedUsername}
                    onChange={(e) => setEditedUsername(e.target.value)}
                    placeholder="Nazwa użytkownika"
                    className="edit-username-input"
                  />
                </div>
              ) : (
                <h1 style={{ fontSize: '32px', marginBottom: '8px', color: '#fff' }}>
                  {userData.username}
                  {profile.selected_title && (
                    <span style={{
                      fontSize: '16px',
                      color: '#FFD700',
                      marginLeft: '12px',
                      opacity: 0.9
                    }}>
                      "{profile.selected_title.name}"
                    </span>
                  )}
                </h1>
              )}
              
              <p style={{ fontSize: '18px', color: '#00E5FF', marginBottom: '8px' }}>
                Level {userData.level} | {userData.flash_points.toLocaleString()} FP
              </p>
              
              {/* Odznaki */}
              {profile.selected_badges && profile.selected_badges.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  {profile.selected_badges.map((badge) => (
                    <span
                      key={badge.id}
                      title={badge.name}
                      className="profile-badge"
                    >
                      {badge.icon_url || '🏆'}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Przyciski akcji */}
            <div className="profile-actions">
              {isOwnProfile ? (
                isEditMode ? (
                  <>
                    <button
                      onClick={handleSaveProfile}
                      className="btn primary"
                      disabled={saving}
                    >
                      <MaterialIcon icon="save" size={20} />
                      {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="btn secondary"
                      disabled={saving}
                    >
                      <MaterialIcon icon="close" size={20} />
                      Anuluj
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditMode(true)}
                      className="btn primary"
                    >
                      <MaterialIcon icon="edit" size={20} />
                      Edytuj Profil
                    </button>
                    <button
                      onClick={() => navigate(`/profile/${user?.id}`)}
                      className="btn secondary"
                    >
                      <MaterialIcon icon="visibility" size={20} />
                      Podgląd jako gość
                    </button>
                  </>
                )
              ) : (
                <>
                  {!isFriend && (
                    <button 
                      className="btn primary" 
                      style={{ whiteSpace: 'nowrap' }}
                      onClick={() => {/* TODO: Dodaj do znajomych */}}
                    >
                      <MaterialIcon icon="person_add" size={20} />
                      Dodaj znajomego
                    </button>
                  )}
                  {isFriend && (
                    <button 
                      className="btn secondary" 
                      style={{ whiteSpace: 'nowrap' }}
                      onClick={() => navigate('/chat')}
                    >
                      <MaterialIcon icon="chat" size={20} />
                      Wyślij wiadomość
                    </button>
                  )}
                  <button 
                    className="btn" 
                    style={{ whiteSpace: 'nowrap' }}
                    onClick={() => {/* TODO: Wyzwij do gry */}}
                  >
                    <MaterialIcon icon="swords" size={20} />
                    Wyzwij do gry
                  </button>
                </>
              )}
              <p className="profile-views">
                <MaterialIcon icon="visibility" size={16} />
                {profile.profile_views} odwiedzin
              </p>
            </div>
          </div>

          {/* Wybór avatara w trybie edycji */}
          {isEditMode && isOwnProfile && (
            <div className="edit-section">
              <h3>
                <MaterialIcon icon="face" size={20} />
                Wybierz avatar
              </h3>
              <div className="avatar-grid">
                {AVATAR_OPTIONS.map((avatar) => (
                  <div
                    key={avatar.emoji}
                    onClick={() => setSelectedAvatar(avatar.emoji)}
                    className={`avatar-option ${selectedAvatar === avatar.emoji ? 'selected' : ''}`}
                    title={avatar.name}
                  >
                    {avatar.emoji}
                  </div>
                ))}
              </div>
            </div>
          )}

          {saveError && (
            <div className="save-error">
              <MaterialIcon icon="error" size={20} />
              {saveError}
            </div>
          )}
        </div>

        {/* Statystyki */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <MaterialIcon icon="bar_chart" size={28} />
            <h2 style={{ fontSize: '24px', margin: 0 }}>Statystyki</h2>
          </div>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-label">
                <MaterialIcon icon="sports_esports" size={20} />
                Gry
              </div>
              <div className="stat-value">{totalGames}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">
                <MaterialIcon icon="emoji_events" size={20} />
                Wygrane
              </div>
              <div className="stat-value" style={{ color: '#4ade80' }}>{userData.total_wins}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">
                <MaterialIcon icon="percent" size={20} />
                Win Rate
              </div>
              <div className="stat-value" style={{ color: '#fbbf24' }}>{winRate}%</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">
                <MaterialIcon icon="local_fire_department" size={20} />
                Streak
              </div>
              <div className="stat-value" style={{ color: '#f97316' }}>
                {userData.current_streak}
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-label">
                <MaterialIcon icon="military_tech" size={20} />
                Best Streak
              </div>
              <div className="stat-value">{userData.best_streak}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">
                <MaterialIcon icon="verified" size={20} />
                Accuracy
              </div>
              <div className="stat-value" style={{ color: '#00E5FF' }}>{accuracy}%</div>
            </div>
          </div>
        </Card>

        {/* Bio / O mnie - zawsze widoczne */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <MaterialIcon icon="person" size={28} />
            <h2 style={{ fontSize: '24px', margin: 0 }}>O mnie</h2>
          </div>
          {isEditingBio ? (
            <div>
              <textarea
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
                maxLength={500}
                rows={4}
                placeholder="Napisz coś o sobie..."
                className="bio-textarea"
              />
              <p className="bio-char-count">
                {editedBio.length}/500 znaków
              </p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button onClick={handleSaveBio} className="btn primary">
                  <MaterialIcon icon="save" size={20} />
                  Zapisz
                </button>
                <button onClick={() => {
                  setEditedBio(profile.bio || '');
                  setIsEditingBio(false);
                }} className="btn secondary">
                  <MaterialIcon icon="close" size={20} />
                  Anuluj
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className={`profile-bio ${!profile.bio ? 'empty' : ''}`}>
                {profile.bio || 'Użytkownik nie dodał jeszcze opisu profilu.'}
              </p>
              {isOwnProfile && !isEditMode && (
                <button 
                  onClick={() => setIsEditingBio(true)} 
                  className="btn secondary"
                  style={{ marginTop: '12px' }}
                >
                  <MaterialIcon icon="edit" size={20} />
                  Edytuj bio
                </button>
              )}
            </div>
          )}
        </Card>

        {/* Showcase Osiągnięć - zawsze widoczne */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <MaterialIcon icon="emoji_events" size={28} />
            <h2 style={{ fontSize: '24px', margin: 0 }}>Top Osiągnięcia</h2>
          </div>
          {profile.showcased_achievement_ids && profile.showcased_achievement_ids.length > 0 ? (
            <div className="achievements-showcase">
              {profile.showcased_achievement_ids.slice(0, 5).map((achId: string, idx: number) => (
                <div key={idx} className="achievement-item">
                  <div className="achievement-icon">
                    <MaterialIcon icon="workspace_premium" size={40} />
                  </div>
                  <p className="achievement-name">{achId}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <MaterialIcon icon="lock" size={48} />
              <p>
                {isOwnProfile 
                  ? 'Nie wybrano jeszcze osiągnięć do showcase. Odblokuj osiągnięcia i wybierz swoje ulubione!'
                  : 'Użytkownik nie wybrał jeszcze osiągnięć do pokazania.'
                }
              </p>
            </div>
          )}
          {isOwnProfile && !isEditMode && (
            <button 
              className="btn secondary"
              style={{ marginTop: '15px' }}
              onClick={() => {/* TODO: Modal wyboru osiągnięć */}}
            >
              <MaterialIcon icon="star" size={20} />
              Wybierz osiągnięcia
            </button>
          )}
        </Card>

        {/* Historia gier - zawsze widoczna */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <MaterialIcon icon="history" size={28} />
            <h2 style={{ fontSize: '24px', margin: 0 }}>Ostatnie Gry</h2>
          </div>
          <div className="empty-state">
            <MaterialIcon icon="sports_esports" size={48} />
            <p>Historia gier pojawi się tutaj wkrótce...</p>
          </div>
        </Card>
      </main>
    </Layout>
  );
}
