/**
 * @fileoverview Komponent Hero z wyborem trybu gry
 * 
 * Wyświetla karty z dostępnymi trybami gry:
 * - Duel (1v1)
 * - Squad (2v2)
 * - Blitz (solo z 3 życiami) - jedyny aktywny tryb
 * - Master (wyzwanie dla ekspertów)
 * 
 * Tylko tryb Blitz jest obecnie klikalny i prowadzi do gry.
 * 
 * @component
 */

import { useNavigate } from 'react-router-dom'
import duelLogo from '@/assets/duel_logo.png'
import squadLogo from '@/assets/squad_logo.png'
import blitzLogo from '@/assets/blitz_logo.png'
import masterLogo from '@/assets/master_logo.png'

export default function Hero() {
  const navigate = useNavigate();
  
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-inner">
        <h1 id="hero-title" className="hero-main-title">Wybierz Tryb Gry</h1>
        <div className="hero-game-modes">
          <div className="game-mode-card">
            <img src={duelLogo} alt="" className="game-mode-icon-img" />
            <div className="game-mode-title">Duel</div>
            <div className="game-mode-description">1v1 - kto jest lepszy?</div>
          </div>
          <div className="game-mode-card">
            <img src={squadLogo} alt="" className="game-mode-icon-img" />
            <div className="game-mode-title">Squad</div>
            <div className="game-mode-description">2v2 drużynowa dominacja</div>
          </div>
          <div className="game-mode-card" onClick={() => navigate('/game-blitz')} style={{ cursor: 'pointer' }}>
            <img src={blitzLogo} alt="" className="game-mode-icon-img" />
            <div className="game-mode-title">Blitz</div>
            <div className="game-mode-description">3 życia i walka na czas</div>
          </div>
          <div className="game-mode-card">
            <img src={masterLogo} alt="" className="game-mode-icon-img" />
            <div className="game-mode-title">Master</div>
            <div className="game-mode-description">Sprawdź się w pojedynku w jednej kategorii</div>
          </div>
        </div>
      </div>
    </section>
  )
}
