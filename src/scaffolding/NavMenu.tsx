import { useState } from 'react'
import { useBeatContext } from './BeatContext'

/**
 * Persistent collapsible navigation rail: Введение + the ten sections. The
 * current section is highlighted; clicking jumps to the start of that section.
 * Built from scenes that declare a `menuLabel`, in document order.
 */
export function NavMenu() {
  const { scenes, activeSceneId } = useBeatContext()
  const [open, setOpen] = useState(false)

  const entries = scenes.filter((s) => s.menuLabel)

  const goTo = (sceneId: string) => {
    const el = document.querySelector(`[data-scene-id="${sceneId}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setOpen(false)
  }

  return (
    <nav className={`nav ${open ? 'nav--open' : ''}`} aria-label="Разделы">
      <button
        type="button"
        className="nav-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? 'Свернуть меню' : 'Развернуть меню'}
      >
        <span className="nav-toggle-bar" />
        <span className="nav-toggle-bar" />
        <span className="nav-toggle-bar" />
      </button>

      <ol className="nav-list">
        {entries.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              className={`nav-item ${
                s.id === activeSceneId ? 'nav-item--active' : ''
              }`}
              onClick={() => goTo(s.id)}
            >
              {s.menuLabel}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}
