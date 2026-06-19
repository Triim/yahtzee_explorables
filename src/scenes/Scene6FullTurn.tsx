import { useState } from 'react'
import type { SceneModelProps, Scene } from '@/scaffolding'
import { Die, RollButton, useDieRoll } from '@/components'
import { rollToHand, scoreHand } from '@/engine'
import type { Category } from '@/engine'
import './FullTurnModel.css'

const CATEGORIES: { id: Category; label: string; upper: boolean }[] = [
  { id: 'ones', label: 'Ones', upper: true },
  { id: 'twos', label: 'Twos', upper: true },
  { id: 'threes', label: 'Threes', upper: true },
  { id: 'fours', label: 'Fours', upper: true },
  { id: 'fives', label: 'Fives', upper: true },
  { id: 'sixes', label: 'Sixes', upper: true },
  { id: 'three-of-a-kind', label: '3 of a kind', upper: false },
  { id: 'four-of-a-kind', label: '4 of a kind', upper: false },
  { id: 'full-house', label: 'Full house', upper: false },
  { id: 'small-straight', label: 'Sm straight', upper: false },
  { id: 'large-straight', label: 'Lg straight', upper: false },
  { id: 'yahtzee', label: 'Yahtzee', upper: false },
  { id: 'chance', label: 'Chance', upper: false },
]

export function FullTurnModel({ activeBeatId, satisfyGate }: SceneModelProps) {
  const [rollNum, setRollNum] = useState(0)
  const [hand, setHand] = useState<number[]>([1, 2, 3, 4, 5])
  const [kept, setKept] = useState<boolean[]>([false, false, false, false, false])
  const [upperSum, setUpperSum] = useState(0) // текущая сумма верхней секции до 63
  const dice = [useDieRoll(1), useDieRoll(2), useDieRoll(3), useDieRoll(4), useDieRoll(5)]

  const handleRoll = () => {
    if (rollNum >= 3) return
    const rolled = hand.map((v, i) => (kept[i] ? v : Math.floor(Math.random() * 6) + 1))
    rolled.forEach((v, i) => {
      if (!kept[i]) window.setTimeout(() => dice[i].start(v), i * 70)
    })
    setHand(rolled)
    setRollNum(rollNum + 1)
    satisfyGate?.() // гейт: бросок в ходе
  }

  const toggleKeep = (idx: number) => {
    if (rollNum > 0 && rollNum < 3) setKept(kept.map((k, i) => (i === idx ? !k : k)))
  }

  const handScores = (() => {
    const h = rollToHand(hand as never)
    const out = new Map<Category, number>()
    for (const c of CATEGORIES) out.set(c.id, scoreHand(h, c.id))
    return out
  })()

  const scoreBox = (cat: { id: Category; upper: boolean }) => {
    const pts = handScores.get(cat.id) ?? 0
    if (cat.upper) setUpperSum((s) => Math.min(63, s + pts))
    // сброс для нового хода
    setRollNum(0)
    setHand([1, 2, 3, 4, 5])
    setKept([false, false, false, false, false])
    satisfyGate?.() // гейт: выбрана ячейка
  }

  const showScorecard = rollNum === 3 || activeBeatId === 'B6.2'
  const bonusReached = upperSum >= 63
  const displayHand = hand.map((v, i) =>
    dice[i].throwing ? dice[i].displayValue : v
  )

  return (
    <div className="full-turn-model">
      <div className="turn-status">
        <p className="roll-counter">Бросок {rollNum} / 3</p>
      </div>

      <div className="dice-section">
        <div className="hand-display">
          {displayHand.map((value, i) => (
            <Die
              key={i}
              value={value}
              size={56}
              held={kept[i]}
              throwing={dice[i].throwing}
              onClick={() => toggleKeep(i)}
            />
          ))}
        </div>

        {rollNum < 3 && (
          <RollButton
            onRoll={handleRoll}
            label={rollNum === 0 ? 'Бросить' : 'Перебросить свободные'}
            pulsing={rollNum === 0}
          />
        )}
      </div>

      {/* Трекер бонуса: верхняя секция до 63 */}
      <div className="bonus-tracker">
        <div className="bonus-bar-bg">
          <div
            className={`bonus-bar ${bonusReached ? 'reached' : ''}`}
            style={{ width: `${(upperSum / 63) * 100}%` }}
          />
        </div>
        <p className="bonus-label">
          Верх {upperSum} / 63 {bonusReached ? '· +35 ✓' : ''}
        </p>
      </div>

      {showScorecard && (
        <div className="scorecard-section">
          <div className="scorecard-grid">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`scorecard-box ${cat.upper ? 'upper' : ''}`}
                onClick={() => scoreBox(cat)}
              >
                <div className="box-name">{cat.label}</div>
                <div className="box-value">{handScores.get(cat.id) ?? 0}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export const scene6: Scene = {
  id: 'scene-6',
  model: FullTurnModel,
  beats: [
    {
      id: 'B6.1',
      scene: 'scene-6',
      prompt:
        'Полный ход по правилам: до трёх бросков, оставляя между ними что хотите, затем запись в одну категорию.',
      payoff:
        'Есть награда с подвохом: верхняя секция даёт +35, но только если набрать в ней 63. Это ровно столько, сколько дают шесть троек: $63 = 3\\cdot(1+2+\\dots+6)$.',
      gate: { kind: 'roll', needed: 1 },
    },
    {
      id: 'B6.2',
      scene: 'scene-6',
      prompt:
        'Теперь запишите очки в ячейку — и следите за трекером верха. Игрок, который каждый ход хватает максимум очков, легко не добирает до 63 и теряет весь бонус.',
      payoff:
        'Локально идеально, глобально — проигрыш. И есть вторая, большая награда: +100 за каждый дополнительный Yahtzee. Запомните это — оно ещё вернётся и сделает нечто впечатляющее.',
      gate: { kind: 'choice' },
    },
    {
      id: 'B6.3',
      scene: 'scene-6',
      prompt:
        'Так что лучший ход зависит не только от того, что у вас в руке сейчас, но и от того, что будет потом. Как выбрать настоящее ради будущего?',
    },
  ],
}
