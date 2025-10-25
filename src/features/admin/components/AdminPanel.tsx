import { Card } from '@shared/ui';

export default function AdminPanel() {
  return (
    <main className="main">
      <Card className="admin-page">
        <h2>🛡️ Panel Admina</h2>
        <p className="page-subtitle">Zarządzanie platformą QuizGame</p>

        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-icon">👥</div>
            <div className="admin-stat-value">15,482</div>
            <div className="admin-stat-label">Użytkowników</div>
            <div className="admin-stat-change positive">+234 dziś</div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon">🎮</div>
            <div className="admin-stat-value">89,234</div>
            <div className="admin-stat-label">Gier rozegranych</div>
            <div className="admin-stat-change positive">+1,523 dziś</div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon">❓</div>
            <div className="admin-stat-value">3,847</div>
            <div className="admin-stat-label">Pytań w bazie</div>
            <div className="admin-stat-change positive">+12 dziś</div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon">⚠️</div>
            <div className="admin-stat-value">23</div>
            <div className="admin-stat-label">Zgłoszeń</div>
            <div className="admin-stat-change negative">Wymaga akcji</div>
          </div>
        </div>

        <div className="admin-section">
          <h3 className="admin-section-title">Moderacja pytań</h3>
          <p className="section-desc">Pytania oczekujące na zatwierdzenie</p>
          
          <div className="pending-questions">
            <div className="pending-question-item">
              <div className="pending-question-header">
                <div className="pending-author">
                  <span className="author-avatar">👤</span>
                  <span className="author-name">ProGamer123</span>
                </div>
                <div className="pending-category">Historia</div>
              </div>
              <div className="pending-question-text">
                W którym roku odbyła się bitwa pod Grunwaldem?
              </div>
              <div className="pending-answers">
                <div className="pending-answer correct">1410 ✓</div>
                <div className="pending-answer">1415</div>
                <div className="pending-answer">1420</div>
                <div className="pending-answer">1400</div>
              </div>
              <div className="pending-actions">
                <button className="btn-small primary">✓ Zatwierdź</button>
                <button className="btn-small">✎ Edytuj</button>
                <button className="btn-small">✗ Odrzuć</button>
              </div>
            </div>

            <div className="pending-question-item">
              <div className="pending-question-header">
                <div className="pending-author">
                  <span className="author-avatar">🎮</span>
                  <span className="author-name">QuizMaster99</span>
                </div>
                <div className="pending-category">Nauka</div>
              </div>
              <div className="pending-question-text">
                Jaki jest symbol chemiczny złota?
              </div>
              <div className="pending-answers">
                <div className="pending-answer correct">Au ✓</div>
                <div className="pending-answer">Ag</div>
                <div className="pending-answer">Fe</div>
                <div className="pending-answer">Zn</div>
              </div>
              <div className="pending-actions">
                <button className="btn-small primary">✓ Zatwierdź</button>
                <button className="btn-small">✎ Edytuj</button>
                <button className="btn-small">✗ Odrzuć</button>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-section">
          <h3 className="admin-section-title">Zgłoszenia</h3>
          
          <div className="reports-list">
            <div className="report-item">
              <div className="report-icon">⚠️</div>
              <div className="report-content">
                <div className="report-title">Niewłaściwa nazwa użytkownika</div>
                <div className="report-desc">Zgłoszenie: Użytkownik "BadWord123" ma obraźliwą nazwę</div>
                <div className="report-meta">
                  <span>Zgłoszone przez: SafePlayer</span>
                  <span>15 min temu</span>
                </div>
              </div>
              <div className="report-actions">
                <button className="btn-small primary">Rozpatrz</button>
              </div>
            </div>

            <div className="report-item">
              <div className="report-icon">❓</div>
              <div className="report-content">
                <div className="report-title">Błędne pytanie</div>
                <div className="report-desc">Pytanie #2847 ma nieprawidłową poprawną odpowiedź</div>
                <div className="report-meta">
                  <span>Zgłoszone przez: SmartPlayer</span>
                  <span>1 godz. temu</span>
                </div>
              </div>
              <div className="report-actions">
                <button className="btn-small primary">Rozpatrz</button>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-section">
          <h3 className="admin-section-title">Szybkie akcje</h3>
          
          <div className="admin-quick-actions">
            <button className="admin-action-btn">
              <span className="admin-action-icon">➕</span>
              <span className="admin-action-label">Dodaj pytanie</span>
            </button>
            <button className="admin-action-btn">
              <span className="admin-action-icon">📢</span>
              <span className="admin-action-label">Wyślij ogłoszenie</span>
            </button>
            <button className="admin-action-btn">
              <span className="admin-action-icon">🏆</span>
              <span className="admin-action-label">Zarządzaj eventami</span>
            </button>
            <button className="admin-action-btn">
              <span className="admin-action-icon">📊</span>
              <span className="admin-action-label">Raporty</span>
            </button>
          </div>
        </div>
      </Card>
    </main>
  );
}
