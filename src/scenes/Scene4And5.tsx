import { useState, useMemo } from 'react'
import type { SceneModelProps, Scene } from '@/scaffolding'
import { Die } from '@/components'
import { rerollDistribution, evForAllCategories } from '@/engine'
import type { Category } from '@/engine'
import './Scene4And5.css'

const START_HAND = [6, 6, 3, 2, 1]

function rollFace() {
  return Math.floor(Math.random() * 6) + 1
}

// Sum distribution after rerolling the non-held dice, from the engine's
// conditional reroll distribution.
function sumDistribution(kept: number[]): Map<number, number> {
  const dist = rerollDistribution(kept)
  const sums = new Map<number, number>()
  for (const [handStr, prob] of dist) {
    const hand = JSON.parse(handStr) as number[]
    const s = hand.reduce((a, b) => a + b, 0)
    sums.set(s, (sums.get(s) || 0) + prob)
  }
  return sums
}

interface HoldRerollProps extends SceneModelProps {
  mode: 'conditional' | 'ev'
}

function HoldReroll({ activeBeatId, satisfyGate, mode }: HoldRerollProps) {
  const [hand, setHand] = useState<number[]>(START_HAND)
  const [held, setHeld] = useState<boolean[]>([true, true, false, false, false])

  const kept = hand.filter((_, i) => held[i])

  const toggleHold = (i: number) => {
    setHeld((h) => h.map((v, j) => (j === i ? !v : v)))
    satisfyGate?.() // гейт: оставить/отпустить кость
  }

  const reroll = () => {
    setHand((h) => h.map((v, i) => (held[i] ? v : rollFace()))) // честный переброс
  }

  // Условное распределение суммы (Сцена 4)
  const sums = useMemo(
    () => (mode === 'conditional' ? sumDistribution(kept) : new Map<number, number>()),
    [mode, kept.join(',')]
  )
  const maxSumProb = Math.max(0.0001, ...Array.from(sums.values()))

  // МО для каждой категории (Сцена 5)
  const evs = useMemo(
    () => (mode === 'ev' ? evForAllCategories(kept) : new Map<Category, number>()),
    [mode, kept.join(',')]
  )
  const evList = Array.from(evs.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
  const maxEv = Math.max(0.0001, ...evList.map(([, v]) => v))

  const showDist = mode === 'conditional' && activeBeatId !== 'B4.1-pre'
  const showEv =
    mode === 'ev' && (activeBeatId === 'B5.2' || activeBeatId === 'B5.3')

  return (
    <div className="holdreroll-model">
      <div className="hr-dice">
        {hand.map((v, i) => (
          <Die
            key={i}
            value={v}
            size={64}
            held={held[i]}
            onClick={() => toggleHold(i)}
          />
        ))}
      </div>

      <button className="hr-reroll" onClick={reroll}>
        Перебросить свободные
      </button>

      {/* Сцена 4: условное распределение итоговой суммы */}
      {showDist && (
        <div className="hr-dist">
          <p className="hr-dist-label">P(сумма | оставленные)</p>
          <svg viewBox="0 0 320 140" className="hr-dist-svg" role="img" aria-label="Условное распределение суммы">
            {Array.from(sums.entries())
              .sort((a, b) => a[0] - b[0])
              .map(([s, p]) => {
                const minS = 5
                const maxS = 30
                const x = ((s - minS) / (maxS - minS)) * 300 + 6
                const h = (p / maxSumProb) * 110
                return (
                  <rect
                    key={s}
                    className="hr-bar"
                    x={x}
                    y={120 - h}
                    width={10}
                    height={h}
                    rx={2}
                  />
                )
              })}
            <line x1={0} x2={320} y1={120} y2={120} className="hr-axis" />
          </svg>
        </div>
      )}

      {/* Сцена 5: МО для каждой категории, лучшее подсвечено */}
      {showEv && (
        <div className="hr-ev">
          {evList.map(([cat, v], idx) => (
            <div key={cat} className={`hr-ev-row ${idx === 0 ? 'best' : ''}`}>
              <span className="hr-ev-label">{cat.replace(/-/g, ' ')}</span>
              <div className="hr-ev-bar-bg">
                <div className="hr-ev-bar" style={{ width: `${(v / maxEv) * 100}%` }} />
              </div>
              <span className="hr-ev-val">{v.toFixed(1)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function RerollModel(props: SceneModelProps) {
  return <HoldReroll {...props} mode="conditional" />
}

export function EVModel(props: SceneModelProps) {
  return <HoldReroll {...props} mode="ev" />
}

export const scene4: Scene = {
  id: 'scene-4',
  model: RerollModel,
  beats: [
    {
      id: 'B4.1',
      scene: 'scene-4',
      prompt: 'Вот рука. Кликните по костям, которые хотите оставить — остальные перебросятся.',
      payoff:
        'Как только вы что-то оставляете, будущее перестаёт быть слепым случаем. Это условная вероятность — распределение будущего при заданном настоящем: $P(B\\mid A)=\\dfrac{P(A\\cap B)}{P(A)}$. Измените то, что оставляете, и вся кривая сместится.',
      gate: { kind: 'hold' },
    },
    {
      id: 'B4.2',
      scene: 'scene-4',
      prompt:
        'Под капотом каждый переброс — это шаг по небольшой цепочке: ценность того, что вы держите, строится из ценностей того, что может прийти — $\\text{keep}[K]=\\frac{1}{6}\\sum_d \\text{keep}[K\\cup\\{d\\}]$.',
    },
    {
      id: 'B4.3',
      scene: 'scene-4',
      prompt:
        'У нас есть распределение. Но какой выбор лучше — оно не скажет. У нас пока нет цели, к которой можно было бы выбирать.',
    },
  ],
}

export const scene5: Scene = {
  id: 'scene-5',
  model: EVModel,
  beats: [
    {
      id: 'B5.1',
      scene: 'scene-5',
      prompt:
        'Назначим руке цену: каждая рука превращается в очки по правилу категории, так что очки — это функция от руки: $\\text{очки}=f(\\text{рука})$.',
    },
    {
      id: 'B5.2',
      scene: 'scene-5',
      prompt:
        'Вы держите жирную шестёрку — уж её-то точно надо защищать. Попробуйте. А затем попробуйте оставить что-то другое и посмотрите на средние значения.',
      payoff:
        'Мы сравниваем не вероятности, а средний улов: математическое ожидание $E[X]=\\sum_x x\\,P(X=x)$. Снова и снова "очевидный" ход проигрывает неочевидному. Глаз обманывает, число — нет.',
      gate: { kind: 'hold' },
    },
    {
      id: 'B5.3',
      scene: 'scene-5',
      prompt:
        'Матожидание выбирает лучший ход в этом броске. Но в ходе три броска, в игре тринадцать ходов, и каждая заполненная ячейка закрывается навсегда. Достаточно ли одного матожидания?',
    },
  ],
}
