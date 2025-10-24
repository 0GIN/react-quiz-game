interface ExperienceBarProps {
  level: number
  currentXP: number
  xpToNextLevel: number
}

export default function ExperienceBar({ level, currentXP, xpToNextLevel }: ExperienceBarProps) {
  // Zabezpieczenie przed dzieleniem przez zero
  const percentage = xpToNextLevel > 0 ? (currentXP / xpToNextLevel) * 100 : 0
  const safePercentage = Math.min(Math.max(percentage, 0), 100) // Ogranicz do 0-100%

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
          <span className="experience-progress">{currentXP} / {xpToNextLevel} XP</span>
          <span className="experience-percentage">{safePercentage.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  )
}
