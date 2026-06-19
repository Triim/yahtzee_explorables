import { useEffect, useRef } from 'react'

/** Hero content, duplicated into each clipped half so the text can be sliced. */
function HeroContent() {
  const scrollDown = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
  }
  return (
    <>
      <h1 className="hero-title">Пять кубиков</h1>
      <p className="hero-sub">
        За простой игрой в кости прячется вся математика случайности — от первого
        броска до стратегии против соперника. Эта история проходит её целиком, и
        каждый шаг можно потрогать руками.
      </p>
      <button
        type="button"
        className="hero-arrow"
        onClick={scrollDown}
        aria-label="Листай вниз"
      >
        <svg width="34" height="34" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M6 9l6 6 6-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </>
  )
}

/**
 * Full-screen title cut along the vertical pane seam, in two scroll steps:
 *   1st viewport of scroll — the LEFT half ("Пять") slides off to the left; the
 *     right half ("кубиков") stays put.
 *   2nd viewport of scroll — the RIGHT half slides off to the right, uncovering
 *     the fixed model stage beneath it.
 *
 * Driven continuously by scroll position via two CSS custom properties (--pl
 * for the left half over [0,H], --pr for the right half over [H,2H]), so it
 * stays in sync with native scrolling. The hero spacer is 2×100vh tall to give
 * the two steps room, and the first beat lands exactly as the right half clears.
 */
export function HeroTitle() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const apply = () => {
      rafRef.current = null
      const h = window.innerHeight || 1
      const y = window.scrollY
      const pl = Math.min(Math.max(y / h, 0), 1) // step 1: left half
      const pr = Math.min(Math.max((y - h) / h, 0), 1) // step 2: right half
      if (rootRef.current) {
        rootRef.current.style.setProperty('--pl', String(pl))
        rootRef.current.style.setProperty('--pr', String(pr))
        rootRef.current.style.pointerEvents = pr > 0.98 ? 'none' : ''
      }
    }
    const onScroll = () => {
      if (rafRef.current !== null) return
      rafRef.current = window.requestAnimationFrame(apply)
    }
    apply()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div
      className="hero"
      ref={rootRef}
      style={{ ['--pl' as string]: 0, ['--pr' as string]: 0 }}
    >
      <div className="hero-half hero-half--left" aria-hidden="true">
        <HeroContent />
      </div>
      <div className="hero-half hero-half--right">
        <HeroContent />
      </div>
    </div>
  )
}
