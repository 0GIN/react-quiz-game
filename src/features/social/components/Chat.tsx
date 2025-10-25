import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@features/auth';
import { Card, MaterialIcon } from '@shared/ui';
import {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  subscribeToMessages,
  type Conversation,
  type MessageWithUser,
} from '@/services/messageService';
import '@/styles/ui.css';

export default function Chat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Pobierz konwersacje
  useEffect(() => {
    if (!user?.id) return;

    const fetchConversations = async () => {
      try {
        const convs = await getConversations(user.id);
        setConversations(convs);
        
        // Automatycznie wybierz pierwszą konwersację
        if (convs.length > 0 && !selectedFriend) {
          setSelectedFriend(convs[0]);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user?.id]);

  // Pobierz wiadomości gdy wybierzemy znajomego
  useEffect(() => {
    if (!user?.id || !selectedFriend) return;

    const fetchMessages = async () => {
      try {
        const msgs = await getMessages(user.id, selectedFriend.friend_id);
        setMessages(msgs);
        
        // Oznacz jako przeczytane
        await markAsRead(user.id, selectedFriend.friend_id);
        
        // Aktualizuj licznik nieprzeczytanych w liście konwersacji
        setConversations(prev =>
          prev.map(conv =>
            conv.friend_id === selectedFriend.friend_id
              ? { ...conv, unread_count: 0 }
              : conv
          )
        );
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    // Subskrybuj nowe wiadomości
    const unsubscribe = subscribeToMessages(
      user.id,
      selectedFriend.friend_id,
      (newMsg) => {
        setMessages(prev => [...prev, newMsg as any]);
        markAsRead(user.id, selectedFriend.friend_id);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user?.id, selectedFriend?.friend_id]);

  // Scroll do dołu przy nowych wiadomościach
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id || !selectedFriend || !newMessage.trim() || sending) return;

    setSending(true);
    
    try {
      const result = await sendMessage(user.id, selectedFriend.friend_id, newMessage);
      
      if (result.success && result.message) {
        // Dodaj wiadomość do listy
        setMessages(prev => [...prev, result.message as any]);
        setNewMessage('');
        
        // Aktualizuj ostatnią wiadomość w liście konwersacji
        setConversations(prev =>
          prev.map(conv =>
            conv.friend_id === selectedFriend.friend_id
              ? {
                  ...conv,
                  last_message: newMessage,
                  last_message_time: new Date().toISOString(),
                }
              : conv
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Dzisiaj - pokaż godzinę
      return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Wczoraj';
    } else if (diffDays < 7) {
      return `${diffDays} dni temu`;
    } else {
      return date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
    }
  };

  if (loading) {
    return (
      <main className="main">
        <div style={{ gridColumn: 'span 12' }}>
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                border: '3px solid #00E5FF',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p style={{ color: '#888' }}>Ładowanie konwersacji...</p>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  if (conversations.length === 0) {
    return (
      <main className="main">
        <Card>
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <MaterialIcon icon="chat_bubble_outline" size={64} style={{ color: '#888', marginBottom: '16px' }} />
            <h3 style={{ marginBottom: '8px' }}>Brak konwersacji</h3>
            <p style={{ color: '#888' }}>
              Dodaj znajomych, aby móc z nimi rozmawiać!
            </p>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="chat-layout">
        <Card className="chat-sidebar-card">
          <h3 className="chat-sidebar-title">
            <MaterialIcon icon="chat" size={24} />
            Konwersacje
          </h3>
          
          <div className="chat-list">
            {conversations.map((conv) => (
              <div 
                key={conv.friend_id}
                className={`chat-item ${selectedFriend?.friend_id === conv.friend_id ? 'active' : ''}`}
                onClick={() => setSelectedFriend(conv)}
                style={{ cursor: 'pointer' }}
              >
                <div 
                  className="friend-avatar small"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: '2px solid #00E5FF',
                    position: 'relative',
                    flexShrink: 0
                  }}
                  dangerouslySetInnerHTML={{ __html: conv.friend_avatar }}
                />
                {conv.is_online && (
                  <span 
                    className="online-indicator"
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '32px',
                      width: '12px',
                      height: '12px',
                      background: '#4ade80',
                      border: '2px solid #0f0f23',
                      borderRadius: '50%',
                      zIndex: 1
                    }}
                  ></span>
                )}
                <div className="chat-item-info">
                  <div className="chat-item-name">{conv.friend_username}</div>
                  <div className="chat-item-preview">
                    {conv.last_message || 'Brak wiadomości'}
                  </div>
                </div>
                <div className="chat-item-meta">
                  <div className="chat-time">
                    {conv.last_message_time ? formatTime(conv.last_message_time) : ''}
                  </div>
                  {conv.unread_count > 0 && (
                    <div className="unread-badge">{conv.unread_count}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {selectedFriend && (
          <Card className="chat-main-card">
            <div className="chat-header">
              <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                <div 
                  className="friend-avatar small"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: '2px solid #00E5FF',
                    flexShrink: 0
                  }}
                  dangerouslySetInnerHTML={{ __html: selectedFriend.friend_avatar }}
                />
                {selectedFriend.is_online && (
                  <span 
                    className="online-indicator"
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: '28px',
                      width: '12px',
                      height: '12px',
                      background: '#4ade80',
                      border: '2px solid #0f0f23',
                      borderRadius: '50%',
                      zIndex: 1
                    }}
                  ></span>
                )}
              </div>
              <div>
                <div className="chat-header-name">{selectedFriend.friend_username}</div>
                <div className="chat-header-status">
                  {selectedFriend.is_online ? 'Online' : 'Offline'}
                </div>
              </div>
            </div>

            <div className="chat-messages">
              {messages.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '60px 20px',
                  color: '#888'
                }}>
                  <MaterialIcon icon="chat_bubble_outline" size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
                  <p>Brak wiadomości. Napisz coś!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id} className={`message-group ${isMe ? 'me' : 'them'}`}>
                      {!isMe && (
                        <div 
                          className="friend-avatar small"
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            background: '#0f0f23',
                            border: '2px solid #00E5FF'
                          }}
                        >
                          {msg.sender.avatar_url || '�'}
                        </div>
                      )}
                      <div className="message-content">
                        <div className="message-bubble">{msg.content}</div>
                        <div className="message-time">{formatTime(msg.created_at)}</div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="chat-input-area">
              <input 
                type="text" 
                className="chat-input" 
                placeholder="Napisz wiadomość..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={sending}
                maxLength={1000}
              />
              <button 
                type="submit"
                className="btn-icon send"
                disabled={sending || !newMessage.trim()}
                style={{
                  opacity: sending || !newMessage.trim() ? 0.5 : 1,
                  cursor: sending || !newMessage.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                {sending ? '⏳' : '📤'}
              </button>
            </form>
          </Card>
        )}
      </div>
    </main>
  );
}
