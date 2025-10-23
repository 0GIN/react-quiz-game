import '../styles/ui.css'
import { Card } from '../components'

export default function GameHistory() {
  return (
    <main className="main" role="main">
      <Card title="📋 Historia Gier" className="history-page">
        <div className="history-filters">
          <button className="filter-btn active">Wszystkie</button>
          <button className="filter-btn">Wygrane</button>
          <button className="filter-btn">Przegrane</button>
          <button className="filter-btn">Duel</button>
          <button className="filter-btn">Squad</button>
        </div>

        <div className="history-list">
          <div className="history-item win">
            <div className="history-result">
              <span className="result-badge win">Wygrana</span>
            </div>
            <div className="history-mode">
              <span className="mode-icon">⚔️</span>
              <span>Duel</span>
            </div>
            <div className="history-opponent">vs Gracz123</div>
            <div className="history-score">15 - 12</div>
            <div className="history-stats">
              <span>82% celności</span>
            </div>
            <div className="history-rewards">
              <span className="xp-gain">+50 XP</span>
              <span className="pts-gain">+30 pts</span>
            </div>
            <div className="history-time">2 godz. temu</div>
          </div>

          <div className="history-item loss">
            <div className="history-result">
              <span className="result-badge loss">Przegrana</span>
            </div>
            <div className="history-mode">
              <span className="mode-icon">⚔️</span>
              <span>Duel</span>
            </div>
            <div className="history-opponent">vs ProGamer99</div>
            <div className="history-score">10 - 15</div>
            <div className="history-stats">
              <span>67% celności</span>
            </div>
            <div className="history-rewards">
              <span className="xp-loss">-20 XP</span>
            </div>
            <div className="history-time">5 godz. temu</div>
          </div>

          <div className="history-item win">
            <div className="history-result">
              <span className="result-badge win">Wygrana</span>
            </div>
            <div className="history-mode">
              <span className="mode-icon">⚡</span>
              <span>Blitz</span>
            </div>
            <div className="history-opponent">Solo</div>
            <div className="history-score">Przeżyto</div>
            <div className="history-stats">
              <span>90% celności</span>
            </div>
            <div className="history-rewards">
              <span className="xp-gain">+75 XP</span>
              <span className="pts-gain">+50 pts</span>
            </div>
            <div className="history-time">Wczoraj</div>
          </div>

          <div className="history-item win">
            <div className="history-result">
              <span className="result-badge win">Wygrana</span>
            </div>
            <div className="history-mode">
              <span className="mode-icon">👥</span>
              <span>Squad</span>
            </div>
            <div className="history-opponent">Drużyna A vs B</div>
            <div className="history-score">30 - 25</div>
            <div className="history-stats">
              <span>75% celności</span>
            </div>
            <div className="history-rewards">
              <span className="xp-gain">+60 XP</span>
              <span className="pts-gain">+40 pts</span>
            </div>
            <div className="history-time">2 dni temu</div>
          </div>
        </div>
      </Card>
    </main>
  )
}
