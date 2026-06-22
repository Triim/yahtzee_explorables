import { useBeatContext } from './BeatContext'
import { useSettings } from './SettingsContext'
import { UI, pick } from '@/i18n'

/** Section the skip button jumps to. */
const TARGET_SCENE = 'scene-1'

/**
 * A small escape hatch shown only while the reader is still in the opening /
 * tutorial run-up: it satisfies every gate before "What does «probable» mean?"
 * and scrolls straight to that section, so a returning reader isn't forced to
 * replay a whole game of Yahtzee before reaching the math.
 */
export function SkipTutorial() {
  const { allBeats, satisfyGate, reachableThrough, activeSceneId } =
    useBeatContext()
  const { lang } = useSettings()

  const targetIndex = allBeats.findIndex((b) => b.scene === TARGET_SCENE)
  const reachable = targetIndex >= 0 && reachableThrough >= targetIndex

  // Only offer the skip while the target is still gated off and the reader is in
  // the lead-up sections (opening or tutorial). Once scene-1 is reachable, gone.
  const inRunUp =
    activeSceneId === 'opening' || activeSceneId === 'scene-tutorial'
  if (targetIndex < 0 || reachable || !inRunUp) return null

  const skip = () => {
    // Open every gate standing between here and the target. This advances
    // reachableThrough, which un-collapses the target section on the next render.
    for (let i = 0; i < targetIndex; i++) {
      const b = allBeats[i]
      if (b.gate) satisfyGate(b.id)
    }
    // Converge on the target's hero spacer over successive frames. A single
    // scrollIntoView won't do: the spacer only mounts a frame or two after the
    // gate-satisfy render, and the freshly un-collapsed tutorial beats keep
    // growing above it — so a one-shot smooth scroll chases a moving target and
    // lands short. Re-aligning each frame until the spacer's top settles at the
    // fold tracks that shift and ends exactly on the section's title card.
    let tries = 0
    const jump = () => {
      const target = document.querySelector(
        `[data-section-hero="${TARGET_SCENE}"]`
      )
      if (target) {
        const top = Math.round(target.getBoundingClientRect().top)
        if (Math.abs(top) <= 2) return // landed
        // 'instant' is required: the page sets `scroll-behavior: smooth`, so a
        // plain scrollBy would animate every frame and the per-frame nudges
        // would fight each other into a slow crawl.
        window.scrollBy({ top, behavior: 'instant' })
      }
      if (tries++ < 120) requestAnimationFrame(jump)
    }
    requestAnimationFrame(jump)
  }

  return (
    <button type="button" className="skip-tutorial" onClick={skip}>
      <span>{pick(UI.skipTutorial, lang)}</span>
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M5 12h14M13 6l6 6-6 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
