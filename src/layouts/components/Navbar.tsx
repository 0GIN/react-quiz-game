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
import textLogo from '@assets/text_logo.png'
import flashPoint from '@assets/flash_point.png'

export default function Navbar() {
  const { user, logout } = useAuth();

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
                {user.avatar_url || '😀'}
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
            <button className="icon-btn bell" aria-label="Powiadomienia">
              🔔
            </button>
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
              🚪
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
