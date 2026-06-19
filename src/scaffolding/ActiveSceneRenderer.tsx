import { useBeatContext } from './BeatContext'

export function ActiveSceneRenderer() {
  const { scenes, activeBeat, satisfyGate, revealed } = useBeatContext()

  if (!activeBeat) {
    return <div className="scene-panel" aria-hidden="true" />
  }

  const scene = scenes.find((s) => s.id === activeBeat.scene)
  if (!scene) {
    return <div className="scene-panel" aria-hidden="true" />
  }

  const Model = scene.model

  return (
    <div className={`scene-panel ${revealed ? 'is-revealed' : ''}`}>
      <div className="scene-panel-inner">
        <Model
          key={scene.id}
          activeBeatId={activeBeat.id}
          modelState={activeBeat.modelState}
          satisfyGate={() => satisfyGate(activeBeat.id)}
          revealed={revealed}
        />
      </div>
    </div>
  )
}
