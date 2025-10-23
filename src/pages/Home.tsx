import '../styles/ui.css'
import { Navbar, Sidebar, Hero, Card, ProgressBar, AchievementBadge, StatsGrid } from '../components'
import flashPoint from '../assets/flash_point.png'

export default function Home() {
  return (
    <div className="home-root">
      <Navbar />
      <div className="app-frame">
        <Sidebar />
        <main className="main" role="main">
          <Hero />

          <section className="mosaic" aria-label="Panel informacyjny">
            {/* Twoje Misje */}
            <Card title="Twoje Misje Dnia" className="missions">
              <div className="mission-row">
                <div className="mission-title">Wygraj 3 pojedynki</div>
                <ProgressBar value={1} max={3} />
                <div className="small">1/3</div>
              </div>
              <div className="mission-row">
                <div className="mission-title">Odpowiedz na 5 pytań z geografii</div>
                <ProgressBar value={4} max={5} />
                <div className="small">4/5</div>
              </div>
              <div className="mission-row">
                <div className="mission-title">Ukończ 1 pojedynek bezbłędnie</div>
                <ProgressBar value={0} max={1} />
                <div className="small">0/1</div>
              </div>
            </Card>

            {/* Ranking */}
            <Card title="Ranking Znajomych" className="ranking">
              <ol className="ranking-list">
                <li>
                  <strong>Player1</strong> 
                  <span className="points">
                    <img src={flashPoint} alt="" className="point-icon" />
                    9876
                  </span>
                </li>
                <li>
                  Player2 
                  <span className="points">
                    <img src={flashPoint} alt="" className="point-icon" />
                    7654
                  </span>
                </li>
                <li>
                  Player3 
                  <span className="points">
                    <img src={flashPoint} alt="" className="point-icon" />
                    7566
                  </span>
                </li>
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
              <StatsGrid 
                gamesPlayed={127}
                accuracy={82}
                streak={5}
                level={12}
              />
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
      </div>
    </div>
  )
}
