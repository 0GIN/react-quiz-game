import { Card } from '@shared/ui';

export default function Chat() {
  return (
    <main className="main">
      <div className="chat-layout">
        <Card className="chat-sidebar-card">
          <h3 className="chat-sidebar-title">Konwersacje</h3>
          
          <div className="chat-list">
            <div className="chat-item active">
              <div className="friend-avatar small">
                <span className="online-indicator"></span>
                👤
              </div>
              <div className="chat-item-info">
                <div className="chat-item-name">ProGamer123</div>
                <div className="chat-item-preview">Hej, gramy duela?</div>
              </div>
              <div className="chat-item-meta">
                <div className="chat-time">12:34</div>
                <div className="unread-badge">2</div>
              </div>
            </div>

            <div className="chat-item">
              <div className="friend-avatar small">
                <span className="online-indicator"></span>
                🎮
              </div>
              <div className="chat-item-info">
                <div className="chat-item-name">QuizMaster99</div>
                <div className="chat-item-preview">Gratulacje zwycięstwa!</div>
              </div>
              <div className="chat-item-meta">
                <div className="chat-time">11:20</div>
              </div>
            </div>

            <div className="chat-item">
              <div className="friend-avatar small">
                🏆
              </div>
              <div className="chat-item-info">
                <div className="chat-item-name">BrainChampion</div>
                <div className="chat-item-preview">Do zobaczenia później</div>
              </div>
              <div className="chat-item-meta">
                <div className="chat-time">Wczoraj</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="chat-main-card">
          <div className="chat-header">
            <div className="friend-avatar small">
              <span className="online-indicator"></span>
              👤
            </div>
            <div>
              <div className="chat-header-name">ProGamer123</div>
              <div className="chat-header-status">Online</div>
            </div>
          </div>

          <div className="chat-messages">
            <div className="message-group them">
              <div className="friend-avatar small">👤</div>
              <div className="message-content">
                <div className="message-bubble">Hej! Jak się masz?</div>
                <div className="message-time">12:30</div>
              </div>
            </div>

            <div className="message-group me">
              <div className="message-content">
                <div className="message-bubble">Świetnie! Ty?</div>
                <div className="message-time">12:31</div>
              </div>
            </div>

            <div className="message-group them">
              <div className="friend-avatar small">👤</div>
              <div className="message-content">
                <div className="message-bubble">Super! Masz ochotę na duela?</div>
                <div className="message-time">12:32</div>
              </div>
            </div>

            <div className="message-group me">
              <div className="message-content">
                <div className="message-bubble">Jasne, dawaj!</div>
                <div className="message-time">12:33</div>
              </div>
            </div>

            <div className="message-group them">
              <div className="friend-avatar small">👤</div>
              <div className="message-content">
                <div className="message-bubble">Wysyłam wyzwanie 🎮</div>
                <div className="message-time">12:34</div>
              </div>
            </div>
          </div>

          <div className="chat-input-area">
            <input 
              type="text" 
              className="chat-input" 
              placeholder="Napisz wiadomość..."
            />
            <button className="btn-icon send">📤</button>
          </div>
        </Card>
      </div>
    </main>
  );
}
