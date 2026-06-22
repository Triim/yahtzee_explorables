import { useEffect, useRef } from 'react'
import { useBeatContext } from './BeatContext'
import { useSettings } from './SettingsContext'
import { MENU, pick } from '@/i18n'

/**
 * A section title card for every section, by the same logic as the opening hero:
 * a full-screen title cut along the pane seam whose two halves lift straight up
 * as you scroll through the section's spacer, uncovering the section beneath.
 *
 * One fixed curtain is reused; the spacers live in the scroll flow (rendered by
 * BeatTrack, tagged `data-section-hero`). Each frame we find the spacer the
 * reader is currently inside and drive the lift from its scroll position — the
 * same imperative, scroll-synced approach as the opening hero.
 */
export function SectionHeroes() {
  const { scenes } = useBeatContext()
  const { lang } = useSettings()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const lRef = useRef<HTMLSpanElement | null>(null)
  const rRef = useRef<HTMLSpanElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastIdRef = useRef<string | null>(null)

  useEffect(() => {
    const labelFor = (id: string) =>
      lang === 'en' && MENU[id]
        ? pick(MENU[id], lang)
        : scenes.find((s) => s.id === id)?.menuLabel ?? ''

    const clamp = (v: number) => Math.min(Math.max(v, 0), 1)

    const apply = () => {
      rafRef.current = null
      const h = window.innerHeight || 1
      const root = rootRef.current
      if (!root) return

      // Pick the one spacer nearest the fold (spacers are >1 viewport apart, so
      // only one is ever in play). It governs the curtain.
      let activeId: string | null = null
      let top = 0
      let bestAbs = Infinity
      document.querySelectorAll('[data-section-hero]').forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.bottom <= 0 || r.top >= h * 0.6) return // off-screen / not yet due
        const a = Math.abs(r.top)
        if (a < bestAbs) {
          bestAbs = a
          activeId = el.getAttribute('data-section-hero')
          top = r.top
        }
      })

      if (!activeId) {
        root.style.opacity = '0'
        root.style.pointerEvents = 'none'
        return
      }

      // Progress q across the spacer: q=0 as the spacer's top reaches 0.6·h
      // (curtain off, above), q=1 once it has scrolled fully past (top at
      // −0.95·h). A menu jump lands the spacer top at 0 → q≈0.39 → full card.
      const q = clamp((0.6 - top / h) / 1.55)

      // Signed vertical offset per half: +1 = off-screen BELOW, 0 = covering,
      // −1 = off-screen above. The title ASSEMBLES from below as you scroll down
      // into it, holds, then LIFTS off the top — one half at a time, the two
      // motions mirror images in opposite order:
      //   in : right rises up, then left       (q 0.00→0.26)
      //   hold: full card                       (q 0.26→0.52)
      //   out: left lifts off, then right       (q 0.52→0.96)
      let pl: number
      if (q < 0.26) pl = 1 - clamp((q - 0.1) / 0.16) // +1 → 0, rise from below (2nd)
      else if (q < 0.52) pl = 0 // hold
      else pl = -clamp((q - 0.52) / 0.22) // 0 → −1, lift off top (1st)

      let pr: number
      if (q < 0.14) pr = 1 - clamp(q / 0.14) // +1 → 0, rise from below (1st)
      else if (q < 0.74) pr = 0 // hold
      else pr = -clamp((q - 0.74) / 0.22) // 0 → −1, lift off top (2nd)

      root.style.opacity = q <= 0.004 || q >= 0.955 ? '0' : '1'
      root.style.pointerEvents = 'none'
      root.style.setProperty('--pl', String(pl))
      root.style.setProperty('--pr', String(pr))
      if (activeId !== lastIdRef.current) {
        lastIdRef.current = activeId
        const label = labelFor(activeId)
        if (lRef.current) lRef.current.textContent = label
        if (rRef.current) rRef.current.textContent = label
      }
    }

    const onScroll = () => {
      if (rafRef.current === null) rafRef.current = window.requestAnimationFrame(apply)
    }
    apply()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [lang, scenes])

  return (
    <div
      className="s-hero"
      ref={rootRef}
      aria-hidden="true"
      style={{ ['--pl' as string]: 0, ['--pr' as string]: 0, opacity: 0, pointerEvents: 'none' }}
    >
      <div className="s-hero-half s-hero-half--left">
        <span className="s-hero-title" ref={lRef} />
        <svg className="s-hero-cue" width="30" height="30" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="s-hero-half s-hero-half--right">
        <span className="s-hero-title" ref={rRef} />
        <svg className="s-hero-cue" width="30" height="30" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}
