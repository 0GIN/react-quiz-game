import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@features/auth';
import { Card, MaterialIcon, Input, Spinner } from '@shared/ui';
import {
  searchUsers,
  sendFriendRequest,
  getSuggestedFriends,
  type UserSearchResult
} from '@/services/friendService';
import '@/styles/ui.css';
import '@/styles/Friends.css';

export default function FriendSearch() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [suggestedFriends, setSuggestedFriends] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Pobierz propozycje przy wejściu
  useEffect(() => {
    loadSuggestions();
  }, [user]);

  const loadSuggestions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const suggestions = await getSuggestedFriends(user.id, 10);
      setSuggestedFriends(suggestions);
    } catch (err) {
      console.error('Error loading suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!user || !searchTerm.trim()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);

      const results = await searchUsers(searchTerm.trim(), user.id);
      setSearchResults(results);
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Nie udało się wyszukać użytkowników');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (friendId: string) => {
    if (!user) return;

    try {
      await sendFriendRequest(user.id, friendId);
      
      // Aktualizuj status w wynikach wyszukiwania i propozycjach
      setSearchResults(prev =>
        prev.map(u =>
          u.id === friendId
            ? { ...u, friendship_status: 'pending' }
            : u
        )
      );
      
      setSuggestedFriends(prev =>
        prev.map(u =>
          u.id === friendId
            ? { ...u, friendship_status: 'pending' }
            : u
        )
      );

      alert('Zaproszenie wysłane!');
    } catch (err) {
      console.error('Error sending friend request:', err);
      alert('Nie udało się wysłać zaproszenia');
    }
  };

  const getStatusButton = (user: UserSearchResult) => {
    switch (user.friendship_status) {
      case 'accepted':
        return (
          <button className="btn success" disabled>
            <MaterialIcon icon="check_circle" size={20} />
            Znajomy
          </button>
        );
      case 'pending':
        return (
          <button className="btn" disabled>
            <MaterialIcon icon="schedule" size={20} />
            Oczekuje
          </button>
        );
      case 'blocked':
        return (
          <button className="btn danger" disabled>
            <MaterialIcon icon="block" size={20} />
            Zablokowany
          </button>
        );
      default:
        return (
          <button
            className="btn primary"
            onClick={() => handleSendRequest(user.id)}
          >
            <MaterialIcon icon="person_add" size={20} />
            Dodaj
          </button>
        );
    }
  };

  return (
    <main className="main">
      <Card className="friend-search-page">
        <div className="search-header">
          <h2>
            <MaterialIcon icon="search" size={32} />
            Szukaj znajomych
          </h2>
          <button
            className="btn-icon"
            onClick={() => navigate('/friends')}
            title="Powrót do znajomych"
          >
            <MaterialIcon icon="arrow_back" size={24} />
          </button>
        </div>

        <form onSubmit={handleSearch} className="search-form">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Wpisz nazwę użytkownika..."
            className="search-input"
          />
          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? (
              <Spinner size="sm" />
            ) : (
              <>
                <MaterialIcon icon="search" size={20} />
                Szukaj
              </>
            )}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {loading && (
          <div className="loading-state">
            <Spinner />
            <p>Szukam użytkowników...</p>
          </div>
        )}

        {!loading && !hasSearched && suggestedFriends.length > 0 && (
          <div className="search-results">
            <h3 className="section-title">
              <MaterialIcon icon="trending_up" size={24} />
              Propozycje znajomych
              <span className="results-count">({suggestedFriends.length})</span>
            </h3>

            <div className="user-search-list">
              {suggestedFriends.map((searchUser) => (
                <div key={searchUser.id} className="user-search-item">
                  <div 
                    className="user-avatar"
                    onClick={() => navigate(`/profile/${searchUser.id}`)}
                    style={{ 
                      cursor: 'pointer',
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '28px',
                      background: '#0f0f23',
                      border: '2px solid #00E5FF'
                    }}
                    title={`Zobacz profil ${searchUser.username}`}
                  >
                    {searchUser.avatar_url || '😀'}
                  </div>

                  <div className="user-info">
                    <div 
                      className="user-name"
                      onClick={() => navigate(`/profile/${searchUser.id}`)}
                      style={{ cursor: 'pointer' }}
                      title={`Zobacz profil ${searchUser.username}`}
                    >
                      {searchUser.username}
                    </div>
                    <div className="user-stats">
                      <span>
                        <MaterialIcon icon="star" size={16} />
                        Level {searchUser.level}
                      </span>
                      <span>•</span>
                      <span>
                        <MaterialIcon icon="bolt" size={16} />
                        {searchUser.flash_points.toLocaleString()} FP
                      </span>
                      <span>•</span>
                      <span>
                        <MaterialIcon icon="sports_esports" size={16} />
                        {searchUser.total_games_played} gier
                      </span>
                    </div>
                  </div>

                  <div className="user-actions">
                    {getStatusButton(searchUser)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && hasSearched && (
          <div className="search-results">
            <h3 className="section-title">
              Wyniki wyszukiwania
              {searchResults.length > 0 && (
                <span className="results-count">({searchResults.length})</span>
              )}
            </h3>

            {searchResults.length === 0 ? (
              <div className="empty-state">
                <MaterialIcon icon="person_search" size={64} />
                <h3>Nie znaleziono użytkowników</h3>
                <p>
                  Spróbuj użyć innej nazwy użytkownika lub sprawdź pisownię.
                </p>
              </div>
            ) : (
              <div className="user-search-list">
                {searchResults.map((searchUser) => (
                  <div key={searchUser.id} className="user-search-item">
                    <div 
                      className="user-avatar"
                      onClick={() => navigate(`/profile/${searchUser.id}`)}
                      style={{ 
                        cursor: 'pointer',
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px',
                        background: '#0f0f23',
                        border: '2px solid #00E5FF'
                      }}
                      title={`Zobacz profil ${searchUser.username}`}
                    >
                      {searchUser.avatar_url || '😀'}
                    </div>

                    <div className="user-info">
                      <div 
                        className="user-name"
                        onClick={() => navigate(`/profile/${searchUser.id}`)}
                        style={{ cursor: 'pointer' }}
                        title={`Zobacz profil ${searchUser.username}`}
                      >
                        {searchUser.username}
                      </div>
                      <div className="user-stats">
                        <span>
                          <MaterialIcon icon="star" size={16} />
                          Level {searchUser.level}
                        </span>
                        <span>•</span>
                        <span>
                          <MaterialIcon icon="bolt" size={16} />
                          {searchUser.flash_points.toLocaleString()} FP
                        </span>
                        <span>•</span>
                        <span>
                          <MaterialIcon icon="sports_esports" size={16} />
                          {searchUser.total_games_played} gier
                        </span>
                      </div>
                    </div>

                    <div className="user-actions">
                      {getStatusButton(searchUser)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!hasSearched && !loading && (
          <div className="empty-state">
            <MaterialIcon icon="person_search" size={64} />
            <h3>Wyszukaj znajomych</h3>
            <p>
              Wprowadź nazwę użytkownika w polu powyżej, aby znaleźć nowych znajomych.
            </p>
          </div>
        )}
      </Card>
    </main>
  );
}
