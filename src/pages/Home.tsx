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

import '../styles/ui.css'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Hero, Card, ExperienceBar, StatsGrid } from '../components'
import flashPoint from '../assets/flash_point.png'
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../lib/supabase'

interface TopPlayer {
  id: string;
  username: string;
  flash_points: number;
}

export default function Home() {
  const { isGuest, user } = useAuth();
  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);

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
      emoji: '⚡',
      title: 'Blitz',
      description: 'Trzy życia, szybkie pytania i rosnące tempo. Idealne na szybki trening.',
    },
    {
      key: 'duel',
      emoji: '🥊',
      title: 'Duel',
      description: 'Pojedynek 1 na 1. Dziesięć pytań, jeden zwycięzca – udowodnij, że wiesz więcej.',
    },
    {
      key: 'squad',
      emoji: '👥',
      title: 'Squad',
      description: 'Dołącz do drużyny i współpracuj, by pokonać rywali w starciu 2 na 2.',
    },
    {
      key: 'master',
      emoji: '🧠',
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
                <span className="guest-mode-emoji" aria-hidden="true">{mode.emoji}</span>
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
      </section>
    </main>
  )
}
