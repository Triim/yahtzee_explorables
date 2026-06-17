import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface BeatContextType {
  activeBeatId: string | null
  setActiveBeatId: (id: string | null) => void
  activeSceneId: string | null
  setActiveSceneId: (id: string | null) => void
  /** Beats whose gate has been satisfied. */
  isSatisfied: (beatId: string) => boolean
  satisfyBeat: (beatId: string) => void
}

const BeatContext = createContext<BeatContextType | undefined>(undefined)

export function BeatProvider({ children }: { children: ReactNode }) {
  const [activeBeatId, setActiveBeatId] = useState<string | null>(null)
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null)
  const [satisfied, setSatisfied] = useState<Set<string>>(new Set())

  const isSatisfied = useCallback(
    (beatId: string) => satisfied.has(beatId),
    [satisfied]
  )

  const satisfyBeat = useCallback((beatId: string) => {
    setSatisfied((prev) => {
      if (prev.has(beatId)) return prev
      const next = new Set(prev)
      next.add(beatId)
      return next
    })
  }, [])

  return (
    <BeatContext.Provider
      value={{
        activeBeatId,
        setActiveBeatId,
        activeSceneId,
        setActiveSceneId,
        isSatisfied,
        satisfyBeat,
      }}
    >
      {children}
    </BeatContext.Provider>
  )
}

export function useBeatContext() {
  const ctx = useContext(BeatContext)
  if (ctx === undefined) {
    throw new Error('useBeatContext must be used within BeatProvider')
  }
  return ctx
}
