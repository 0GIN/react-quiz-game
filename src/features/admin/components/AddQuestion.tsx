import '@/styles/ui.css'
import { Card } from '@shared/ui'

export default function AddQuestion() {
  return (
    <main className="main" role="main">
      <Card title="➕ Dodaj Pytanie" className="add-question-page">
        <p className="page-subtitle">Pomóż nam rozwijać bazę pytań! Twoje pytania po zatwierdzeniu będą dostępne dla wszystkich graczy.</p>

        <form className="question-form">
          <div className="form-group">
            <label htmlFor="category">Kategoria *</label>
            <select id="category" className="form-select" required>
              <option value="">Wybierz kategorię...</option>
              <option value="geografia">🌍 Geografia</option>
              <option value="historia">📚 Historia</option>
              <option value="nauka">🔬 Nauka</option>
              <option value="sport">⚽ Sport</option>
              <option value="kultura">🎭 Kultura</option>
              <option value="technologia">💻 Technologia</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="difficulty">Poziom trudności *</label>
            <select id="difficulty" className="form-select" required>
              <option value="">Wybierz poziom...</option>
              <option value="easy">🟢 Łatwy</option>
              <option value="medium">🟡 Średni</option>
              <option value="hard">🔴 Trudny</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="question">Treść pytania *</label>
            <textarea 
              id="question" 
              className="form-textarea" 
              rows={3}
              placeholder="Wpisz treść pytania..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="correct">Poprawna odpowiedź *</label>
            <input 
              type="text" 
              id="correct" 
              className="form-input correct" 
              placeholder="Wpisz poprawną odpowiedź..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="wrong1">Błędna odpowiedź #1 *</label>
            <input 
              type="text" 
              id="wrong1" 
              className="form-input" 
              placeholder="Wpisz błędną odpowiedź..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="wrong2">Błędna odpowiedź #2 *</label>
            <input 
              type="text" 
              id="wrong2" 
              className="form-input" 
              placeholder="Wpisz błędną odpowiedź..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="wrong3">Błędna odpowiedź #3 *</label>
            <input 
              type="text" 
              id="wrong3" 
              className="form-input" 
              placeholder="Wpisz błędną odpowiedź..."
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn primary">Wyślij pytanie</button>
            <button type="reset" className="btn">Wyczyść</button>
          </div>

          <div className="form-note">
            <strong>Uwaga:</strong> Wszystkie pytania przechodzą proces weryfikacji. Za zatwierdzone pytania otrzymasz bonus punktów!
          </div>
        </form>
      </Card>
    </main>
  )
}
