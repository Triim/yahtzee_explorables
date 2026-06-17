import type { Scene as SceneType } from './types'
import { useActiveStep } from './useActiveStep'
import { StepRenderer } from './StepRenderer'
import './Scene.css'

interface SceneProps {
  scene: SceneType
}

export function SceneComponent({ scene }: SceneProps) {
  const stepIds = scene.steps.map((s) => s.id)
  const activeStepId = useActiveStep(stepIds)

  const activeStep = scene.steps.find((s) => s.id === activeStepId)
  const activeDirective = activeStep?.directive
  const activeRegister = activeStep?.register || 'free'

  const ModelComponent = scene.model
  const panelType = scene.panel || 'single'

  return (
    <div className={`scene scene-${scene.id}`}>
      <div className="left-column">
        <div className="steps-container">
          {scene.steps.map((step) => (
            <StepRenderer
              key={step.id}
              step={step}
            />
          ))}
        </div>
      </div>

      <div className="right-panel" data-panel-type={panelType}>
        <ModelComponent
          activeStepId={activeStepId}
          directive={activeDirective}
          register={activeRegister}
        />
      </div>
    </div>
  )
}
