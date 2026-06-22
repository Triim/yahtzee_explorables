import { useBeatContext } from './BeatContext'
import { useSettings } from './SettingsContext'
import { UI, MENU, pick } from '@/i18n'
import type { Scene } from './types'

/**
 * Left-edge progress rail: one neat horizontal bar per section. Bars before the
 * current section are marked done, the current section's bar is the longest —
 * so the band of filled bars shows how far through the article you are. Bars are
 * clickable and each label flies out on hover.
 */
export function NavMenu() {
  const { scenes, activeSceneId, allBeats, reachableThrough } = useBeatContext()
  const { lang } = useSettings()

  const entries = scenes.filter((s) => s.menuLabel)
  const activeIndex = entries.findIndex((s) => s.id === activeSceneId)

  // A section is reachable once its first beat is no longer behind a closed gate.
  // The menu navigates within reached territory and leaves locked sections
  // disabled — so jumping never bypasses a gate (which would break the gating).
  const reachable = (sceneId: string) => {
    const idx = allBeats.findIndex((b) => b.scene === sceneId)
    return idx >= 0 && idx <= reachableThrough
  }

  const goTo = (sceneId: string) => {
    if (!reachable(sceneId)) return
    // prefer the section's hero card so the jump re-enters through its title
    const target =
      document.querySelector(`[data-section-hero="${sceneId}"]`) ||
      document.querySelector(`[data-scene-id="${sceneId}"]`)
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const labelFor = (s: Scene) =>
    lang === 'en' && MENU[s.id] ? pick(MENU[s.id], lang) : s.menuLabel

  return (
    <nav className="rail" aria-label={pick(UI.sections, lang)}>
      <ol className="rail-bars">
        {entries.map((s, i) => {
          const active = s.id === activeSceneId
          const done = activeIndex >= 0 && i < activeIndex
          const locked = !reachable(s.id)
          return (
            <li key={s.id} className="rail-item">
              <button
                type="button"
                className={`rail-bar ${active ? 'is-active' : ''} ${done ? 'is-done' : ''} ${locked ? 'is-locked' : ''}`}
                onClick={() => goTo(s.id)}
                disabled={locked}
                aria-current={active ? 'step' : undefined}
              >
                <span className="rail-bar-mark" aria-hidden="true" />
                <span className="rail-bar-label">{labelFor(s)}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
