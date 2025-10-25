/**
 * @fileoverview Strona główna aplikacji
 * 
 * Główny dashboard użytkownika wyświetlający:
 * 
 * **Dla zalogowanych:**
 * - Hero z wyborem trybu gry (Blitz - dostępny, Duel/Squad/Master - wkrótce)
 * - Pasek doświadczenia (poziom, XP do następnego poziomu)
 * - Siatka statystyk (gry, wygrane, celność, streak)
 * - Top 3 graczy (ranking Flash Points)
 * 
 * **Dla gości:**
 * - Wersja demo z komunikatami zachęcającymi do rejestracji
 * - Podstawowe informacje o trybach gry
 * 
 * @page
 */

import '@/styles/ui.css'
import { Link } from 'react-router-dom'
import { useAuth } from '@features/auth/hooks/useAuth'
import { Hero, ExperienceBar, StatsGrid } from '@shared/components'
import { Card, MaterialIcon } from '@shared/ui'
import flashPoint from '@/assets/flash_point.png'
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { getPendingRequests, acceptFriendRequest, type FriendRequest } from '@/services/friendService'

interface TopPlayer {
  id: string;
  username: string;
  flash_points: number;
}

export default function Home() {
  const { isGuest, user } = useAuth();
  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [acceptingRequest, setAcceptingRequest] = useState<string | null>(null);

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

  // Pobierz zaproszenia do znajomych
  useEffect(() => {
    const fetchFriendRequests = async () => {
      if (!user?.id) return;

      try {
        const requests = await getPendingRequests(user.id);
        setFriendRequests(requests.slice(0, 3)); // Tylko 3 ostatnie
      } catch (error) {
        console.error('Błąd pobierania zaproszeń:', error);
      }
    };

    if (!isGuest) {
      fetchFriendRequests();
    }
  }, [user?.id, isGuest]);

  const handleAcceptRequest = async (requestId: string) => {
    if (!user?.id) return;

    setAcceptingRequest(requestId);
    
    try {
      await acceptFriendRequest(requestId);
      
      // Usuń z listy
      setFriendRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Błąd akceptowania zaproszenia:', error);
      alert('Nie udało się zaakceptować zaproszenia');
    } finally {
      setAcceptingRequest(null);
    }
  };

  // Memoizuj dane użytkownika - przelicz tylko gdy user się zmieni
  const userData = useMemo(() => ({
    level: user?.level || 1,
    currentXP: user?.experience || 0,
    xpToNextLevel: user?.experience_to_next_level || 100,
    gamesPlayed: user?.total_games_played || 0,
    totalWins: user?.total_wins || 0,
    totalLosses: user?.total_losses || 0,
    totalQuestionsAnswered: user?.total_questions_answered || 0,
    totalCorrectAnswers: user?.total_correct_answers || 0,
    currentStreak: user?.current_streak || 0
  }), [user]);

  // Memoizuj accuracy - przelicz tylko gdy totalQuestionsAnswered lub totalCorrectAnswers się zmienią
  const accuracy = useMemo(() => 
    userData.totalQuestionsAnswered > 0 
      ? Math.round((userData.totalCorrectAnswers / userData.totalQuestionsAnswered) * 100)
      : 0,
    [userData.totalQuestionsAnswered, userData.totalCorrectAnswers]
  );

  const guestModes = [
    {
      key: 'blitz',
      icon: 'bolt',
      title: 'Blitz',
      description: 'Trzy życia, szybkie pytania i rosnące tempo. Idealne na szybki trening.',
    },
    {
      key: 'duel',
      icon: 'sports_mma',
      title: 'Duel',
      description: 'Pojedynek 1 na 1. Dziesięć pytań, jeden zwycięzca – udowodnij, że wiesz więcej.',
    },
    {
      key: 'squad',
      icon: 'groups',
      title: 'Squad',
      description: 'Dołącz do drużyny i współpracuj, by pokonać rywali w starciu 2 na 2.',
    },
    {
      key: 'master',
      icon: 'psychology',
      title: 'Master',
      description: 'Wybierz ulubioną kategorię i pokaż mistrzowską wiedzę w tematycznym wyzwaniu.',
    },
  ];

  // Wersja dla gości (niezalogowanych) - DEMO
  if (isGuest) {
    return (
      <main className="main guest-home" role="main">
        <section className="guest-hero" aria-labelledby="guest-home-title">
          <p className="guest-hero-kicker">Witaj w QuizRush</p>
          <h1 id="guest-home-title">Szybkie quizy, zdrowa rywalizacja i nagrody za wiedzę.</h1>
          <p className="guest-hero-description">
            QuizRush to platforma, na której rozwijasz wiedzę, zdobywasz FlashPoints i wspinasz się w rankingach.
            Wskocz do gry solo, zmierz się w pojedynku albo stwórz drużynę – wszystko w jednym miejscu.
          </p>
          <div className="guest-cta">
            <Link to="/register" className="guest-cta-primary">Dołącz bezpłatnie</Link>
            <Link to="/login" className="guest-cta-secondary">Mam już konto</Link>
          </div>
        </section>

        <section className="guest-modes" aria-label="Dostępne tryby gry">
          <h2>Poznaj tryby gry</h2>
          <p className="guest-modes-intro">Każdy tryb oferuje inny sposób rywalizacji – wybierz ten, który pasuje do Ciebie najlepiej.</p>
          <div className="guest-modes-grid">
            {guestModes.map((mode) => (
              <div key={mode.key} className="guest-mode-card">
                <MaterialIcon icon={mode.icon} size={48} className="guest-mode-icon" />
                <h3>{mode.title}</h3>
                <p>{mode.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="guest-extra" aria-label="Dlaczego warto założyć konto?">
          <h2>Więcej niż quiz</h2>
          <ul>
            <li>Zdobywaj punkty doświadczenia i odblokowuj kolejne poziomy.</li>
            <li>Realizuj codzienne misje i odbieraj nagrody.</li>
            <li>Rywalizuj ze znajomymi i śledź ich postępy w rankingach.</li>
          </ul>
          <p>
            Zarejestruj konto, aby zapisywać swoje wyniki, budować kolekcję osiągnięć i odblokować wszystkie tryby gry.
          </p>
          <Link to="/register" className="guest-cta-primary">Załóż konto w minutę</Link>
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

        {/* Ranking */}
        <Card title="� Top Gracze" className="ranking">
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
          <Link 
            to="/ranking" 
            style={{
              display: 'block',
              marginTop: '16px',
              padding: '12px',
              textAlign: 'center',
              background: 'rgba(0,229,255,0.1)',
              borderRadius: '8px',
              color: '#00E5FF',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            Zobacz pełny ranking →
          </Link>
        </Card>

        {/* Aktywność - zaproszenia do znajomych */}
        <Card title="🔔 Aktywność" className="activity">
          {friendRequests.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {friendRequests.map((request) => (
                <div 
                  key={request.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    background: 'rgba(0,229,255,0.05)',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,229,255,0.1)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      background: '#0f0f23',
                      border: '2px solid #00E5FF'
                    }}>
                      {request.requester_data.avatar_url || '😀'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: '#fff', marginBottom: '2px' }}>
                        {request.requester_data.username}
                      </div>
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        zaprasza do znajomych
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAcceptRequest(request.id)}
                    disabled={acceptingRequest === request.id}
                    className="btn primary"
                    style={{
                      padding: '8px 16px',
                      fontSize: '13px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {acceptingRequest === request.id ? '...' : 'Zaakceptuj'}
                  </button>
                </div>
              ))}
              <Link
                to="/znajomi"
                style={{
                  display: 'block',
                  marginTop: '8px',
                  padding: '10px',
                  textAlign: 'center',
                  color: '#00E5FF',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                Zobacz wszystkie zaproszenia →
              </Link>
            </div>
          ) : (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#888'
            }}>
              <MaterialIcon icon="notifications_none" size={48} style={{ opacity: 0.5, marginBottom: '12px' }} />
              <p style={{ fontSize: '14px', margin: 0 }}>
                Brak nowych powiadomień
              </p>
              <p style={{ fontSize: '12px', marginTop: '8px', opacity: 0.7 }}>
                Zaproszenia do znajomych i wyzwania pojawią się tutaj
              </p>
            </div>
          )}
        </Card>
      </section>
    </main>
  )
}
