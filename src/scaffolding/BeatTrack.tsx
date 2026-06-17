import type { GateKind, Scene } from './types'
import { getSceneBeats } from './beats'
import { useBeatContext } from './BeatContext'
import { RichText } from './RichText'

const GATE_CUE: Record<GateKind, string> = {
  roll: 'roll to continue',
  slider: 'drag to continue',
  choice: 'choose to continue',
  hold: 'hold a die to continue',
  toggle: 'toggle to continue',
}

function Chevron() {
  return (
    <svg
      className="beat-chevron"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M6 9l6 6 6-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function BeatTrack({ scenes }: { scenes: Scene[] }) {
  const { activeBeatId, isSatisfied } = useBeatContext()
  const allBeats = scenes.flatMap(getSceneBeats)

  return (
    <div className="track">
      {allBeats.map((beat) => {
        const active = beat.id === activeBeatId
        const gated = !!beat.gate
        const open = !gated || isSatisfied(beat.id)

        return (
          <section
            key={beat.id}
            className={`beat ${active ? 'active' : ''}`}
            data-beat-id={beat.id}
            data-scene-id={beat.scene}
          >
            <div className="beat-inner">
              <p className="beat-prompt">
                <RichText text={beat.prompt} />
              </p>

              {beat.payoff && open && (
                <p className="beat-payoff">
                  <RichText text={beat.payoff} />
                </p>
              )}

              {gated && !open && (
                <p className="beat-cue">{GATE_CUE[beat.gate!.kind]}</p>
              )}

              {open && <Chevron />}
            </div>
          </section>
        )
      })}
    </div>
  )
}
