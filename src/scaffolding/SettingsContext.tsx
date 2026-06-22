import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import type { Lang } from '@/i18n'

export type Theme = 'light' | 'dark'

interface SettingsValue {
  lang: Lang
  theme: Theme
  setLang: (l: Lang) => void
  setTheme: (t: Theme) => void
  toggleLang: () => void
  toggleTheme: () => void
}

const SettingsContext = createContext<SettingsValue | undefined>(undefined)

function initialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * App-wide, in-memory UI settings: reading language (ru/en) and colour theme.
 * The theme is written to <html data-theme> so CSS can override the OS default;
 * the language is written to <html lang> for correctness. Nothing is persisted
 * (the project keeps state in memory only).
 */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('ru')
  const [theme, setTheme] = useState<Theme>(initialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang)
  }, [lang])

  const toggleLang = useCallback(() => setLang((l) => (l === 'ru' ? 'en' : 'ru')), [])
  const toggleTheme = useCallback(() => setTheme((t) => (t === 'light' ? 'dark' : 'light')), [])

  const value = useMemo(
    () => ({ lang, theme, setLang, setTheme, toggleLang, toggleTheme }),
    [lang, theme, toggleLang, toggleTheme]
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}

/**
 * Inline translator for model micro-labels: `const tr = useTr(); tr('бросок','roll')`.
 * Keeps the Russian source and English side by side at the call site.
 */
export function useTr() {
  const { lang } = useSettings()
  return useCallback((ru: string, en: string) => (lang === 'en' ? en : ru), [lang])
}
