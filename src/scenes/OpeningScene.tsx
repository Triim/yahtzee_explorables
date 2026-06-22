import { useEffect, useRef, useState } from 'react'
import type { SceneModelProps, Scene } from '@/scaffolding'
import { useTr } from '@/scaffolding'
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
  const tr = useTr()
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
        aria-label={tr('Подбросить кубики', 'Toss the dice')}
      >
        {DICE.map((face, i) => (
          <ThrownDie key={i} initial={face} rollToken={rollToken} delay={i * 70} />
        ))}
      </button>
      <span className="hero-model-hint">{tr('нажми на кубики — бросок', 'tap the dice to roll')}</span>
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
        'Вот они, пять кубиков. Бросаешь — и любые можешь дважды перекинуть, чтобы собрать комбинацию повыше: пару, тройку, стрейт. Что вышло, записываешь в одну из тринадцати строк. Тринадцать ходов, и у кого больше очков, тот выиграл. Подбрось.',
      payoff:
        'Правила и правда на минуту. Но стоит спросить «а как сыграть лучше?» — и за простой костью встаёт вопрос за вопросом, на которые арифметики не хватает.',
      gate: { kind: 'roll', needed: 1 },
    },
    {
      id: 'INT.2',
      scene: 'opening',
      prompt:
        'Но прежде чем разбираться, как играть лучше, стоит просто сыграть — освоить правила руками. Бери пять кубиков и проведи свою первую партию.',
    },
  ],
}
