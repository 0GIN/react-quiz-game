import '../styles/ui.css'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Hero, Card, ProgressBar, ExperienceBar, StatsGrid } from '../components'
import flashPoint from '../assets/flash_point.png'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { MissionTracker, catchUpDailyMissions, synchronizeMissionProgress } from '../services/missionService'

interface TopPlayer {
  id: string;
  username: string;
  flash_points: number;
}

interface DailyMission {
  id: string;
  mission_id: string;
  name: string;
  description: string;
  target_value: number;
  current_progress: number;
  reward_flash_points: number;
  reward_experience: number;
  is_completed: boolean;
  is_claimed: boolean;
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

        // Najpierw pobierz statystyki użytkownika i zsynchronizuj progres misji
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('total_games_played, total_wins, best_streak, flash_points, total_correct_answers, total_questions_answered')
            .eq('id', user.id)
            .single();
          if (!userError && userData) {
            await synchronizeMissionProgress(user.id, userData);
          }
          await catchUpDailyMissions(user.id);
        } catch (e) {
          // Błąd nie jest krytyczny, misje i tak się załadują
        }

        // Inicjalizuj misje na dziś (jeśli jeszcze nie istnieją)
        const { initializeDailyMissions } = await import('../services/missionService');
        await initializeDailyMissions(user.id);
        
        // Pobierz postęp użytkownika w misjach na dziś
        const today = new Date().toISOString().split('T')[0];
        const { data: userMissions, error: missionsError } = await supabase
          .from('user_daily_missions')
          .select(`
            id,
            current_progress,
            is_completed,
            is_claimed,
            mission_id,
            daily_missions!inner (
              id,
              name,
              description,
              target_value,
              flash_points_reward,
              experience_reward,
              valid_date
            )
          `)
          .eq('user_id', user.id)
          .eq('daily_missions.valid_date', today)
          .eq('daily_missions.is_active', true);

        if (missionsError) {
          console.error('Błąd pobierania misji:', missionsError);
          setLoading(false);
          return;
        }

        // Mapuj dane do naszego interfejsu
        const missionsWithProgress = (userMissions || []).map((um: any) => ({
          id: um.id,
          mission_id: um.mission_id,
          name: um.daily_missions.name,
          description: um.daily_missions.description,
          target_value: um.daily_missions.target_value,
          reward_flash_points: um.daily_missions.flash_points_reward,
          reward_experience: um.daily_missions.experience_reward,
          current_progress: um.current_progress,
          is_completed: um.is_completed,
          is_claimed: um.is_claimed || false
        }));
        
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
    totalLosses: user?.total_losses || 0,
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
              � Zagraj pierwszą grę, aby zobaczyć swoje statystyki!
            </div>
          )}
        </Card>

        {/* Twoje Misje */}
        <div style={{ gridColumn: 'span 6' }}>
          <Card title="🎯 Twoje Misje Dnia" className="missions">
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
                  <div key={mission.id} style={{
                    padding: '16px',
                    background: mission.is_completed 
                      ? 'linear-gradient(90deg, rgba(0,229,255,0.1) 0%, rgba(0,229,255,0.05) 100%)'
                      : 'rgba(18,18,30,0.4)',
                    borderRadius: '12px',
                    border: mission.is_completed 
                      ? '2px solid rgba(0,229,255,0.5)'
                      : '2px solid rgba(255,255,255,0.1)',
                    marginBottom: '12px',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontSize: '16px', 
                          fontWeight: 700, 
                          color: mission.is_completed ? '#00E5FF' : '#E0E0E0',
                          marginBottom: '4px'
                        }}>
                          {mission.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#B8B8D0' }}>
                          {mission.description}
                        </div>
                      </div>
                      <div style={{
                        padding: '6px 12px',
                        background: 'rgba(255,215,0,0.2)',
                        borderRadius: '20px',
                        fontSize: '12px',
                        color: '#FFD700',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        marginLeft: '12px'
                      }}>
                        +{mission.reward_flash_points} FP
                      </div>
                    </div>
                    
                    <ProgressBar value={mission.current_progress} max={mission.target_value} />
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginTop: '8px'
                    }}>
                      <div style={{ fontSize: '13px', color: '#B8B8D0' }}>
                        {mission.current_progress}/{mission.target_value}
                        {mission.is_completed && !mission.is_claimed && (
                          <span style={{ color: '#4ade80', marginLeft: '8px', fontWeight: 600 }}>
                            ✓ Ukończone!
                          </span>
                        )}
                        {mission.is_claimed && (
                          <span style={{ color: '#B8B8D0', marginLeft: '8px' }}>
                            ✓ Odebrane
                          </span>
                        )}
                      </div>
                      
                      {mission.is_completed && !mission.is_claimed && (
                        <button
                          onClick={async () => {
                            const { claimMissionReward } = await import('../services/missionService');
                            const result = await claimMissionReward(user!.id, mission.id);
                            
                            if (result.success && result.reward) {
                              alert(`🎉 Gratulacje! Otrzymujesz:\n+${result.reward.fp} Flash Points\n+${result.reward.xp} XP`);
                              // Odśwież misje
                              window.location.reload();
                            } else {
                              alert(`❌ ${result.error}`);
                            }
                          }}
                          style={{
                            padding: '8px 20px',
                            background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            boxShadow: '0 4px 12px rgba(74,222,128,0.4)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(74,222,128,0.6)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(74,222,128,0.4)';
                          }}
                        >
                          🎁 Odbierz nagrodę
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </Card>
          </div>

          {/* Ranking */}
          <div style={{ gridColumn: 'span 6' }}>
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
          </div>
        </section>
      </main>
    )
  }
