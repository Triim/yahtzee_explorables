import { useEffect, useRef, useState } from 'react'
import type { SceneModelProps, Scene } from '@/scaffolding'
import './Value.css'

/* ============================================================
   Section 7 — Value of a position.
   The game's state, its value V(s), chance/choice nodes, and
   counting from the end. (The DP/oracle behind it is never named.)
   ============================================================ */

const OPTIMUM = 254.6

const ROWS = [
  'Единицы', 'Двойки', 'Тройки', 'Четвёрки', 'Пятёрки', 'Шестёрки',
  'Тройка', 'Каре', 'Фулл-хаус', 'Малый', 'Большой', 'Yahtzee', 'Шанс',
]

export function ValueModel({ activeBeatId, satisfyGate }: SceneModelProps) {
  const beat = activeBeatId ?? ''
  const [closed, setClosed] = useState<Set<number>>(new Set())
  const [node, setNode] = useState(0)
  const [filled, setFilled] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
  }, [])

  if (beat === 'B7.6' || beat === '') {
    return <div className="val-model val-model--empty" />
  }

  // shared state card (B7.1, B7.2)
  if (beat === 'B7.1' || beat === 'B7.2') {
    const upper = closed.size * 7 // illustrative running upper count
    return (
      <div className="val-model">
        <div className="val-card">
          {ROWS.map((name, i) => (
            <button
              key={name}
              className={`val-cell ${closed.has(i) ? 'val-cell--closed' : ''}`}
              onClick={() => {
                if (beat !== 'B7.1') return
                setClosed((c) => {
                  const n = new Set(c)
                  n.has(i) ? n.delete(i) : n.add(i)
                  if (n.size >= 2) satisfyGate?.()
                  return n
                })
              }}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="val-flags">
          <span>верх к 63: {Math.min(upper, 63)}</span>
          <span>бонус Yahtzee: ✓</span>
        </div>
        {beat === 'B7.2' && (
          <div className="val-badge">
            V(s) ≈ лучшее среднее отсюда до конца
          </div>
        )}
      </div>
    )
  }

  // B7.3 — chance/choice graph
  if (beat === 'B7.3') {
    const NODES = [
      { kind: 'hot', label: 'твой ход\nmax' },
      { kind: 'cold', label: 'бросок\nΣ p·V' },
      { kind: 'hot', label: 'твой ход\nmax' },
      { kind: 'cold', label: 'бросок\nΣ p·V' },
    ]
    return (
      <div className="val-model">
        <div className="val-graph">
          {NODES.map((n, i) => (
            <div key={i} className="val-graph-item">
              <div className={`val-node val-node--${n.kind} ${i <= node ? 'val-node--on' : ''}`}>
                {n.label.split('\n').map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </div>
              {i < NODES.length - 1 && <span className="val-edge">→</span>}
            </div>
          ))}
        </div>
        <button
          type="button"
          className="val-btn"
          onClick={() => {
            setNode((x) => {
              const nx = Math.min(x + 1, NODES.length - 1)
              if (nx >= NODES.length - 1) satisfyGate?.()
              return nx
            })
          }}
        >
          шаг по графу
        </button>
        <div className="val-legend">
          <span><i className="dot dot--hot" /> выбор — максимум</span>
          <span><i className="dot dot--cold" /> случай — среднее</span>
        </div>
      </div>
    )
  }

  // B7.4 — backward induction
  if (beat === 'B7.4') {
    const STEPS = 8
    const run = () => {
      setFilled(0)
      satisfyGate?.()
      const t0 = performance.now()
      const tick = (now: number) => {
        const k = Math.min(Math.floor((now - t0) / 220) + 1, STEPS)
        setFilled(k)
        if (k < STEPS) rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    return (
      <div className="val-model">
        <div className="val-chain">
          {Array.from({ length: STEPS }, (_, i) => {
            const idx = STEPS - 1 - i // fill right→left
            return (
              <div key={i} className={`val-slot ${filled > idx ? 'val-slot--on' : ''}`}>
                {filled > idx ? '✓' : ''}
              </div>
            )
          })}
        </div>
        <p className="val-note">ход 13 → … → старт: ценности заполняются с конца</p>
        <button type="button" className="val-btn" onClick={run}>
          запустить счёт с конца
        </button>
      </div>
    )
  }

  // B7.5 — the ceiling
  return (
    <div className="val-model">
      <div className="val-ceiling">
        <span className="val-ceiling-num">≈ {OPTIMUM}</span>
        <span className="val-ceiling-label">V(старт) — потолок одиночной игры</span>
      </div>
    </div>
  )
}

export const scene7: Scene = {
  id: 'scene-7',
  model: ValueModel,
  beats: [
    {
      id: 'B7.1',
      scene: 'scene-7',
      prompt:
        'Что полностью описывает твоё положение посреди партии? Не кубики — они сменятся. А то, что останется: какие строки закрыты, сколько набрано в верхе на пути к 63 и пара флагов. Закрой пару строк.',
      payoff:
        'Вот это и есть **состояние партии**. То же слово, что в Разделе 2: там мы свернули руку в одно состояние, выбросив лишнее. Теперь так же сворачиваем всю партию — оставляем только то, что влияет на будущее.',
      gate: { kind: 'choice' },
    },
    {
      id: 'B7.2',
      scene: 'scene-7',
      prompt: 'Дадим каждому состоянию число.',
      payoff:
        '**Ценность состояния** $V(s)$ — это лучшее среднее число очков, которое ещё можно набрать отсюда до конца, играя наилучшим образом. Не «сколько ты уже набрал», а «сколько впереди при идеальной игре».',
    },
    {
      id: 'B7.3',
      scene: 'scene-7',
      prompt:
        'Как такое число посчитать? Партия чередует два типа моментов. Пройди по графу от своего хода к броску.',
      payoff:
        'После броска ход твой — ценность узла есть **максимум** по твоим ходам. А перед броском решает случай — ценность **усредняется** по исходам, $\\sum p\\cdot V$. Узел выбора — максимум, узел случая — среднее. То же дерево, только в каждом узле стоит ценность.',
      gate: { kind: 'choice' },
    },
    {
      id: 'B7.4',
      scene: 'scene-7',
      prompt: 'Считать начинаем с конца — там ценность очевидна. Запусти счёт с конца.',
      payoff:
        'Остался один ход и одна пустая строка: ценность — лучшее, что можно в неё записать, усреднённое по случаю. Шаг назад — для каждого исхода выбираешь строку, зная ценности на шаг впереди, и берёшь максимум; затем усредняешь. Так, пятясь от конца к началу, заполняешь ценности всех положений.',
      gate: { kind: 'choice' },
    },
    {
      id: 'B7.5',
      scene: 'scene-7',
      prompt: 'Дойдя до самого старта, получаем одно число.',
      payoff:
        'Ценность начальной позиции — около **254,6** очка. Это потолок одиночной игры: в среднем лучше не сыграть. И каждый ход теперь выбирается просто — тот, что ведёт в положение с наибольшей ценностью. (Сам этот счёт делается заранее, за кадром; важно, что он есть.)',
    },
    {
      id: 'B7.6',
      scene: 'scene-7',
      prompt:
        'Итак, есть одна идеальная одиночная игра и её среднее. Но «среднее» — это про тысячи партий разом. Как выглядят разные стратегии на этой тысяче?',
    },
  ],
}
