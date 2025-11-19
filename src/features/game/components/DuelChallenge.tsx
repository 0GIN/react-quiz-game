/**
 * @fileoverview Wysyłanie wyzwania do pojedynku
 * 
 * Pozwala wybrać znajomego i wysłać mu wyzwanie do Duel
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@features/auth';
import { Card, MaterialIcon, Spinner } from '@shared/ui';
import { getFriends, type Friend } from '@/services/friendService';
import { createDuelChallenge } from '@/services/duelService';
import { getCategories } from '@/services/questionService';
import { getDisplayAvatar } from '@/utils/avatar';
import type { Category } from '@/types';
import '@/styles/ui.css';

export default function DuelChallenge() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMasterMode = location.state?.isMaster || false; // Określamy czy to Master czy Duel
  const preselectedFriendId = location.state?.preselectedFriendId; // Preselekcja z listy znajomych
  
  const [friends, setFriends] = useState<Friend[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(preselectedFriendId || null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [friendsList, categoriesList] = await Promise.all([
        getFriends(user.id),
        isMasterMode ? getCategories() : Promise.resolve([]),
      ]);
      setFriends(friendsList);
      setCategories(categoriesList);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendChallenge = async () => {
    if (!user || !selectedFriendId) return;
    
    // Dla Master Mode wymagamy wyboru kategorii
    if (isMasterMode && !selectedCategoryId) {
      alert('Wybierz kategorię dla pojedynku Master');
      return;
    }

    const selectedFriend = friends.find(f => f.friend_id === selectedFriendId);
    if (!selectedFriend) {
      alert('Nie znaleziono wybranego znajomego');
      return;
    }

    // Walidacja: nie można wysłać wyzwania do samego siebie
    if (selectedFriend.friend_id === user.id) {
      alert('Nie możesz wysłać wyzwania do samego siebie!');
      return;
    }

    setSending(true);
    try {
      console.log('🎯 Sending challenge:', {
        from: user.id,
        to: selectedFriend.friend_id,
        isMaster: isMasterMode,
        category: selectedCategoryId,
      });

      const result = await createDuelChallenge(
        user.id,
        selectedFriend.friend_id,
        message || undefined,
        isMasterMode ? selectedCategoryId : undefined
      );

      if (result.success) {
        // Wróć do odpowiedniego lobby
        navigate(isMasterMode ? '/master' : '/duel');
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
                onClick={() => navigate(isMasterMode ? '/master' : '/duel')}
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

              <h1 style={{ fontSize: '28px', color: isMasterMode ? '#FFD700' : '#E0E0E0', marginBottom: '8px' }}>
                {isMasterMode ? '👑 Wyślij Wyzwanie Master' : '⚔️ Wyślij Wyzwanie'}
              </h1>
              <p style={{ color: '#B0B0B0', fontSize: '14px' }}>
                {isMasterMode 
                  ? 'Wybierz kategorię i znajomego do pojedynku Master!' 
                  : 'Wybierz znajomego i rzuć mu wyzwanie do pojedynku!'}
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
                {/* Wybór kategorii (tylko dla Master) */}
                {isMasterMode && (
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ color: '#FFD700', fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
                      1️⃣ Wybierz kategorię
                    </h3>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                      gap: '12px',
                    }}>
                      {categories.map(category => (
                        <div
                          key={category.id}
                          onClick={() => setSelectedCategoryId(category.id)}
                          style={{
                            padding: '16px',
                            background: selectedCategoryId === category.id
                              ? 'rgba(255,215,0,0.15)'
                              : 'rgba(255,255,255,0.03)',
                            border: selectedCategoryId === category.id
                              ? '2px solid rgba(255,215,0,0.5)'
                              : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            if (selectedCategoryId !== category.id) {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedCategoryId !== category.id) {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                            }
                          }}
                        >
                          <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                            {category.icon_emoji}
                          </div>
                          <div style={{ 
                            color: selectedCategoryId === category.id ? '#FFD700' : '#E0E0E0', 
                            fontSize: '13px',
                            fontWeight: 600,
                          }}>
                            {category.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Wyszukiwarka */}
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ 
                    color: isMasterMode ? '#FFD700' : '#00E5FF', 
                    fontSize: '16px', 
                    fontWeight: 600, 
                    marginBottom: '12px' 
                  }}>
                    {isMasterMode ? '2️⃣ Wybierz przeciwnika' : 'Wybierz przeciwnika'}
                  </h3>
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
                    disabled={!selectedFriendId || (isMasterMode && !selectedCategoryId) || sending}
                    style={{
                      padding: '12px 24px',
                      background: selectedFriendId && (!isMasterMode || selectedCategoryId) && !sending
                        ? isMasterMode 
                          ? 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)'
                          : 'linear-gradient(135deg, #00E5FF 0%, #00B8D4 100%)'
                        : 'rgba(255,255,255,0.1)',
                      border: 'none',
                      borderRadius: '12px',
                      color: selectedFriendId && (!isMasterMode || selectedCategoryId) && !sending ? '#0A0A1A' : '#666',
                      fontWeight: 600,
                      cursor: selectedFriendId && (!isMasterMode || selectedCategoryId) && !sending ? 'pointer' : 'not-allowed',
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
