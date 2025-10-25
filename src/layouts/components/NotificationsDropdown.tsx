/**
 * @fileoverview Dropdown z powiadomieniami
 * 
 * Typy powiadomień:
 * - MESSAGE: ktoś napisał wiadomość (widoczne do momentu przeczytania)
 * - FRIEND_REQUEST: zaproszenie do znajomych (przycisk akceptuj, po akceptacji znika)
 * - CHALLENGE: wyzwanie do pojedynku (przycisk akceptuj, po akceptacji znika)
 * 
 * Każde powiadomienie ma przycisk "usuń" (kasuje tylko z tego miejsca).
 * 
 * @component
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { MaterialIcon } from '@shared/ui';
import { useAuth } from '@features/auth';
import { getPendingRequests, acceptFriendRequest, rejectFriendRequest } from '@/services/friendService';
import { getUnreadMessageNotifications, markAsRead } from '@/services/messageService';
import { supabase } from '@/lib/supabase';
import { getDisplayAvatar } from '@/utils/avatar';

export interface Notification {
  id: string;
  type: 'MESSAGE' | 'FRIEND_REQUEST' | 'CHALLENGE';
  from_user_id: string;
  from_username: string;
  from_avatar?: string;
  message?: string;
  created_at: string;
  read?: boolean;
}

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsDropdown({ isOpen, onClose }: NotificationsDropdownProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications();
    }
  }, [isOpen, user]);

  // Real-time subskrypcje dla nowych powiadomień
  useEffect(() => {
    if (!user) return;

    // Subskrypcja na nowe wiadomości
    const messagesChannel = supabase
      .channel(`dropdown-messages:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          console.log('📨 Nowa wiadomość - odświeżam dropdown');
          if (isOpen) {
            fetchNotifications();
          }
        }
      )
      .subscribe();

    // Subskrypcja na nowe zaproszenia
    const friendRequestsChannel = supabase
      .channel(`dropdown-friendships:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'friendships',
          filter: `friend_id=eq.${user.id}`,
        },
        () => {
          console.log('👥 Nowe zaproszenie - odświeżam dropdown');
          if (isOpen) {
            fetchNotifications();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(friendRequestsChannel);
    };
  }, [user, isOpen]);

  // Zamknij dropdown przy kliknięciu poza nim
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Sprawdź czy kliknięcie było poza dropdownem i przyciskiem dzwonka
      if (!target.closest('.notifications-dropdown') && !target.closest('.bell')) {
        onClose();
      }
    };

    // Dodaj listener z małym opóźnieniem, żeby nie zamknąć od razu po otwarciu
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      if (!user) return;

      // Pobierz zaproszenia do znajomych z backendu
      const friendRequests = await getPendingRequests(user.id);
      
      // Konwertuj zaproszenia na powiadomienia
      const friendNotifications: Notification[] = friendRequests.map(req => ({
        id: req.id,
        type: 'FRIEND_REQUEST' as const,
        from_user_id: req.user_id,
        from_username: req.requester_data.username,
        from_avatar: req.requester_data.avatar_url,
        created_at: req.requested_at,
        read: false,
      }));

      // Pobierz nieprzeczytane wiadomości
      const messageNotifications = await getUnreadMessageNotifications(user.id);
      
      const messages: Notification[] = messageNotifications.map(msg => ({
        id: msg.id,
        type: 'MESSAGE' as const,
        from_user_id: msg.sender_id,
        from_username: msg.sender_username,
        from_avatar: msg.sender_avatar,
        message: msg.content,
        created_at: msg.created_at,
        read: false,
      }));

      // TODO: Dodać pobieranie wyzwań
      // const challenges = await getPendingChallenges(user.id);

      // Połącz wszystkie powiadomienia i sortuj po dacie
      const allNotifications = [...friendNotifications, ...messages].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setNotifications(allNotifications);
    } catch (error) {
      console.error('Błąd pobierania powiadomień:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptFriend = async (notificationId: string) => {
    try {
      await acceptFriendRequest(notificationId);
      // Po akceptacji usuń powiadomienie z listy
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Błąd akceptacji zaproszenia:', error);
    }
  };

  const handleAcceptChallenge = async (notificationId: string) => {
    try {
      // TODO: Zaimplementować akceptację wyzwania
      console.log('Akceptuję wyzwanie:', notificationId);
      // Po akceptacji usuń powiadomienie
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Błąd akceptacji wyzwania:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      if (!user) return;

      const notification = notifications.find(n => n.id === notificationId);
      if (!notification || notification.type !== 'MESSAGE') return;

      // Oznacz wszystkie wiadomości od danego użytkownika jako przeczytane
      await markAsRead(user.id, notification.from_user_id);
      
      // Usuń powiadomienie z listy
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Odśwież licznik w sidebar
      window.dispatchEvent(new Event('refreshUnreadCount'));
      
      // Zamknij dropdown i przejdź do czatu
      onClose();
      navigate(`/chat?userId=${notification.from_user_id}`);
    } catch (error) {
      console.error('Błąd oznaczania jako przeczytane:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      const notification = notifications.find(n => n.id === notificationId);
      
      if (notification?.type === 'FRIEND_REQUEST') {
        // Dla zaproszeń - odrzuć (usuń z bazy)
        await rejectFriendRequest(notificationId);
      } else if (notification?.type === 'MESSAGE' && user) {
        // Dla wiadomości - oznacz jako przeczytane
        await markAsRead(user.id, notification.from_user_id);
        // Odśwież licznik w sidebar
        window.dispatchEvent(new Event('refreshUnreadCount'));
      }
      
      // TODO: Dodać usuwanie wyzwań
      // if (notification?.type === 'CHALLENGE') await deleteChallengeNotification(notificationId);
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Błąd usuwania powiadomienia:', error);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'MESSAGE':
        return 'chat';
      case 'FRIEND_REQUEST':
        return 'person_add';
      case 'CHALLENGE':
        return 'sports_mma';
      default:
        return 'notifications';
    }
  };

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'MESSAGE':
        return notification.message || 'Nowa wiadomość';
      case 'FRIEND_REQUEST':
        return `${notification.from_username} zaprasza do znajomych`;
      case 'CHALLENGE':
        return `${notification.from_username} wyzwał Cię na pojedynek`;
      default:
        return '';
    }
  };

  if (!isOpen) return null;

  const dropdownContent = (
    <div className="notifications-dropdown">
      <div className="notifications-header">
        <h3>Powiadomienia</h3>
        <button onClick={onClose} className="notifications-close">
          <MaterialIcon icon="close" size={20} />
        </button>
        </div>

        <div className="notifications-list">
          {loading ? (
            <div className="notifications-empty">
              <MaterialIcon icon="hourglass_empty" size={48} style={{ opacity: 0.5 }} />
              <p>Ładowanie...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="notifications-empty">
              <MaterialIcon icon="notifications_none" size={48} style={{ opacity: 0.5 }} />
              <p>Brak nowych powiadomień</p>
            </div>
          ) : (
            notifications.map(notification => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.read ? 'unread' : ''}`}
              >
                <div className="notification-icon">
                  <MaterialIcon icon={getNotificationIcon(notification.type)} size={24} />
                </div>
                
                <div className="notification-content">
                  <div className="notification-avatar">
                    {getDisplayAvatar(notification.from_avatar)}
                  </div>
                  <div className="notification-text">
                    <div className="notification-username">{notification.from_username}</div>
                    <div className="notification-message">{getNotificationText(notification)}</div>
                  </div>
                  
                  <div className="notification-actions">
                    {notification.type === 'MESSAGE' && !notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="btn-notification btn-read"
                      >
                        <MaterialIcon icon="chat" size={16} />
                        Przeczytaj
                      </button>
                    )}
                    
                    {notification.type === 'FRIEND_REQUEST' && (
                      <button
                        onClick={() => handleAcceptFriend(notification.id)}
                        className="btn-notification btn-accept"
                      >
                        <MaterialIcon icon="check" size={16} />
                        Akceptuj
                      </button>
                    )}
                    
                    {notification.type === 'CHALLENGE' && (
                      <button
                        onClick={() => handleAcceptChallenge(notification.id)}
                        className="btn-notification btn-accept"
                      >
                        <MaterialIcon icon="check" size={16} />
                        Akceptuj
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="btn-notification btn-delete"
                      title="Usuń powiadomienie"
                    >
                      <MaterialIcon icon="close" size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
  );

  return createPortal(dropdownContent, document.body);
}
