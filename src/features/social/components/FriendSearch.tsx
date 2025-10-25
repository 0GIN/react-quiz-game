import { Card } from '@shared/ui';

export default function FriendSearch() {
  return (
    <main className="main">
      <Card className="friend-search-page">
        <h2>🔍 Szukaj Znajomych</h2>
        
        <div className="search-box">
          <input 
            type="text" 
            className="form-input" 
            placeholder="Wpisz nazwę użytkownika..."
          />
          <button className="btn primary">Szukaj</button>
        </div>

        <div className="search-results">
          <h3 className="section-title">Wyniki wyszukiwania</h3>
          
          <div className="user-search-list">
            <div className="user-search-item">
              <div className="friend-avatar">👤</div>
              <div className="friend-info">
                <div className="friend-name">ProGamer123</div>
                <div className="friend-stats">
                  <div>Poziom: 42</div>
                  <div>Punkty: 12,840</div>
                </div>
              </div>
              <button className="btn-small primary">Dodaj do znajomych</button>
            </div>

            <div className="user-search-item">
              <div className="friend-avatar">🎮</div>
              <div className="friend-info">
                <div className="friend-name">QuizMaster99</div>
                <div className="friend-stats">
                  <div>Poziom: 38</div>
                  <div>Punkty: 9,560</div>
                </div>
              </div>
              <button className="btn-small primary">Dodaj do znajomych</button>
            </div>

            <div className="user-search-item">
              <div className="friend-avatar">🏆</div>
              <div className="friend-info">
                <div className="friend-name">BrainChampion</div>
                <div className="friend-stats">
                  <div>Poziom: 55</div>
                  <div>Punkty: 18,230</div>
                </div>
              </div>
              <button className="btn-small accent">Zaproszenie wysłane</button>
            </div>

            <div className="user-search-item">
              <div className="friend-avatar">⭐</div>
              <div className="friend-info">
                <div className="friend-name">TriviaKing</div>
                <div className="friend-stats">
                  <div>Poziom: 29</div>
                  <div>Punkty: 6,420</div>
                </div>
              </div>
              <button className="btn-small primary">Dodaj do znajomych</button>
            </div>
          </div>
        </div>

        <div className="suggested-friends">
          <h3 className="section-title">Sugerowane</h3>
          <p className="section-desc">Gracze o podobnym poziomie</p>
          
          <div className="user-search-list">
            <div className="user-search-item">
              <div className="friend-avatar">🎯</div>
              <div className="friend-info">
                <div className="friend-name">SmartPlayer</div>
                <div className="friend-stats">
                  <div>Poziom: 35</div>
                  <div>Punkty: 8,650</div>
                </div>
              </div>
              <button className="btn-small primary">Dodaj do znajomych</button>
            </div>

            <div className="user-search-item">
              <div className="friend-avatar">💡</div>
              <div className="friend-info">
                <div className="friend-name">QuizWhiz</div>
                <div className="friend-stats">
                  <div>Poziom: 33</div>
                  <div>Punkty: 7,890</div>
                </div>
              </div>
              <button className="btn-small primary">Dodaj do znajomych</button>
            </div>
          </div>
        </div>
      </Card>
    </main>
  );
}
