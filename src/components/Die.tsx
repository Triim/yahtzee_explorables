import './Die.css'

interface DieProps {
  value: number
  size?: number
  className?: string
  onClick?: () => void
  held?: boolean
}

export function Die({
  value,
  size = 60,
  className = '',
  onClick,
  held = false,
}: DieProps) {
  const dotSize = size / 10
  const spacing = size / 6

  // Generate dot positions for standard die face layouts
  const getDots = (face: number): Array<{ x: number; y: number }> => {
    const dots: Array<{ x: number; y: number }> = []
    const offset = spacing

    switch (face) {
      case 1:
        dots.push({ x: size / 2, y: size / 2 })
        break
      case 2:
        dots.push({ x: offset, y: offset })
        dots.push({ x: size - offset, y: size - offset })
        break
      case 3:
        dots.push({ x: offset, y: offset })
        dots.push({ x: size / 2, y: size / 2 })
        dots.push({ x: size - offset, y: size - offset })
        break
      case 4:
        dots.push({ x: offset, y: offset })
        dots.push({ x: size - offset, y: offset })
        dots.push({ x: offset, y: size - offset })
        dots.push({ x: size - offset, y: size - offset })
        break
      case 5:
        dots.push({ x: offset, y: offset })
        dots.push({ x: size - offset, y: offset })
        dots.push({ x: size / 2, y: size / 2 })
        dots.push({ x: offset, y: size - offset })
        dots.push({ x: size - offset, y: size - offset })
        break
      case 6:
        for (let row = 0; row < 2; row++) {
          for (let col = 0; col < 3; col++) {
            dots.push({
              x: offset + col * (size / 3),
              y: offset + row * (size - 2 * offset),
            })
          }
        }
        break
    }

    return dots
  }

  const dots = getDots(Math.max(1, Math.min(6, value)))

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`die ${held ? 'held' : ''} ${className}`}
      onClick={onClick}
      role="img"
      aria-label={`Die showing ${value}`}
    >
      <rect width={size} height={size} className="die-face" rx={size / 10} />
      {dots.map((dot, i) => (
        <circle
          key={i}
          cx={dot.x}
          cy={dot.y}
          r={dotSize}
          className="die-dot"
        />
      ))}
    </svg>
  )
}
