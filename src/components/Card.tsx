/**
 * @fileoverview Uniwersalny komponent karty
 * 
 * Podstawowy komponent UI do wyświetlania zawartości w stylizowanej karcie.
 * Używany w wielu miejscach aplikacji (statystyki, misje, ranking, etc.).
 * 
 * Props:
 * - title: Opcjonalny tytuł karty
 * - children: Zawartość karty
 * - className: Dodatkowe klasy CSS
 * 
 * @component
 */

type Props = {
  title?: string
  children?: React.ReactNode
  className?: string
}

export default function Card({title, children, className = ''}: Props) {
  return (
    <article className={`card ${className}`} role="region" aria-labelledby={title ? `${title}-title` : undefined}>
      {title && <h2 id={`${title}-title`}>{title}</h2>}
      <div className="card-body">{children}</div>
    </article>
  )
}
