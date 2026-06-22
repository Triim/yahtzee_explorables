import { useSettings } from './SettingsContext'
import { UI, pick } from '@/i18n'

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  )
}

/** Fixed top-right controls: language (RU/EN) and colour theme (light/dark). */
export function Toggles() {
  const { lang, theme, setLang, toggleTheme } = useSettings()

  return (
    <div className="toggles">
      <div className="lang-toggle" role="group" aria-label={pick(UI.langSwitch, lang)}>
        <button
          type="button"
          className={`lang-opt ${lang === 'ru' ? 'is-on' : ''}`}
          onClick={() => setLang('ru')}
          aria-pressed={lang === 'ru'}
        >
          RU
        </button>
        <button
          type="button"
          className={`lang-opt ${lang === 'en' ? 'is-on' : ''}`}
          onClick={() => setLang('en')}
          aria-pressed={lang === 'en'}
        >
          EN
        </button>
      </div>

      <button
        type="button"
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={pick(UI.themeSwitch, lang)}
        title={pick(UI.themeSwitch, lang)}
      >
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>
    </div>
  )
}
