import { useBeatContext } from './BeatContext'

/**
 * The fixed right-hand stage. It is pinned to the viewport and never scrolls —
 * only its content swaps as the active beat changes.
 */
export function ActiveSceneRenderer() {
  const { scenes, activeBeat, satisfyGate, revealed, isSatisfied } = useBeatContext()

  const scene = activeBeat
    ? scenes.find((s) => s.id === activeBeat.scene)
    : undefined
  const Model = scene?.model

  // When the active beat is gated and not yet satisfied, the reader must act on
  // the model: its controls pulse to draw the eye.
  const awaiting = !!(activeBeat?.gate && !isSatisfied(activeBeat.id))

  return (
    <aside
      className={`scene-stage ${revealed ? 'is-revealed' : ''} ${awaiting ? 'scene-stage--await' : ''}`}
    >
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
