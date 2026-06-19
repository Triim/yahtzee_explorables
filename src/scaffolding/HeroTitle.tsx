/**
 * Full-screen title card. Per the intro spec: title + short description + a soft
 * "scroll down" arrow. No models live on the hero — only the invitation to read.
 */
export function HeroTitle() {
  const scrollDown = () => {
    const first = document.querySelector('[data-beat-id]')
    first?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <header className="hero">
      <div className="hero-inner">
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
    </header>
  )
}
