/**
 * @fileoverview Pasek doświadczenia użytkownika
 * 
 * Wyświetla:
 * - Aktualny poziom użytkownika
 * - Postęp XP do następnego poziomu (liczby i procenty)
 * - Animowany pasek wypełnienia z efektem świecenia
 * 
 * Używany na stronie głównej i w profilu użytkownika.
 * 
 * OPTYMALIZACJA: React.memo + useMemo dla obliczeń
 * 
 * @component
 */

import { memo, useMemo } from 'react'

interface ExperienceBarProps {
  level: number
  currentXP: number
  xpToNextLevel: number
}

function ExperienceBar({ level, currentXP, xpToNextLevel }: ExperienceBarProps) {
  // Memoizuj obliczenia - przeliczaj tylko gdy wartości się zmienią
  const safePercentage = useMemo(() => {
    // Oblicz XP potrzebne na obecny level (suma wszystkich poprzednich)
    let totalXPForCurrentLevel = 0;
    for (let i = 1; i < level; i++) {
      totalXPForCurrentLevel += Math.floor(100 * Math.pow(1.5, i - 1));
    }
    
    // Oblicz XP w ramach obecnego levelu (reszta po odjęciu poprzednich)
    const xpInCurrentLevel = Math.max(0, currentXP - totalXPForCurrentLevel);
    
    // Procent postępu w obecnym levelu
    const pct = xpToNextLevel > 0 ? (xpInCurrentLevel / xpToNextLevel) * 100 : 0;
    return Math.min(Math.max(pct, 0), 100);
  }, [currentXP, xpToNextLevel, level])

  // Oblicz rzeczywiste XP w ramach obecnego levelu
  const xpInCurrentLevel = useMemo(() => {
    let totalXPForCurrentLevel = 0;
    for (let i = 1; i < level; i++) {
      totalXPForCurrentLevel += Math.floor(100 * Math.pow(1.5, i - 1));
    }
    return Math.max(0, currentXP - totalXPForCurrentLevel);
  }, [currentXP, level])

  return (
    <div className="experience-bar-container">
      <div className="experience-bar">
        <div 
          className="experience-bar-fill" 
          style={{ width: `${safePercentage}%` }}
        >
          <div className="experience-bar-shine"></div>
        </div>
        <div className="experience-bar-text">
          <span className="experience-level">Level {level}</span>
          <span className="experience-progress">{xpInCurrentLevel} / {xpToNextLevel} XP</span>
          <span className="experience-percentage">{safePercentage.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  )
}

export default memo(ExperienceBar)
