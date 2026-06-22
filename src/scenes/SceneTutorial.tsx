import { useEffect, useRef, useState } from 'react'
import type { SceneModelProps, Scene } from '@/scaffolding'
import { useTr, usePlayerState } from '@/scaffolding'
import { Die, useDieRoll } from '@/components'
import './Tutorial.css'

/* ============================================================
   Tutorial — just the game, no math. The reader actually plays one
   full game of Yahtzee: roll, hold, reroll, write a row. The finished
   scorecard is saved to PlayerState and called back later in the article.
   ============================================================ */

const NAMES_RU = [
  'Единицы', 'Двойки', 'Тройки', 'Четвёрки', 'Пятёрки', 'Шестёрки',
  'Тройка', 'Каре', 'Фулл-хаус', 'Малый стрейт', 'Большой стрейт', 'Yahtzee', 'Шанс',
]
const NAMES_EN = [
  'Ones', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes',
  'Three of a kind', 'Four of a kind', 'Full house', 'Small straight', 'Large straight', 'Yahtzee', 'Chance',
]

function counts(hand: number[]): number[] {
  const c = [0, 0, 0, 0, 0, 0, 0]
  hand.forEach((v) => c[v]++)
  return c
}
function sum(hand: number[]): number {
  return hand.reduce((a, b) => a + b, 0)
}
const has = (h: number[], v: number) => h.includes(v)

/** Score a hand in category 0..12 (the standard Yahtzee rules). */
function scoreCategory(hand: number[], cat: number): number {
  const c = counts(hand)
  if (cat < 6) return c[cat + 1] * (cat + 1)
  if (cat === 6) return c.some((x) => x >= 3) ? sum(hand) : 0
  if (cat === 7) return c.some((x) => x >= 4) ? sum(hand) : 0
  if (cat === 8) return c.some((x) => x === 3) && c.some((x) => x === 2) ? 25 : 0
  if (cat === 9) {
    const ss =
      (has(hand, 1) && has(hand, 2) && has(hand, 3) && has(hand, 4)) ||
      (has(hand, 2) && has(hand, 3) && has(hand, 4) && has(hand, 5)) ||
      (has(hand, 3) && has(hand, 4) && has(hand, 5) && has(hand, 6))
    return ss ? 30 : 0
  }
  if (cat === 10) {
    const ls =
      (has(hand, 1) && has(hand, 2) && has(hand, 3) && has(hand, 4) && has(hand, 5)) ||
      (has(hand, 2) && has(hand, 3) && has(hand, 4) && has(hand, 5) && has(hand, 6))
    return ls ? 40 : 0
  }
  if (cat === 11) return c.some((x) => x === 5) ? 50 : 0
  return sum(hand) // chance
}

function rollFace() {
  return ((Math.random() * 6) | 0) + 1
}

/** One tutorial die that re-throws (reusing useDieRoll) when it was rolled this
 *  turn; held dice sit still and just keep showing their value. */
function TutorialDie({
  value,
  animate,
  rollToken,
  held,
  disabled,
  onClick,
}: {
  value: number
  animate: boolean
  rollToken: number
  held: boolean
  disabled: boolean
  onClick: () => void
}) {
  const die = useDieRoll(value)
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (animate) die.start(value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rollToken])

  return (
    <button className="tut-die" onClick={onClick} disabled={disabled}>
      <Die value={die.displayValue} size={56} held={held} throwing={die.throwing} />
    </button>
  )
}

export function TutorialModel({ activeBeatId, satisfyGate }: SceneModelProps) {
  const beat = activeBeatId ?? ''
  const tr = useTr()
  const names = tr('ru', 'en') === 'en' ? NAMES_EN : NAMES_RU
  const { scorecard, scoreCell, filled, done, record, resetGame } = usePlayerState()

  // local turn state (the in-progress hand); the scorecard itself lives in context
  const [hand, setHand] = useState<number[]>([1, 2, 3, 4, 5])
  const [held, setHeld] = useState<boolean[]>([false, false, false, false, false])
  const [rerolls, setRerolls] = useState(3) // rolls remaining this turn (1 initial + 2 rerolls)
  const [rolled, setRolled] = useState(false)
  // Drives the throw animation: a token that ticks each roll, plus the per-die
  // mask of which dice actually flew (held dice stay put).
  const [rollToken, setRollToken] = useState(0)
  const [rolling, setRolling] = useState<boolean[]>([false, false, false, false, false])

  const upper = (scorecard.slice(0, 6) as (number | null)[]).reduce<number>((a, b) => a + (b ?? 0), 0)
  const runningTotal = scorecard.reduce<number>((a, b) => a + (b ?? 0), 0)

  // If the game is already finished, don't trap the play-gated beats.
  useEffect(() => {
    if (done && (beat === 'TUT.2' || beat === 'TUT.3')) satisfyGate?.()
  }, [done, beat, satisfyGate])

  const roll = () => {
    // A die flies unless it was explicitly held on a reroll (the first roll of a
    // turn throws all five). Same mask drives the hand update and the animation.
    const flew = hand.map((_, i) => !(rolled && held[i]))
    setHand((h) => h.map((v, i) => (flew[i] ? rollFace() : v)))
    setRolling(flew)
    setRollToken((t) => t + 1)
    setRerolls((r) => r - 1)
    setRolled(true)
    // Rolling only opens the "roll the dice" beat; the write-a-row beats must be
    // opened by actually writing a row (see writeRow), not by rerolling.
    if (beat === 'TUT.1') satisfyGate?.()
  }

  const toggleHold = (i: number) => {
    if (!rolled) return
    setHeld((h) => h.map((v, j) => (j === i ? !v : v)))
  }

  const writeRow = (cat: number) => {
    if (!rolled || scorecard[cat] !== null) return
    scoreCell(cat, scoreCategory(hand, cat))
    // next turn
    setHeld([false, false, false, false, false])
    setRerolls(3)
    setRolled(false)
    satisfyGate?.()
  }

  return (
    <div className="tut-model">
      {!done ? (
        <>
          <div className="tut-hand">
            {hand.map((v, i) => (
              <TutorialDie
                key={i}
                value={v}
                animate={rolling[i]}
                rollToken={rollToken}
                held={held[i]}
                disabled={!rolled}
                onClick={() => toggleHold(i)}
              />
            ))}
          </div>
          <div className="tut-controls">
            <button className="tut-btn" onClick={roll} disabled={rerolls <= 0}>
              {!rolled
                ? tr('бросить', 'roll')
                : rerolls > 0
                  ? `${tr('переброс', 'reroll')} · ${rerolls}`
                  : tr('перебросов нет', 'no rerolls')}
            </button>
            <span className="tut-hint">
              {rolled
                ? tr('кликни кубик — оставить, затем выбери строку', 'click a die to keep, then pick a row')
                : tr('брось пять кубиков', 'roll the five dice')}
            </span>
          </div>
        </>
      ) : (
        <div className="tut-final">
          <span className="tut-final-num">{record?.finalScore}</span>
          <span className="tut-final-label">
            {tr('очков за партию', 'points this game')}
            {record?.gotBonus ? tr(' · бонус +35', ' · bonus +35') : ''}
          </span>
          <button className="tut-btn" onClick={resetGame}>{tr('сыграть заново', 'play again')}</button>
        </div>
      )}

      <div className="tut-card">
        {[
          { h: tr('Верх', 'Upper'), cats: [0, 1, 2, 3, 4, 5] },
          { h: tr('Низ', 'Lower'), cats: [6, 7, 8, 9, 10, 11, 12] },
        ].map((sec) => (
          <div className="tut-section" key={sec.h}>
            <span className="tut-section-h">{sec.h}</span>
            <ol className="tut-rows">
              {sec.cats.map((cat) => {
                const closed = scorecard[cat] !== null
                const preview = rolled && !closed ? scoreCategory(hand, cat) : null
                return (
                  <li key={cat}>
                    <button
                      className={`tut-row ${closed ? 'tut-row--closed' : ''}`}
                      onClick={() => writeRow(cat)}
                      disabled={closed || !rolled || done}
                    >
                      <span className="tut-row-name">{names[cat]}</span>
                      <span className="tut-row-score">
                        {closed ? scorecard[cat] : preview !== null ? `+${preview}` : ''}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </div>
        ))}
      </div>

      <div className="tut-totals">
        <span>{tr('верх', 'upper')}: {upper}/63{upper >= 63 ? ' +35' : ''}</span>
        <span>{tr('итог', 'total')}: {runningTotal}{record?.gotBonus ? ' +35' : ''}</span>
        <span>{tr('строк', 'rows')}: {filled}/13</span>
      </div>
    </div>
  )
}

export const sceneTutorial: Scene = {
  id: 'scene-tutorial',
  model: TutorialModel,
  beats: [
    {
      id: 'TUT.1',
      scene: 'scene-tutorial',
      prompt:
        'Прежде чем считать — сыграй. Брось пять кубиков. Любые можно оставить и перебросить ещё дважды, собирая комбинацию повыше.',
      payoff:
        'Кликаешь кубик — он остаётся на месте, остальные летят заново. Два переброса за ход, и можно остановиться раньше, если рука уже нравится. Всё как в настоящей игре — никакой математики, просто бросай.',
      gate: { kind: 'roll', needed: 1 },
    },
    {
      id: 'TUT.2',
      scene: 'scene-tutorial',
      prompt:
        'Рука собрана — пора её записать. Справа тринадцать строк; выбери одну, и в неё пойдут очки по правилу этой строки. Запиши первую руку.',
      payoff:
        'Строка закрывается навсегда: записал — и больше в неё нельзя. Верхние шесть строк берут сумму своих граней, нижние — за комбинации: тройку, каре, стрейты, фулл-хаус, пять одинаковых. «Шанс» примет что угодно.',
      gate: { kind: 'choice' },
    },
    {
      id: 'TUT.3',
      scene: 'scene-tutorial',
      prompt:
        'Теперь доиграй партию до конца — заполни все тринадцать строк. Думай, куда выгоднее писать слабую руку, а куда беречь сильную.',
      payoff:
        'Вот и вся игра: тринадцать ходов, тринадцать решений, и каждое — это компромисс между «взять сейчас» и «приберечь строку». В конце сложатся очки, и за верх в 63 дадут ещё +35.',
      gate: { kind: 'choice' },
    },
    {
      id: 'TUT.4',
      scene: 'scene-tutorial',
      prompt:
        'Партия сыграна — вот твой счёт. Запомни его: к этой самой партии мы ещё не раз вернёмся, когда будем разбирать, как сыграть лучше.',
      payoff:
        'Правила освоены за одну партию. Но за каждым «куда записать» прятался вопрос: а какой ход на самом деле лучший? Вот этим — математикой случая, спрятанной за костью, — мы дальше и займёмся. Начнём с самого простого случая — даже не с кубика, а с монеты: всего два исхода.',
    },
  ],
}
