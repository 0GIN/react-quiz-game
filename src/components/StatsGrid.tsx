interface StatItemProps {
  label: string
  value: string | number
  icon?: string
}

function StatItem({ label, value, icon }: StatItemProps) {
  return (
    <div className="stat-item">
      {icon && <span className="stat-icon">{icon}</span>}
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

interface StatsGridProps {
  gamesPlayed: number
  accuracy: number
  streak: number
  level: number
}

export default function StatsGrid({ gamesPlayed, accuracy, streak, level }: StatsGridProps) {
  return (
    <div className="stats-grid">
      <StatItem icon="🎮" label="Rozegrane" value={gamesPlayed} />
      <StatItem icon="🎯" label="Celność" value={`${accuracy}%`} />
      <StatItem icon="🔥" label="Passa" value={streak} />
      <StatItem icon="⭐" label="Poziom" value={level} />
    </div>
  )
}
