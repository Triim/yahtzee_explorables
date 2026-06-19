import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import type { Beat, Scene } from './types'
import { getSceneBeats } from './beats'

interface BeatContextType {
  scenes: Scene[]
  allBeats: Beat[]
  activeBeatId: string | null
  setActiveBeatId: (id: string | null) => void
  activeSceneId: string | null
  setActiveSceneId: (id: string | null) => void
  activeBeat: Beat | null
  /** Beats whose gate has been satisfied. */
  isSatisfied: (beatId: string) => boolean
  satisfyGate: (beatId: string) => void
  /**
   * Index into `allBeats` of the furthest beat the reader may reach: the first
   * gated-but-unsatisfied beat (inclusive). Beats past it are withheld from the
   * document so there is nothing to scroll into — gating without wheel hijack.
   */
  reachableThrough: number
  /** Has the active scene's right-hand model been revealed yet? */
  revealed: boolean
  revealModel: () => void
}

const BeatContext = createContext<BeatContextType | undefined>(undefined)

export function BeatProvider({
  scenes,
  children,
}: {
  scenes: Scene[]
  children: ReactNode
}) {
  const allBeats = useMemo(() => scenes.flatMap(getSceneBeats), [scenes])

  const [activeBeatId, setActiveBeatId] = useState<string | null>(null)
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null)
  const [satisfied, setSatisfied] = useState<Set<string>>(new Set())
  const [revealedScenes, setRevealedScenes] = useState<Set<string>>(new Set())

  const isSatisfied = useCallback(
    (beatId: string) => satisfied.has(beatId),
    [satisfied]
  )

  const satisfyGate = useCallback((beatId: string) => {
    setSatisfied((prev) => {
      if (prev.has(beatId)) return prev
      const next = new Set(prev)
      next.add(beatId)
      return next
    })
  }, [])

  const revealModel = useCallback(() => {
    setActiveSceneId((sceneId) => {
      if (sceneId) {
        setRevealedScenes((prev) => {
          if (prev.has(sceneId)) return prev
          const next = new Set(prev)
          next.add(sceneId)
          return next
        })
      }
      return sceneId
    })
  }, [])

  const reachableThrough = useMemo(() => {
    for (let i = 0; i < allBeats.length; i++) {
      const b = allBeats[i]
      if (b.gate && !satisfied.has(b.id)) return i
    }
    return allBeats.length - 1
  }, [allBeats, satisfied])

  const activeBeat = useMemo(
    () => allBeats.find((b) => b.id === activeBeatId) ?? null,
    [allBeats, activeBeatId]
  )

  // The opening's model is uncovered by the hero's second cut, so it must be
  // present on the stage from the start; later sections reveal on scroll.
  const revealed =
    activeSceneId === 'opening'
      ? true
      : activeSceneId
        ? revealedScenes.has(activeSceneId)
        : false

  return (
    <BeatContext.Provider
      value={{
        scenes,
        allBeats,
        activeBeatId,
        setActiveBeatId,
        activeSceneId,
        setActiveSceneId,
        activeBeat,
        isSatisfied,
        satisfyGate,
        reachableThrough,
        revealed,
        revealModel,
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
