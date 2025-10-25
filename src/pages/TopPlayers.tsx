import { Card } from '@shared/ui';
import flashPoint from '@/assets/flash_point.png';

export default function TopPlayers() {
  return (
    <main className="main">
      <Card className="top-players-page">
        <h2>🏆 Najlepsi Gracze Wszech Czasów</h2>
        <p className="page-subtitle">Hall of Fame - Legendy QuizGame</p>

        <div className="podium">
          <div className="podium-item second">
            <div className="podium-avatar">🥈</div>
            <div className="podium-name">QuizMaster99</div>
            <div className="podium-stats">
              <div className="podium-level">Lvl 99</div>
              <div className="podium-points">
                <img src={flashPoint} alt="" className="point-icon" />
                245,680
              </div>
            </div>
            <div className="podium-pillar second-place">
              <span className="podium-rank">2</span>
            </div>
          </div>

          <div className="podium-item first">
            <div className="podium-crown">👑</div>
            <div className="podium-avatar">🏆</div>
            <div className="podium-name">LegendaryBrain</div>
            <div className="podium-stats">
              <div className="podium-level">Lvl 100</div>
              <div className="podium-points">
                <img src={flashPoint} alt="" className="point-icon" />
                389,450
              </div>
            </div>
            <div className="podium-pillar first-place">
              <span className="podium-rank">1</span>
            </div>
          </div>

          <div className="podium-item third">
            <div className="podium-avatar">🥉</div>
            <div className="podium-name">BrainChampion</div>
            <div className="podium-stats">
              <div className="podium-level">Lvl 95</div>
              <div className="podium-points">
                <img src={flashPoint} alt="" className="point-icon" />
                198,320
              </div>
            </div>
            <div className="podium-pillar third-place">
              <span className="podium-rank">3</span>
            </div>
          </div>
        </div>

        <div className="hall-of-fame">
          <h3 className="section-title">Top 10 Legend</h3>
          
          <div className="legend-list">
            {[
              { rank: 4, name: 'ProGamer123', level: 92, points: 176840, avatar: '⭐' },
              { rank: 5, name: 'SmartPlayer', level: 89, points: 165230, avatar: '🎯' },
              { rank: 6, name: 'QuizWhiz', level: 87, points: 152670, avatar: '💡' },
              { rank: 7, name: 'TriviaKing', level: 85, points: 145890, avatar: '👑' },
              { rank: 8, name: 'MindMaster', level: 83, points: 138450, avatar: '🧠' },
              { rank: 9, name: 'GeniePlayer', level: 81, points: 129870, avatar: '🔮' },
              { rank: 10, name: 'WiseGamer', level: 79, points: 121340, avatar: '📚' },
            ].map((player) => (
              <div key={player.rank} className="legend-item">
                <div className="legend-rank">#{player.rank}</div>
                <div className="player-avatar">{player.avatar}</div>
                <div className="legend-info">
                  <div className="legend-name">{player.name}</div>
                  <div className="legend-level">Poziom {player.level}</div>
                </div>
                <div className="legend-points">
                  <img src={flashPoint} alt="" className="point-icon" />
                  {player.points.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="achievements-showcase">
          <h3 className="section-title">Najrzadsze Osiągnięcia</h3>
          <p className="section-desc">Tylko 1% graczy je zdobyło</p>
          
          <div className="rare-achievements-grid">
            <div className="rare-achievement">
              <div className="rare-icon">💎</div>
              <div className="rare-name">Perfekcjonista</div>
              <div className="rare-desc">100 gier z 100% celności</div>
              <div className="rare-owners">Posiadaczy: 23</div>
            </div>

            <div className="rare-achievement">
              <div className="rare-icon">🔥</div>
              <div className="rare-name">Niepokonany</div>
              <div className="rare-desc">50 zwycięstw z rzędu</div>
              <div className="rare-owners">Posiadaczy: 15</div>
            </div>

            <div className="rare-achievement">
              <div className="rare-icon">⚡</div>
              <div className="rare-name">Błyskawica</div>
              <div className="rare-desc">100 pytań &lt;1s każde</div>
              <div className="rare-owners">Posiadaczy: 8</div>
            </div>
          </div>
        </div>
      </Card>
    </main>
  );
}
