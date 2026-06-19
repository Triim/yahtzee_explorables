import { useBeatContext } from './BeatContext'

/**
 * The fixed right-hand stage. It is pinned to the viewport and never scrolls —
 * only its content swaps as the active beat changes.
 */
export function ActiveSceneRenderer() {
  const { scenes, activeBeat, satisfyGate, revealed } = useBeatContext()

  const scene = activeBeat
    ? scenes.find((s) => s.id === activeBeat.scene)
    : undefined
  const Model = scene?.model

  return (
    <aside className={`scene-stage ${revealed ? 'is-revealed' : ''}`}>
      <div className="scene-stage-inner">
        {Model && scene && activeBeat && (
          <Model
            key={scene.id}
            activeBeatId={activeBeat.id}
            modelState={activeBeat.modelState}
            satisfyGate={() => satisfyGate(activeBeat.id)}
            revealed={revealed}
          />
        )}
      </div>
    </aside>
  )
}
