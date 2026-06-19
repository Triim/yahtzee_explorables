import { useEffect, useRef, useState } from 'react'
import type { SceneModelProps, Scene } from '@/scaffolding'
import { Die, useDieRoll } from '@/components'
import './HeroModel.css'

// Deterministic resting faces so the first render is pure; throws randomize.
const DICE = [2, 5, 1, 4, 3]

/** One die that re-throws (with a stagger delay) whenever `rollToken` changes. */
function ThrownDie({ initial, rollToken, delay }: { initial: number; rollToken: number; delay: number }) {
  const die = useDieRoll(initial)
  const firstRef = useRef(true)

  useEffect(() => {
    if (firstRef.current) {
      firstRef.current = false
      return
    }
    const t = window.setTimeout(
      () => die.start(Math.floor(Math.random() * 6) + 1),
      delay
    )
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rollToken])

  return <Die value={die.displayValue} size={88} throwing={die.throwing} />
}

/**
 * A handful of five dice you can toss — no labels, no score, just the feel of a
 * throw. The narrative lives in the left column; the model only answers it.
 */
export function HeroModel({ satisfyGate }: SceneModelProps) {
  const [rollToken, setRollToken] = useState(0)
  const [busy, setBusy] = useState(false)

  const throwAll = () => {
    if (busy) return
    setRollToken((t) => t + 1)
    setBusy(true)
    window.setTimeout(() => setBusy(false), 720)
    satisfyGate?.()
  }

  return (
    <div className="hero-model">
      <button
        type="button"
        className="hand"
        onClick={throwAll}
        disabled={busy}
        aria-label="Подбросить кубики"
      >
        {DICE.map((face, i) => (
          <ThrownDie key={i} initial={face} rollToken={rollToken} delay={i * 70} />
        ))}
      </button>
    </div>
  )
}

export const openingScene: Scene = {
  id: 'opening',
  model: HeroModel,
  beats: [
    {
      id: 'INT.1',
      scene: 'opening',
      prompt:
        'Пять кубиков, тринадцать ходов, лист для записи очков — вот и весь Yahtzee. Игра, которой учат за минуту.',
      payoff:
        'Но стоит присмотреться — и за простыми правилами встаёт вопрос за вопросом, на которые арифметики уже не хватает.',
      gate: { kind: 'roll', needed: 1 },
    },
    {
      id: 'INT.2',
      scene: 'opening',
      prompt:
        'Каждый раз, когда заканчивается один кусок математики, игра подсовывает следующий. Начнём не с пяти кубиков и даже не с одного — с самого простого, что вообще бывает случайным.',
    },
  ],
}
