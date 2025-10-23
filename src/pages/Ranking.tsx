import '../styles/ui.css'
import { Card } from '../components'

export default function Ranking() {
  return (
    <main className="main" role="main">
      <Card title="🏆 Ranking Globalny" className="ranking-page">
        <div className="ranking-tabs">
          <button className="ranking-tab active">Globalny</button>
          <button className="ranking-tab">Znajomi</button>
          <button className="ranking-tab">Tygodniowy</button>
          <button className="ranking-tab">Miesięczny</button>
        </div>

        <div className="ranking-table">
          <div className="ranking-header">
            <div className="rank-col">#</div>
            <div className="player-col">Gracz</div>
            <div className="level-col">Poziom</div>
            <div className="points-col">Punkty</div>
            <div className="games-col">Gry</div>
            <div className="winrate-col">Wygrane</div>
          </div>

          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rank) => (
            <div key={rank} className="ranking-row">
              <div className="rank-col">
                <span className={`rank-badge ${rank <= 3 ? 'top-3' : ''}`}>
                  {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                </span>
              </div>
              <div className="player-col">
                <div className="player-info">
                  <div className="player-avatar">👤</div>
                  <span>Gracz{rank}</span>
                </div>
              </div>
              <div className="level-col">Level {15 - rank}</div>
              <div className="points-col highlight">{(5000 - rank * 300).toLocaleString()}</div>
              <div className="games-col">{200 - rank * 10}</div>
              <div className="winrate-col">{95 - rank}%</div>
            </div>
          ))}
        </div>
      </Card>
    </main>
  )
}
