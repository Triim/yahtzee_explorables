import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

/* ============================================================
   Player state that persists across the whole article: the hand the
   reader actually played in the tutorial. Later scenes read it to call
   back to the reader's own game ("in your game you scored …"), so the
   dynamic, personalized text lives in the model panels, not the static
   prose. Everything degrades gracefully when the tutorial is unplayed.
   ============================================================ */

export const TUT_CATEGORIES = 13
const EMPTY: (number | null)[] = Array(TUT_CATEGORIES).fill(null)

export interface TutorialRecord {
  finalScore: number
  upper: number
  gotBonus: boolean
  gotYahtzee: boolean
  best: { cat: number; score: number }
}

interface PlayerStateValue {
  /** scores written into the 13 rows; null = still open. */
  scorecard: (number | null)[]
  scoreCell: (cat: number, value: number) => void
  resetGame: () => void
  filled: number
  done: boolean
  /** computed once the game is finished, else null. */
  record: TutorialRecord | null
}

const Ctx = createContext<PlayerStateValue | null>(null)

function deriveRecord(scorecard: (number | null)[]): TutorialRecord | null {
  if (scorecard.some((v) => v === null)) return null
  const vals = scorecard as number[]
  const upper = vals.slice(0, 6).reduce((a, b) => a + b, 0)
  const gotBonus = upper >= 63
  const base = vals.reduce((a, b) => a + b, 0)
  const finalScore = base + (gotBonus ? 35 : 0)
  const gotYahtzee = (vals[11] ?? 0) > 0
  let best = { cat: 0, score: -1 }
  vals.forEach((s, cat) => {
    if (s > best.score) best = { cat, score: s }
  })
  return { finalScore, upper, gotBonus, gotYahtzee, best }
}

export function PlayerStateProvider({ children }: { children: ReactNode }) {
  const [scorecard, setScorecard] = useState<(number | null)[]>(EMPTY)

  const value = useMemo<PlayerStateValue>(() => {
    const filled = scorecard.filter((v) => v !== null).length
    return {
      scorecard,
      scoreCell: (cat, v) =>
        setScorecard((sc) => {
          if (sc[cat] !== null) return sc
          const next = [...sc]
          next[cat] = v
          return next
        }),
      resetGame: () => setScorecard(Array(TUT_CATEGORIES).fill(null)),
      filled,
      done: filled === TUT_CATEGORIES,
      record: deriveRecord(scorecard),
    }
  }, [scorecard])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function usePlayerState() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('usePlayerState must be used within PlayerStateProvider')
  return ctx
}
