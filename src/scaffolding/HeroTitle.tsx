import { useEffect, useRef } from 'react'
import { useSettings } from './SettingsContext'
import { UI, pick } from '@/i18n'

/** Hero content, duplicated into each clipped half so the text can be sliced. */
function HeroContent() {
  const { lang } = useSettings()

  const introLine1 =
    lang === 'en'
      ? 'An interactive introduction to probability'
      : 'Интерактивное введение в теорию вероятностей'

  const introLine2 =
    lang === 'en'
      ? 'through a simple dice game.'
      : 'на примере простой игры в кости.'

  const seamLeft =
    lang === 'en'
      ? 'Read the left side'
      : 'Читай левое'

  const seamRight =
    lang === 'en'
      ? 'touch the right side.'
      : 'трогай правое.'

  const byline =
    lang === 'en'
      ? 'Site prepared by Ilia Mogilev.'
      : 'Сайт подготовлен Ильёй Могилевым.'

  const scrollDown = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
  }

  return (
    <>
      <div className="hero-dice-cluster" aria-hidden="true">
        <div className="hero-dice-side hero-dice-side--left">
          <span className="hero-die hero-die--1"><span className="pip pip--cc" /></span>
          <span className="hero-die hero-die--4">
            <span className="pip pip--tl" /><span className="pip pip--tr" />
            <span className="pip pip--bl" /><span className="pip pip--br" />
          </span>
        </div>

        <div className="hero-dice-side hero-dice-side--right">
          <span className="hero-die hero-die--2">
            <span className="pip pip--tl" /><span className="pip pip--br" />
          </span>
          <span className="hero-die hero-die--5">
            <span className="pip pip--tl" /><span className="pip pip--tr" />
            <span className="pip pip--cc" />
            <span className="pip pip--bl" /><span className="pip pip--br" />
          </span>
          <span className="hero-die hero-die--6">
            <span className="pip pip--tl" /><span className="pip pip--ml" /><span className="pip pip--bl" />
            <span className="pip pip--tr" /><span className="pip pip--mr" /><span className="pip pip--br" />
          </span>
        </div>
      </div>

      <div className="hero-copy">
        <p className="hero-sub">
          <span className="hero-sub-line hero-sub-line--intro">{introLine1}</span>
          <span className="hero-sub-line hero-sub-line--intro">{introLine2}</span>
          <span className="hero-sub-line hero-sub-line--seam">
            {seamLeft} — {seamRight}
          </span>
        </p>

        <p className="hero-byline">{byline}</p>
      </div>

      <button className="hero-arrow" type="button" onClick={scrollDown} aria-label={pick(UI.heroArrow, lang)}>
        ↓
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
