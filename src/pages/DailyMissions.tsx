import '../styles/ui.css'
import { Card, ProgressBar } from '../components'

export default function DailyMissions() {
  return (
    <main className="main" role="main">
      <Card title="🎯 Misje Dzienne" className="missions-page">
        <div className="missions-header">
          <p className="missions-subtitle">Ukończ misje, aby zdobyć dodatkowe punkty i doświadczenie!</p>
          <div className="missions-timer">⏰ Odnowienie za: 14h 32m</div>
        </div>

        <div className="missions-list-page">
          <div className="mission-card">
            <div className="mission-icon">🎮</div>
            <div className="mission-content">
              <h3 className="mission-name">Wygraj 3 pojedynki</h3>
              <p className="mission-desc">Wygraj dowolne 3 gry w dowolnym trybie</p>
              <ProgressBar value={1} max={3} />
              <div className="mission-progress-text">1/3 ukończone</div>
            </div>
            <div className="mission-reward">
              <div className="reward-value">+150 XP</div>
              <div className="reward-value">+50 pts</div>
            </div>
          </div>

          <div className="mission-card">
            <div className="mission-icon">🌍</div>
            <div className="mission-content">
              <h3 className="mission-name">Mistrz Geografii</h3>
              <p className="mission-desc">Odpowiedz poprawnie na 10 pytań z geografii</p>
              <ProgressBar value={7} max={10} />
              <div className="mission-progress-text">7/10 ukończone</div>
            </div>
            <div className="mission-reward">
              <div className="reward-value">+200 XP</div>
              <div className="reward-value">+75 pts</div>
            </div>
          </div>

          <div className="mission-card completed">
            <div className="mission-icon">✨</div>
            <div className="mission-content">
              <h3 className="mission-name">Perfekcja!</h3>
              <p className="mission-desc">Ukończ 1 grę bez błędów</p>
              <ProgressBar value={1} max={1} />
              <div className="mission-progress-text">✓ Ukończono</div>
            </div>
            <div className="mission-reward">
              <div className="reward-value claimed">+100 XP</div>
              <div className="reward-value claimed">+100 pts</div>
            </div>
          </div>

          <div className="mission-card">
            <div className="mission-icon">🔥</div>
            <div className="mission-content">
              <h3 className="mission-name">Passa Zwycięstw</h3>
              <p className="mission-desc">Osiągnij passę 5 wygranych z rzędu</p>
              <ProgressBar value={2} max={5} />
              <div className="mission-progress-text">2/5 ukończone</div>
            </div>
            <div className="mission-reward">
              <div className="reward-value">+300 XP</div>
              <div className="reward-value">+150 pts</div>
            </div>
          </div>

          <div className="mission-card">
            <div className="mission-icon">⚡</div>
            <div className="mission-content">
              <h3 className="mission-name">Szybki jak błyskawica</h3>
              <p className="mission-desc">Wygraj grę w trybie Blitz</p>
              <ProgressBar value={0} max={1} />
              <div className="mission-progress-text">0/1 ukończone</div>
            </div>
            <div className="mission-reward">
              <div className="reward-value">+250 XP</div>
              <div className="reward-value">+100 pts</div>
            </div>
          </div>
        </div>
      </Card>
    </main>
  )
}
