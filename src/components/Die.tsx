import './Die.css'

export type DieValue = 1 | 2 | 3 | 4 | 5 | 6

interface DieProps {
  value: number // 1..6 (clamped); typed loose so call sites can pass engine output
  size?: number // px, default 64
  held?: boolean // default false
  rolling?: boolean // default false (drives the shake animation)
  settling?: boolean // default false (drives the settle animation)
  onClick?: () => void
  className?: string
}

// Fixed 3×3 pip grid on the 0..100 viewBox.
const PIP = {
  TL: { cx: 28, cy: 28 },
  TR: { cx: 72, cy: 28 },
  ML: { cx: 28, cy: 50 },
  MR: { cx: 72, cy: 50 },
  BL: { cx: 28, cy: 72 },
  BR: { cx: 72, cy: 72 },
  C: { cx: 50, cy: 50 },
} as const

type PipKey = keyof typeof PIP

const FACE_PIPS: Record<DieValue, PipKey[]> = {
  1: ['C'],
  2: ['TL', 'BR'],
  3: ['TL', 'C', 'BR'],
  4: ['TL', 'TR', 'BL', 'BR'],
  5: ['TL', 'TR', 'C', 'BL', 'BR'],
  6: ['TL', 'TR', 'ML', 'MR', 'BL', 'BR'],
}

export function Die({
  value,
  size = 64,
  held = false,
  rolling = false,
  settling = false,
  onClick,
  className = '',
}: DieProps) {
  const safeValue = (Math.max(1, Math.min(6, value)) as DieValue)
  const pips = FACE_PIPS[safeValue]

  const stateClass = rolling ? 'die--rolling' : settling ? 'die--settle' : ''
  const heldClass = held ? 'die--held' : ''
  const clickableClass = onClick ? 'die--clickable' : ''

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`die ${stateClass} ${heldClass} ${clickableClass} ${className}`}
      onClick={onClick}
      role="img"
      aria-label={`Die showing ${safeValue}`}
    >
      {/* Held outline: a rounded-rect 3px outside the body in the accent color */}
      {held && (
        <rect
          x={3}
          y={3}
          width={94}
          height={94}
          rx={21}
          className="die-held-outline"
          fill="none"
        />
      )}

      {/* Body */}
      <rect
        x={6}
        y={6}
        width={88}
        height={88}
        rx={18}
        className="die-face"
        strokeWidth={2}
      />

      {/* Pips */}
      {pips.map((key) => {
        const { cx, cy } = PIP[key]
        return <circle key={key} cx={cx} cy={cy} r={8} className="die-pip" />
      })}
    </svg>
  )
}
