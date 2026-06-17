import { useEffect, useRef, useState } from 'react'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

interface UseDieRollResult {
  displayValue: number
  rolling: boolean
  settling: boolean
  /** Start the cosmetic tumble, settling on `final` (the honest engine result). */
  start: (final: number) => void
}

/**
 * Cosmetic dice-roll animation over an honest result.
 * - 0–420ms: cycle a random face every 60ms (~7 swaps)
 * - at 420ms: snap to `final`, play a 180ms settle
 * Reduced motion: snap to `final` immediately, no cycling.
 */
export function useDieRoll(initialValue: number): UseDieRollResult {
  const [displayValue, setDisplayValue] = useState(initialValue)
  const [rolling, setRolling] = useState(false)
  const [settling, setSettling] = useState(false)

  const cycleRef = useRef<number | null>(null)
  const timersRef = useRef<number[]>([])

  const clearAll = () => {
    if (cycleRef.current !== null) {
      window.clearInterval(cycleRef.current)
      cycleRef.current = null
    }
    timersRef.current.forEach((t) => window.clearTimeout(t))
    timersRef.current = []
  }

  useEffect(() => clearAll, [])

  const start = (final: number) => {
    clearAll()

    if (prefersReducedMotion()) {
      setDisplayValue(final)
      setRolling(false)
      setSettling(false)
      return
    }

    setRolling(true)
    setSettling(false)

    // Cycle random faces every 60ms during the shake.
    cycleRef.current = window.setInterval(() => {
      setDisplayValue(Math.floor(Math.random() * 6) + 1)
    }, 60)

    // At 420ms: stop cycling, show the honest result, play settle.
    const settleStart = window.setTimeout(() => {
      if (cycleRef.current !== null) {
        window.clearInterval(cycleRef.current)
        cycleRef.current = null
      }
      setDisplayValue(final)
      setRolling(false)
      setSettling(true)

      const settleEnd = window.setTimeout(() => setSettling(false), 180)
      timersRef.current.push(settleEnd)
    }, 420)
    timersRef.current.push(settleStart)
  }

  return { displayValue, rolling, settling, start }
}
