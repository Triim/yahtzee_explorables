import { useEffect, useRef } from 'react'
import { useBeatContext } from './BeatContext'

/**
 * Tracks which beat section is centered in the viewport and pushes it into the
 * beat context. Native scroll only — no hijacking. rAF-throttled scroll/resize
 * plus an IntersectionObserver to wake on band crossings.
 *
 * Also drives the entrance choreography: when a new scene's text has landed,
 * the right-hand model is withheld until the reader scrolls once more (or a
 * short fallback elapses), so the thought arrives before the thing it tests.
 */
export function useActiveBeat() {
  const { setActiveBeatId, setActiveSceneId, revealModel } = useBeatContext()
  const observerRef = useRef<IntersectionObserver | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastBeatRef = useRef<string | null>(null)
  const revealTimerRef = useRef<number | null>(null)

  const update = () => {
    const sections = document.querySelectorAll('[data-beat-id]')
    if (sections.length === 0) return

    const viewportCenter = window.innerHeight / 2
    let closest: Element | null = null
    let closestDistance = Infinity

    sections.forEach((el) => {
      const rect = el.getBoundingClientRect()
      const center = rect.top + rect.height / 2
      const distance = Math.abs(center - viewportCenter)
      if (distance < closestDistance) {
        closestDistance = distance
        closest = el
      }
    })

    if (closest) {
      const beatId = (closest as HTMLElement).getAttribute('data-beat-id')
      const sceneId = (closest as HTMLElement).getAttribute('data-scene-id')
      if (beatId && beatId !== lastBeatRef.current) {
        lastBeatRef.current = beatId
        setActiveBeatId(beatId)
        if (sceneId) setActiveSceneId(sceneId)

        // Entrance choreography: reveal the model a beat after the text lands,
        // as a fallback in case the reader doesn't actively scroll further.
        if (revealTimerRef.current !== null) {
          window.clearTimeout(revealTimerRef.current)
        }
        revealTimerRef.current = window.setTimeout(() => revealModel(), 1100)
      }
    }
  }

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current !== null) return
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null
        update()
      })
    }

    // Any deliberate downward intent reveals the active scene's model.
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) revealModel()
    }
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', ' ', 'Spacebar'].includes(e.key)) {
        revealModel()
      }
    }
    const onTouchMove = () => revealModel()

    update()

    observerRef.current = new IntersectionObserver(() => update(), {
      rootMargin: '-45% 0px -45% 0px',
    })
    document.querySelectorAll('[data-beat-id]').forEach((el) => {
      observerRef.current?.observe(el as HTMLElement)
    })

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('keydown', onKey)
    window.addEventListener('touchmove', onTouchMove, { passive: true })

    return () => {
      observerRef.current?.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('touchmove', onTouchMove)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      if (revealTimerRef.current !== null) clearTimeout(revealTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setActiveBeatId, setActiveSceneId, revealModel])
}
