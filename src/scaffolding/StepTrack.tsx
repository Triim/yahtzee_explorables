import { StepRenderer } from './StepRenderer'
import type { Scene as SceneType } from './types'
import { useActiveStepContext } from './ActiveStepContext'

interface StepTrackProps {
  scenes: SceneType[]
}

export function StepTrack({ scenes }: StepTrackProps) {
  const { activeStepId } = useActiveStepContext()

  return (
    <div className="track">
      {scenes.map((scene) =>
        scene.steps.map((step) => {
          const isActive = step.id === activeStepId
          return (
            <section
              key={step.id}
              className={`step ${isActive ? 'active' : ''}`}
              data-step-id={step.id}
              data-scene-id={scene.id}
            >
              <StepRenderer step={step} />
            </section>
          )
        })
      )}
    </div>
  )
}
