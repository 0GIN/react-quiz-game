import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import textLogo from '../assets/text_logo.png'
import guestAvatar from '../assets/guest_avatar.png'
import flashPoint from '../assets/flash_point.png'

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    console.log('🚪 Kliknięto przycisk wylogowania');
    try {
      await logout();
      console.log('✅ Wylogowanie zakończone');
      navigate('/login');
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
              <img src={guestAvatar} alt={`${user.username} avatar`} className="avatar-img" />
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
                fontSize: '20px'
              }}
              aria-label="Wyloguj się"
              title="Wyloguj się"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                logout
              </span>
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
