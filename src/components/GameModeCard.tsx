interface GameModeCardProps {
  icon: string
  title: string
  description: string
  onClick?: () => void
}

export default function GameModeCard({ icon, title, description, onClick }: GameModeCardProps) {
  return (
    <button className="game-mode-card" onClick={onClick}>
      <div className="game-mode-icon">{icon}</div>
      <div className="game-mode-title">{title}</div>
      <div className="game-mode-description">{description}</div>
    </button>
  )
}
