import { useActiveStepContext } from './ActiveStepContext'
import { ErrorBoundary } from './ErrorBoundary'
import type { Scene as SceneType } from './types'

interface ActiveSceneRendererProps {
  scenes: SceneType[]
}

export function ActiveSceneRenderer({ scenes }: ActiveSceneRendererProps) {
  const { activeSceneId, activeStepId } = useActiveStepContext()

  // Build a registry from the scene list so a missing/unknown scene id is
  // an obvious, labeled fallback rather than a blank panel (Acceptance A).
  const activeScene = scenes.find((s) => s.id === activeSceneId)

  // Before the observer has resolved a scene (very first paint), default to the
  // first scene so the stage is never blank.
  const sceneToRender = activeScene ?? scenes[0]

  if (!sceneToRender) {
    return (
      <aside className="stage">
        <div className="stage-error">
          <strong>No scenes registered</strong>
        </div>
      </aside>
    )
  }

  // If we have an active scene id but it doesn't map to a scene, show it.
  if (activeSceneId && !activeScene) {
    return (
      <aside className="stage">
        <div className="stage-error">
          <strong>Unknown scene</strong>
          <pre>activeSceneId = "{activeSceneId}"</pre>
        </div>
      </aside>
    )
  }

  const activeStep = sceneToRender.steps.find((s) => s.id === activeStepId)
  const activeDirective = activeStep?.directive
  const activeRegister = activeStep?.register || 'free'

  const ModelComponent = sceneToRender.model

  return (
    <aside className="stage">
      <ErrorBoundary key={sceneToRender.id} label={sceneToRender.id}>
        <ModelComponent
          activeStepId={activeStepId}
          directive={activeDirective}
          register={activeRegister}
        />
      </ErrorBoundary>
    </aside>
  )
}
