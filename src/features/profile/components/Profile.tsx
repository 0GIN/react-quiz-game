/**
 * @fileoverview Strona profilu użytkownika
 * 
 * Wizytówka użytkownika z możliwością customizacji.
 * 
 * Funkcjonalność:
 * - Widok własnego profilu (/profile) - edytowalne
 * - Widok profilu innego gracza (/profile/:userId) - readonly
 * - Banner + Avatar + Tytuł + Poziom
 * - Statystyki (gry, wygrane, Flash Points, streak)
 * - Showcase osiągnięć (wybrane 5)
 * - Bio/opis
 * - Historia ostatnich gier
 * - Edycja (tylko własny profil)
 * 
 * @page
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@features/auth/hooks/useAuth';
import { getProfile, updateBio, type FullUserProfile } from '@/services/profileService';
import { Layout, Card } from '@shared/ui';
import '@/styles/ui.css';

export default function Profile() {
  const { userId } = useParams<{ userId?: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<FullUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState('');

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
  }, [profileUserId]);

  const fetchProfile = async () => {
    if (!profileUserId) return;

    setLoading(true);
    setError(null);

    const result = await getProfile(profileUserId, user?.id);

    if (result.success && result.data) {
      setProfile(result.data);
      setEditedBio(result.data.bio || '');
    } else {
      setError(result.error || 'Failed to load profile');
    }

    setLoading(false);
  };

  const handleSaveBio = async () => {
    if (!user?.id) return;

    const result = await updateBio(user.id, editedBio);

    if (result.success) {
      setIsEditing(false);
      fetchProfile(); // Odśwież profil
    } else {
      alert(result.error || 'Failed to update bio');
    }
  };

  const handleCancelEdit = () => {
    setEditedBio(profile?.bio || '');
    setIsEditing(false);
  };

  if (loading) {
    return (
      <Layout>
        <main className="main" role="main">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '60vh',
            color: '#00E5FF',
            fontSize: '20px'
          }}>
            ⏳ Ładowanie profilu...
          </div>
        </main>
      </Layout>
    );
  }

  if (error || !profile) {
    return (
      <Layout>
        <main className="main" role="main">
          <Card title="Błąd">
            <p style={{ color: '#ff4444', textAlign: 'center' }}>
              {error || 'Nie można załadować profilu'}
            </p>
            <button 
              onClick={() => navigate('/')} 
              className="btn primary"
              style={{ marginTop: '20px' }}
            >
              Wróć do strony głównej
            </button>
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
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: profile.avatar_frame ? `4px solid ${profile.avatar_frame.icon_url}` : '4px solid #00E5FF',
                  background: '#0f0f23'
                }}
              >
                <img
                  src={profile.selected_avatar?.image_url || userData.avatar_url || '/avatars/default.png'}
                  alt={`${userData.username} avatar`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>

            {/* Informacje użytkownika */}
            <div style={{ flex: 1 }}>
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
                      style={{
                        fontSize: '24px',
                        padding: '4px 8px',
                        background: 'rgba(0,229,255,0.1)',
                        borderRadius: '8px',
                        border: '1px solid rgba(0,229,255,0.3)'
                      }}
                    >
                      {badge.icon_url || '🏆'}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Przyciski akcji */}
            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
              {isOwnProfile ? (
                <button
                  onClick={() => navigate('/settings')}
                  className="btn secondary"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  ⚙️ Edytuj Profil
                </button>
              ) : (
                <>
                  <button className="btn primary" style={{ whiteSpace: 'nowrap' }}>
                    ➕ Dodaj do znajomych
                  </button>
                  <button className="btn secondary" style={{ whiteSpace: 'nowrap' }}>
                    💬 Wyślij wiadomość
                  </button>
                </>
              )}
              <p style={{ fontSize: '12px', color: '#888', textAlign: 'center' }}>
                👁️ {profile.profile_views} odwiedzin
              </p>
            </div>
          </div>
        </div>

        {/* Statystyki */}
        <Card title="📊 Statystyki">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '20px' 
          }}>
            <div className="stat-box">
              <div className="stat-label">Gry</div>
              <div className="stat-value">{totalGames}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Wygrane</div>
              <div className="stat-value" style={{ color: '#4ade80' }}>{userData.total_wins}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Win Rate</div>
              <div className="stat-value" style={{ color: '#fbbf24' }}>{winRate}%</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Streak</div>
              <div className="stat-value" style={{ color: '#f97316' }}>
                🔥 {userData.current_streak}
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Best Streak</div>
              <div className="stat-value">{userData.best_streak}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Accuracy</div>
              <div className="stat-value" style={{ color: '#00E5FF' }}>{accuracy}%</div>
            </div>
          </div>
        </Card>

        {/* Bio / O mnie */}
        {(profile.show_stats || isOwnProfile) && (
          <Card title="📝 O mnie">
            {isEditing ? (
              <div>
                <textarea
                  value={editedBio}
                  onChange={(e) => setEditedBio(e.target.value)}
                  maxLength={500}
                  rows={4}
                  placeholder="Napisz coś o sobie..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#0f0f23',
                    border: '1px solid rgba(0,229,255,0.3)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
                <p style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
                  {editedBio.length}/500 znaków
                </p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                  <button onClick={handleSaveBio} className="btn primary">
                    💾 Zapisz
                  </button>
                  <button onClick={handleCancelEdit} className="btn secondary">
                    ❌ Anuluj
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ 
                  color: profile.bio ? '#ccc' : '#666',
                  fontStyle: profile.bio ? 'normal' : 'italic',
                  lineHeight: '1.6'
                }}>
                  {profile.bio || 'Użytkownik nie dodał jeszcze opisu profilu.'}
                </p>
                {isOwnProfile && (
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="btn secondary"
                    style={{ marginTop: '12px' }}
                  >
                    ✏️ Edytuj bio
                  </button>
                )}
              </div>
            )}
          </Card>
        )}

        {/* Showcase Osiągnięć */}
        {(profile.show_achievements || isOwnProfile) && (
          <Card title="🏆 Top Osiągnięcia">
            {profile.showcased_achievement_ids && profile.showcased_achievement_ids.length > 0 ? (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                gap: '15px' 
              }}>
                {profile.showcased_achievement_ids.slice(0, 5).map((achId, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '20px',
                      background: 'rgba(0,229,255,0.05)',
                      borderRadius: '12px',
                      border: '2px solid rgba(0,229,255,0.2)',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '40px' }}>🏅</div>
                    <p style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
                      {achId}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center' }}>
                {isOwnProfile 
                  ? 'Nie wybrano jeszcze osiągnięć do showcase. Odblokuj osiągnięcia i wybierz swoje ulubione!'
                  : 'Użytkownik nie wybrał jeszcze osiągnięć do pokazania.'
                }
              </p>
            )}
            {isOwnProfile && (
              <button 
                className="btn secondary"
                style={{ marginTop: '15px' }}
                onClick={() => {/* TODO: Modal wyboru osiągnięć */}}
              >
                ⭐ Wybierz osiągnięcia
              </button>
            )}
          </Card>
        )}

        {/* Historia gier (TODO: dodać po zintegrowaniu z gameService) */}
        {(profile.show_game_history || isOwnProfile) && (
          <Card title="📜 Ostatnie Gry">
            <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center' }}>
              Historia gier pojawi się tutaj wkrótce...
            </p>
          </Card>
        )}
      </main>
    </Layout>
  );
}
