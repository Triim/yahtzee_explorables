import { useEffect, useRef } from 'react'
import { useActiveStepContext } from './ActiveStepContext'

export function useGlobalActiveStep() {
  const { setActiveStepId, setActiveSceneId } = useActiveStepContext()
  const observerRef = useRef<IntersectionObserver | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastStepRef = useRef<string | null>(null)

  const updateActiveStepFromScroll = () => {
    const allSteps = document.querySelectorAll('[data-step-id]')
    if (allSteps.length === 0) return

    const viewportCenter = window.innerHeight / 2
    let closestElement: Element | null = null
    let closestDistance = Infinity

    allSteps.forEach((el) => {
      const rect = el.getBoundingClientRect()
      const elementCenter = rect.top + rect.height / 2
      const distance = Math.abs(elementCenter - viewportCenter)
      if (distance < closestDistance) {
        closestDistance = distance
        closestElement = el
      }
    })

    if (closestElement) {
      const stepId = (closestElement as HTMLElement).getAttribute('data-step-id')
      const sceneId = (closestElement as HTMLElement).getAttribute('data-scene-id')
      // Only push state when the active step actually changed.
      if (stepId && stepId !== lastStepRef.current) {
        lastStepRef.current = stepId
        setActiveStepId(stepId)
        if (sceneId) setActiveSceneId(sceneId)
      }
    }
  }

  useEffect(() => {
    // Throttle scroll work to one update per animation frame.
    const onScroll = () => {
      if (rafRef.current !== null) return
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null
        updateActiveStepFromScroll()
      })
    }

    // Sync immediately so the stage matches the restored scroll position on
    // mount/refresh (browsers restore scroll on reload).
    updateActiveStepFromScroll()

    // IntersectionObserver wakes us as steps cross the center band; the scroll
    // listener keeps tracking continuous between those crossings.
    observerRef.current = new IntersectionObserver(() => updateActiveStepFromScroll(), {
      rootMargin: '-45% 0px -45% 0px',
    })
    document.querySelectorAll('[data-step-id]').forEach((el) => {
      observerRef.current?.observe(el as HTMLElement)
    })

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      observerRef.current?.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setActiveStepId, setActiveSceneId])
}
