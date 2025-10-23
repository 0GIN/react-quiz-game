type Props = { value: number; max?: number }

export default function ProgressBar({value, max = 1}: Props) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)))
  return (
    <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-label={`Postęp ${value} z ${max}`}>
      <div className="bar" style={{width: `${pct}%`}} />
    </div>
  )
}
