import { useMemo, useState } from 'react'
import type { SceneModelProps, Scene } from '@/scaffolding'
import { useTr, usePlayerState } from '@/scaffolding'
import { Die } from '@/components'
import {
  Category,
  scoreHand,
  qualifies,
  evForAllCategories,
  simulateGame,
  strategies,
} from '@/engine'
import type { Hand } from '@/engine'
import './Synthesis.css'

/* ============================================================
   Section — Synthesis: a real game with the full instrumentation.
   You play actual dice against an opponent; every move shows the
   engine's EV per category (the "oracle" suggestion), a decision
   fan, and the opponent's prediction funnel / win-region. Then a
   Monte-Carlo convergence closes the law-of-large-numbers arc from
   Section 1, and the honest capstone lands.
   ============================================================ */

type Cat = (typeof Category)[keyof typeof Category]

const CEILING = 254.6 // solitaire optimum (Pawlewicz: 254.589)
const SIG_TURN = 13 // rough per-turn standard deviation (drives the funnel width)

const CATS: Cat[] = [
  Category.Ones, Category.Twos, Category.Threes, Category.Fours, Category.Fives, Category.Sixes,
  Category.ThreeOfAKind, Category.FourOfAKind, Category.FullHouse,
  Category.SmallStraight, Category.LargeStraight, Category.Yahtzee, Category.Chance,
]
const UPPER = new Set<Cat>([Category.Ones, Category.Twos, Category.Threes, Category.Fours, Category.Fives, Category.Sixes])
const LABEL_RU: Record<string, string> = {
  ones: 'Единицы', twos: 'Двойки', threes: 'Тройки', fours: 'Четвёрки', fives: 'Пятёрки', sixes: 'Шестёрки',
  'three-of-a-kind': 'Тройка', 'four-of-a-kind': 'Каре', 'full-house': 'Фулл-хаус',
  'small-straight': 'Малый', 'large-straight': 'Большой', yahtzee: 'Yahtzee', chance: 'Шанс',
}
const LABEL_EN: Record<string, string> = {
  ones: 'Ones', twos: 'Twos', threes: 'Threes', fours: 'Fours', fives: 'Fives', sixes: 'Sixes',
  'three-of-a-kind': '3 of a kind', 'four-of-a-kind': '4 of a kind', 'full-house': 'Full house',
  'small-straight': 'Small', 'large-straight': 'Large', yahtzee: 'Yahtzee', chance: 'Chance',
}

function rollFace(): number {
  return ((Math.random() * 6) | 0) + 1
}
function roll5(): number[] {
  return Array.from({ length: 5 }, rollFace)
}
function modalFace(hand: number[]): number {
  const c = [0, 0, 0, 0, 0, 0, 0]
  hand.forEach((v) => c[v]++)
  let f = 1
  for (let i = 2; i <= 6; i++) if (c[i] > c[f]) f = i
  return f
}
function upperBonus(card: Partial<Record<Cat, number>>): number {
  let s = 0
  for (const c of UPPER) s += card[c] ?? 0
  return s >= 63 ? 35 : 0
}
function total(card: Partial<Record<Cat, number>>): number {
  let s = 0
  for (const c of CATS) s += card[c] ?? 0
  return s + upperBonus(card)
}

/* One honest opponent turn: roll, keep the modal face, reroll twice, then take
   the highest-scoring still-open category. A real, fair-ish player. */
function opponentTurn(filled: Partial<Record<Cat, number>>): { cat: Cat; score: number } {
  let hand = roll5()
  for (let rr = 0; rr < 2; rr++) {
    const f = modalFace(hand)
    hand = hand.map((v) => (v === f ? v : rollFace()))
  }
  let bestCat: Cat = Category.Chance
  let bestScore = -1
  for (const c of CATS) {
    if (filled[c] !== undefined) continue
    const s = scoreHand(hand, c)
    if (s > bestScore) { bestScore = s; bestCat = c }
  }
  return { cat: bestCat, score: Math.max(bestScore, 0) }
}

/* The live "shots at each combination" — the conditional probabilities from the
   Reroll section, but computed on the CURRENT hand and holds via the engine's
   own `qualifies`. Held dice are always kept; the rest are rerolled toward the
   target over the remaining rerolls. */
const ODDS_TARGETS: { cat: Cat; ru: string; en: string }[] = [
  { cat: Category.ThreeOfAKind, ru: 'тройка', en: 'three of a kind' },
  { cat: Category.FourOfAKind, ru: 'каре', en: 'four of a kind' },
  { cat: Category.FullHouse, ru: 'фулл-хаус', en: 'full house' },
  { cat: Category.SmallStraight, ru: 'малый стрейт', en: 'small straight' },
  { cat: Category.LargeStraight, ru: 'большой стрейт', en: 'large straight' },
  { cat: Category.Yahtzee, ru: 'Yahtzee', en: 'Yahtzee' },
]

function countsOf(hand: number[]): number[] {
  const c = [0, 0, 0, 0, 0, 0, 0]
  for (const v of hand) c[v]++
  return c
}

/* Which non-held dice help a target (a sensible heuristic, not the oracle). */
function helpsTarget(hand: number[], target: Cat): boolean[] {
  const c = countsOf(hand)
  if (target === Category.ThreeOfAKind || target === Category.FourOfAKind || target === Category.Yahtzee) {
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
  // straights: keep one of each distinct value
  const seen = new Set<number>()
  return hand.map((v) => {
    if (seen.has(v)) return false
    seen.add(v)
    return true
  })
}

function rollFace1(): number {
  return ((Math.random() * 6) | 0) + 1
}

/* P(complete target) given current dice, the player's holds, and rerolls left. */
function completionOdds(dice: number[], held: boolean[], rerolls: number, target: Cat): number {
  if (dice.length === 0) return 0
  if (qualifies(dice as Hand, target)) return 1
  if (rerolls === 0) return 0
  const N = 1200
  let hits = 0
  for (let t = 0; t < N; t++) {
    let h = [...dice]
    for (let r = 0; r < rerolls; r++) {
      const help = helpsTarget(h, target)
      h = h.map((v, i) => (held[i] || help[i] ? v : rollFace1()))
    }
    if (qualifies(h as Hand, target)) hits++
  }
  return hits / N
}

function erf(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t) *
      Math.exp(-x * x)
  return x >= 0 ? y : -y
}

export function SynthesisModel({ activeBeatId, satisfyGate }: SceneModelProps) {
  const beat = activeBeatId ?? ''
  const tr = useTr()
  const { record } = usePlayerState()
  const LABEL = tr('ru', 'en') === 'en' ? LABEL_EN : LABEL_RU

  // ---- live game state (B10.1) ----
  const [you, setYou] = useState<Partial<Record<Cat, number>>>({})
  const [opp, setOpp] = useState<Partial<Record<Cat, number>>>({})
  const [turn, setTurn] = useState(0) // completed turns
  const [dice, setDice] = useState<number[]>([])
  const [held, setHeld] = useState<boolean[]>([false, false, false, false, false])
  const [rerolls, setRerolls] = useState(0)
  const [rolledThisTurn, setRolledThisTurn] = useState(false)
  // shadow optimum: a greedy player on the SAME rolls (own fills + bonus), the
  // running "you vs optimum" baseline; gapHist = (you − optimum) per turn.
  const [optCard, setOptCard] = useState<Partial<Record<Cat, number>>>({})
  const [gapHist, setGapHist] = useState<number[]>([])
  const [lastTurn, setLastTurn] = useState<{ bestCat: Cat; bestScore: number; yourScore: number } | null>(null)

  // ---- Monte-Carlo convergence (B10.3) ----
  const [mcN, setMcN] = useState(0)
  const [mcWin, setMcWin] = useState<number | null>(null)

  const kept = dice.filter((_, i) => held[i])
  // EV after the remaining rerolls, per open category (the engine's calculation).
  const evMap = useMemo(() => {
    if (!rolledThisTurn || rerolls === 0 || dice.length === 0) return null
    return evForAllCategories(kept)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dice, held, rerolls, rolledThisTurn])

  // Live "shot at each combination" for the current hand + holds + rerolls left.
  const liveOdds = useMemo(() => {
    if (!rolledThisTurn || dice.length === 0) return null
    return ODDS_TARGETS.map((t) => ({ ...t, p: completionOdds(dice, held, rerolls, t.cat) }))
  }, [dice, held, rerolls, rolledThisTurn])

  if (beat === 'B10.5' || beat === '') {
    return <div className="sy-model sy-model--empty" />
  }

  const youTotal = total(you)
  const oppTotal = total(opp)
  const optTotal = total(optCard)
  const remaining = 13 - turn
  const gameOver = remaining <= 0

  // win-region: lead over a funnel whose width collapses as turns run out
  const sigmaGap = SIG_TURN * Math.sqrt(Math.max(remaining, 0) * 2)
  const lead = youTotal - oppTotal
  const winP = gameOver ? (lead > 0 ? 1 : lead === 0 ? 0.5 : 0) : 0.5 * (1 + erf(lead / (sigmaGap * Math.SQRT2 || 1)))

  const rollNew = () => {
    if (gameOver) return
    setDice(roll5())
    setHeld([false, false, false, false, false])
    setRerolls(2)
    setRolledThisTurn(true)
  }
  const toggleHold = (i: number) => {
    if (!rolledThisTurn) return
    setHeld((h) => h.map((v, j) => (j === i ? !v : v)))
  }
  const doReroll = () => {
    if (rerolls <= 0) return
    setDice((d) => d.map((v, i) => (held[i] ? v : rollFace())))
    setRerolls((r) => r - 1)
  }
  const pickCategory = (c: Cat) => {
    if (!rolledThisTurn || you[c] !== undefined) return
    const sc = scoreHand(dice, c)
    // best category available to YOU this turn — the regret highlight
    let bestCat = c
    let bestScore = -1
    for (const x of CATS) {
      if (you[x] !== undefined) continue
      const s = scoreHand(dice, x)
      if (s > bestScore) { bestScore = s; bestCat = x }
    }
    // the shadow optimum picks the best on ITS own open set, same final hand
    let oc = c
    let oScore = -1
    for (const x of CATS) {
      if (optCard[x] !== undefined) continue
      const s = scoreHand(dice, x)
      if (s > oScore) { oScore = s; oc = x }
    }
    const nextYou = { ...you, [c]: sc }
    const nextOpt = { ...optCard, [oc]: Math.max(oScore, 0) }
    setYou(nextYou)
    setOptCard(nextOpt)
    setGapHist((g) => [...g, total(nextYou) - total(nextOpt)])
    setLastTurn({ bestCat, bestScore: Math.max(bestScore, 0), yourScore: sc })
    const ot = opponentTurn(opp)
    setOpp((o) => ({ ...o, [ot.cat]: ot.score }))
    setRolledThisTurn(false)
    setDice([])
    setTurn((t) => {
      const nt = t + 1
      if (nt >= 3) satisfyGate?.()
      return nt
    })
  }

  // open categories ranked for the decision fan / table
  const openCats = CATS.filter((c) => you[c] === undefined)
  const ranked = openCats
    .map((c) => {
      const now = rolledThisTurn ? scoreHand(dice, c) : 0
      const ev = evMap?.get(c) ?? now
      return { c, now, ev }
    })
    .sort((a, b) => (rerolls > 0 ? b.ev - a.ev : b.now - a.now))
  const bestCat = ranked[0]?.c

  // ============ B10.1 — the live game with full instrumentation ============
  if (beat === 'B10.1') {
    const fan = ranked.slice(0, 3)
    return (
      <div className="sy-model sy-game">
        <div className="sy-scores">
          <div className="sy-score">
            <span className="sy-score-num">{youTotal}</span>
            <span className="sy-score-name">{tr('ты', 'you')}</span>
          </div>
          <div className="sy-score">
            <span className="sy-score-num">{oppTotal}</span>
            <span className="sy-score-name">{tr('соперник', 'opponent')}</span>
          </div>
        </div>

        {/* you vs the optimum on the same rolls: running gap */}
        <div className="sy-opt">
          <div className="sy-opt-head">
            <span>{tr('оптимум на тех же бросках', 'optimum on the same rolls')}: <b>{optTotal}</b></span>
            <span className={`sy-opt-gap ${youTotal - optTotal < 0 ? 'sy-opt-gap--behind' : ''}`}>
              {tr('разрыв', 'gap')} {youTotal - optTotal > 0 ? '+' : ''}{youTotal - optTotal}
            </span>
          </div>
          {gapHist.length > 0 && (() => {
            const W = 300
            const H = 44
            const pad = 6
            const maxAbs = Math.max(5, ...gapHist.map((g) => Math.abs(g)))
            const x = (i: number) => pad + (gapHist.length === 1 ? 0 : (i / (gapHist.length - 1)) * (W - pad * 2))
            const y = (g: number) => pad + (-g / maxAbs) * (H - pad * 2)
            const pts = gapHist.map((g, i) => `${x(i).toFixed(1)},${y(g).toFixed(1)}`).join(' ')
            return (
              <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="sy-opt-line" role="img">
                <line x1={pad} y1={pad} x2={W - pad} y2={pad} className="sy-opt-zero" />
                <polyline points={pts} className="sy-opt-poly" fill="none" />
              </svg>
            )
          })()}
          {lastTurn && (
            <p className="sy-opt-regret">
              {lastTurn.bestScore > lastTurn.yourScore
                ? tr(
                    `прошлый ход: лучший был «${LABEL[lastTurn.bestCat]}» (+${lastTurn.bestScore}), ты записал +${lastTurn.yourScore} — недобрал ${lastTurn.bestScore - lastTurn.yourScore}`,
                    `last turn: best was “${LABEL[lastTurn.bestCat]}” (+${lastTurn.bestScore}), you scored +${lastTurn.yourScore} — left ${lastTurn.bestScore - lastTurn.yourScore}`
                  )
                : tr(`прошлый ход: лучший возможный — ты его и взял (+${lastTurn.yourScore})`, `last turn: you took the best move (+${lastTurn.yourScore})`)}
            </p>
          )}
        </div>

        {/* win-region + collapsing funnel band */}
        <div className="sy-winbar">
          <div className="sy-winbar-fill" style={{ width: `${(winP * 100).toFixed(0)}%` }} />
          <span className="sy-winbar-label">{tr('P(победа)', 'P(win)')} ≈ {winP.toFixed(2)}</span>
        </div>
        <svg width={320} height={46} className="sy-funnel" role="img">
          <line x1={160} y1={6} x2={160} y2={40} className="sy-funnel-zero" />
          <rect x={160 - Math.min(sigmaGap, 150)} y={18} width={Math.min(sigmaGap, 150) * 2} height={10}
            className="sy-funnel-band" />
          <circle cx={Math.max(10, Math.min(310, 160 + lead))} cy={23} r={6} className="sy-funnel-you" />
        </svg>
        <p className="sy-readout">
          {tr('ход', 'turn')} {Math.min(turn, 13)}/13 · {tr('воронка соперника', 'opponent funnel')} ∝ √{Math.max(remaining, 0)} · {lead >= 0 ? tr('ведёшь', 'leading') : tr('отстаёшь', 'behind')} {Math.abs(lead)}
        </p>

        {gameOver ? (
          <div className="sy-gameover">
            {lead > 0 ? tr('🏆 ты выиграл', '🏆 you win') : lead < 0 ? tr('соперник впереди', 'opponent wins') : tr('ничья', 'a tie')}
          </div>
        ) : (
          <>
            {/* dice + holds */}
            {rolledThisTurn && (
              <div className="sy-hand">
                {dice.map((v, i) => (
                  <button key={i} className="sy-die" onClick={() => toggleHold(i)} aria-pressed={held[i]}>
                    <Die value={v} size={46} held={held[i]} />
                  </button>
                ))}
              </div>
            )}
            <div className="sy-controls">
              {!rolledThisTurn ? (
                <button className="sy-btn" onClick={rollNew}>{tr('бросить', 'roll')}</button>
              ) : (
                <button className="sy-btn" onClick={doReroll} disabled={rerolls <= 0}>
                  {tr('перебросить', 'reroll')} · {rerolls}
                </button>
              )}
            </div>

            {/* live "shot at each combination" — conditional probabilities on the
                current hand + holds, recomputed by the engine as you keep dice */}
            {rolledThisTurn && liveOdds && (
              <div className="sy-odds">
                <span className="sy-odds-title">
                  {rerolls > 0
                    ? tr(`шанс добрать за ${rerolls} переброс${rerolls > 1 ? 'а' : ''}`, `chance to complete in ${rerolls} reroll${rerolls > 1 ? 's' : ''}`)
                    : tr('что уже собрано', 'what you already have')}
                </span>
                <div className="sy-odds-rows">
                  {liveOdds.map((o) => (
                    <div key={o.cat} className={`sy-odds-row ${o.p >= 0.999 ? 'sy-odds-row--done' : o.p === 0 ? 'sy-odds-row--none' : ''}`}>
                      <span className="sy-odds-name">{tr(o.ru, o.en)}</span>
                      <span className="sy-odds-track">
                        <span className="sy-odds-fill" style={{ width: `${Math.max(o.p * 100, o.p > 0 ? 2 : 0)}%` }} />
                      </span>
                      <span className="sy-odds-val">{o.p >= 0.999 ? '✓' : `${Math.round(o.p * 100)}%`}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* decision fan: hand → best categories (choice = max) */}
            {rolledThisTurn && (
              <>
                <svg width={320} height={92} className="sy-fan" role="img">
                  <circle cx={26} cy={46} r={7} className="sy-fan-root" />
                  {fan.map((r, i) => {
                    const y = 18 + i * 30
                    const isBest = r.c === bestCat
                    return (
                      <line key={`e${r.c}`} x1={33} y1={46} x2={92} y2={y}
                        className={`sy-fan-edge ${isBest ? 'sy-fan-edge--max' : ''}`} />
                    )
                  })}
                  {fan.map((r, i) => {
                    const y = 18 + i * 30
                    const isBest = r.c === bestCat
                    return (
                      <text key={`t${r.c}`} x={100} y={y + 4}
                        className={`sy-fan-label ${isBest ? 'sy-fan-label--max' : ''}`}>
                        {LABEL[r.c]} · {rerolls > 0 ? `EV ${r.ev.toFixed(1)}` : r.now}
                        {isBest ? tr('  ★ движок', '  ★ engine') : ''}
                      </text>
                    )
                  })}
                </svg>

                {/* full pick table */}
                <div className="sy-cats">
                  {ranked.map((r) => (
                    <button key={r.c} className={`sy-cat ${r.c === bestCat ? 'sy-cat--best' : ''}`} onClick={() => pickCategory(r.c)}>
                      <span>{LABEL[r.c]}</span>
                      <span className="sy-cat-val">
                        {r.now}{rerolls > 0 && <span className="sy-cat-ev"> · EV {r.ev.toFixed(1)}</span>}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="sy-readout">{tr('кликни кубик — оставить · кликни строку — записать', 'click a die to keep · click a row to score')}</p>
              </>
            )}
          </>
        )}
        <p className="sy-ceiling">{tr('потолок одиночной игры', 'solitaire ceiling')} ≈ {CEILING}</p>
      </div>
    )
  }

  // ============ B10.2 — the two halves framing ============
  if (beat === 'B10.2') {
    return (
      <div className="sy-model">
        <div className="sy-halves">
          <div className="sy-half">
            <svg width={130} height={90} role="img">
              <polygon points="6,45 124,18 124,72" className="sy-cone sy-cone--wide" />
            </svg>
            <span className="sy-half-label">{tr('начало · широкая', 'start · wide')}</span>
            <span className="sy-half-sub">{tr('играешь на среднее', 'play for the average')}</span>
          </div>
          <div className="sy-half">
            <svg width={130} height={90} role="img">
              <polygon points="6,45 124,40 124,50" className="sy-cone sy-cone--narrow" />
            </svg>
            <span className="sy-half-label">{tr('конец · узкая', 'end · narrow')}</span>
            <span className="sy-half-sub">{tr('играешь на победу', 'play to win')}</span>
          </div>
        </div>
        <p className="sy-readout">
          {tr('стратегия стала функцией положения: π(состояние, ходов, цель)', 'strategy became a function of position: π(state, turns, goal)')}
        </p>
      </div>
    )
  }

  // ============ B10.3 — Monte-Carlo convergence (callback to Section 1) ============
  if (beat === 'B10.3') {
    const runMC = (n: number) => {
      if (n === 0) { setMcN(0); setMcWin(null); return }
      let wins = 0
      for (let i = 0; i < n; i++) {
        const a = simulateGame(strategies.upperFirst).finalScore
        const b = simulateGame(strategies.greedy).finalScore
        if (a > b) wins++
      }
      setMcN(n)
      setMcWin(wins / n)
    }
    return (
      <div className="sy-model">
        <div className="sy-mc">
          <span className="sy-mc-num">{mcWin === null ? '—' : mcWin.toFixed(3)}</span>
          <span className="sy-mc-label">P̂({tr('победа', 'win')}) = (1/N)·Σ 1[{tr('победа', 'win')}]</span>
        </div>
        <input
          type="range"
          min={0}
          max={5000}
          step={100}
          value={mcN}
          onChange={(e) => { const n = +e.target.value; runMC(n); satisfyGate?.() }}
          className="sy-slider"
        />
        <p className="sy-readout">
          N = {mcN.toLocaleString(tr('ru-RU', 'en-US'))} {tr('партий', 'games')} · {tr('оценка оседает — тот же закон больших чисел, что и в первом слайдере', 'the estimate settles — the same law of large numbers as the very first slider')}
        </p>
      </div>
    )
  }

  // ============ B10.4 — honest capstone ============
  return (
    <div className="sy-model">
      <div className="sy-capstone">
        <span className="sy-cap-num">{tr('23 млн', '23 M')}</span>
        <span className="sy-cap-label">{tr('реальных партий: оптимум против людей', 'real games: the optimum vs humans')}</span>
      </div>
      <div className="sy-cap-edge">
        {tr('оптимум точнее лучших людей в ~50 раз — но на 100 партий это лишь ~4 лишние победы', 'the optimum is ~50× more accurate than the best humans — yet over 100 games that is only ~4 extra wins')}
      </div>
      <p className="sy-readout">
        {tr(
          'гора случайности выше зазора в мастерстве. В одной партии везение громче любой стратегии.',
          'the mountain of chance is taller than the gap in skill. In a single game, luck is louder than any strategy.'
        )}
      </p>
      {record && (
        <p className="sy-readout">
          {tr(
            `Твои ${record.finalScore} в первой партии — где-то на этой горе случайности. Сыграй ещё десяток раз, и счёт запляшет на десятки очков: вот почему одной партии мало, чтобы судить о мастерстве.`,
            `Your ${record.finalScore} from that first game sits somewhere on this mountain of chance. Play another dozen and the score swings by tens of points — which is why one game can’t judge skill.`
          )}
        </p>
      )}
    </div>
  )
}

export const scene10: Scene = {
  id: 'scene-10',
  model: SynthesisModel,
  beats: [
    {
      id: 'B10.1',
      scene: 'scene-10',
      prompt:
        'Собери всё в одну живую партию против соперника — с полным обвесом: настоящие кубики и холды, ценность каждой категории, живые шансы добрать каждую комбинацию, бегущий счёт оптимума на тех же бросках, дерево хода и воронка соперника. Сыграй несколько ходов.',
      payoff:
        'Каждый твой ход — уже не «возьми максимум очков». Это функция трёх вещей: где ты сейчас (состояние), сколько ходов осталось и какая цель. Такую стратегию-функцию называют **политикой**:\n[[$\\pi(\\text{состояние}, \\text{ходов осталось}, \\text{цель})$]]\nДвижок на каждый ход считает ожидание по категориям и подсказывает лучший ход, а рядом ведёт счёт оптимума на тех же бросках — видно, на сколько ты отстаёшь от лучшей игры и где именно недобрал. Решаешь по-прежнему ты.',
      gate: { kind: 'choice' },
    },
    {
      id: 'B10.2',
      scene: 'scene-10',
      prompt: 'И она сама собой делит партию надвое.',
      payoff:
        'В начале воронка соперника широкая, читать нечего — играешь почти как в одиночку, на максимум среднего. К концу воронка сужается, соперник прочитан — и ты крутишь риск под него: отстаёшь — раздуваешь, ведёшь — поджимаешь. Стратегия стала функцией положения.',
    },
    {
      id: 'B10.3',
      scene: 'scene-10',
      prompt:
        'А чем вообще измеряют «вероятность победы» одной стратегии над другой? Тем же, с чего всё началось. Тяни N.',
      payoff:
        'Прогоняешь тысячи партий и берёшь долю выигранных:\n[[$\\hat P(\\text{победа}) = \\frac{1}{N}\\sum_{i} \\mathbf{1}[\\text{победа}_i]$]]\nС ростом N оценка оседает на истинной вероятности — это всё тот же метод Монте-Карло, и держится он на том самом законе больших чисел, с которого всё началось: доля выигранных партий твердеет ровно так же, как когда-то доля орлов на монете.',
      gate: { kind: 'slider' },
    },
    {
      id: 'B10.4',
      scene: 'scene-10',
      prompt: 'И вот честный итог всей этой математики.',
      payoff:
        'Идеальная стратегия обыгрывает лучших живых игроков лишь чуть-чуть. На 23 миллионах реальных партий оптимум оказался примерно в полсотни раз точнее лучших людей — но это лишь около четырёх лишних побед на сотню партий. Не потому что математика слаба, а потому что разброс огромен: гора случайности куда выше, чем зазор в мастерстве. Yahtzee — игра, в которой почти всё решает удача.',
    },
    {
      id: 'B10.5',
      scene: 'scene-10',
      prompt:
        'Большую часть партии ты играешь против формы случая. Потом против правил. Потом против собственных будущих решений. И лишь в конце — против того, кто меняет единственное: критерий победы. Всё это пряталось за пятью кубиками и тринадцатью строками.',
    },
  ],
}
