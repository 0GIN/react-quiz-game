export default function Sidebar() {
  return (
    <nav className="sidebar" aria-label="Główne menu aplikacji">
      <ul>
        <li><button className="nav-item"><span className="nav-icon">🏠</span> Start</button></li>
        <li><button className="nav-item active"><span className="nav-icon">🏆</span> Ranking</button></li>
        <li><button className="nav-item"><span className="nav-icon">🎯</span> Misje Codziennie</button></li>
        <li><button className="nav-item"><span className="nav-icon">👥</span> Moi Znajomi</button></li>
        <li><button className="nav-item"><span className="nav-icon">📋</span> Historia Gier</button></li>
        <li className="spacer"></li>
        <li><button className="nav-item add"><span className="nav-icon">➕</span> Dodaj Pytanie</button></li>
        <li><button className="nav-item"><span className="nav-icon">⚙️</span> Ustawienia</button></li>
      </ul>
    </nav>
  )
}
