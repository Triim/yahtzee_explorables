import { useEffect, useRef, useState } from 'react'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

interface UseDieRollResult {
  displayValue: number
  throwing: boolean
  /** Throw the die, landing on `final` (the honest engine result). */
  start: (final: number) => void
}

/**
 * Cosmetic dice-throw over an honest result (Part 2 §D).
 * - 0–480ms: cycle a random face every 55ms
 * - at 480ms: snap to `final`; the CSS throw arc/bounce runs to 600ms
 * Reduced motion: snap to `final` immediately, no cycling, no class.
 */
export function useDieRoll(initialValue: number): UseDieRollResult {
  const [displayValue, setDisplayValue] = useState(initialValue)
  const [throwing, setThrowing] = useState(false)

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
      setThrowing(false)
      return
    }

    setThrowing(true)

    // Cycle random faces every 55ms during the throw.
    cycleRef.current = window.setInterval(() => {
      setDisplayValue(Math.floor(Math.random() * 6) + 1)
    }, 55)

    // At 480ms: stop cycling, lock the honest result (arc/bounce finishes the
    // last 120ms of the 600ms CSS animation).
    const lock = window.setTimeout(() => {
      if (cycleRef.current !== null) {
        window.clearInterval(cycleRef.current)
        cycleRef.current = null
      }
      setDisplayValue(final)
    }, 480)
    timersRef.current.push(lock)

    // At 600ms: animation done.
    const done = window.setTimeout(() => setThrowing(false), 600)
    timersRef.current.push(done)
  }

  return { displayValue, throwing, start }
}
