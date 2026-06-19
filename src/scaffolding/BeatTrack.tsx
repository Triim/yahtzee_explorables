import type { GateKind } from './types'
import { useBeatContext } from './BeatContext'
import { RichText } from './RichText'

const GATE_CUE: Record<GateKind, string> = {
  roll: 'бросьте, чтобы продолжить',
  slider: 'потяните ползунок, чтобы продолжить',
  choice: 'выберите, чтобы продолжить',
  hold: 'удержите кубик, чтобы продолжить',
  toggle: 'переключите, чтобы продолжить',
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

export function BeatTrack() {
  const { allBeats, activeBeatId, isSatisfied, reachableThrough } =
    useBeatContext()

  return (
    <div className="track">
      {allBeats.map((beat, i) => {
        const active = beat.id === activeBeatId
        const gated = !!beat.gate
        const open = !gated || isSatisfied(beat.id)
        // Past the first unsatisfied gate the document is collapsed: nothing to
        // scroll into until the gate opens. No wheel hijack, fully reversible.
        const locked = i > reachableThrough

        return (
          <section
            key={beat.id}
            className={`beat ${active ? 'active' : ''} ${
              locked ? 'beat--locked' : ''
            }`}
            data-beat-id={beat.id}
            data-scene-id={beat.scene}
            aria-hidden={locked || undefined}
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

              {open && i < reachableThrough && <Chevron />}
            </div>
          </section>
        )
      })}
    </div>
  )
}
