import { useMemo, useState } from 'react'
import type { SceneModelProps, Scene } from '@/scaffolding'
import { Die, Histogram, useDieRoll } from '@/components'
import './ProbabilityModel.css'

/* ============================================================
   Section 1 — Probability.
   Coin → growing bars → law of large numbers → two-coin tree →
   independent/dependent → die → die bars → two dice + sum →
   6×6 grid → the bell. One model, switched by the active beat.
   ============================================================ */

const COIN_GROUP = ['B1.1', 'B1.2', 'B1.3']
const TREE_GROUP = ['B1.4', 'B1.5']
const DIE_GROUP = ['B1.6', 'B1.7']
const DICE_GROUP = ['B1.8', 'B1.9', 'B1.10']

function logN(t: number): number {
  // slider 0..100 → 10 .. 100 000, logarithmically
  return Math.round(10 ** (1 + 4 * (t / 100)))
}

function fmt(n: number): string {
  return n.toLocaleString('ru-RU')
}

/* Honest simulations, run only from event handlers (never during render). */
function simCoin(t: number) {
  const n = logN(t)
  let heads = 0
  for (let i = 0; i < n; i++) if (Math.random() < 0.5) heads++
  return { n, heads, tails: n - heads }
}
function simDie(t: number) {
  const n = logN(t)
  const counts = [0, 0, 0, 0, 0, 0]
  for (let i = 0; i < n; i++) counts[(Math.random() * 6) | 0]++
  return { n, counts }
}
function simBell(t: number) {
  const n = logN(t)
  const hist = new Map<number, number>()
  for (let s = 2; s <= 12; s++) hist.set(s, 0)
  for (let i = 0; i < n; i++) {
    const s = ((Math.random() * 6) | 0) + ((Math.random() * 6) | 0) + 2
    hist.set(s, (hist.get(s) ?? 0) + 1)
  }
  return { n, hist }
}

/* ---- Coin ---- */
function Coin({ heads, flipping }: { heads: boolean; flipping: boolean }) {
  return (
    <div className={`coin-face ${flipping ? 'flipping' : ''}`}>
      <span>{heads ? 'О' : 'Р'}</span>
    </div>
  )
}

/* ---- Two / six bars converging to a fraction ---- */
function Bars({
  counts,
  labels,
  target,
  total,
}: {
  counts: number[]
  labels: string[]
  target: number
  total: number
}) {
  const W = 320
  const H = 200
  const n = counts.length
  const slot = W / n
  const bw = slot * 0.6
  const max = Math.max(total, 1)
  const targetY = H - (target / max) * H

  return (
    <svg width={W} height={H + 26} className="prob-bars" role="img">
      {/* fair-share line */}
      <line
        x1={0}
        y1={targetY}
        x2={W}
        y2={targetY}
        className="bars-target"
      />
      {counts.map((c, i) => {
        const h = (c / max) * H
        const x = i * slot + (slot - bw) / 2
        return (
          <g key={i}>
            <rect
              x={x}
              y={H - h}
              width={bw}
              height={h}
              className="bars-bar"
              style={{ fill: `var(--face-${(i % 6) + 1})` }}
            />
            <text x={x + bw / 2} y={H + 18} className="bars-tick">
              {labels[i]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/* ---- Two-coin probability tree ---- */
function ProbTree({
  path,
  dependent,
}: {
  path: [boolean, boolean] | null
  dependent: boolean
}) {
  const leaves = ['ОО', 'ОР', 'РО', 'РР']
  const active = path ? (path[0] ? (path[1] ? 'ОО' : 'ОР') : path[1] ? 'РО' : 'РР') : null
  const W = 360
  const H = 240
  const rootX = 30
  const midX = 150
  const leafX = 250
  const ys1 = [80, 160]
  const leafY = [40, 95, 150, 205]

  return (
    <svg width={W} height={H} className="prob-tree" role="img">
      {/* root → two */}
      {ys1.map((y, i) => (
        <line key={`a${i}`} x1={rootX} y1={120} x2={midX} y2={y} className="tree-edge" />
      ))}
      {/* two → four */}
      {ys1.map((y, i) =>
        [0, 1].map((j) => (
          <line
            key={`b${i}${j}`}
            x1={midX}
            y1={y}
            x2={leafX}
            y2={leafY[i * 2 + j]}
            className={`tree-edge ${dependent && i === 0 ? 'tree-edge--dim' : ''}`}
          />
        ))
      )}
      <circle cx={rootX} cy={120} r={6} className="tree-node" />
      {ys1.map((y, i) => (
        <g key={`n${i}`}>
          <circle cx={midX} cy={y} r={6} className="tree-node" />
          <text x={midX - 12} y={y + 4} className="tree-label">
            {i === 0 ? 'О' : 'Р'}
          </text>
        </g>
      ))}
      {leaves.map((lf, i) => (
        <g key={lf}>
          <circle
            cx={leafX}
            cy={leafY[i]}
            r={7}
            className={`tree-node ${active === lf ? 'tree-node--on' : ''}`}
          />
          <text x={leafX + 16} y={leafY[i] + 4} className="tree-leaf">
            {lf}
            {dependent && i < 2 ? ' · зависит' : ''}
          </text>
        </g>
      ))}
    </svg>
  )
}

/* ---- 6×6 grid of dice pairs ---- */
function DiceGrid({
  selected,
  onSelect,
}: {
  selected: number | null
  onSelect: (s: number) => void
}) {
  const cells = []
  for (let a = 1; a <= 6; a++) {
    for (let b = 1; b <= 6; b++) {
      const sum = a + b
      const on = selected === sum
      cells.push(
        <button
          key={`${a}-${b}`}
          className={`grid-cell ${on ? 'grid-cell--on' : ''}`}
          onClick={() => onSelect(sum)}
        >
          {a}+{b}
        </button>
      )
    }
  }
  return <div className="dice-grid">{cells}</div>
}

export function ProbabilityModel({ activeBeatId, satisfyGate }: SceneModelProps) {
  const beat = activeBeatId ?? ''

  // coin
  const [coin, setCoin] = useState(true)
  const [coinFlipping, setCoinFlipping] = useState(false)
  const [coinTally, setCoinTally] = useState<[number, number]>([0, 0]) // [heads, tails]
  const [coinSlider, setCoinSlider] = useState(0)

  // tree
  const [treePath, setTreePath] = useState<[boolean, boolean] | null>(null)
  const [dependent, setDependent] = useState(false)

  // die
  const die = useDieRoll(1)
  const [dieSlider, setDieSlider] = useState(0)

  // two dice
  const dA = useDieRoll(1)
  const dB = useDieRoll(1)
  const [sumRolls, setSumRolls] = useState<number[]>([])
  const [selectedSum, setSelectedSum] = useState<number | null>(null)
  const [bellSlider, setBellSlider] = useState(0)

  const flipCoin = () => {
    const h = Math.random() < 0.5
    setCoinFlipping(true)
    setCoin(h)
    window.setTimeout(() => setCoinFlipping(false), 300)
    setCoinTally(([hh, tt]) => (h ? [hh + 1, tt] : [hh, tt + 1]))
    satisfyGate?.()
  }

  // Simulations are stored in state and recomputed in the slider handlers
  // (never during render — Math.random must not run while rendering).
  const [coinFraction, setCoinFraction] = useState({ n: 0, heads: 0, tails: 0 })
  const [dieFaces, setDieFaces] = useState<{ n: number; counts: number[] }>({
    n: 0,
    counts: [0, 0, 0, 0, 0, 0],
  })
  const [bell, setBell] = useState<{ n: number; hist: Map<number, number> }>({
    n: 0,
    hist: new Map(),
  })

  const tossTree = () => {
    setTreePath([Math.random() < 0.5, Math.random() < 0.5])
    satisfyGate?.()
  }

  const rollDie = () => {
    die.start(((Math.random() * 6) | 0) + 1)
    satisfyGate?.()
  }

  const rollTwo = () => {
    const a = ((Math.random() * 6) | 0) + 1
    const b = ((Math.random() * 6) | 0) + 1
    dA.start(a)
    window.setTimeout(() => dB.start(b), 70)
    setSumRolls((r) => {
      const next = [...r, a + b]
      if (next.length >= 8) satisfyGate?.()
      return next
    })
  }

  const sumHist = useMemo(() => {
    const h = new Map<number, number>()
    for (let s = 2; s <= 12; s++) h.set(s, 0)
    sumRolls.forEach((s) => h.set(s, (h.get(s) ?? 0) + 1))
    return h
  }, [sumRolls])

  const waysFor = (sum: number) => {
    let n = 0
    for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b === sum) n++
    return n
  }

  /* ---- render by group ---- */
  if (COIN_GROUP.includes(beat)) {
    return (
      <div className="prob-model">
        <button type="button" className="coin-btn" onClick={flipCoin}>
          <Coin heads={coin} flipping={coinFlipping} />
          <span className="hint">подбрось</span>
        </button>

        {beat === 'B1.2' && (
          <>
            <Bars
              counts={coinTally}
              labels={['орёл', 'решка']}
              target={Math.max(...coinTally, 1) === 0 ? 0 : (coinTally[0] + coinTally[1]) / 2}
              total={Math.max(coinTally[0] + coinTally[1], 1)}
            />
            <p className="readout">
              {coinTally[0]} орлов · {coinTally[1]} решек
            </p>
          </>
        )}

        {beat === 'B1.3' && (
          <>
            <Bars
              counts={[coinFraction.heads, coinFraction.tails]}
              labels={['орёл', 'решка']}
              target={coinFraction.n / 2}
              total={coinFraction.n}
            />
            <input
              type="range"
              min={0}
              max={100}
              value={coinSlider}
              onChange={(e) => {
                const t = +e.target.value
                setCoinSlider(t)
                setCoinFraction(simCoin(t))
                satisfyGate?.()
              }}
              className="prob-slider"
            />
            <p className="readout">
              {fmt(coinFraction.n)} бросков · доля орлов{' '}
              {(coinFraction.heads / coinFraction.n).toFixed(3)}
            </p>
          </>
        )}
      </div>
    )
  }

  if (TREE_GROUP.includes(beat)) {
    return (
      <div className="prob-model">
        <ProbTree path={treePath} dependent={dependent} />
        {beat === 'B1.4' && (
          <button type="button" className="act-btn" onClick={tossTree}>
            бросить две монеты
          </button>
        )}
        {beat === 'B1.5' && (
          <button
            type="button"
            className={`act-btn ${dependent ? 'act-btn--on' : ''}`}
            onClick={() => {
              setDependent((d) => !d)
              satisfyGate?.()
            }}
          >
            {dependent ? 'зависимые' : 'независимые'}
          </button>
        )}
      </div>
    )
  }

  if (DIE_GROUP.includes(beat)) {
    return (
      <div className="prob-model">
        {beat === 'B1.6' && (
          <button type="button" className="die-btn" onClick={rollDie}>
            <Die value={die.displayValue} size={120} throwing={die.throwing} />
            <span className="hint">брось</span>
          </button>
        )}
        {beat === 'B1.7' && (
          <>
            <Bars
              counts={dieFaces.counts}
              labels={['1', '2', '3', '4', '5', '6']}
              target={dieFaces.n / 6}
              total={dieFaces.n}
            />
            <input
              type="range"
              min={0}
              max={100}
              value={dieSlider}
              onChange={(e) => {
                const t = +e.target.value
                setDieSlider(t)
                setDieFaces(simDie(t))
                satisfyGate?.()
              }}
              className="prob-slider"
            />
            <p className="readout">{fmt(dieFaces.n)} бросков · каждая грань → 1/6</p>
          </>
        )}
      </div>
    )
  }

  if (DICE_GROUP.includes(beat)) {
    return (
      <div className="prob-model">
        {beat !== 'B1.10' && (
          <div className="two-dice-row">
            <Die value={dA.displayValue} size={72} throwing={dA.throwing} />
            <Die value={dB.displayValue} size={72} throwing={dB.throwing} />
          </div>
        )}

        {beat === 'B1.8' && (
          <>
            <button type="button" className="act-btn" onClick={rollTwo}>
              бросить
            </button>
            {sumRolls.length > 0 && (
              <Histogram
                data={sumHist}
                title=""
                xLabel="сумма"
                yLabel="сколько"
                width={340}
                height={190}
              />
            )}
            <p className="readout">{sumRolls.length} бросков</p>
          </>
        )}

        {beat === 'B1.9' && (
          <>
            <DiceGrid
              selected={selectedSum}
              onSelect={(s) => {
                setSelectedSum(s)
                satisfyGate?.()
              }}
            />
            {selectedSum !== null && (
              <p className="readout">
                сумма {selectedSum}: {waysFor(selectedSum)} из 36 ={' '}
                {(waysFor(selectedSum) / 36).toFixed(3)}
              </p>
            )}
          </>
        )}

        {beat === 'B1.10' && (
          <>
            {bell.n > 0 && (
              <Histogram
                data={bell.hist}
                title=""
                xLabel="сумма"
                yLabel="сколько"
                width={360}
                height={210}
              />
            )}
            <input
              type="range"
              min={0}
              max={100}
              value={bellSlider}
              onChange={(e) => {
                const t = +e.target.value
                setBellSlider(t)
                setBell(simBell(t))
                satisfyGate?.()
              }}
              className="prob-slider"
            />
            <p className="readout">{fmt(bell.n)} бросков</p>
          </>
        )}
      </div>
    )
  }

  // B1.11 — transition beat, no model
  return <div className="prob-model prob-model--empty" />
}

export const scene1: Scene = {
  id: 'scene-1',
  model: ProbabilityModel,
  beats: [
    {
      id: 'B1.1',
      scene: 'scene-1',
      prompt: 'Подбрось монету.',
      payoff:
        'Орёл или решка — третьего не бывает. Каждый бросок даёт ровно одно из двух, не половину и не что-то ещё. Этот короткий список — всё, что вообще может произойти, — называют **пространством исходов**: {орёл, решка}.',
      gate: { kind: 'roll', needed: 1 },
    },
    {
      id: 'B1.2',
      scene: 'scene-1',
      prompt:
        'Орёл выпадает чаще решки, или они равны? Не угадывай — подбрось десяток раз и смотри на столбики.',
      payoff:
        'После десятка бросков один столбик обычно обгоняет другой. Но это ещё ничего не значит: на горстке бросков перевес рисует сам случай. Чтобы увидеть, как на самом деле, бросать надо куда больше — больше, чем получится руками.',
      gate: { kind: 'roll', needed: 10 },
    },
    {
      id: 'B1.3',
      scene: 'scene-1',
      prompt:
        'Передай броски компьютеру и тяни ползунок: тысяча, десять тысяч, сто тысяч.',
      payoff:
        'Чем больше бросков, тем ровнее встают столбики: доля орлов оседает на половине и там остаётся. Вот это оседание и есть то, что называют **вероятностью** — доля, которая достаётся исходу, когда бросаешь очень много раз. Частота $f = \\frac{\\text{орлов}}{\\text{бросков}}$, и с ростом числа бросков $f \\to \\tfrac12$. Это **закон больших чисел**.',
      gate: { kind: 'slider' },
    },
    {
      id: 'B1.4',
      scene: 'scene-1',
      prompt:
        'Подбрось две монеты, одну за другой. Первый бросок — развилка надвое, от каждой ветки ещё развилка. Всего четыре пути.',
      payoff:
        'Четыре пути — ОО, ОР, РО, РР — и все равноправны. Первая монета ничего не знает о второй: сколько бы орлов ни выпало подряд, на следующей развилке всё те же пол-на-пол. Исходы, которые не влияют друг на друга, называют **независимыми** — прошлое не сдвигает будущее.',
      gate: { kind: 'roll', needed: 1 },
    },
    {
      id: 'B1.5',
      scene: 'scene-1',
      prompt:
        'А если между бросками ты что-то решаешь — оставить орла, перебросить решку? Переключи дерево.',
      payoff:
        'Тогда ветки второго броска зависят от твоего выбора: дерево перестраивается под тебя. Это **зависимые** исходы. Их дерево мы развернём, когда дойдём до самой игры, — из него вырастает вся стратегия.',
      gate: { kind: 'toggle' },
    },
    {
      id: 'B1.6',
      scene: 'scene-1',
      prompt:
        'У монеты всего два исхода — ей быстро нечего показывать. Возьмём кубик: шесть граней вместо двух. Брось.',
      payoff:
        'Пространство исходов шире — {1, 2, 3, 4, 5, 6}, — но всё, что мы поняли на монете, переносится сюда слово в слово.',
      gate: { kind: 'roll', needed: 1 },
    },
    {
      id: 'B1.7',
      scene: 'scene-1',
      prompt:
        'Тяни ползунок — и, как у монеты, каждая грань оседает на своей доле.',
      payoff:
        'Только теперь эта доля — одна шестая: шесть равноправных граней, $f \\to \\tfrac16$.',
      gate: { kind: 'slider' },
    },
    {
      id: 'B1.8',
      scene: 'scene-1',
      prompt:
        'Добавь второй кубик. Теперь интересна сумма двух. Брось несколько раз и следи за суммой.',
      payoff:
        'Суммы ложатся неравномерно: семёрка выпадает снова и снова, а двойка и двенадцатка — почти никогда. Кубики честные — откуда тогда перекос?',
      gate: { kind: 'roll', needed: 8 },
    },
    {
      id: 'B1.9',
      scene: 'scene-1',
      prompt:
        'Разложим всё по клеткам: 6 × 6 = 36 пар. Выбери сумму и посмотри, какими парами она набирается.',
      payoff:
        'Двенадцать набирается единственным способом, 6+6 — это 1/36. А семёрку дают сразу шесть пар — 6/36 = 1/6, вшестеро чаще. Вот и весь секрет: к семёрке ведёт больше дорог. Общее правило: $P = \\frac{|\\text{подходящие}|}{|\\text{все}|}$. На монете мы вероятность **измеряли**, здесь — **посчитали**. Само умение пересчитывать — это **комбинаторика**.',
      gate: { kind: 'choice' },
    },
    {
      id: 'B1.10',
      scene: 'scene-1',
      prompt:
        'А теперь брось эту пару десятки тысяч раз.',
      payoff:
        'Гистограмма сумм собирается в ровный холм: высокий на семёрке, плавно спадающий к краям. У этой колоколообразной формы есть имя — **нормальное распределение**.',
      gate: { kind: 'slider' },
    },
    {
      id: 'B1.11',
      scene: 'scene-1',
      prompt:
        'Тридцать шесть пар ещё помещаются на одной картинке. С пятью кубиками так уже не получится.',
    },
  ],
}
