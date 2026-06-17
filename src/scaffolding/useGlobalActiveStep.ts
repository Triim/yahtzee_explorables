import { useEffect, useRef } from 'react'
import { useActiveStepContext } from './ActiveStepContext'

export function useGlobalActiveStep() {
  const { setActiveStepId, setActiveSceneId } = useActiveStepContext()
  const observerRef = useRef<IntersectionObserver | null>(null)

  const updateActiveStepFromScroll = () => {
    const allSteps = document.querySelectorAll('[data-step-id]')
    if (allSteps.length === 0) return

    const viewportCenter = window.innerHeight / 2
    let closestElement: Element | null = null
    let closestDistance = Infinity

    allSteps.forEach((el) => {
      const rect = el.getBoundingClientRect()
      const distance = Math.abs(rect.top - viewportCenter)
      if (distance < closestDistance) {
        closestDistance = distance
        closestElement = el
      }
    })

    if (closestElement) {
      const stepId = (closestElement as HTMLElement).getAttribute('data-step-id')
      const sceneId = (closestElement as HTMLElement).getAttribute('data-scene-id')
      if (stepId) setActiveStepId(stepId)
      if (sceneId) setActiveSceneId(sceneId)
    }
  }

  useEffect(() => {
    // Initialize on mount with current scroll position
    updateActiveStepFromScroll()

    // Set up IntersectionObserver for smooth updates
    observerRef.current = new IntersectionObserver(
      () => {
        // Recalculate on any intersection change
        updateActiveStepFromScroll()
      },
      {
        rootMargin: '-45% 0px -45% 0px',
      }
    )

    const allSteps = document.querySelectorAll('[data-step-id]')
    allSteps.forEach((el) => {
      observerRef.current?.observe(el as HTMLElement)
    })

    return () => {
      observerRef.current?.disconnect()
    }
  }, [setActiveStepId, setActiveSceneId])
}
