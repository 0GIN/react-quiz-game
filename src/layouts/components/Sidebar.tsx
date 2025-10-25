/**
 * @fileoverview Boczne menu nawigacyjne aplikacji
 * 
 * Dynamiczne menu dostosowujące się do roli użytkownika:
 * 
 * **Guest (niezalogowany):**
 * - Start, Ranking (demo), Regulamin
 * - Promocja logowania/rejestracji
 * 
 * **User (zalogowany użytkownik):**
 * - Wszystkie tryby gier (Blitz, Duel, Squad, Master)
 * - Misje dzienne, Historia gier, Ranking
 * - Sklep, Znajomi, Czat
 * - Ustawienia, Regulamin
 * 
 * **Admin:**
 * - Wszystko co user + Panel Admina
 * 
 * Podświetla aktywny element menu.
 * 
 * @component
 */

import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@features/auth'
import { useState, useEffect } from 'react'
import { getTotalUnreadCount } from '@/services/messageService'
import { supabase } from '@/lib/supabase'

export default function Sidebar() {
  const { isGuest, isAdmin, user } = useAuth();
  const location = useLocation()
  const [unreadCount, setUnreadCount] = useState(0);

  const isActive = (path: string) => location.pathname === path

  // Pobierz liczbę nieprzeczytanych wiadomości
  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      const count = await getTotalUnreadCount(user.id);
      setUnreadCount(count);
    };

    fetchUnreadCount();

    // Odświeżaj co 30 sekund
    const interval = setInterval(fetchUnreadCount, 30000);
    
    // Odświeżaj po custom event (np. po przeczytaniu wiadomości)
    const handleRefresh = () => fetchUnreadCount();
    window.addEventListener('refreshUnreadCount', handleRefresh);
    
    // Real-time subskrypcja dla nowych wiadomości
    const messagesChannel = supabase
      .channel(`sidebar-messages:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          console.log('📨 Nowa wiadomość - odświeżam licznik sidebar');
          fetchUnreadCount();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          console.log('✅ Wiadomość przeczytana - odświeżam licznik sidebar');
          fetchUnreadCount();
        }
      )
      .subscribe();
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshUnreadCount', handleRefresh);
      supabase.removeChannel(messagesChannel);
    };
  }, [user]);

  // Guest (niezalogowany) - widzi tylko Home, Ranking (demo), Regulamin
  if (isGuest) {
    return (
      <nav className="sidebar" aria-label="Główne menu aplikacji">
        <ul>
          <li><Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}><span className="nav-icon">🏠</span> Start</Link></li>
          <li><Link to="/ranking" className={`nav-item ${isActive('/ranking') ? 'active' : ''}`}><span className="nav-icon">🏆</span> Ranking</Link></li>
          <li><Link to="/rules" className={`nav-item ${isActive('/rules') ? 'active' : ''}`}><span className="nav-icon">📜</span> Regulamin</Link></li>
          <li className="spacer"></li>
          <li>
            <div style={{ 
              padding: '20px', 
              background: 'linear-gradient(135deg, rgba(0,229,255,0.15) 0%, rgba(138,43,226,0.15) 100%)',
              borderRadius: '16px',
              textAlign: 'center',
              border: '1px solid rgba(0,229,255,0.4)',
              boxShadow: '0 4px 12px rgba(0,229,255,0.2)'
            }}>
              <p style={{ color: '#00E5FF', fontSize: '16px', marginBottom: '12px', fontWeight: 700 }}>
                🎮 Zaloguj się!
              </p>
              <p style={{ color: '#B8B8D0', fontSize: '13px', lineHeight: 1.5, marginBottom: '20px' }}>
                Uzyskaj pełny dostęp do gier, rankingów i misji!
              </p>
              <Link 
                to="/login" 
                className="btn secondary"
                style={{ 
                  display: 'block', 
                  textDecoration: 'none', 
                  padding: '12px',
                  fontSize: '14px',
                  marginBottom: '10px',
                  background: 'rgba(0,229,255,0.2)',
                  border: '2px solid #00E5FF',
                  fontWeight: 600
                }}
              >
                🔑 Zaloguj się
              </Link>
              <Link 
                to="/register" 
                className="btn primary"
                style={{ 
                  display: 'block', 
                  textDecoration: 'none', 
                  padding: '12px',
                  fontSize: '14px',
                  background: 'linear-gradient(135deg, #00E5FF 0%, #8A2BE2 100%)',
                  border: 'none',
                  fontWeight: 600
                }}
              >
                � Dołącz Teraz!
              </Link>
            </div>
          </li>
        </ul>
      </nav>
    )
  }

  // User lub Admin (zalogowany)
  return (
    <nav className="sidebar" aria-label="Główne menu aplikacji">
      <ul>
        <li><Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}><span className="nav-icon">🏠</span> Start</Link></li>
        <li><Link to="/profile" className={`nav-item ${isActive('/profile') ? 'active' : ''}`}><span className="nav-icon">👤</span> Mój Profil</Link></li>
        <li><Link to="/ranking" className={`nav-item ${isActive('/ranking') ? 'active' : ''}`}><span className="nav-icon">🏆</span> Ranking</Link></li>
        <li><Link to="/history" className={`nav-item ${isActive('/history') ? 'active' : ''}`}><span className="nav-icon">📋</span> Historia Gier</Link></li>
        <li className="spacer"></li>
        <li><Link to="/shop" className={`nav-item ${isActive('/shop') ? 'active' : ''}`}><span className="nav-icon">🛒</span> Sklep</Link></li>
        <li><Link to="/friends" className={`nav-item ${isActive('/friends') ? 'active' : ''}`}><span className="nav-icon">👥</span> Moi Znajomi</Link></li>
        <li><Link to="/find-friends" className={`nav-item ${isActive('/find-friends') ? 'active' : ''}`}><span className="nav-icon">🔍</span> Szukaj Znajomych</Link></li>
        <li>
          <Link to="/chat" className={`nav-item ${isActive('/chat') ? 'active' : ''}`} style={{ position: 'relative' }}>
            <span className="nav-icon">💬</span> Czat
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </Link>
        </li>
        <li><Link to="/top-players" className={`nav-item ${isActive('/top-players') ? 'active' : ''}`}><span className="nav-icon">👑</span> Najlepsi</Link></li>
        <li className="spacer"></li>
        <li><Link to="/add-question" className={`nav-item add ${isActive('/add-question') ? 'active' : ''}`}><span className="nav-icon">➕</span> Dodaj Pytanie</Link></li>
        <li><Link to="/settings" className={`nav-item ${isActive('/settings') ? 'active' : ''}`}><span className="nav-icon">⚙️</span> Ustawienia</Link></li>
        
        {isAdmin && (
          <>
            <li className="spacer"></li>
            <li><Link to="/admin" className={`nav-item admin ${isActive('/admin') ? 'active' : ''}`}><span className="nav-icon">🛡️</span> Panel Admina</Link></li>
          </>
        )}
      </ul>
    </nav>
  )
}
