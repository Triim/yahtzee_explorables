import { useState } from 'react'
import './RollButton.css'

interface RollButtonProps {
  onRoll: () => void
  disabled?: boolean
  label?: string
  pulsing?: boolean
}

export function RollButton({
  onRoll,
  disabled = false,
  label = 'Roll',
  pulsing = false,
}: RollButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleClick = () => {
    if (!disabled && !isAnimating) {
      setIsAnimating(true)
      onRoll()
      setTimeout(() => setIsAnimating(false), 300)
    }
  }

  return (
    <button
      className={`roll-button ${pulsing ? 'pulsing' : ''} ${isAnimating ? 'animating' : ''}`}
      onClick={handleClick}
      disabled={disabled}
      aria-label={label}
    >
      <span className="roll-button-text">{label}</span>
    </button>
  )
}
