import { useState, useEffect } from 'react'
import type { SceneModelProps, Scene } from '@/scaffolding'
import { initOracle } from '@/engine/oracle'
import './StateDPModel.css'

// A short ribbon of alternating cold (chance) and hot (choice) nodes.
const NODES = [
  { type: 'hot' as const },
  { type: 'cold' as const },
  { type: 'hot' as const },
  { type: 'cold' as const },
  { type: 'hot' as const },
  { type: 'cold' as const },
  { type: 'hot' as const },
]

export function StateDPModel({ activeBeatId, satisfyGate }: SceneModelProps) {
  const [oracleValue, setOracleValue] = useState<number | null>(null)
  const [propagated, setPropagated] = useState(0) // how many nodes filled from the end

  useEffect(() => {
    initOracle()
      .then((o) => setOracleValue(o.optimalExpectedScore))
      .catch(() => setOracleValue(254.589))
  }, [])

  const runBackwardInduction = () => {
    satisfyGate?.() // gate: ran the backward pass
    // Fill values right-to-left, one node per tick.
    let n = 0
    const tick = () => {
      n += 1
      setPropagated(n)
      if (n < NODES.length) window.setTimeout(tick, 180)
    }
    setPropagated(0)
    window.setTimeout(tick, 150)
  }

  const showRun = activeBeatId === 'B7.2' || activeBeatId === 'B7.3'
  const valueReady = propagated >= NODES.length

  const W = 320
  const cx = (i: number) => 28 + (i * (W - 56)) / (NODES.length - 1)
  const cy = 50

  return (
    <div className="state-dp-model">
      <svg viewBox="0 0 320 100" className="state-graph" role="img" aria-label="Холодные и горячие узлы состояний">
        {/* edges */}
        {NODES.slice(0, -1).map((_, i) => (
          <line key={i} x1={cx(i)} y1={cy} x2={cx(i + 1)} y2={cy} className="sg-edge" />
        ))}
        {/* nodes; filled from the end as backward induction propagates */}
        {NODES.map((node, i) => {
          const filled = i >= NODES.length - propagated
          return (
            <circle
              key={i}
              cx={cx(i)}
              cy={cy}
              r={13}
              className={`sg-node ${node.type} ${filled ? 'filled' : ''}`}
            />
          )
        })}
      </svg>

      <div className="sg-legend">
        <span className="sg-key cold">холодный · шанс · среднее</span>
        <span className="sg-key hot">горячий · выбор · максимум</span>
      </div>

      {showRun && (
        <button className="sg-run" onClick={runBackwardInduction}>
          Запустить обратную индукцию
        </button>
      )}

      <div className={`value-panel ${valueReady ? 'ready' : ''}`}>
        <span className="vp-label">V(пустое поле)</span>
        <span className="vp-value">
          {valueReady ? (oracleValue?.toFixed(3) ?? '…') : '—'}
        </span>
      </div>
    </div>
  )
}

export const scene7: Scene = {
  id: 'scene-7',
  model: StateDPModel,
  beats: [
    {
      id: 'B7.1',
      scene: 'scene-7',
      prompt:
        'Поднимемся над рамками одного хода: вся игра — это состояния и переходы. Состояния бывают двух цветов.',
      payoff:
        'В холодном узле решает случай — сразу после броска, ценность усредняется по всем исходам, $E=\\sum_i p_i E_i$. В горячем узле решаете вы — оставить или записать — и вы выбираете лучшее, $E=\\max_i E_i$. Игра представляет собой ленту из холодных и горячих кругов.',
    },
    {
      id: 'B7.2',
      scene: 'scene-7',
      prompt:
        'Чтобы знать, что делать сейчас, считайте с конца. Запустите — и значения потекут в обратном направлении по графу.',
      payoff:
        "Вы не выбираете лучший бросок, вы выбираете ход, который ведет к лучшему будущему: $V(s)=\\max_a E[V(s')]$. При такой игре средний результат составляет около 254.6 — это потолок для любой пасьянсной стратегии.",
      gate: { kind: 'toggle' },
    },
    {
      id: 'B7.3',
      scene: 'scene-7',
      prompt:
        'Итак, у нас есть идеальная пасьянсная игра. Но какие существуют стратегии — и как они выглядят не в одной игре, а в тысяче?',
    },
  ],
}
