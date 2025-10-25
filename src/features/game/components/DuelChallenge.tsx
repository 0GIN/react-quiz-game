/**
 * @fileoverview Wysyłanie wyzwania do pojedynku
 * 
 * Pozwala wybrać znajomego i wysłać mu wyzwanie do Duel
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@features/auth';
import { Card, MaterialIcon, Spinner } from '@shared/ui';
import { getFriends, type Friend } from '@/services/friendService';
import { createDuelChallenge } from '@/services/duelService';
import { getDisplayAvatar } from '@/utils/avatar';
import '@/styles/ui.css';

export default function DuelChallenge() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      loadFriends();
    }
  }, [user]);

  const loadFriends = async () => {
    if (!user) return;

    try {
      const friendsList = await getFriends(user.id);
      setFriends(friendsList);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendChallenge = async () => {
    if (!user || !selectedFriendId) return;

    const selectedFriend = friends.find(f => f.friend_id === selectedFriendId);
    if (!selectedFriend) return;

    setSending(true);
    try {
      const result = await createDuelChallenge(
        user.id,
        selectedFriend.friend_id,
        message || undefined
      );

      if (result.success) {
        // Wróć do lobby
        navigate('/duel');
      } else {
        alert(result.error || 'Nie udało się wysłać wyzwania');
      }
    } catch (error) {
      console.error('Error sending challenge:', error);
      alert('Wystąpił błąd podczas wysyłania wyzwania');
    } finally {
      setSending(false);
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.friend_data.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <main className="main">
        <div style={{ gridColumn: 'span 12' }}>
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Spinner />
              <p style={{ color: '#B0B0B0', marginTop: '16px' }}>Ładowanie znajomych...</p>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="main">
      <div style={{ gridColumn: 'span 12' }}>
        <Card>
          <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
              <button
                onClick={() => navigate('/duel')}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#B0B0B0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px',
                }}
              >
                <MaterialIcon icon="arrow_back" size={20} />
                Powrót
              </button>

              <h1 style={{ fontSize: '28px', color: '#E0E0E0', marginBottom: '8px' }}>
                ⚔️ Wyślij Wyzwanie
              </h1>
              <p style={{ color: '#B0B0B0', fontSize: '14px' }}>
                Wybierz znajomego i rzuć mu wyzwanie do pojedynku!
              </p>
            </div>

            {friends.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <MaterialIcon icon="group_off" size={64} style={{ opacity: 0.3 }} />
                <p style={{ color: '#B0B0B0', marginTop: '16px' }}>
                  Nie masz jeszcze znajomych
                </p>
                <button
                  onClick={() => navigate('/friends')}
                  style={{
                    marginTop: '16px',
                    padding: '10px 20px',
                    background: 'rgba(0,229,255,0.1)',
                    border: '1px solid rgba(0,229,255,0.3)',
                    borderRadius: '8px',
                    color: '#00E5FF',
                    cursor: 'pointer',
                  }}
                >
                  Dodaj znajomych
                </button>
              </div>
            ) : (
              <div>
                {/* Wyszukiwarka */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ position: 'relative' }}>
                    <MaterialIcon 
                      icon="search" 
                      size={20} 
                      style={{ 
                        position: 'absolute', 
                        left: '12px', 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        color: '#B0B0B0'
                      }} 
                    />
                    <input
                      type="text"
                      placeholder="Szukaj znajomego..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 12px 12px 40px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: '#E0E0E0',
                        fontSize: '14px',
                      }}
                    />
                  </div>
                </div>

                {/* Lista znajomych */}
                <div style={{ marginBottom: '24px', maxHeight: '400px', overflowY: 'auto' }}>
                  {filteredFriends.map(friend => (
                    <div
                      key={friend.id}
                      onClick={() => setSelectedFriendId(friend.friend_id)}
                      style={{
                        padding: '16px',
                        marginBottom: '8px',
                        background: selectedFriendId === friend.friend_id
                          ? 'rgba(0,229,255,0.1)'
                          : 'rgba(255,255,255,0.02)',
                        border: selectedFriendId === friend.friend_id
                          ? '2px solid rgba(0,229,255,0.5)'
                          : '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                      onMouseEnter={(e) => {
                        if (selectedFriendId !== friend.friend_id) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedFriendId !== friend.friend_id) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                        }
                      }}
                    >
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'rgba(0,229,255,0.1)',
                        border: '2px solid rgba(0,229,255,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                      }}>
                        {getDisplayAvatar(friend.friend_data.avatar_url)}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#E0E0E0', fontWeight: 600, marginBottom: '4px' }}>
                          {friend.friend_data.username}
                        </div>
                        <div style={{ color: '#B0B0B0', fontSize: '13px' }}>
                          Level {friend.friend_data.level} • {friend.friend_data.flash_points} FP
                        </div>
                      </div>

                      {selectedFriendId === friend.friend_id && (
                        <MaterialIcon icon="check_circle" size={24} style={{ color: '#00E5FF' }} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Wiadomość opcjonalna */}
                {selectedFriendId && (
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ 
                      display: 'block', 
                      color: '#E0E0E0', 
                      marginBottom: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}>
                      Wiadomość (opcjonalna)
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Np. 'Czas pokazać kto tu rządzi! 😎'"
                      maxLength={100}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: '#E0E0E0',
                        fontSize: '14px',
                        resize: 'none',
                      }}
                    />
                    <div style={{ 
                      textAlign: 'right', 
                      color: '#888', 
                      fontSize: '12px',
                      marginTop: '4px',
                    }}>
                      {message.length}/100
                    </div>
                  </div>
                )}

                {/* Przyciski */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => navigate('/duel')}
                    disabled={sending}
                    style={{
                      padding: '12px 24px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#B0B0B0',
                      fontWeight: 600,
                      cursor: sending ? 'not-allowed' : 'pointer',
                      opacity: sending ? 0.5 : 1,
                    }}
                  >
                    Anuluj
                  </button>
                  <button
                    onClick={handleSendChallenge}
                    disabled={!selectedFriendId || sending}
                    style={{
                      padding: '12px 24px',
                      background: selectedFriendId && !sending
                        ? 'linear-gradient(135deg, #00E5FF 0%, #00B8D4 100%)'
                        : 'rgba(255,255,255,0.1)',
                      border: 'none',
                      borderRadius: '12px',
                      color: selectedFriendId && !sending ? '#0A0A1A' : '#666',
                      fontWeight: 600,
                      cursor: selectedFriendId && !sending ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    {sending ? (
                      <>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid #666',
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          animation: 'spin 0.6s linear infinite',
                        }} />
                        Wysyłanie...
                      </>
                    ) : (
                      <>
                        <MaterialIcon icon="send" size={20} />
                        Wyślij Wyzwanie
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}
