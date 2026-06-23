import { useState } from 'react'
import type { SceneModelProps, Scene } from '@/scaffolding'
import { useTr } from '@/scaffolding'
import { Die } from '@/components'
import { qualifies, scoreHand, Category } from '@/engine'
import { useMonteCarloWorker, type SimulationResult } from '@/engine'
import { SimProgress } from './Scene8Strategies'
import './Strategy.css'

const ACCENT = '#059669'
const SECOND = '#ef4444'

/* ============================================================
   Section «Strategies» — what's easy to roll, and how to close 13.
   Part A: single-roll vs over-a-turn odds (honest reroll sim), the
   difficulty ladder. Part B: assigning a hand to a row, the value
   of a deliberate zero, the upper bonus, and two strategy archetypes.
   ============================================================ */

type Cat = (typeof Category)[keyof typeof Category]

interface Combo {
  key: string
  ru: string
  en: string
  cat: Cat
  single: number // single-roll probability, %
}

// Single-roll odds are the exact values established back in «Rules».
const COMBOS: Combo[] = [
  { key: 'three', ru: 'тройка', en: 'three of a kind', cat: Category.ThreeOfAKind, single: 21 },
  { key: 'small', ru: 'малый стрейт', en: 'small straight', cat: Category.SmallStraight, single: 15 },
  { key: 'full', ru: 'фулл-хаус', en: 'full house', cat: Category.FullHouse, single: 3.9 },
  { key: 'large', ru: 'большой стрейт', en: 'large straight', cat: Category.LargeStraight, single: 3.1 },
  { key: 'four', ru: 'каре', en: 'four of a kind', cat: Category.FourOfAKind, single: 2 },
  { key: 'yahtzee', ru: 'Yahtzee', en: 'Yahtzee', cat: Category.Yahtzee, single: 0.08 },
]

// The five championship characters, each defined by what it optimizes. The key
// is the engine strategy name; ru/en/opt are display; color avoids blue/purple.
interface Role {
  key: string
  ru: string
  en: string
  optRu: string
  optEn: string
  descRu: string
  descEn: string
  color: string
}
const ROLES: Role[] = [
  { key: 'greedy', ru: 'EV-максимизатор', en: 'EV-maximizer', optRu: 'макс. среднее', optEn: 'max average', descRu: 'Берёт максимум очков на каждом ходу. Самое высокое среднее — пасьянсный оптимум.', descEn: 'Takes the most points each turn. The highest mean — the solitaire optimum.', color: ACCENT },
  { key: 'conservator', ru: 'консерватор', en: 'conservator', optRu: 'мин. дисперсия', optEn: 'min variance', descRu: 'Бережёт гарантированные очки и не оставляет дыр. Узкий разброс, мало провалов.', descEn: 'Banks sure points and leaves no holes. Narrow spread, few flops.', color: '#84cc16' },
  { key: 'upperFirst', ru: 'охотник за бонусом', en: 'bonus hunter', optRu: 'порог 63 (+35)', optEn: 'the 63 (+35) threshold', descRu: 'Целит в порог 63 ради +35. Добрал — высокое среднее, нет — обрыв.', descEn: 'Aims at the 63 threshold for +35. Hit it and the mean is high; miss and it drops.', color: '#eab308' },
  { key: 'yahtzeeHunter', ru: 'охотник за Yahtzee', en: 'Yahtzee hunter', optRu: 'жирный хвост', optEn: 'a fat tail', descRu: 'Жжёт ходы под крупные комбинации. Низкое среднее, но жирный правый хвост.', descEn: 'Burns turns chasing big combos. A low mean, but a fat right tail.', color: SECOND },
  { key: 'random', ru: 'случайный', en: 'random', optRu: 'без плана', optEn: 'no plan', descRu: 'Пишет руку куда придётся. Самое низкое среднее, всё кучно у самого низа — мерило снизу.', descEn: 'Writes a hand wherever. Lowest mean, everything clustered near the floor — the baseline.', color: '#f97316' },
]
const FOCUS: Record<string, string> = {
  'STR.C1': 'greedy',
  'STR.C2': 'conservator',
  'STR.C3': 'upperFirst',
  'STR.C4': 'yahtzeeHunter',
  'STR.C5': 'random',
}

function rollFace(): number {
  return ((Math.random() * 6) | 0) + 1
}
function roll5(): number[] {
  return Array.from({ length: 5 }, rollFace)
}
function countsOf(hand: number[]): number[] {
  const c = [0, 0, 0, 0, 0, 0, 0]
  hand.forEach((v) => c[v]++)
  return c
}

/* A character's score distribution as a small histogram — this is what makes the
   fat tail / bimodality readable, beyond the single (μ, σ) point. */
function MiniHist({ scores, color }: { scores: number[]; color: string }) {
  const W = 240
  const H = 60
  const BINS = 18
  const HI = 360
  const bins = new Array(BINS).fill(0)
  for (const s of scores) {
    const b = Math.min(BINS - 1, Math.max(0, Math.floor((s / HI) * BINS)))
    bins[b]++
  }
  const max = Math.max(1, ...bins)
  const bw = W / BINS
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="strat-minihist" role="img">
      {bins.map((c, i) => {
        const h = (c / max) * (H - 12)
        return <rect key={i} x={i * bw + 0.5} y={H - h - 10} width={bw - 1} height={h} fill={color} rx={1} />
      })}
      <text x={0} y={H - 1} className="strat-minihist-ax">0</text>
      <text x={W} y={H - 1} className="strat-minihist-ax" textAnchor="end">{HI}</text>
    </svg>
  )
}

/* Which dice to keep when chasing a target category — a sensible heuristic,
   not the optimal oracle: keep what already helps, reroll the rest. */
function keepFor(hand: number[], target: Cat): boolean[] {
  const c = countsOf(hand)
  if (
    target === Category.ThreeOfAKind ||
    target === Category.FourOfAKind ||
    target === Category.Yahtzee
  ) {
    let f = 1
    for (let i = 2; i <= 6; i++) if (c[i] > c[f]) f = i
    return hand.map((v) => v === f)
  }
  if (target === Category.FullHouse) {
    const order = [1, 2, 3, 4, 5, 6].sort((a, b) => c[b] - c[a])
    const [top, second] = order
    const keep = [false, false, false, false, false]
    let kt = 0
    let ks = 0
    hand.forEach((v, i) => {
      if (v === top && kt < 3) { keep[i] = true; kt++ }
      else if (v === second && ks < 2) { keep[i] = true; ks++ }
    })
    return keep
  }
  if (target === Category.SmallStraight || target === Category.LargeStraight) {
    const seen = new Set<number>()
    return hand.map((v) => {
      if (seen.has(v)) return false
      seen.add(v)
      return true
    })
  }
  return hand.map(() => true)
}

/* One honest turn: roll, keep-and-reroll twice, then check the target. */
function chase(target: Cat): boolean {
  if (target === Category.Chance) return true
  let hand = roll5()
  for (let rr = 0; rr < 2; rr++) {
    const keep = keepFor(hand, target)
    hand = hand.map((v, i) => (keep[i] ? v : rollFace()))
  }
  return qualifies(hand, target)
}

function perTurnRate(target: Cat, n: number): number {
  let hits = 0
  for (let i = 0; i < n; i++) if (chase(target)) hits++
  return (hits / n) * 100
}

/* ---- Part B helpers ---- */

const ROWS_RU = [
  'Единицы', 'Двойки', 'Тройки', 'Четвёрки', 'Пятёрки', 'Шестёрки',
  'Тройка', 'Каре', 'Фулл-хаус', 'Малый', 'Большой', 'Yahtzee', 'Шанс',
]
const ROWS_EN = [
  'Ones', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes',
  'Three of a kind', 'Four of a kind', 'Full house', 'Small', 'Large', 'Yahtzee', 'Chance',
]
const ROW_CATS: Cat[] = [
  Category.Ones, Category.Twos, Category.Threes, Category.Fours, Category.Fives, Category.Sixes,
  Category.ThreeOfAKind, Category.FourOfAKind, Category.FullHouse,
  Category.SmallStraight, Category.LargeStraight, Category.Yahtzee, Category.Chance,
]

export function StrategyModel({ activeBeatId, satisfyGate }: SceneModelProps) {
  const beat = activeBeatId ?? ''
  const tr = useTr()
  const en = tr('ru', 'en') === 'en'
  const rows = en ? ROWS_EN : ROWS_RU

  // Part A — selected combo + simulated per-turn rates (shared A.2 → A.3)
  const [pick, setPick] = useState<string>('yahtzee')
  const [perTurn, setPerTurn] = useState<Record<string, number> | null>(null)
  const [busyA, setBusyA] = useState(false)
  // STR.A3 — the reader sorts the combos themselves (drag to reorder), then
  // reveals the true over-a-turn ranking and sees how many they placed right.
  const [order, setOrder] = useState<string[]>(['four', 'yahtzee', 'three', 'large', 'small', 'full'])
  const [a3Revealed, setA3Revealed] = useState(false)
  const [dragKey, setDragKey] = useState<string | null>(null)

  // Part B
  const [assigned, setAssigned] = useState<number | null>(null)
  const [zeroed, setZeroed] = useState(false)
  const [upper, setUpper] = useState<Set<number>>(new Set())

  // Part B.4 archetypes
  const { simulate } = useMonteCarloWorker()
  const [arch, setArch] = useState<Record<string, SimulationResult>>({})
  const [busyB, setBusyB] = useState(false)
  const [progressB, setProgressB] = useState(0)

  if (beat === 'STR.A4' || beat === 'STR.B6' || beat === '') {
    return <div className="strat-model strat-model--empty" />
  }

  const runPerTurn = () => {
    if (busyA) return
    setBusyA(true)
    // synchronous sim is fast enough for 400 turns × 6 combos
    window.setTimeout(() => {
      const out: Record<string, number> = {}
      for (const c of COMBOS) out[c.key] = perTurnRate(c.cat, 400)
      setPerTurn(out)
      setBusyA(false)
      satisfyGate?.()
    }, 0)
  }

  // STR.A1 — single-roll odds, pick a combo
  if (beat === 'STR.A1') {
    return (
      <div className="strat-model">
        <div className="strat-bars">
          {COMBOS.map((c) => (
            <button
              key={c.key}
              className={`strat-bar-row ${pick === c.key ? 'strat-bar-row--on' : ''}`}
              onClick={() => { setPick(c.key); satisfyGate?.() }}
            >
              <span className="strat-bar-name">{tr(c.ru, c.en)}</span>
              <span className="strat-bar-track">
                <span className="strat-bar-fill" style={{ width: `${Math.max(c.single / 21 * 100, 1.5)}%` }} />
              </span>
              <span className="strat-bar-val">{tr(String(c.single).replace('.', ','), String(c.single))}%</span>
            </button>
          ))}
        </div>
        <p className="strat-note">{tr('с одного броска', 'from a single roll')}</p>
      </div>
    )
  }

  // STR.A2 — single roll vs over-a-turn
  if (beat === 'STR.A2') {
    return (
      <div className="strat-model">
        <button className="strat-btn" disabled={busyA} onClick={runPerTurn}>
          {busyA ? tr('считаю…', 'simulating…') : tr('прогнать ход за ходом', 'simulate turn by turn')}
        </button>
        <div className="strat-bars strat-bars--dual">
          {COMBOS.map((c) => {
            const pt = perTurn?.[c.key]
            return (
              <div key={c.key} className="strat-dual-row">
                <span className="strat-bar-name">{tr(c.ru, c.en)}</span>
                <span className="strat-dual-tracks">
                  <span className="strat-bar-track">
                    <span className="strat-bar-fill" style={{ width: `${Math.max(c.single, 1)}%` }} />
                  </span>
                  <span className="strat-bar-track">
                    <span
                      className="strat-bar-fill strat-bar-fill--turn"
                      style={{ width: pt !== undefined ? `${Math.min(Math.max(pt, 1), 100)}%` : '0%' }}
                    />
                  </span>
                </span>
                <span className="strat-bar-val">
                  {c.single}%{pt !== undefined && <> → <b>{pt.toFixed(pt < 10 ? 1 : 0)}%</b></>}
                </span>
              </div>
            )
          })}
        </div>
        <p className="strat-note">
          <i className="strat-key strat-key--roll" /> {tr('с броска', 'single roll')} · <i className="strat-key strat-key--turn" /> {tr('за ход', 'over a turn')}
        </p>
      </div>
    )
  }

  // STR.A3 — the reader drags the combos into their own difficulty order, then
  // reveals the true over-a-turn ranking and how many they placed right.
  if (beat === 'STR.A3') {
    const rates = perTurn ?? Object.fromEntries(COMBOS.map((c) => [c.key, c.single]))
    const byKey: Record<string, Combo> = Object.fromEntries(COMBOS.map((c) => [c.key, c]))
    const correct = [...COMBOS]
      .sort((a, b) => (rates[b.key] ?? 0) - (rates[a.key] ?? 0))
      .map((c) => c.key)
    const rightCount = a3Revealed ? order.filter((k, i) => correct[i] === k).length : 0

    const onDrop = (targetKey: string) => {
      setOrder((prev) => {
        if (dragKey === null || dragKey === targetKey) return prev
        const arr = prev.filter((k) => k !== dragKey)
        arr.splice(arr.indexOf(targetKey), 0, dragKey)
        return arr
      })
      setDragKey(null)
    }

    return (
      <div className="strat-model">
        <ol className="strat-ladder">
          {order.map((key, i) => {
            const c = byKey[key]
            const r = rates[key] ?? c.single
            const tier = r > 40 ? 'easy' : r > 10 ? 'mid' : 'hard'
            const placedRight = a3Revealed && correct[i] === key
            return (
              <li
                key={key}
                className={`strat-rung ${a3Revealed ? `strat-rung--${tier}` : ''} ${
                  a3Revealed ? (placedRight ? 'strat-rung--right' : 'strat-rung--wrong') : 'strat-rung--draggable'
                } ${dragKey === key ? 'strat-rung--dragging' : ''}`}
                draggable={!a3Revealed}
                onDragStart={() => setDragKey(key)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(key)}
                onDragEnd={() => setDragKey(null)}
              >
                <span className="strat-bar-name">
                  {!a3Revealed && <span className="strat-rung-grip" aria-hidden="true">⠿ </span>}
                  {tr(c.ru, c.en)}
                </span>
                <span className="strat-rung-val">{a3Revealed ? `${r.toFixed(r < 10 ? 1 : 0)}%` : ''}</span>
                <span className={`strat-rung-tag ${placedRight ? 'strat-rung-tag--ok' : ''}`}>
                  {a3Revealed
                    ? placedRight
                      ? '✓'
                      : tr(`верно №${correct.indexOf(key) + 1}`, `should be #${correct.indexOf(key) + 1}`)
                    : tr('перетащи', 'drag')}
                </span>
              </li>
            )
          })}
        </ol>
        {!a3Revealed ? (
          <>
            <button
              className="strat-btn"
              onClick={() => {
                if (!perTurn) runPerTurn()
                setA3Revealed(true)
                satisfyGate?.()
              }}
            >
              {tr('проверить порядок', 'check my order')}
            </button>
            <p className="strat-note">
              {tr('перетаскивай: сверху — что собрать легче за ход', 'drag to sort: easiest-over-a-turn on top')}
            </p>
          </>
        ) : (
          <p className="strat-note">
            {tr(
              `верно расставлено ${rightCount} из 6 · сверху — что собрать легче за ход`,
              `${rightCount} of 6 in the right place · top = easiest to make over a turn`
            )}
          </p>
        )}
      </div>
    )
  }

  // STR.B1 — assign a hand to a row
  if (beat === 'STR.B1') {
    const hand = [5, 5, 5, 2, 3]
    const taken = new Set<Cat>([Category.Yahtzee, Category.LargeStraight]) // illustrative
    return (
      <div className="strat-model">
        <div className="strat-hand">
          {hand.map((v, i) => <Die key={i} value={v} size={50} />)}
        </div>
        <div className="strat-rows">
          {rows.map((name, i) => {
            const cat = ROW_CATS[i]
            const isTaken = taken.has(cat)
            const sc = scoreHand(hand, cat)
            return (
              <button
                key={name}
                className={`strat-row ${assigned === i ? 'strat-row--on' : ''} ${isTaken ? 'strat-row--taken' : ''}`}
                disabled={isTaken}
                onClick={() => { setAssigned(i); satisfyGate?.() }}
              >
                <span>{name}</span>
                <span className="strat-row-score">{isTaken ? '—' : sc}</span>
              </button>
            )
          })}
        </div>
        {assigned !== null && (
          <p className="strat-note">
            {tr('эта рука сюда стоит', 'this hand scores')} <b>{scoreHand(hand, ROW_CATS[assigned])}</b> {tr('очков — и строка закрывается', 'points — and the row closes')}
          </p>
        )}
      </div>
    )
  }

  // STR.B2 — a deliberate zero
  if (beat === 'STR.B2') {
    const hand = [2, 4, 1, 6, 3] // junk: nothing of a kind, no full straight
    return (
      <div className="strat-model">
        <div className="strat-hand">
          {hand.map((v, i) => <Die key={i} value={v} size={50} />)}
        </div>
        <p className="strat-note">{tr('поздняя junk-рука · ценные строки закрыты', 'a late junk hand · the good rows are gone')}</p>
        <div className="strat-rows strat-rows--short">
          <button
            className={`strat-row ${zeroed ? 'strat-row--on' : ''}`}
            onClick={() => { setZeroed(true); satisfyGate?.() }}
          >
            <span>Yahtzee</span>
            <span className="strat-row-score">0</span>
          </button>
        </div>
        {zeroed && (
          <p className="strat-note strat-note--accent">
            {tr('ноль в недостижимый Yahtzee — и хорошие строки целы', 'a zero into the unreachable Yahtzee — the good rows stay intact')}
          </p>
        )}
      </div>
    )
  }

  // STR.B3 — the upper bonus
  if (beat === 'STR.B3') {
    const total = [...upper].reduce((a, f) => a + 3 * f, 0)
    const got = total >= 63
    return (
      <div className="strat-model">
        <div className="strat-upper">
          {[1, 2, 3, 4, 5, 6].map((f) => (
            <button
              key={f}
              className={`strat-upper-btn ${upper.has(f) ? 'strat-upper-btn--on' : ''}`}
              onClick={() =>
                setUpper((s) => {
                  const n = new Set(s)
                  if (n.has(f)) n.delete(f)
                  else n.add(f)
                  if ([...n].reduce((a, x) => a + 3 * x, 0) >= 63) satisfyGate?.()
                  return n
                })
              }
            >
              {tr('три', '3×')} {f}
            </button>
          ))}
        </div>
        <div className="strat-meter">
          <div className="strat-meter-track">
            <div className="strat-meter-fill" style={{ width: `${Math.min(total / 63 * 100, 100)}%` }} />
            <div className="strat-meter-goal" />
          </div>
          <span className="strat-meter-label">{total} / 63{got && <b> · +35</b>}</span>
        </div>
        <p className="strat-note">{tr('по три кубика на грань → 63 → бонус +35', 'three dice per face → 63 → a +35 bonus')}</p>
      </div>
    )
  }

  // STR.B4 (run) → STR.C1..C5 (one character per screen, that point lit on the
  // scatter with its card) → STR.B5 (all five together — the instrument).
  const runChampionship = async () => {
    if (busyB) return
    setBusyB(true)
    setProgressB(0)
    try {
      const out: Record<string, SimulationResult> = {}
      for (let i = 0; i < ROLES.length; i++) {
        out[ROLES[i].key] = await simulate(ROLES[i].key, 1500, (done, total) =>
          setProgressB((i + done / total) / ROLES.length)
        )
      }
      setArch(out)
      satisfyGate?.()
    } finally {
      setBusyB(false)
    }
  }
  const haveAll = ROLES.every((r) => arch[r.key])
  const focusKey = FOCUS[beat] ?? null
  const focusRole = ROLES.find((r) => r.key === focusKey) ?? null
  // scatter domain (fixed so the points have a stable home; μ starts low enough
  // to fit the random baseline ≈ 46)
  const MU = [40, 260]
  const SG = [10, 90]
  const sw = 360
  const sh = 230
  const ml = 44
  const mb = 34
  const px = (mu: number) => ml + ((mu - MU[0]) / (MU[1] - MU[0])) * (sw - ml - 12)
  const py = (sg: number) => sh - mb - ((sg - SG[0]) / (SG[1] - SG[0])) * (sh - mb - 14)

  return (
    <div className="strat-model">
      {beat === 'STR.B4' && !haveAll && (
        <>
          <button className="strat-btn" disabled={busyB} onClick={runChampionship}>
            {busyB ? tr('гоняю чемпионат…', 'running the championship…') : tr('провести чемпионат · 5 характеров', 'run the championship · 5 characters')}
          </button>
          {busyB && <SimProgress value={progressB} tr={tr} />}
        </>
      )}
      {beat === 'STR.B4' && haveAll && (
        <p className="strat-note">{tr('пятеро сыграли. Листай — познакомься с каждым.', 'all five have played. Scroll on — meet each of them.')}</p>
      )}
      {!haveAll && beat !== 'STR.B4' && (
        <p className="strat-note">{tr('считаю чемпионат…', 'running the championship…')}</p>
      )}

      {haveAll && (
        <>
          <svg width={sw} height={sh} className="strat-scatter" role="img">
            <line x1={ml} y1={14} x2={ml} y2={sh - mb} className="strat-axis" />
            <line x1={ml} y1={sh - mb} x2={sw - 6} y2={sh - mb} className="strat-axis" />
            <text x={sw - 6} y={sh - mb + 22} className="strat-axis-label" textAnchor="end">μ {tr('среднее →', 'mean →')}</text>
            <text x={ml - 8} y={20} className="strat-axis-label" textAnchor="end">σ ↑</text>
            {ROLES.map((r) => {
              const s = arch[r.key].stats
              const dim = focusKey ? r.key !== focusKey : false
              const big = focusKey ? r.key === focusKey : false
              return (
                <g key={r.key} opacity={dim ? 0.22 : 1}>
                  <circle cx={px(s.mean)} cy={py(s.stdDev)} r={big ? 12 : 8} fill={r.color} className="strat-pt" />
                  {/* Label only the focused point (C1–C5); on the overview the
                      points cluster and their labels collide, so the colored
                      legend below carries the names instead. */}
                  {big && (
                    <text x={px(s.mean)} y={py(s.stdDev) - 16} className="strat-pt-label" textAnchor="middle">
                      {tr(r.ru, r.en)}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>

          {focusRole ? (
            <div className="strat-card">
              <div className="strat-card-head">
                <i className="strat-role-dot" style={{ background: focusRole.color }} />
                <span className="strat-card-name">{tr(focusRole.ru, focusRole.en)}</span>
                <span className="strat-card-sig">
                  μ {arch[focusRole.key].stats.mean.toFixed(0)} · σ {arch[focusRole.key].stats.stdDev.toFixed(0)}
                </span>
              </div>
              <MiniHist scores={arch[focusRole.key].scores} color={focusRole.color} />
              <p className="strat-card-desc">{tr(focusRole.descRu, focusRole.descEn)}</p>
            </div>
          ) : (
            <div className="strat-roles">
              {ROLES.map((r) => {
                const s = arch[r.key].stats
                return (
                  <div key={r.key} className="strat-role">
                    <i className="strat-role-dot" style={{ background: r.color }} />
                    <span className="strat-role-name">{tr(r.ru, r.en)}</span>
                    <span className="strat-role-opt">{tr(r.optRu, r.optEn)}</span>
                    <span className="strat-role-sig">μ {s.mean.toFixed(0)} · σ {s.stdDev.toFixed(0)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export const sceneStrat: Scene = {
  id: 'scene-strat',
  model: StrategyModel,
  beats: [
    {
      id: 'STR.A1',
      scene: 'scene-strat',
      prompt:
        'Ты уже видел, как часто комбинации выпадают с одного броска. Но играешь ты не с одного — у тебя три броска и перебросы между ними. Выбери комбинацию.',
      payoff:
        'С одного броска шансы скромные:\n[[Yahtzee — 0,08% · каре — 2% · фулл-хаус — 3,9% · большой стрейт — 3,1% · малый — 15% · тройка — 21%]]\nНо это не те числа, по которым играют.',
      gate: { kind: 'pick' },
    },
    {
      id: 'STR.A2',
      scene: 'scene-strat',
      prompt:
        'За целый ход, перебрасывая с умом, шанс куда выше. Прогони — модель сыграет ход за ходом, целясь в комбинацию, и посчитает, как часто доходит.',
      payoff:
        'Yahtzee за ход выходит примерно у каждого 22-го — около **4,6%**. С одного броска было 0,08%: за ход в полсотни раз чаще, и всё равно редкость. Остальные комбинации за ход тоже подскакивают — модель считает каждую тем же честным перебором.',
      gate: { kind: 'roll' },
    },
    {
      id: 'STR.A3',
      scene: 'scene-strat',
      prompt: 'Расставь комбинации по сложности — по шансу собрать их за ход.',
      payoff:
        'Тройка и пара — почти даром, добираются между делом. Малый стрейт и фулл-хаус — середина. Большой стрейт, каре и особенно Yahtzee — дорого: их надо ловить и беречь под них целый ход. Вот и ответ на «что проще выбросить»: [[дешёвые комбинации берёшь попутно, дорогие — планируешь.]]',
      gate: { kind: 'build' },
    },
    {
      id: 'STR.A4',
      scene: 'scene-strat',
      prompt:
        'Раз одни комбинации дёшевы, а другие дороги, встаёт главный вопрос партии: какую руку в какую из тринадцати строк отправить?',
    },
    {
      id: 'STR.B1',
      scene: 'scene-strat',
      prompt:
        'Тринадцать строк, тринадцать ходов — каждую надо закрыть ровно один раз. Поэтому вопрос не «какая рука хорошая», а «куда эту руку записать». Вот рука — выбери строку.',
      payoff:
        'Одна и та же рука в разные строки стоит по-разному — и каждая занятая строка больше недоступна. [[Хороший ход выбирает не максимум очков сейчас, а тот, после которого ценнее всё оставшееся.]]',
      gate: { kind: 'pick' },
    },
    {
      id: 'STR.B2',
      scene: 'scene-strat',
      prompt: 'Под конец приходит junk-рука, а хороших строк уже нет. Что делать? Спиши ноль намеренно.',
      payoff:
        'Иногда лучший ход — записать ноль. Сжечь недостижимую строку (например, Yahtzee, который уже не собрать) нулём дешевле, чем испортить ею хорошую руку или оставить дыру на потом. [[Жертва — часть плана, а не поражение.]]',
      gate: { kind: 'step' },
    },
    {
      id: 'STR.B3',
      scene: 'scene-strat',
      prompt: 'Внутри партии прячется ещё одна цель — верхний бонус. Добери верх до 63.',
      payoff:
        'Тридцать пять очков ждут за порогом 63, а это примерно по три кубика на каждую грань:\n[[$3\\cdot(1+2+3+4+5+6) = 63 \\Rightarrow +35$]]\nПоэтому ранние шестёрки и пятёрки часто берегут под верх, а не сливают в «шанс»: недобор пары очков стоит всех тридцати пяти.',
      gate: { kind: 'build' },
    },
    {
      id: 'STR.B4',
      scene: 'scene-strat',
      prompt:
        'Из этих развилок рождаются характеры — каждый определён тем, что он оптимизирует. Проведи чемпионат: пусть все пятеро сыграют по полторы тысячи партий.',
      payoff:
        'Чемпионат не ищет «лучшего» — он **прибор**, который снимает у каждой роли её подпись.\n[[Подпись характера — это точка (μ, σ): где центр и насколько широк разброс.]]\nЛистай — познакомься с пятью по очереди.',
      gate: { kind: 'roll' },
    },
    {
      id: 'STR.C1',
      scene: 'scene-strat',
      prompt: 'Первый — EV-максимизатор. На каждом ходу берёт максимум очков.',
      payoff:
        'Его подпись — правее всех по μ: это пасьянсный оптимум, самое высокое среднее. Разброс при этом немалый — максимум он берёт и в удачных, и в провальных партиях. В одиночной игре его не обыграть.',
    },
    {
      id: 'STR.C2',
      scene: 'scene-strat',
      prompt: 'Консерватор. Бережёт верные очки и не оставляет дыр.',
      payoff:
        'Его точка ниже всех по σ — узкая, надёжная подпись. Среднее умеренное, зато почти без провалов.',
    },
    {
      id: 'STR.C3',
      scene: 'scene-strat',
      prompt: 'Охотник за бонусом. Всё затачивает под порог 63 и +35.',
      payoff:
        'Подпись раздвоенная: добрал бонус — съезжает вправо-вверх, не добрал — обрыв влево. Оттого разброс шире, чем у консерватора.',
    },
    {
      id: 'STR.C4',
      scene: 'scene-strat',
      prompt: 'Охотник за Yahtzee. Жжёт ходы под крупные комбинации.',
      payoff:
        'Самый широкий разброс — высоко по σ, низковато по μ. То густо, то пусто: жирный правый хвост ценой частых провалов.',
    },
    {
      id: 'STR.C5',
      scene: 'scene-strat',
      prompt: 'И случайный — пишет руку куда придётся, без плана.',
      payoff:
        'Левый нижний угол: ниже всех по μ, и всё кучно у самого низа. Он ничего не оптимизирует — это мерило снизу, относительно которого видно цену плана.',
    },
    {
      id: 'STR.B5',
      scene: 'scene-strat',
      prompt: 'Теперь все пятеро на одном поле.',
      payoff:
        'Вот облако подписей целиком. В одиночку их можно упорядочить — EV-максимизатор правее всех. Несравнимыми роли становятся лишь когда цель меняется с «больше очков» на «больше, чем у соперника». Именно из этого облака потом и выбирает адаптивный игрок.',
    },
    {
      id: 'STR.B6',
      scene: 'scene-strat',
      prompt:
        'А какая из подписей лучшая — смотря против чего играешь.',
    },
  ],
}
