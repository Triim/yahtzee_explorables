import type { Beat } from '@/scaffolding'
import type { Lang } from './strings'
import { BEATS_EN } from './en'

export type { Lang, Bilingual } from './strings'
export { UI, GATE_CUE, MENU, pick } from './strings'
export { BEATS_EN } from './en'

/** Beat prompt in the active language (English overrides, Russian is the source). */
export function beatPrompt(beat: Beat, lang: Lang): string {
  if (lang === 'en') return BEATS_EN[beat.id]?.prompt ?? beat.prompt
  return beat.prompt
}

/** Beat payoff in the active language, or undefined if the beat has none. */
export function beatPayoff(beat: Beat, lang: Lang): string | undefined {
  if (lang === 'en') return BEATS_EN[beat.id]?.payoff ?? beat.payoff
  return beat.payoff
}
