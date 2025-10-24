import '../styles/ui.css'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Hero, Card, ProgressBar, ExperienceBar, AchievementBadge, StatsGrid } from '../components'
import flashPoint from '../assets/flash_point.png'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface TopPlayer {
  id: string;
  username: string;
  flash_points: number;
}

interface DailyMission {
  id: string;
  title: string;
  description: string;
  target_value: number;
  current_progress: number;
  reward_flash_points: number;
  is_completed: boolean;
}

export default function Home() {
  const { isGuest, user } = useAuth();
  const navigate = useNavigate();
  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>([]);
  const [loading, setLoading] = useState(true);

  // Pobierz top graczy
  useEffect(() => {
    const fetchTopPlayers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, flash_points')
        .order('flash_points', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Błąd pobierania top graczy:', error);
      } else {
        setTopPlayers(data || []);
      }
    };

    fetchTopPlayers();
  }, []);

  // Pobierz codzienne misje dla zalogowanego użytkownika
  useEffect(() => {
    if (!isGuest && user) {
      const fetchDailyMissions = async () => {
        setLoading(true);
        
        // Pobierz aktywne misje na dziś
        const today = new Date().toISOString().split('T')[0];
        const { data: activeMissions, error: missionsError } = await supabase
          .from('daily_missions')
          .select('*')
          .eq('is_active', true)
          .eq('valid_date', today)
          .limit(3);

        if (missionsError) {
          console.error('Błąd pobierania misji:', missionsError);
          setLoading(false);
          return;
        }

        // Sprawdź postęp użytkownika dla każdej misji
        const missionsWithProgress = await Promise.all(
          (activeMissions || []).map(async (mission) => {
            const { data: userMission } = await supabase
              .from('user_daily_missions')
              .select('current_progress, is_completed')
              .eq('user_id', user.id)
              .eq('mission_id', mission.id)
              .single();

            return {
              id: mission.id,
              title: mission.name,
              description: mission.description,
              target_value: mission.target_value,
              current_progress: userMission?.current_progress || 0,
              reward_flash_points: mission.flash_points_reward,
              is_completed: userMission?.is_completed || false
            };
          })
        );
        
        setDailyMissions(missionsWithProgress);
        setLoading(false);
      };

      fetchDailyMissions();
    }
  }, [isGuest, user]);

  // Oblicz dane użytkownika z bazy
  const userData = {
    level: user?.level || 1,
    currentXP: user?.experience || 0,
    xpToNextLevel: user?.experience_to_next_level || 100,
    gamesPlayed: user?.total_games_played || 0,
    totalWins: user?.total_wins || 0,
    totalQuestionsAnswered: user?.total_questions_answered || 0,
    totalCorrectAnswers: user?.total_correct_answers || 0,
    currentStreak: user?.current_streak || 0
  }

  // Oblicz celność (accuracy)
  const accuracy = userData.totalQuestionsAnswered > 0 
    ? Math.round((userData.totalCorrectAnswers / userData.totalQuestionsAnswered) * 100)
    : 0;

  // Wersja dla gości (niezalogowanych) - DEMO
  if (isGuest) {
    return (
      <main className="main" role="main">
        <Hero />

        <section className="mosaic" aria-label="Panel informacyjny">
          {/* CTA Rejestracja - DUŻY BANNER */}
          <div style={{ gridColumn: 'span 12' }}>
            <Card title="" className="missions">
              <div style={{ 
                padding: '40px 20px', 
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(0,229,255,0.1) 0%, rgba(138,43,226,0.1) 100%)',
                borderRadius: '16px'
              }}>
                <h2 style={{ 
                  color: '#00E5FF', 
                  fontSize: '42px', 
                  marginBottom: '16px',
                  fontWeight: 800,
                  textShadow: '0 0 20px rgba(0,229,255,0.5)'
                }}>
                  ⚡ QuizRush - Gra Quizowa Nowej Generacji!
                </h2>
                <p style={{ 
                  color: '#E0E0E0', 
                  fontSize: '20px', 
                  lineHeight: 1.6, 
                  marginBottom: '32px',
                  maxWidth: '800px',
                  margin: '0 auto 32px'
                }}>
                  Rywalizuj z przyjaciółmi, zdobywaj FlashPoints, wspinaj się na szczyty rankingów!<br />
                  <span style={{ color: '#B8B8D0', fontSize: '16px' }}>Dołącz do tysięcy graczy już dziś! 🚀</span>
                </p>
                <div style={{ 
                  display: 'flex', 
                  gap: '16px', 
                  justifyContent: 'center', 
                  flexWrap: 'wrap'
                }}>
                  <Link 
                    to="/register" 
                    className="btn primary" 
                    style={{ 
                      textDecoration: 'none', 
                      padding: '18px 40px', 
                      fontSize: '18px',
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #00E5FF 0%, #8A2BE2 100%)',
                      border: 'none',
                      boxShadow: '0 8px 24px rgba(0,229,255,0.4)',
                      transform: 'scale(1)',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    🚀 Zacznij Grać Teraz!
                  </Link>
                  <Link 
                    to="/login" 
                    className="btn secondary" 
                    style={{ 
                      textDecoration: 'none', 
                      padding: '18px 40px', 
                      fontSize: '18px',
                      fontWeight: 700,
                      background: 'rgba(0,229,255,0.1)',
                      border: '2px solid #00E5FF',
                      color: '#00E5FF'
                    }}
                  >
                    🔑 Mam już konto
                  </Link>
                </div>
              </div>
            </Card>
          </div>

          {/* Wybierz Tryb - Prezentacja */}
          <div style={{ gridColumn: 'span 12' }}>
            <Card title="⚔️ Wybierz Tryb Gry" className="game-modes">
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '20px',
                padding: '10px'
              }}>
                {/* Duel */}
                <div style={{ 
                  padding: '24px', 
                  background: 'linear-gradient(135deg, rgba(255,59,48,0.1) 0%, rgba(255,149,0,0.1) 100%)',
                  borderRadius: '16px',
                  border: '2px solid rgba(255,59,48,0.3)',
                  textAlign: 'center',
                  cursor: 'not-allowed',
                  opacity: 0.8,
                  position: 'relative' as const
                }}>
                  <div style={{ 
                    position: 'absolute' as const, 
                    top: '12px', 
                    right: '12px', 
                    background: 'rgba(0,0,0,0.5)', 
                    padding: '4px 12px', 
                    borderRadius: '20px',
                    fontSize: '11px',
                    color: '#FFD700',
                    fontWeight: 600
                  }}>
                    🔒 Wymagane konto
                  </div>
                  <div style={{ fontSize: '64px', marginBottom: '12px' }}>🥊</div>
                  <h4 style={{ color: '#FF3B30', fontSize: '22px', marginBottom: '8px', fontWeight: 700 }}>Duel</h4>
                  <p style={{ color: '#B8B8D0', fontSize: '14px', lineHeight: 1.6, marginBottom: '12px' }}>
                    Klasyczny 1v1<br />10 pytań, kto lepszy?
                  </p>
                  <div style={{ color: '#00E5FF', fontSize: '13px', fontWeight: 600 }}>
                    +100 FlashPoints za wygraną
                  </div>
                </div>

                {/* Squad */}
                <div style={{ 
                  padding: '24px', 
                  background: 'linear-gradient(135deg, rgba(0,229,255,0.1) 0%, rgba(0,122,255,0.1) 100%)',
                  borderRadius: '16px',
                  border: '2px solid rgba(0,229,255,0.3)',
                  textAlign: 'center',
                  cursor: 'not-allowed',
                  opacity: 0.8,
                  position: 'relative' as const
                }}>
                  <div style={{ 
                    position: 'absolute' as const, 
                    top: '12px', 
                    right: '12px', 
                    background: 'rgba(0,0,0,0.5)', 
                    padding: '4px 12px', 
                    borderRadius: '20px',
                    fontSize: '11px',
                    color: '#FFD700',
                    fontWeight: 600
                  }}>
                    🔒 Wymagane konto
                  </div>
                  <div style={{ fontSize: '64px', marginBottom: '12px' }}>👥</div>
                  <h4 style={{ color: '#00E5FF', fontSize: '22px', marginBottom: '8px', fontWeight: 700 }}>Squad</h4>
                  <p style={{ color: '#B8B8D0', fontSize: '14px', lineHeight: 1.6, marginBottom: '12px' }}>
                    2v2 drużynowa dominacja<br />Współpraca = Zwycięstwo
                  </p>
                  <div style={{ color: '#00E5FF', fontSize: '13px', fontWeight: 600 }}>
                    +150 FlashPoints za wygraną
                  </div>
                </div>

                {/* Blitz */}
                <div 
                  onClick={() => navigate('/game-blitz')}
                  style={{ 
                  padding: '24px', 
                  background: 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,149,0,0.1) 100%)',
                  borderRadius: '16px',
                  border: '2px solid rgba(255,215,0,0.3)',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative' as const
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(255,215,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                >
                  <div style={{ fontSize: '64px', marginBottom: '12px' }}>⚡</div>
                  <h4 style={{ color: '#FFD700', fontSize: '22px', marginBottom: '8px', fontWeight: 700 }}>Blitz</h4>
                  <p style={{ color: '#B8B8D0', fontSize: '14px', lineHeight: 1.6, marginBottom: '12px' }}>
                    3 życia, mix kategorii<br />Szybkość i precyzja!
                  </p>
                  <div style={{ color: '#00E5FF', fontSize: '13px', fontWeight: 600 }}>
                    do +200 FlashPoints
                  </div>
                </div>

                {/* Master */}
                <div style={{ 
                  padding: '24px', 
                  background: 'linear-gradient(135deg, rgba(138,43,226,0.1) 0%, rgba(75,0,130,0.1) 100%)',
                  borderRadius: '16px',
                  border: '2px solid rgba(138,43,226,0.3)',
                  textAlign: 'center',
                  cursor: 'not-allowed',
                  opacity: 0.8,
                  position: 'relative' as const
                }}>
                  <div style={{ 
                    position: 'absolute' as const, 
                    top: '12px', 
                    right: '12px', 
                    background: 'rgba(0,0,0,0.5)', 
                    padding: '4px 12px', 
                    borderRadius: '20px',
                    fontSize: '11px',
                    color: '#FFD700',
                    fontWeight: 600
                  }}>
                    🔒 Wymagane konto
                  </div>
                  <div style={{ fontSize: '64px', marginBottom: '12px' }}>�</div>
                  <h4 style={{ color: '#8A2BE2', fontSize: '22px', marginBottom: '8px', fontWeight: 700 }}>Master</h4>
                  <p style={{ color: '#B8B8D0', fontSize: '14px', lineHeight: 1.6, marginBottom: '12px' }}>
                    1v1 w jednej kategorii<br />Tylko dla ekspertów
                  </p>
                  <div style={{ color: '#00E5FF', fontSize: '13px', fontWeight: 600 }}>
                    +200 FlashPoints za wygraną
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Demo Ranking */}
          <div style={{ gridColumn: 'span 6' }}>
            <Card title="🏆 Top Gracze" className="ranking">
              <ol className="ranking-list">
                {topPlayers.map((player, index) => (
                  <li key={player.id}>
                    {index === 0 ? <strong>{player.username}</strong> : player.username}
                    <span className="points">
                      <img src={flashPoint} alt="" className="point-icon" />
                      {player.flash_points.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ol>
              <div style={{ 
                marginTop: '16px', 
                padding: '12px', 
                background: 'rgba(0,229,255,0.1)', 
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <p style={{ color: '#00E5FF', fontSize: '13px', fontWeight: 600 }}>
                  🔒 Zaloguj się, aby zobaczyć pełny ranking!
                </p>
              </div>
            </Card>
          </div>

          {/* Co oferujemy */}
          <div style={{ gridColumn: 'span 6' }}>
            <Card title="✨ Dlaczego QuizRush?" className="achievements">
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ padding: '12px', background: 'rgba(0,229,255,0.05)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>🎯</div>
                  <h4 style={{ color: '#E0E0E0', marginBottom: '4px', fontSize: '15px' }}>Codzienne Misje</h4>
                  <p style={{ color: '#B8B8D0', fontSize: '13px' }}>Nowe wyzwania każdego dnia</p>
                </div>
                <div style={{ padding: '12px', background: 'rgba(0,229,255,0.05)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>💬</div>
                  <h4 style={{ color: '#E0E0E0', marginBottom: '4px', fontSize: '15px' }}>Czat & Znajomi</h4>
                  <p style={{ color: '#B8B8D0', fontSize: '13px' }}>Graj ze znajomymi!</p>
                </div>
                <div style={{ padding: '12px', background: 'rgba(0,229,255,0.05)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>🛒</div>
                  <h4 style={{ color: '#E0E0E0', marginBottom: '4px', fontSize: '15px' }}>Sklep Premium</h4>
                  <p style={{ color: '#B8B8D0', fontSize: '13px' }}>Kupuj ulepszenia za FP</p>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>
    );
  }

  // Wersja dla zalogowanych użytkowników
  return (
    <main className="main" role="main">
      <Hero />

          <section className="mosaic" aria-label="Panel informacyjny">
            {/* Twoje Misje */}
            <Card title="Twoje Misje Dnia" className="missions">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#B8B8D0' }}>
                  Ładowanie misji...
                </div>
              ) : dailyMissions.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '20px', 
                  color: '#B8B8D0',
                  background: 'rgba(255,215,0,0.05)',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎯</div>
                  <div style={{ fontSize: '14px', marginBottom: '4px', color: '#E0E0E0' }}>
                    Brak aktywnych misji na dziś
                  </div>
                  <div style={{ fontSize: '12px', color: '#B8B8D0' }}>
                    Nowe misje pojawią się wkrótce!
                  </div>
                </div>
              ) : (
                dailyMissions.map((mission) => (
                  <div key={mission.id} className="mission-row">
                    <div className="mission-title">
                      {mission.title}
                      <span style={{ 
                        marginLeft: '8px', 
                        fontSize: '12px', 
                        color: '#00E5FF',
                        fontWeight: 600
                      }}>
                        +{mission.reward_flash_points} FP
                      </span>
                    </div>
                    <ProgressBar value={mission.current_progress} max={mission.target_value} />
                    <div className="small">
                      {mission.current_progress}/{mission.target_value}
                      {mission.is_completed && ' ✓'}
                    </div>
                  </div>
                ))
              )}
            </Card>

            {/* Ranking */}
            <Card title="Ranking Znajomych" className="ranking">
              <ol className="ranking-list">
                {topPlayers.map((player, index) => (
                  <li key={player.id}>
                    {index === 0 ? <strong>{player.username}</strong> : player.username}
                    <span className="points">
                      <img src={flashPoint} alt="" className="point-icon" />
                      {player.flash_points.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ol>
            </Card>

            {/* Aktywność */}
            <Card title="Aktywność" className="activity">
              <ul className="activity-list">
                <li>Użytkownik X wyzwał Cię na pojedynek!</li>
                <li>Użytkownik Y dołączył misję</li>
                <li>Użytkownik Z pobił wynik!</li>
              </ul>
            </Card>

            {/* Statystyki z rozszerzonymi danymi */}
            <Card title="Twoje Statystyki" className="stats">
              <ExperienceBar 
                level={userData.level} 
                currentXP={userData.currentXP} 
                xpToNextLevel={userData.xpToNextLevel} 
              />
              <StatsGrid 
                gamesPlayed={userData.gamesPlayed}
                accuracy={accuracy}
                streak={userData.currentStreak}
                level={userData.level}
              />
              {userData.gamesPlayed === 0 && (
                <div style={{ 
                  marginTop: '16px', 
                  padding: '12px', 
                  background: 'rgba(0,229,255,0.1)', 
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '13px',
                  color: '#B8B8D0'
                }}>
                  💡 Zagraj pierwszą grę, aby zobaczyć swoje statystyki!
                </div>
              )}
            </Card>

            {/* Osiągnięcia */}
            <Card title="Ostatnie Osiągnięcia" className="achievements">
              <div className="achievements-list">
                <AchievementBadge 
                  icon="🏅"
                  title="Mistrz Geografii"
                  date="Wczoraj"
                  isNew
                />
                <AchievementBadge 
                  icon="💯"
                  title="100 Wygranych"
                  date="3 dni temu"
                />
                <AchievementBadge 
                  icon="🔥"
                  title="Gorąca Passa x10"
                  date="Tydzień temu"
                />
              </div>
            </Card>

            {/* Wyzwania */}
            <Card title="Oczekujące Wyzwania" className="challenges">
              <div className="challenges-list">
                <div className="challenge-item">
                  <div className="challenge-avatar">👤</div>
                  <div className="challenge-info">
                    <strong>PlayerX</strong> wyzwał Cię na pojedynek
                    <div className="challenge-category">Geografia • 5 pytań</div>
                  </div>
                  <button className="btn-small primary">Akceptuj</button>
                </div>
                <div className="challenge-item">
                  <div className="challenge-avatar">👤</div>
                  <div className="challenge-info">
                    <strong>PlayerY</strong> czeka na Twoją odpowiedź
                    <div className="challenge-category">Historia • 10 pytań</div>
                  </div>
                  <button className="btn-small primary">Zagraj</button>
                </div>
              </div>
            </Card>
          </section>
        </main>
  )
}
