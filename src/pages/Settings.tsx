import { Card } from '../components';

export default function Settings() {
  return (
    <main className="main">
      <Card className="settings-page">
        <h2>⚙️ Ustawienia</h2>
        <p className="page-subtitle">Personalizuj swoje doświadczenie w QuizGame</p>

        <div className="settings-section">
          <h3 className="settings-section-title">Profil</h3>
          
          <div className="form-group">
            <label>Nazwa użytkownika</label>
            <input type="text" className="form-input" defaultValue="Gość_8520" />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" className="form-input" placeholder="twoj@email.com" />
          </div>

          <div className="form-group">
            <label>Avatar</label>
            <div className="avatar-selector">
              <div className="avatar-option selected">👤</div>
              <div className="avatar-option">🎮</div>
              <div className="avatar-option">🏆</div>
              <div className="avatar-option">⭐</div>
              <div className="avatar-option">🎯</div>
              <div className="avatar-option">💡</div>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">Rozgrywka</h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-name">Dźwięki</div>
              <div className="setting-desc">Efekty dźwiękowe w grze</div>
            </div>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-name">Muzyka</div>
              <div className="setting-desc">Muzyka w tle</div>
            </div>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-name">Wibracje</div>
              <div className="setting-desc">Wibracje po każdej odpowiedzi</div>
            </div>
            <label className="toggle">
              <input type="checkbox" />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="form-group">
            <label>Czas na odpowiedź</label>
            <select className="form-select">
              <option value="10">10 sekund</option>
              <option value="15" selected>15 sekund (domyślne)</option>
              <option value="20">20 sekund</option>
              <option value="30">30 sekund</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">Powiadomienia</h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-name">Wyzwania</div>
              <div className="setting-desc">Powiadomienia o nowych wyzwaniach</div>
            </div>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-name">Wiadomości</div>
              <div className="setting-desc">Powiadomienia o nowych wiadomościach</div>
            </div>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-name">Osiągnięcia</div>
              <div className="setting-desc">Powiadomienia o nowych osiągnięciach</div>
            </div>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">Prywatność</h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-name">Widoczny online</div>
              <div className="setting-desc">Pokazuj status online znajomym</div>
            </div>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-name">Profil publiczny</div>
              <div className="setting-desc">Pozwól innym oglądać Twoje statystyki</div>
            </div>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn primary">Zapisz zmiany</button>
          <button className="btn-small">Anuluj</button>
        </div>
      </Card>
    </main>
  );
}
