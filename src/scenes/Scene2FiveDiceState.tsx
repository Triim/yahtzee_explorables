import { useEffect, useRef, useState } from 'react'
import type { SceneModelProps, Scene } from '@/scaffolding'
import { Formula } from '@/scaffolding'
import { Die } from '@/components'
import './FiveDiceState.css'

/* ============================================================
   Section 2 — Five dice and state.
   7776 ordered rolls collapse into 252 distinct hands.
   ============================================================ */

const START: number[] = [3, 1, 6, 1, 4]

function randHand(): number[] {
  return Array.from({ length: 5 }, () => ((Math.random() * 6) | 0) + 1)
}

export function FiveDiceStateModel({ activeBeatId, satisfyGate }: SceneModelProps) {
  const beat = activeBeatId ?? ''

  const [hand, setHand] = useState<number[]>(START)
  const [throwing, setThrowing] = useState(false)
  const [ordered, setOrdered] = useState(true) // B2.2: does order matter?
  const [collapsed, setCollapsed] = useState(false)
  const [count, setCount] = useState(7776)
  const rafRef = useRef<number | null>(null)

  const roll = () => {
    setThrowing(true)
    setHand(randHand())
    window.setTimeout(() => setThrowing(false), 600)
    satisfyGate?.()
  }

  const shown = ordered ? hand : [...hand].sort((a, b) => a - b)

  const countDistinct = () => {
    if (collapsed) return
    setCollapsed(true)
    satisfyGate?.()
    const from = 7776
    const to = 252
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - t0) / 1100, 1)
      const eased = 1 - (1 - p) ** 3
      setCount(Math.round(from + (to - from) * eased))
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
  }, [])

  if (beat === 'B2.4' || beat === '') {
    return <div className="fds-model fds-model--empty" />
  }

  return (
    <div className="fds-model">
      <div className="fds-hand">
        {shown.map((v, i) => (
          <Die key={i} value={v} size={64} throwing={throwing} />
        ))}
      </div>

      {beat === 'B2.1' && (
        <>
          <button type="button" className="fds-btn" onClick={roll}>
            бросить
          </button>
          <p className="fds-count">
            6 × 6 × 6 × 6 × 6 = <strong>7776</strong>
          </p>
        </>
      )}

      {beat === 'B2.2' && (
        <>
          <button
            type="button"
            className={`fds-btn ${!ordered ? 'fds-btn--on' : ''}`}
            onClick={() => {
              setOrdered((o) => !o)
              satisfyGate?.()
            }}
          >
            {ordered ? 'учитывать порядок' : 'порядок не важен'}
          </button>
          <p className="fds-note">
            {ordered
              ? '3·1·6·1·4 — пять кубиков по местам'
              : 'та же рука: 1·1·3·4·6'}
          </p>
        </>
      )}

      {beat === 'B2.3' && (
        <>
          <div className="fds-cloud" data-collapsed={collapsed}>
            <span className="fds-bignum">{count.toLocaleString('ru-RU')}</span>
            <span className="fds-cloud-label">
              {collapsed ? 'разных рук' : 'упорядоченных раскладов'}
            </span>
          </div>
          <button type="button" className="fds-btn" onClick={countDistinct}>
            посчитать разные руки
          </button>
          {collapsed && (
            <div className="fds-formula">
              <Formula latex="\binom{6+5-1}{5} = 252" />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export const scene2: Scene = {
  id: 'scene-2',
  model: FiveDiceStateModel,
  beats: [
    {
      id: 'B2.1',
      scene: 'scene-2',
      prompt:
        'Два кубика мы разложили по тридцати шести клеткам. Возьмём пять — ровно столько, сколько в самой игре. Брось.',
      payoff:
        'У каждого кубика шесть граней, кубиков пять — значит раскладов $6^5 = 7776$. И тут прежний приём ломается: тридцать шесть пар умещались на одной картинке, а нарисовать 7776 клеток в пяти измерениях невозможно.',
      gate: { kind: 'roll', needed: 1 },
    },
    {
      id: 'B2.2',
      scene: 'scene-2',
      prompt:
        'Но приглядись к своей руке. Важно ли, какой кубик лежит первым, а какой третьим?',
      payoff:
        '3·1·6·1·4 и 1·6·4·1·3 — это одна и та же рука: те же грани, просто разложены иначе. Как ни перемешивай, важно лишь, какие числа выпали и сколько каких.',
      gate: { kind: 'toggle' },
    },
    {
      id: 'B2.3',
      scene: 'scene-2',
      prompt: 'Раз порядок не важен — посчитаем не расклады, а разные руки.',
      payoff:
        '7776 упорядоченных раскладов схлопываются всего в 252 разные руки — это число $\\binom{6+5-1}{5} = 252$. Такую руку, «какие грани и сколько каждой, без порядка», называют **мультимножеством**, а для нас это просто **состояние**: рука стала одним объектом. Мы выбросили лишнее — порядок — и оставили только то, что влияет на игру.',
      gate: { kind: 'choice' },
    },
    {
      id: 'B2.4',
      scene: 'scene-2',
      prompt:
        'Теперь рука — аккуратный объект, с которым можно работать. И впервые встаёт вопрос самой игры: чего эта рука стоит и что из неё оставить? Пора разобрать правила Yahtzee.',
    },
  ],
}
