import { useEffect, useRef } from 'react'
import { useSettings } from './SettingsContext'
import { UI, pick } from '@/i18n'

/** Hero content, duplicated into each clipped half so the text can be sliced. */
function HeroContent() {
  const { lang } = useSettings()
  const scrollDown = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
  }
  return (
    <>
      <div className="hero-center">
        <h1 className="hero-title">{pick(UI.heroTitle, lang)}</h1>
        <div className="hero-dice-title" aria-hidden="true">
          <span className="hero-title-die hero-title-die--1"><span className="hero-title-pip hero-title-pip--cc" /></span>
          <span className="hero-title-die hero-title-die--4">
            <span className="hero-title-pip hero-title-pip--tl" /><span className="hero-title-pip hero-title-pip--tr" />
            <span className="hero-title-pip hero-title-pip--bl" /><span className="hero-title-pip hero-title-pip--br" />
          </span>
          <span className="hero-title-die hero-title-die--2">
            <span className="hero-title-pip hero-title-pip--tl" /><span className="hero-title-pip hero-title-pip--br" />
          </span>
          <span className="hero-title-die hero-title-die--5">
            <span className="hero-title-pip hero-title-pip--tl" /><span className="hero-title-pip hero-title-pip--tr" />
            <span className="hero-title-pip hero-title-pip--cc" />
            <span className="hero-title-pip hero-title-pip--bl" /><span className="hero-title-pip hero-title-pip--br" />
          </span>
          <span className="hero-title-die hero-title-die--6">
            <span className="hero-title-pip hero-title-pip--tl" /><span className="hero-title-pip hero-title-pip--ml" /><span className="hero-title-pip hero-title-pip--bl" />
            <span className="hero-title-pip hero-title-pip--tr" /><span className="hero-title-pip hero-title-pip--mr" /><span className="hero-title-pip hero-title-pip--br" />
          </span>
        </div>
        <p className="hero-sub">{pick(UI.heroSub, lang)}</p>
        <p className="hero-author">{pick(UI.heroAuthor, lang)}</p>
      </div>
      <button
        type="button"
        className="hero-arrow"
        onClick={scrollDown}
        aria-label={pick(UI.heroArrow, lang)}
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
 * Full-screen title cut along the vertical pane seam. The two halves are covers
 * that lift straight UP in two scroll steps, uncovering what sits behind them:
 *   1st viewport of scroll — the LEFT half ("Пять") lifts up, revealing the
 *     first beat's text (pinned in the left column beneath it).
 *   2nd viewport of scroll — the RIGHT half ("кубиков") lifts up, revealing the
 *     fixed model stage beneath it.
 *
 * Driven continuously by scroll position via two CSS custom properties (--pl
 * for the left half over [0,H], --pr for the right half over [H,2H]), so it
 * stays in sync with native scrolling.
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
