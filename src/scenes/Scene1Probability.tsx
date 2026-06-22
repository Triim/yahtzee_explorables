import { useMemo, useState } from 'react'
import type { SceneModelProps, Scene } from '@/scaffolding'
import { XkcdChart, useTr } from '@/scaffolding'
import { Die, useDieRoll } from '@/components'
import './ProbabilityModel.css'

/* One colour per die face (matches the --face-* tokens); accent for single-series bars. */
const FACE = ['#dc2626', '#f97316', '#eab308', '#84cc16', '#22c55e', '#10b981']
const ACCENT = '#059669'

/* Map of {value → count} → the {labels, data} shape chart.xkcd wants, sorted by value. */
function mapToBars(m: Map<number, number>): { labels: string[]; data: number[] } {
  const labels: string[] = []
  const data: number[] = []
  for (const [k, v] of [...m.entries()].sort((a, b) => a[0] - b[0])) {
    labels.push(String(k))
    data.push(v)
  }
  return { labels, data }
}

/* ============================================================
   Section 1 — Probability.
   Coin → growing bars → law of large numbers → two-coin tree →
   independent/dependent → die → die bars → two dice + sum →
   6×6 grid → the bell. One model, switched by the active beat.
   ============================================================ */

const COIN_GROUP = ['B1.1', 'B1.2', 'B1.3']
const TREE_GROUP = ['B1.4', 'B1.5']
const DIE_GROUP = ['B1.6', 'B1.6e', 'B1.7']
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
function Coin({ letter, flipping }: { letter: string; flipping: boolean }) {
  return (
    <div className={`coin-face ${flipping ? 'flipping' : ''}`}>
      <span>{letter}</span>
    </div>
  )
}

/* ---- Two-coin probability tree, grown one flip at a time ----
   reveal = how many levels are drawn (0 root only, 1 first fork, 2 leaves);
   coin1/coin2 = the path taken so far (null = not flipped yet), used to light
   the branch you actually walked. */
function ProbTree({
  coin1,
  coin2,
  reveal,
  dependent,
  tr,
  onKeepFirst,
}: {
  coin1: boolean | null
  coin2: boolean | null
  reveal: 0 | 1 | 2
  dependent: boolean
  tr: (ru: string, en: string) => string
  /** When set, the first-level nodes become clickable: pick which coin to keep. */
  onKeepFirst?: (i: 0 | 1) => void
}) {
  const H1 = tr('О', 'H')
  const T1 = tr('Р', 'T')
  const leaves = [H1 + H1, H1 + T1, T1 + H1, T1 + T1]
  const W = 440
  const H = 270
  const rootX = 34
  const midX = 190
  const leafX = 330
  const rootY = 135
  const ys1 = [90, 180]
  const leafY = [46, 108, 170, 232]

  // 0 = heads/top branch, 1 = tails/bottom; null until coin 1 is flipped.
  const branch = coin1 === null ? null : coin1 ? 0 : 1
  const leafIdx =
    coin1 !== null && coin2 !== null ? (coin1 ? (coin2 ? 0 : 1) : coin2 ? 2 : 3) : null

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      className="prob-tree"
      role="img"
      style={{ width: '100%', maxWidth: `${W}px` }}
    >
      <circle cx={rootX} cy={rootY} r={9} className="tree-node tree-node--on" />

      {/* level 1: root → two outcomes of the first flip */}
      {reveal >= 1 && (
        <g className="tree-grow">
          {ys1.map((y, i) => (
            <line
              key={`a${i}`}
              x1={rootX}
              y1={rootY}
              x2={midX}
              y2={y}
              className={`tree-edge ${branch !== null && branch !== i ? 'tree-edge--faded' : ''}`}
            />
          ))}
          {ys1.map((y, i) => (
            <g
              key={`n${i}`}
              onClick={onKeepFirst ? () => onKeepFirst(i as 0 | 1) : undefined}
              className={onKeepFirst ? 'tree-pick' : ''}
            >
              {onKeepFirst && (
                <circle cx={midX} cy={y} r={24} className="tree-hit" />
              )}
              <circle cx={midX} cy={y} r={9} className={`tree-node ${branch === i ? 'tree-node--on' : ''}`} />
              <text x={midX - 20} y={y} textAnchor="end" dominantBaseline="central" className="tree-label">
                {i === 0 ? H1 : T1}
              </text>
            </g>
          ))}
        </g>
      )}

      {/* level 2: each first outcome → two leaves of the second flip */}
      {reveal >= 2 && (
        <g className="tree-grow">
          {ys1.map((y, i) =>
            [0, 1].map((j) => {
              const li = i * 2 + j
              const faded = branch !== null && branch !== i
              return (
                <line
                  key={`b${i}${j}`}
                  x1={midX}
                  y1={y}
                  x2={leafX}
                  y2={leafY[li]}
                  className={`tree-edge ${dependent && i === branch ? 'tree-edge--dim' : ''} ${faded ? 'tree-edge--faded' : ''}`}
                />
              )
            })
          )}
          {leaves.map((lf, i) => (
            <g key={lf}>
              <circle cx={leafX} cy={leafY[i]} r={10} className={`tree-node ${leafIdx === i ? 'tree-node--on' : ''}`} />
              <text x={leafX + 18} y={leafY[i]} dominantBaseline="central" className="tree-leaf">
                {lf}
                {dependent && Math.floor(i / 2) === branch ? tr(' · зависит', ' · depends') : ''}
              </text>
            </g>
          ))}
        </g>
      )}
    </svg>
  )
}

/* ---- 6×6 grid of dice pairs ----
   mode 'pairs' shows a+b in each cell; mode 'sums' shows the sum value, so you
   can see how many cells share a number. A selected sum lights its whole
   diagonal; a real roll outlines the single cell it landed on. */
function DiceGrid({
  mode,
  selected,
  rolled,
  onSelect,
}: {
  mode: 'pairs' | 'sums'
  selected: number | null
  rolled: [number, number] | null
  onSelect: (s: number) => void
}) {
  const cells = []
  for (let a = 1; a <= 6; a++) {
    for (let b = 1; b <= 6; b++) {
      const sum = a + b
      const on = selected === sum
      const isRolled = rolled !== null && rolled[0] === a && rolled[1] === b
      cells.push(
        <button
          key={`${a}-${b}`}
          className={`grid-cell ${on ? 'grid-cell--on' : ''} ${isRolled ? 'grid-cell--rolled' : ''}`}
          onClick={() => onSelect(sum)}
        >
          {mode === 'pairs' ? `${a}+${b}` : sum}
        </button>
      )
    }
  }
  return <div className="dice-grid">{cells}</div>
}

export function ProbabilityModel({ activeBeatId, satisfyGate }: SceneModelProps) {
  const beat = activeBeatId ?? ''
  const tr = useTr()

  // coin
  const [coin, setCoin] = useState(true)
  const [coinFlipping, setCoinFlipping] = useState(false)
  const [coinTally, setCoinTally] = useState<[number, number]>([0, 0]) // [heads, tails]
  const [coinSlider, setCoinSlider] = useState(0)

  // tree
  const [coin1, setCoin1] = useState<boolean | null>(null)
  const [coin2, setCoin2] = useState<boolean | null>(null)
  const [dependent, setDependent] = useState(false)
  // which first coin the reader chose to keep (C1: the choice is a real click)
  const [keptFirst, setKeptFirst] = useState<0 | 1 | null>(null)

  // die
  const die = useDieRoll(1)
  const [dieSlider, setDieSlider] = useState(0)
  // event = a subset of the die's faces the reader marks out (B1)
  const [eventFaces, setEventFaces] = useState<Set<number>>(new Set())

  // two dice
  const dA = useDieRoll(1)
  const dB = useDieRoll(1)
  const [sumRolls, setSumRolls] = useState<number[]>([])
  const [selectedSum, setSelectedSum] = useState<number | null>(null)
  const [bellSlider, setBellSlider] = useState(0)
  // 6×6 grid: pairs vs sums view, and the single cell a real roll landed on (D2/D3)
  const [gridMode, setGridMode] = useState<'pairs' | 'sums'>('pairs')
  const [gridRoll, setGridRoll] = useState<[number, number] | null>(null)

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

  // Flip ONE coin per click so the tree grows a level at a time. Once both are
  // flipped, another click restarts from a fresh first flip.
  const flipNext = () => {
    if (coin1 === null) {
      setCoin1(Math.random() < 0.5)
    } else if (coin2 === null) {
      setCoin2(Math.random() < 0.5)
      satisfyGate?.()
    } else {
      setCoin1(Math.random() < 0.5)
      setCoin2(null)
    }
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

  // Roll a real pair and light up its single cell in the 6×6 grid (D2).
  const rollOntoGrid = () => {
    const a = ((Math.random() * 6) | 0) + 1
    const b = ((Math.random() * 6) | 0) + 1
    dA.start(a)
    window.setTimeout(() => dB.start(b), 70)
    setGridRoll([a, b])
    setSelectedSum(a + b)
    satisfyGate?.()
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
          <Coin letter={coin ? tr('О', 'H') : tr('Р', 'T')} flipping={coinFlipping} />
          <span className="hint">{tr('подбрось', 'flip')}</span>
        </button>

        {beat === 'B1.2' && (
          <>
            {coinTally[0] + coinTally[1] > 0 && (
              <XkcdChart
                type="Bar"
                width={320}
                height={210}
                config={{
                  yLabel: tr('сколько', 'count'),
                  data: {
                    labels: [tr('орёл', 'heads'), tr('решка', 'tails')],
                    datasets: [{ data: coinTally }],
                  },
                  options: { yTickCount: 3, dataColors: [FACE[0], FACE[1]] },
                }}
              />
            )}
            <p className="readout">
              {coinTally[0]} {tr('орлов', 'heads')} · {coinTally[1]} {tr('решек', 'tails')}
            </p>
          </>
        )}

        {beat === 'B1.3' && (
          <>
            {coinFraction.n > 0 && (
              <XkcdChart
                type="Bar"
                width={320}
                height={210}
                config={{
                  yLabel: tr('сколько', 'count'),
                  data: {
                    labels: [tr('орёл', 'heads'), tr('решка', 'tails')],
                    datasets: [{ data: [coinFraction.heads, coinFraction.tails] }],
                  },
                  options: { yTickCount: 3, dataColors: [FACE[0], FACE[1]] },
                }}
              />
            )}
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
              {fmt(coinFraction.n)} {tr('бросков', 'flips')} · {tr('доля орлов', 'heads share')}{' '}
              {(coinFraction.heads / coinFraction.n).toFixed(3)}
            </p>
          </>
        )}
      </div>
    )
  }

  if (TREE_GROUP.includes(beat)) {
    // B1.4 grows level by level with each flip; B1.5 lets the reader KEEP one
    // first-coin outcome — the tree rebuilds from that choice, and the toggle
    // says whether the second flip ignores the choice (independent) or bends to
    // it (dependent).
    const reveal: 0 | 1 | 2 =
      beat === 'B1.5'
        ? 2
        : (((coin1 !== null ? 1 : 0) + (coin2 !== null ? 1 : 0)) as 0 | 1 | 2)
    const flipLabel =
      coin1 === null
        ? tr('брось первую монету', 'flip the first coin')
        : coin2 === null
          ? tr('брось вторую монету', 'flip the second coin')
          : tr('ещё раз', 'again')
    // For B1.5 the "kept" first coin drives which branch the tree walks.
    const keptAsCoin = keptFirst === null ? null : keptFirst === 0
    return (
      <div className="prob-model">
        <ProbTree
          coin1={beat === 'B1.5' ? keptAsCoin : coin1}
          coin2={beat === 'B1.5' ? null : coin2}
          reveal={reveal}
          dependent={beat === 'B1.5' ? dependent && keptFirst !== null : dependent}
          tr={tr}
          onKeepFirst={
            beat === 'B1.5'
              ? (i) => {
                  setKeptFirst(i)
                  satisfyGate?.()
                }
              : undefined
          }
        />
        {beat === 'B1.4' && (
          <button type="button" className="act-btn" onClick={flipNext}>
            {flipLabel}
          </button>
        )}
        {beat === 'B1.5' && (
          <>
            <p className="readout">
              {keptFirst === null
                ? tr('нажми на исход первой монеты — оставь его', 'tap a first-coin outcome to keep it')
                : tr(
                    `оставлено: ${keptFirst === 0 ? 'орёл' : 'решка'}`,
                    `kept: ${keptFirst === 0 ? 'heads' : 'tails'}`
                  )}
            </p>
            <button
              type="button"
              className={`act-btn ${dependent ? 'act-btn--on' : ''}`}
              onClick={() => setDependent((d) => !d)}
            >
              {dependent ? tr('зависимые', 'dependent') : tr('независимые', 'independent')}
            </button>
          </>
        )}
      </div>
    )
  }

  if (DIE_GROUP.includes(beat)) {
    const evtList = [...eventFaces].sort((a, b) => a - b)
    const toggleFace = (f: number) =>
      setEventFaces((prev) => {
        const next = new Set(prev)
        if (next.has(f)) next.delete(f)
        else next.add(f)
        return next
      })
    const shareSum =
      dieFaces.n > 0 ? dieFaces.counts.reduce((s, c) => s + c, 0) / dieFaces.n : 0
    return (
      <div className="prob-model">
        {beat === 'B1.6' && (
          <button type="button" className="die-btn" onClick={rollDie}>
            <Die value={die.displayValue} size={120} throwing={die.throwing} />
            <span className="hint">{tr('брось', 'roll')}</span>
          </button>
        )}

        {beat === 'B1.6e' && (
          <>
            <div className="event-faces">
              {[1, 2, 3, 4, 5, 6].map((f) => (
                <Die
                  key={f}
                  value={f}
                  size={56}
                  held={eventFaces.has(f)}
                  onClick={() => {
                    toggleFace(f)
                    satisfyGate?.()
                  }}
                />
              ))}
            </div>
            <p className="readout">
              {evtList.length === 0
                ? tr('выдели грани — это и есть событие', 'mark some faces — that is the event')
                : tr(
                    `событие {${evtList.join(', ')}} · P = ${evtList.length}/6 = ${(evtList.length / 6).toFixed(3)}`,
                    `event {${evtList.join(', ')}} · P = ${evtList.length}/6 = ${(evtList.length / 6).toFixed(3)}`
                  )}
            </p>
          </>
        )}

        {beat === 'B1.7' && (
          <>
            {dieFaces.n > 0 && (
              <XkcdChart
                type="Bar"
                width={360}
                height={210}
                config={{
                  yLabel: tr('сколько', 'count'),
                  data: {
                    labels: ['1', '2', '3', '4', '5', '6'],
                    datasets: [{ data: dieFaces.counts }],
                  },
                  options: { yTickCount: 3, dataColors: FACE },
                }}
              />
            )}
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
            <p className="readout">
              {fmt(dieFaces.n)} {tr('бросков', 'rolls')} · {tr('каждая грань → 1/6', 'each face → 1/6')}
              {dieFaces.n > 0 &&
                tr(
                  ` · сумма долей = ${shareSum.toFixed(2)} (100%)`,
                  ` · shares sum to ${shareSum.toFixed(2)} (100%)`
                )}
            </p>
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
              {tr('бросить', 'roll')}
            </button>
            {sumRolls.length > 0 && (() => {
              const { labels, data } = mapToBars(sumHist)
              return (
                <XkcdChart
                  type="Bar"
                  width={360}
                  height={200}
                  config={{
                    xLabel: tr('сумма', 'sum'),
                    yLabel: tr('сколько', 'count'),
                    data: { labels, datasets: [{ data }] },
                    options: { yTickCount: 3, dataColors: data.map(() => ACCENT) },
                  }}
                />
              )
            })()}
            <p className="readout">{sumRolls.length} {tr('бросков', 'rolls')}</p>
          </>
        )}

        {beat === 'B1.9' && (
          <>
            <div className="grid-controls">
              <button type="button" className="act-btn" onClick={rollOntoGrid}>
                {tr('бросить на сетку', 'roll onto the grid')}
              </button>
              <button
                type="button"
                className={`act-btn ${gridMode === 'sums' ? 'act-btn--on' : ''}`}
                onClick={() => setGridMode((m) => (m === 'pairs' ? 'sums' : 'pairs'))}
              >
                {gridMode === 'pairs' ? tr('показать суммы', 'show sums') : tr('показать пары', 'show pairs')}
              </button>
            </div>
            <DiceGrid
              mode={gridMode}
              selected={selectedSum}
              rolled={gridRoll}
              onSelect={(s) => {
                setSelectedSum(s)
                setGridRoll(null)
                satisfyGate?.()
              }}
            />
            {selectedSum !== null && (
              <p className="readout">
                {tr('сумма', 'sum')} {selectedSum}: {waysFor(selectedSum)} {tr('пар из', 'pairs of')} 36 ={' '}
                {(waysFor(selectedSum) / 36).toFixed(3)}
              </p>
            )}
          </>
        )}

        {beat === 'B1.10' && (
          <>
            {bell.n > 0 && (() => {
              const { labels, data } = mapToBars(bell.hist)
              return (
                <XkcdChart
                  type="Bar"
                  width={380}
                  height={220}
                  config={{
                    xLabel: tr('сумма', 'sum'),
                    yLabel: tr('сколько', 'count'),
                    data: { labels, datasets: [{ data }] },
                    options: { yTickCount: 3, dataColors: data.map(() => ACCENT) },
                  }}
                />
              )
            })()}
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
            <p className="readout">{fmt(bell.n)} {tr('бросков', 'rolls')}</p>
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
        'Чем больше бросков, тем ровнее встают столбики: доля орлов оседает на половине и там остаётся. Вот это оседание и есть то, что называют **вероятностью** — доля, которая достаётся исходу, когда бросаешь очень много раз.\n[[Частота $f = \\dfrac{\\text{орлов}}{\\text{бросков}} \\to \\tfrac12$ с ростом числа бросков]]\nЭто **закон больших чисел**.',
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
        'А если между бросками ты что-то решаешь — одну монету оставляешь как есть? Нажми на исход первой монеты и оставь его.',
      payoff:
        'Дерево перестроилось под твой выбор — вторая развилка растёт уже из оставленной монеты. Тумблер показывает два мира: у **независимых** монет вторая ничего не знает о первой, пол-на-пол при любом выборе; у **зависимых** то, что ты оставил, перекашивает ветки второго броска. Эту вилку «зависит / не зависит» мы развернём, когда дойдём до самой игры.',
      gate: { kind: 'choice' },
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
      id: 'B1.6e',
      scene: 'scene-1',
      prompt:
        'Редко интересен ровно один исход — чаще целый набор: «выпало чётное», «больше четырёх». Выдели на кубике такие грани.',
      payoff:
        'Любой такой набор исходов — это **событие**. Вероятность мы приписываем не отдельной грани, а событию, и считается она просто: доля выделенных граней среди всех шести.\n[[«чётное» — три грани из шести, $P = \\tfrac36 = \\tfrac12$]]\nИсход — это точка; событие — это множество точек, в которое мы целимся.',
      gate: { kind: 'choice' },
    },
    {
      id: 'B1.7',
      scene: 'scene-1',
      prompt:
        'Тяни ползунок — и, как у монеты, каждая грань оседает на своей доле.',
      payoff:
        'Только теперь эта доля — одна шестая: шесть равноправных граней, $f \\to \\tfrac16$. И эти шесть долей не висят порознь — вместе они заполняют целое: $\\tfrac16 \\cdot 6 = 1$. Сумма вероятностей всех исходов всегда равна 1 — все 100% случаев куда-то да попадают.',
      gate: { kind: 'slider' },
    },
    {
      id: 'B1.8',
      scene: 'scene-1',
      prompt:
        'Добавь второй кубик — теперь смотрим на сумму двух. Брось десятка два раз, пока не проступит форма, и следи за суммой.',
      payoff:
        'Суммы ложатся неравномерно: семёрка выпадает снова и снова, а двойка и двенадцатка — почти никогда. Кубики честные — откуда тогда перекос?',
      gate: { kind: 'roll', needed: 12 },
    },
    {
      id: 'B1.9',
      scene: 'scene-1',
      prompt:
        'Разложи все пары по клеткам: каждая из 6 граней первой кости встречается с каждой из 6 граней второй — это 6 × 6 = 36 равных клеток. Брось на сетку, потом переключи на суммы и выбери одну.',
      payoff:
        'В режиме сумм видно главное: двенадцать набирается единственной парой 6+6 — это 1/36; а семёрку дают сразу шесть пар, 6/36 = 1/6, вшестеро чаще. К семёрке просто ведёт больше клеток.\n[[$P = \\dfrac{|\\text{подходящие клетки}|}{|\\text{все клетки}|}$]]\nНа монете мы вероятность **измеряли** бросками; здесь — **посчитали** клетки. Само умение пересчитывать исходы и есть **комбинаторика**. И вот связка, на которой держится вся дальнейшая статья: комбинаторикой считаем число подходящих исходов и делим на число всех — так из счёта рождается вероятность. К ней мы будем возвращаться у каждой комбинации.',
      gate: { kind: 'choice' },
    },
    {
      id: 'B1.10',
      scene: 'scene-1',
      prompt:
        'А теперь брось эту пару десятки тысяч раз.',
      payoff:
        'Гистограмма сумм собирается в ровный холм с пиком на семёрке и почти прямыми склонами к двойке и двенадцатке — выходит треугольник. Кубики честные, а форма уже не плоская: к серединным суммам ведёт больше дорог.',
      gate: { kind: 'slider' },
    },
    {
      id: 'B1.11',
      scene: 'scene-1',
      prompt:
        'Две кости легли треугольником. А что станет с суммой, если костей не две, а больше?',
    },
  ],
}
