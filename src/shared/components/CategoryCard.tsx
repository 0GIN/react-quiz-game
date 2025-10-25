interface CategoryCardProps {
  icon: string
  title: string
  count?: number
  onClick?: () => void
}

export default function CategoryCard({ icon, title, count, onClick }: CategoryCardProps) {
  return (
    <button className="category-card" onClick={onClick}>
      <div className="category-icon">{icon}</div>
      <div className="category-title">{title}</div>
      {count !== undefined && (
        <div className="category-count">{count} quizów</div>
      )}
    </button>
  )
}
