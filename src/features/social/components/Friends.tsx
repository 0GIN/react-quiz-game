import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@features/auth';
import { Card, MaterialIcon, Spinner } from '@shared/ui';
import {
  getFriends,
  getPendingRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  isUserOnline,
  formatLastSeen,
  type Friend,
  type FriendRequest
} from '@/services/friendService';
import '@/styles/ui.css';
import '@/styles/Friends.css';

export default function Friends() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const [friendsData, requestsData] = await Promise.all([
        getFriends(user.id),
        getPendingRequests(user.id)
      ]);

      setFriends(friendsData);
      setPendingRequests(requestsData);
    } catch (err) {
      console.error('Error loading friends data:', err);
      setError('Nie udało się załadować danych znajomych');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      await loadData(); // Odśwież dane
    } catch (err) {
      console.error('Error accepting request:', err);
      alert('Nie udało się zaakceptować zaproszenia');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId);
      await loadData(); // Odśwież dane
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert('Nie udało się odrzucić zaproszenia');
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!user) return;
    
    if (!confirm('Czy na pewno chcesz usunąć tego znajomego?')) {
      return;
    }

    try {
      await removeFriend(user.id, friendId);
      await loadData(); // Odśwież dane
    } catch (err) {
      console.error('Error removing friend:', err);
      alert('Nie udało się usunąć znajomego');
    }
  };

  const handleAddFriend = () => {
    navigate('/friend-search');
  };

  const handleChallengeFriend = (friendId: string) => {
    // TODO: Implementacja wyzwania do gry
    console.log('Challenge friend:', friendId);
    alert('Funkcja wyzwania będzie wkrótce dostępna!');
  };

  const handleMessageFriend = (friendId: string) => {
    navigate('/chat', { state: { userId: friendId } });
  };

  if (loading) {
    return (
      <main className="main" role="main">
        <Card title="Znajomi" className="friends-page">
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Spinner />
          </div>
        </Card>
      </main>
    );
  }

  if (error) {
    return (
      <main className="main" role="main">
        <Card title="Znajomi" className="friends-page">
          <div className="error-message">{error}</div>
          <button onClick={loadData} className="btn primary">Spróbuj ponownie</button>
        </Card>
      </main>
    );
  }

  return (
    <main className="main" role="main">
      <Card className="friends-page">
        <div className="friends-header">
          <h2 className="friends-title">
            <MaterialIcon icon="groups" size={32} />
            Znajomi
          </h2>
          <button className="btn primary" onClick={handleAddFriend}>
            <MaterialIcon icon="person_add" size={20} />
            Dodaj znajomego
          </button>
        </div>

        {/* Tabs */}
        <div className="friends-tabs">
          <button
            className={`tab-button ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveTab('friends')}
          >
            <MaterialIcon icon="people" size={20} />
            Moi znajomi ({friends.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <MaterialIcon icon="mail" size={20} />
            Zaproszenia ({pendingRequests.length})
          </button>
        </div>

        {/* Friends List */}
        {activeTab === 'friends' && (
          <div className="friends-list">
            {friends.length === 0 ? (
              <div className="empty-state">
                <MaterialIcon icon="person_off" size={64} />
                <h3>Brak znajomych</h3>
                <p>Dodaj pierwszego znajomego, aby rozpocząć!</p>
                <button className="btn primary" onClick={handleAddFriend}>
                  <MaterialIcon icon="person_add" size={20} />
                  Szukaj znajomych
                </button>
              </div>
            ) : (
              friends.map((friend) => {
                const online = isUserOnline(friend.friend_data.last_login);
                const lastSeen = formatLastSeen(friend.friend_data.last_login);

                return (
                  <div
                    key={friend.id}
                    className={`friend-item ${online ? 'online' : ''}`}
                  >
                    <div 
                      className="friend-avatar"
                      onClick={() => navigate(`/profile/${friend.friend_id}`)}
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
                        border: '2px solid #00E5FF',
                        position: 'relative'
                      }}
                      title={`Zobacz profil ${friend.friend_data.username}`}
                    >
                      {friend.friend_data.avatar_url || '😀'}
                      {online && <span className="online-badge"></span>}
                    </div>

                    <div className="friend-info">
                      <div 
                        className="friend-name"
                        onClick={() => navigate(`/profile/${friend.friend_id}`)}
                        style={{ cursor: 'pointer' }}
                        title={`Zobacz profil ${friend.friend_data.username}`}
                      >
                        {friend.friend_data.username}
                      </div>
                      <div className="friend-status">
                        <MaterialIcon
                          icon={online ? 'circle' : 'circle'}
                          size={12}
                          style={{ color: online ? '#4ade80' : '#6b7280' }}
                        />
                        {lastSeen}
                      </div>
                    </div>

                    <div className="friend-stats">
                      <span>
                        <MaterialIcon icon="star" size={16} />
                        Level {friend.friend_data.level}
                      </span>
                      <span>
                        <MaterialIcon icon="bolt" size={16} />
                        {friend.friend_data.flash_points.toLocaleString()} FP
                      </span>
                    </div>

                    <div className="friend-actions">
                      <button
                        className="btn-icon"
                        onClick={() => handleChallengeFriend(friend.friend_id)}
                        title="Wyzwij do gry"
                      >
                        <MaterialIcon icon="swords" size={20} />
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleMessageFriend(friend.friend_id)}
                        title="Wyślij wiadomość"
                      >
                        <MaterialIcon icon="chat" size={20} />
                      </button>
                      <button
                        className="btn-icon danger"
                        onClick={() => handleRemoveFriend(friend.friend_id)}
                        title="Usuń znajomego"
                      >
                        <MaterialIcon icon="person_remove" size={20} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Pending Requests */}
        {activeTab === 'requests' && (
          <div className="requests-list">
            {pendingRequests.length === 0 ? (
              <div className="empty-state">
                <MaterialIcon icon="inbox" size={64} />
                <h3>Brak zaproszeń</h3>
                <p>Nie masz żadnych oczekujących zaproszeń do znajomych.</p>
              </div>
            ) : (
              pendingRequests.map((request) => (
                <div key={request.id} className="request-item">
                  <div 
                    className="friend-avatar"
                    style={{
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
                  >
                    {request.requester_data.avatar_url || '😀'}
                  </div>

                  <div className="friend-info">
                    <div className="friend-name">
                      {request.requester_data.username}
                    </div>
                    <div className="friend-meta">
                      <span>Level {request.requester_data.level}</span>
                      <span>•</span>
                      <span>{request.requester_data.flash_points.toLocaleString()} FP</span>
                    </div>
                    <div className="request-time">
                      <MaterialIcon icon="schedule" size={14} />
                      {new Date(request.requested_at).toLocaleDateString('pl-PL')}
                    </div>
                  </div>

                  <div className="request-actions">
                    <button
                      className="btn success"
                      onClick={() => handleAcceptRequest(request.id)}
                    >
                      <MaterialIcon icon="check" size={20} />
                      Akceptuj
                    </button>
                    <button
                      className="btn danger"
                      onClick={() => handleRejectRequest(request.id)}
                    >
                      <MaterialIcon icon="close" size={20} />
                      Odrzuć
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </Card>
    </main>
  );
}
