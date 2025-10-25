import '@/styles/ui.css'
import { Card } from '@shared/ui'

export default function Friends() {
  return (
    <main className="main" role="main">
      <Card title="👥 Moi Znajomi" className="friends-page">
        <div className="friends-header">
          <button className="btn primary">➕ Dodaj znajomego</button>
          <div className="friends-count">Znajomi: 12</div>
        </div>

        <div className="friends-list">
          <div className="friend-item online">
            <div className="friend-avatar">👤</div>
            <div className="friend-info">
              <div className="friend-name">Jan Kowalski</div>
              <div className="friend-status">🟢 Online - W grze</div>
            </div>
            <div className="friend-stats">
              <span>Level 15</span>
              <span>2,450 pts</span>
            </div>
            <div className="friend-actions">
              <button className="btn-small primary">Wyzwij</button>
              <button className="btn-icon">💬</button>
            </div>
          </div>

          <div className="friend-item online">
            <div className="friend-avatar">👤</div>
            <div className="friend-info">
              <div className="friend-name">Anna Nowak</div>
              <div className="friend-status">🟢 Online</div>
            </div>
            <div className="friend-stats">
              <span>Level 12</span>
              <span>1,890 pts</span>
            </div>
            <div className="friend-actions">
              <button className="btn-small primary">Wyzwij</button>
              <button className="btn-icon">💬</button>
            </div>
          </div>

          <div className="friend-item">
            <div className="friend-avatar">👤</div>
            <div className="friend-info">
              <div className="friend-name">Piotr Wiśniewski</div>
              <div className="friend-status">⚫ Offline - 2h temu</div>
            </div>
            <div className="friend-stats">
              <span>Level 18</span>
              <span>3,120 pts</span>
            </div>
            <div className="friend-actions">
              <button className="btn-small" disabled>Offline</button>
              <button className="btn-icon">💬</button>
            </div>
          </div>
        </div>
      </Card>
    </main>
  )
}
