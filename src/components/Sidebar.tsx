import { Link, useLocation } from 'react-router-dom'

export default function Sidebar() {
  // TODO: Replace with actual user role check from auth context
  const isAdmin = true; // Temporary - set to true to show admin panel
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="sidebar" aria-label="Główne menu aplikacji">
      <ul>
        <li><Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}><span className="nav-icon">🏠</span> Start</Link></li>
        <li><Link to="/ranking" className={`nav-item ${isActive('/ranking') ? 'active' : ''}`}><span className="nav-icon">🏆</span> Ranking</Link></li>
        <li><Link to="/missions" className={`nav-item ${isActive('/missions') ? 'active' : ''}`}><span className="nav-icon">🎯</span> Misje Codziennie</Link></li>
        <li><Link to="/history" className={`nav-item ${isActive('/history') ? 'active' : ''}`}><span className="nav-icon">📋</span> Historia Gier</Link></li>
        <li className="spacer"></li>
        <li><Link to="/shop" className={`nav-item ${isActive('/shop') ? 'active' : ''}`}><span className="nav-icon">🛒</span> Sklep Punktów</Link></li>
        <li><Link to="/friends" className={`nav-item ${isActive('/friends') ? 'active' : ''}`}><span className="nav-icon">👥</span> Moi Znajomi</Link></li>
        <li><Link to="/find-friends" className={`nav-item ${isActive('/find-friends') ? 'active' : ''}`}><span className="nav-icon">🔍</span> Szukaj Znajomych</Link></li>
        <li><Link to="/chat" className={`nav-item ${isActive('/chat') ? 'active' : ''}`}><span className="nav-icon">💬</span> Czat</Link></li>
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
