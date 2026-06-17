import { useEffect, useState, useRef } from 'react'

export function useActiveStep(stepIds: string[]) {
  const [activeStepId, setActiveStepId] = useState<string | null>(
    stepIds.length > 0 ? stepIds[0] : null
  )
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const stepElements = stepIds
      .map((id) => document.getElementById(id))
      .filter((el) => el !== null) as HTMLElement[]

    if (stepElements.length === 0) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        let closestEntry = entries[0]
        let closestDistance = Infinity

        entries.forEach((entry) => {
          const rect = entry.boundingClientRect
          const distance = Math.abs(rect.top - window.innerHeight / 2)

          if (distance < closestDistance) {
            closestDistance = distance
            closestEntry = entry
          }
        })

        if (closestEntry.target.id) {
          setActiveStepId(closestEntry.target.id)
        }
      },
      {
        rootMargin: '-50% 0px -50% 0px',
      }
    )

    stepElements.forEach((el) => {
      if (observerRef.current) {
        observerRef.current.observe(el)
      }
    })

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [stepIds])

  return activeStepId
}
