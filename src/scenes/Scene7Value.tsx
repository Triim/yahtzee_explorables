import { useEffect, useRef, useState } from 'react'
import type { SceneModelProps, Scene } from '@/scaffolding'
import { useTr, usePlayerState } from '@/scaffolding'
import './Value.css'

const ROWS_EN = [
  'Ones', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes',
  'Three of a kind', 'Four of a kind', 'Full house', 'Small', 'Large', 'Yahtzee', 'Chance',
]

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

/* One node of the B7.3 chance/choice tree (a rounded box with two text lines). */
function VgNode({ x, y, kind, l1, l2, on = false, w = 92, h = 42 }: {
  x: number; y: number; kind: string; l1: string; l2: string; on?: boolean; w?: number; h?: number
}) {
  return (
    <g>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={9}
        className={`vg-node vg-node--${kind} ${on ? 'vg-node--on' : ''}`} />
      <text x={x} y={l2 ? y - 7 : y} textAnchor="middle" dominantBaseline="central" className="vg-node-l1">{l1}</text>
      {l2 && <text x={x} y={y + 9} textAnchor="middle" dominantBaseline="central" className="vg-node-l2">{l2}</text>}
    </g>
  )
}

export function ValueModel({ activeBeatId, satisfyGate }: SceneModelProps) {
  const beat = activeBeatId ?? ''
  const tr = useTr()
  const { record } = usePlayerState()
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
                  if (n.has(i)) n.delete(i)
                  else n.add(i)
                  if (n.size >= 2) satisfyGate?.()
                  return n
                })
              }}
            >
              {tr(name, ROWS_EN[i])}
            </button>
          ))}
        </div>
        <div className="val-flags">
          <span>{tr('верх к 63', 'upper to 63')}: {Math.min(upper, 63)}</span>
          <span>{tr('бонус Yahtzee', 'Yahtzee bonus')}: ✓</span>
        </div>
        {beat === 'B7.2' && (
          <div className="val-badge">
            {tr('V(s) ≈ лучшее среднее отсюда до конца', 'V(s) ≈ best average from here to the end')}
          </div>
        )}
      </div>
    )
  }

  // B7.3 — chance/choice tree, grown by branching: a hot root (your choice =
  // max) fans to cold chance nodes (a roll = average), which fan to outcome
  // leaves. `node` doubles as the reveal level (0 root, 1 moves, 2 outcomes).
  if (beat === 'B7.3') {
    const reveal = node // 0..2
    // illustrative values: cold = average of its leaves, hot root = max of colds
    const leavesA = [22, 14]
    const leavesB = [30, 10]
    const avgA = (leavesA[0] + leavesA[1]) / 2 // 18
    const avgB = (leavesB[0] + leavesB[1]) / 2 // 20
    const best = avgB >= avgA ? 'B' : 'A'
    const rootX = 50
    const coldX = 196
    const leafX = 330
    const rootY = 125
    const coldAY = 66
    const coldBY = 184
    const leafAY = [34, 98]
    const leafBY = [152, 216]

    return (
      <div className="val-model">
        <svg viewBox="0 0 380 250" width={532} height={350} className="vg" role="img" style={{ maxWidth: '100%' }}>
          {/* edges root → cold */}
          {reveal >= 1 && (
            <g className="vg-grow">
              <line x1={rootX + 46} y1={rootY} x2={coldX - 46} y2={coldAY}
                className={`vg-edge ${reveal >= 2 && best === 'A' ? 'vg-edge--max' : ''}`} />
              <line x1={rootX + 46} y1={rootY} x2={coldX - 46} y2={coldBY}
                className={`vg-edge ${reveal >= 2 && best === 'B' ? 'vg-edge--max' : ''}`} />
            </g>
          )}
          {/* edges cold → leaves */}
          {reveal >= 2 && (
            <g className="vg-grow">
              <line x1={coldX + 46} y1={coldAY} x2={leafX - 32} y2={leafAY[0]} className="vg-edge" />
              <line x1={coldX + 46} y1={coldAY} x2={leafX - 32} y2={leafAY[1]} className="vg-edge" />
              <line x1={coldX + 46} y1={coldBY} x2={leafX - 32} y2={leafBY[0]} className="vg-edge" />
              <line x1={coldX + 46} y1={coldBY} x2={leafX - 32} y2={leafBY[1]} className="vg-edge" />
            </g>
          )}

          {/* root: your choice = max */}
          <VgNode x={rootX} y={rootY} kind="hot" on
            l1={tr('твой ход', 'your move')}
            l2={reveal >= 2 ? `max ${Math.max(avgA, avgB)}` : 'max'} />

          {/* cold chance nodes: a roll = average */}
          {reveal >= 1 && (
            <g className="vg-grow">
              <VgNode x={coldX} y={coldAY} kind="cold" on={reveal >= 2 && best === 'A'}
                l1={tr('бросок', 'roll')} l2={reveal >= 2 ? `${tr('ср.', 'avg')} ${avgA}` : 'Σ p·V'} />
              <VgNode x={coldX} y={coldBY} kind="cold" on={reveal >= 2 && best === 'B'}
                l1={tr('бросок', 'roll')} l2={reveal >= 2 ? `${tr('ср.', 'avg')} ${avgB}` : 'Σ p·V'} />
            </g>
          )}

          {/* outcome leaves */}
          {reveal >= 2 && (
            <g className="vg-grow">
              {leafAY.map((y, i) => <VgNode key={`a${i}`} x={leafX} y={y} kind="leaf" w={64} h={32} l1={`V=${leavesA[i]}`} l2="" />)}
              {leafBY.map((y, i) => <VgNode key={`b${i}`} x={leafX} y={y} kind="leaf" w={64} h={32} l1={`V=${leavesB[i]}`} l2="" />)}
            </g>
          )}
        </svg>

        <button
          type="button"
          className="val-btn"
          disabled={reveal >= 2}
          onClick={() => {
            setNode((x) => {
              const nx = Math.min(x + 1, 2)
              if (nx >= 2) satisfyGate?.()
              return nx
            })
          }}
        >
          {reveal === 0
            ? tr('раскрыть ходы', 'reveal the moves')
            : reveal === 1
              ? tr('раскрыть броски', 'reveal the rolls')
              : tr('дерево раскрыто', 'tree revealed')}
        </button>
        <div className="val-legend">
          <span><i className="dot dot--hot" /> {tr('выбор — максимум', 'choice — maximum')}</span>
          <span><i className="dot dot--cold" /> {tr('случай — среднее', 'chance — average')}</span>
        </div>
      </div>
    )
  }

  // B7.4 — backward induction: values fill in from the last turn back to the start
  if (beat === 'B7.4') {
    // illustrative "value still to come" at the start of each turn (1..13)
    const VTOGO = [254.6, 240, 222, 202, 181, 159, 137, 115, 93, 72, 53, 35, 18]
    const STEPS = 13
    const run = () => {
      setFilled(0)
      satisfyGate?.()
      const t0 = performance.now()
      const tick = (now: number) => {
        const k = Math.min(Math.floor((now - t0) / 200) + 1, STEPS)
        setFilled(k)
        if (k < STEPS) rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    // we process turn 13 first, then 12, … → slot j (turn j+1) fills once
    // `filled` has passed (13 − (j+1)) earlier turns.
    const filledTurn = filled === 0 ? null : 13 - filled + 1 // the turn just filled
    return (
      <div className="val-model">
        <div className="val-chain">
          {VTOGO.map((v, j) => {
            const isOn = filled > 12 - j
            const isCurrent = filledTurn === j + 1
            return (
              <div key={j} className={`val-turn ${isOn ? 'val-turn--on' : ''} ${isCurrent ? 'val-turn--cur' : ''}`}>
                <span className="val-turn-v">{isOn ? Math.round(v) : ''}</span>
                <span className="val-turn-n">{j + 1}</span>
              </div>
            )
          })}
        </div>
        <p className="val-note">
          {filled === 0
            ? tr('ход на оси — счёт идёт справа налево, с конца к старту', 'turns on the axis — the count runs right to left, end to start')
            : filledTurn === 1
              ? tr('дошли до старта: V(старт) ≈ 254,6', 'reached the start: V(start) ≈ 254.6')
              : tr(
                  `ход ${filledTurn}: лучшее отсюда, зная ценность хода ${(filledTurn ?? 0) + 1}`,
                  `turn ${filledTurn}: best from here, knowing the value of turn ${(filledTurn ?? 0) + 1}`
                )}
        </p>
        <button type="button" className="val-btn" onClick={run}>
          {filled >= STEPS ? tr('ещё раз', 'again') : tr('запустить счёт с конца', 'run the count from the end')}
        </button>
      </div>
    )
  }

  // B7.5 — the ceiling (with a callback to the reader's own tutorial game)
  return (
    <div className="val-model">
      <div className="val-ceiling">
        <span className="val-ceiling-num">≈ {OPTIMUM}</span>
        <span className="val-ceiling-label">{tr('V(старт) — потолок одиночной игры', 'V(start) — the solitaire ceiling')}</span>
      </div>
      {record && (
        <p className="val-note">
          {tr(
            `В твоей первой партии вышло ${record.finalScore} — это ${Math.round((record.finalScore / OPTIMUM) * 100)}% от идеального потолка.`,
            `Your first game scored ${record.finalScore} — that’s ${Math.round((record.finalScore / OPTIMUM) * 100)}% of the perfect ceiling.`
          )}
        </p>
      )}
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
        'Вот это и есть **состояние партии**. То же слово, что и с рукой: тогда мы свернули пять кубиков в одно состояние, выбросив лишний порядок. Теперь так же сворачиваем всю партию — оставляем только то, что влияет на будущее.',
      gate: { kind: 'select' },
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
        'Как такое число посчитать? Партия чередует два типа моментов — твой выбор и бросок. Раскрывай дерево ветка за веткой.',
      payoff:
        'После броска ход твой — ценность узла есть **максимум** по твоим ходам. А перед броском решает случай — ценность **усредняется** по исходам, $\\sum p\\cdot V$. Узел выбора — максимум, узел случая — среднее. То же дерево, только в каждом узле стоит ценность.',
      gate: { kind: 'step' },
    },
    {
      id: 'B7.4',
      scene: 'scene-7',
      prompt: 'Считать начинаем с конца — там ценность очевидна. Запусти счёт и смотри, как ценности заполняются справа налево, от последнего хода к старту.',
      payoff:
        'На последнем, тринадцатом ходу осталась одна пустая строка: ценность — лучшее, что можно в неё записать, усреднённое по случаю. Шаг назад, на двенадцатый: для каждого исхода выбираешь строку, **зная ценности уже посчитанного тринадцатого**, и берёшь максимум; потом усредняешь по броску. Так, опираясь каждый раз на уже готовый ход впереди, пятишься от конца к началу и заполняешь ценности всех положений.',
      gate: { kind: 'step' },
    },
    {
      id: 'B7.5',
      scene: 'scene-7',
      prompt: 'Дойдя до самого старта, получаем одно число.',
      payoff:
        'Ценность начальной позиции — около **254,6** очка. Это потолок одиночной игры: в среднем лучше не сыграть. И каждый ход теперь выбирается просто — тот, что ведёт в положение с наибольшей ценностью.',
    },
    {
      id: 'B7.6',
      scene: 'scene-7',
      prompt:
        'Итак, есть одна идеальная одиночная игра и её среднее. Но «среднее» — это про тысячи партий разом. Как выглядят разные стратегии на этой тысяче?',
    },
  ],
}
