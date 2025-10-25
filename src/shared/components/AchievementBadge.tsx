interface AchievementBadgeProps {
  icon: string
  title: string
  date?: string
  isNew?: boolean
}

export default function AchievementBadge({ icon, title, date, isNew }: AchievementBadgeProps) {
  return (
    <div className="achievement-badge">
      {isNew && <span className="achievement-new">Nowe!</span>}
      <div className="achievement-icon">{icon}</div>
      <div className="achievement-info">
        <div className="achievement-title">{title}</div>
        {date && <div className="achievement-date">{date}</div>}
      </div>
    </div>
  )
}
