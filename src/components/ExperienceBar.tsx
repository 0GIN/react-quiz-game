interface ExperienceBarProps {
  level: number
  currentXP: number
  xpToNextLevel: number
}

export default function ExperienceBar({ level, currentXP, xpToNextLevel }: ExperienceBarProps) {
  const percentage = (currentXP / xpToNextLevel) * 100

  return (
    <div className="experience-bar-container">
      <div className="experience-bar">
        <div 
          className="experience-bar-fill" 
          style={{ width: `${percentage}%` }}
        >
          <div className="experience-bar-shine"></div>
        </div>
        <div className="experience-bar-text">
          <span className="experience-level">Level {level}</span>
          <span className="experience-progress">{currentXP} / {xpToNextLevel} XP</span>
          <span className="experience-percentage">{percentage.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  )
}
