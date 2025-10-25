/**
 * @fileoverview Górny pasek nawigacyjny aplikacji
 * 
 * Wyświetla:
 * - Logo aplikacji QuizRush
 * - Avatar użytkownika (lub komunikat o braku logowania dla gości)
 * - Nazwę użytkownika i Flash Points
 * - Przycisk powiadomień
 * - Przycisk wylogowania (dla zalogowanych)
 * - Przyciski logowania/rejestracji (dla gości)
 * 
 * Dostosowuje się automatycznie do statusu użytkownika (guest/user/admin).
 * 
 * @component
 */

import { Link } from 'react-router-dom'
import { useAuth } from '@features/auth'
import { MaterialIcon } from '@shared/ui'
import textLogo from '@assets/text_logo.png'
import flashPoint from '@assets/flash_point.png'
import { useState, useEffect } from 'react'
import NotificationsDropdown from './NotificationsDropdown'
import { getPendingRequests } from '@/services/friendService'
import { getTotalUnreadCount } from '@/services/messageService'
import { supabase } from '@/lib/supabase'
import { getDisplayAvatar } from '@/utils/avatar'

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  // Sprawdź czy są nieprzeczytane powiadomienia
  useEffect(() => {
    const checkUnreadNotifications = async () => {
      if (!user) {
        setHasUnreadNotifications(false);
        return;
      }

      try {
        const pendingRequests = await getPendingRequests(user.id);
        const unreadMessages = await getTotalUnreadCount(user.id);
        // TODO: Dodać sprawdzanie wyzwań
        // const pendingChallenges = await getPendingChallenges(user.id);
        
        setHasUnreadNotifications(pendingRequests.length > 0 || unreadMessages > 0);
      } catch (error) {
        console.error('Błąd sprawdzania powiadomień:', error);
      }
    };

    checkUnreadNotifications();
    
    // Odświeżaj co minutę
    const interval = setInterval(checkUnreadNotifications, 60000);
    
    // Listener na ręczne odświeżanie (np. po przeczytaniu wiadomości)
    const handleRefresh = () => checkUnreadNotifications();
    window.addEventListener('refreshUnreadCount', handleRefresh);
    
    // Real-time subskrypcje dla nowych wiadomości i zaproszeń
    const messagesChannel = user ? supabase
      .channel(`user-messages:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          console.log('📨 Nowa wiadomość - odświeżam powiadomienia');
          checkUnreadNotifications();
        }
      )
      .subscribe() : null;

    const friendRequestsChannel = user ? supabase
      .channel(`user-friend-requests:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'friendships',
          filter: `friend_id=eq.${user.id}`,
        },
        () => {
          console.log('👥 Nowe zaproszenie - odświeżam powiadomienia');
          checkUnreadNotifications();
        }
      )
      .subscribe() : null;
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshUnreadCount', handleRefresh);
      if (messagesChannel) supabase.removeChannel(messagesChannel);
      if (friendRequestsChannel) supabase.removeChannel(friendRequestsChannel);
    };
  }, [user]);

  const handleLogout = async () => {
    console.log('🚪 Kliknięto przycisk wylogowania');
    try {
      await logout();
      console.log('✅ Wylogowanie zakończone');
      // Wymuszenie pełnego przeładowania strony
      window.location.href = '/login';
    } catch (error) {
      console.error('❌ Błąd wylogowania:', error);
    }
  };

  return (
    <header className="topbar" role="banner">
      <div className="brand">
        <img src={textLogo} alt="QuizRush logo" className="brand-logo-text" />
      </div>

      <div className="top-actions">
        {user ? (
          <>
            <button className="avatar-btn" aria-label={`Profil użytkownika, ${user.username}`}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                background: '#0f0f23',
                border: '2px solid #00E5FF'
              }}>
                {getDisplayAvatar(user.avatar_url)}
              </div>
            </button>
            <div className="user-meta">
              <span className="user-name">
                {user.username} 
                <span className="user-points">
                  <img src={flashPoint} alt="" className="point-icon-nav" />
                  {user.flash_points.toLocaleString()}
                </span>
              </span>
            </div>
            <div>
              <button 
                className="icon-btn bell" 
                aria-label="Powiadomienia"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              >
                <MaterialIcon 
                  icon={hasUnreadNotifications ? "notifications_unread" : "notifications"} 
                  size={20} 
                />
              </button>
              <NotificationsDropdown 
                isOpen={isNotificationsOpen} 
                onClose={() => {
                  setIsNotificationsOpen(false);
                  // Odśwież status powiadomień po zamknięciu
                  if (user) {
                    Promise.all([
                      getPendingRequests(user.id),
                      getTotalUnreadCount(user.id)
                    ]).then(([requests, unreadMessages]) => {
                      setHasUnreadNotifications(requests.length > 0 || unreadMessages > 0);
                    }).catch(console.error);
                  }
                }} 
              />
            </div>
            <button
              onClick={handleLogout}
              className="icon-btn"
              style={{
                marginLeft: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                fontSize: '20px',
                cursor: 'pointer'
              }}
              aria-label="Wyloguj się"
              title="Wyloguj się"
            >
              <MaterialIcon icon="logout" size={20} />
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/login" className="btn secondary" style={{ padding: '8px 16px', fontSize: '14px', textDecoration: 'none' }}>
              🔑 Zaloguj się
            </Link>
            <Link to="/register" className="btn primary" style={{ padding: '8px 16px', fontSize: '14px', textDecoration: 'none' }}>
              🎯 Zarejestruj się
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
