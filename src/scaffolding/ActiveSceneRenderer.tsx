import { useActiveStepContext } from './ActiveStepContext'
import type { Scene as SceneType } from './types'

interface ActiveSceneRendererProps {
  scenes: SceneType[]
}

export function ActiveSceneRenderer({ scenes }: ActiveSceneRendererProps) {
  const { activeSceneId, activeStepId } = useActiveStepContext()

  const activeScene = scenes.find((s) => s.id === activeSceneId)

  // Only render active scene; others unmount (mount discipline)
  if (!activeScene) {
    return null
  }

  const activeStep = activeScene.steps.find((s) => s.id === activeStepId)
  const activeDirective = activeStep?.directive
  const activeRegister = activeStep?.register || 'free'

  const ModelComponent = activeScene.model

  return (
    <aside className="stage" key={activeScene.id}>
      <ModelComponent
        activeStepId={activeStepId}
        directive={activeDirective}
        register={activeRegister}
      />
    </aside>
  )
}
