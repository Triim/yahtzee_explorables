import { useEffect, useRef } from 'react'

/**
 * Full-screen title that splits like a curtain as the reader scrolls the first
 * viewport: the left half slides off to uncover the text column, the right half
 * slides off to uncover the fixed model stage, and the centered title fades.
 *
 * The split is driven continuously by scroll position (0 → 1 over the first
 * viewport height) via a CSS custom property, so it stays in sync with native
 * scrolling — no wheel hijack.
 */
export function HeroTitle() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const apply = () => {
      rafRef.current = null
      const h = window.innerHeight || 1
      const p = Math.min(Math.max(window.scrollY / h, 0), 1)
      rootRef.current?.style.setProperty('--p', String(p))
      // Once fully parted, stop intercepting pointer events.
      if (rootRef.current) {
        rootRef.current.style.pointerEvents = p > 0.98 ? 'none' : ''
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

  const scrollDown = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
  }

  return (
    <div className="hero" ref={rootRef} style={{ ['--p' as string]: 0 }}>
      {/* Two curtain halves that part on scroll, uncovering text + model. */}
      <div className="hero-curtain hero-curtain--left" />
      <div className="hero-curtain hero-curtain--right" />

      {/* Centered title, fades as the curtain parts. */}
      <div className="hero-titles">
        <h1 className="hero-title">Пять кубиков</h1>
        <p className="hero-sub">
          За простой игрой в кости прячется вся математика случайности — от
          первого броска до стратегии против соперника. Эта история проходит её
          целиком, и каждый шаг можно потрогать руками.
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
      </div>
    </div>
  )
}
