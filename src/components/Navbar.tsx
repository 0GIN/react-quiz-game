import textLogo from '../assets/text_logo.png'
import guestAvatar from '../assets/guest_avatar.png'
import flashPoint from '../assets/flash_point.png'

export default function Navbar() {
  return (
    <header className="topbar" role="banner">
      <div className="brand">
        <img src={textLogo} alt="QuizRush logo" className="brand-logo-text" />
      </div>

      <div className="top-actions">
        <button className="avatar-btn" aria-label="Profil użytkownika, UserNick">
          <img src={guestAvatar} alt="UserNick avatar" className="avatar-img" />
        </button>
        <div className="user-meta">
          <span className="user-name">
            UserNick 
            <span className="user-points">
              <img src={flashPoint} alt="" className="point-icon-nav" />
              12,345
            </span>
          </span>
        </div>
        <button className="icon-btn bell" aria-label="Powiadomienia">
          🔔
        </button>
      </div>
    </header>
  )
}
