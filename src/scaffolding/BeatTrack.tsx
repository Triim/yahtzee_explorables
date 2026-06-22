import { useBeatContext } from './BeatContext'
import { useSettings } from './SettingsContext'
import { RichText } from './RichText'
import { GATE_CUE, beatPrompt, beatPayoff, pick } from '@/i18n'

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
  const { scenes, allBeats, activeBeatId, isSatisfied, reachableThrough } =
    useBeatContext()
  const { lang } = useSettings()

  const hasHero = (sceneId: string) =>
    sceneId !== 'opening' && !!scenes.find((s) => s.id === sceneId)?.menuLabel

  return (
    <div className="track">
      {allBeats.map((beat, i) => {
        const active = beat.id === activeBeatId
        const gated = !!beat.gate
        const open = !gated || isSatisfied(beat.id)
        // Past the first unsatisfied gate the document is collapsed: nothing to
        // scroll into until the gate opens. No wheel hijack, fully reversible.
        const locked = i > reachableThrough
        const payoff = beatPayoff(beat, lang)

        // A reachable, first-of-section beat gets a full-screen title hero in
        // front of it (the spacer the fixed curtain animates against). Skipped
        // when locked, so a hero never grants scroll past a closed gate.
        const firstOfScene = i === 0 || allBeats[i - 1].scene !== beat.scene
        const spacer =
          firstOfScene && !locked && hasHero(beat.scene) ? (
            <div
              key={`hero-${beat.scene}`}
              className="s-hero-spacer"
              data-section-hero={beat.scene}
              aria-hidden="true"
            />
          ) : null

        const section = (
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
              <div className="beat-prompt">
                <RichText text={beatPrompt(beat, lang)} />
              </div>

              {payoff && open && (
                <div className="beat-payoff">
                  <RichText text={payoff} />
                </div>
              )}

              {gated && !open && (
                <p className="beat-cue">{pick(GATE_CUE[beat.gate!.kind], lang)}</p>
              )}

              {open && i < reachableThrough && <Chevron />}
            </div>
          </section>
        )

        return spacer ? [spacer, section] : section
      })}
    </div>
  )
}
