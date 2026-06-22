import type { GateKind } from '@/scaffolding'

export type Lang = 'ru' | 'en'

/** A string that exists in both languages. */
export type Bilingual = { ru: string; en: string }

export function pick(b: Bilingual, lang: Lang): string {
  return b[lang]
}

/* ---- UI chrome (everything that isn't beat content) ---- */

export const UI = {
  heroTitle: { ru: 'Пять кубиков', en: 'Five dice' },
  heroSub: {
    ru: 'Яцзы — игра в пять кубиков: бросаешь, собираешь комбинации и заполняешь тринадцать строк; у кого за партию больше очков, тот и выиграл. А ещё это интерактивное введение в теорию вероятностей на примере простой игры в кости — от первого броска до игры против соперника вся математика случайности собрана здесь руками. Трогаешь правое — читаешь левое.',
    en: 'Yahtzee is a game of five dice: you roll, build combinations and fill in thirteen rows; whoever scores the most over a game wins. It’s also an interactive introduction to probability through a simple dice game — from the first roll to playing an opponent, all the mathematics of chance, assembled here by hand. You touch on the right, you read on the left.',
  },
  heroArrow: { ru: 'Листай вниз', en: 'Scroll down' },
  sections: { ru: 'Разделы', en: 'Sections' },
  progress: { ru: 'Прогресс чтения', en: 'Reading progress' },
  themeSwitch: { ru: 'Сменить тему', en: 'Switch theme' },
  langSwitch: { ru: 'Сменить язык', en: 'Switch language' },
  mobile: {
    ru: 'Эта интерактивная история рассчитана на широкий экран. Открой её на компьютере.',
    en: 'This interactive story is built for a wide screen. Open it on a computer.',
  },
} satisfies Record<string, Bilingual>

export const GATE_CUE: Record<GateKind, Bilingual> = {
  roll: { ru: 'бросьте, чтобы продолжить', en: 'roll to continue' },
  slider: { ru: 'потяните ползунок, чтобы продолжить', en: 'drag the slider to continue' },
  choice: { ru: 'выберите, чтобы продолжить', en: 'make a choice to continue' },
  hold: { ru: 'удержите кубик, чтобы продолжить', en: 'hold a die to continue' },
  toggle: { ru: 'переключите, чтобы продолжить', en: 'flip the switch to continue' },
}

/** Menu labels by scene id (RU mirrors the labels set in App.tsx). */
export const MENU: Record<string, Bilingual> = {
  opening: { ru: 'Введение', en: 'Intro' },
  'scene-tutorial': { ru: 'Туториал · Сыграй сам', en: 'Tutorial · Play it yourself' },
  'scene-1': { ru: '1 · Что значит «вероятно»?', en: '1 · What does “probable” mean?' },
  'scene-sum': { ru: '2 · Какие суммы выпадают чаще?', en: '2 · Which sums come up more often?' },
  'scene-2': { ru: '3 · Сколько бывает раскладов?', en: '3 · How many outcomes are there?' },
  'scene-counting': { ru: '4 · Откуда берётся 252?', en: '4 · Where does 252 come from?' },
  'scene-multiset': { ru: '5 · Все ли руки равновероятны?', en: '5 · Are all hands equally likely?' },
  'scene-3': { ru: '6 · Как считаются очки?', en: '6 · How is it scored?' },
  'scene-4': { ru: '7 · Что выгоднее оставить?', en: '7 · What’s better to keep?' },
  'scene-5': { ru: '8 · Сколько рука стоит в среднем?', en: '8 · What’s a hand worth on average?' },
  'scene-6': { ru: '9 · Почему «брать максимум» проигрывает?', en: '9 · Why does “grab the max” lose?' },
  'scene-7': { ru: '10 · Чего стоит каждое положение?', en: '10 · What is each position worth?' },
  'scene-8': { ru: '11 · Насколько разбросан счёт?', en: '11 · How spread out are the scores?' },
  'scene-strat': { ru: '12 · Как вообще играть?', en: '12 · How do you even play?' },
  'scene-9': { ru: '13 · Что меняет соперник?', en: '13 · What does the opponent change?' },
  'scene-10': { ru: '14 · Мастерство или удача?', en: '14 · Skill or luck?' },
  'scene-fair': { ru: 'Доп · А честная ли кость?', en: 'Side-quest · Is the die fair?' },
}
