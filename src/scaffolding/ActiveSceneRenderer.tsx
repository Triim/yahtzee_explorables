import { useBeatContext } from './BeatContext'
import { ErrorBoundary } from './ErrorBoundary'
import { getSceneBeats } from './beats'
import type { Scene as SceneType } from './types'

interface ActiveSceneRendererProps {
  scenes: SceneType[]
}

export function ActiveSceneRenderer({ scenes }: ActiveSceneRendererProps) {
  const { activeSceneId, activeBeatId, satisfyBeat } = useBeatContext()

  const activeScene = scenes.find((s) => s.id === activeSceneId)
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

  // Resolve the active beat's register/directive (beats may not carry these;
  // legacy steps still do via the conversion in getSceneBeats — register
  // defaults to 'free').
  const beats = getSceneBeats(sceneToRender)
  const activeBeat = beats.find((b) => b.id === activeBeatId)
  const register = 'free' as const

  const ModelComponent = sceneToRender.model

  return (
    <aside className="stage">
      <ErrorBoundary key={sceneToRender.id} label={sceneToRender.id}>
        <ModelComponent
          activeStepId={activeBeat?.id ?? activeBeatId}
          register={register}
          satisfyGate={() => {
            if (activeBeatId) satisfyBeat(activeBeatId)
          }}
        />
      </ErrorBoundary>
    </aside>
  )
}
