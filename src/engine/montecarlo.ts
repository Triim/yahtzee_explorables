/**
 * Monte Carlo: simulate complete Yahtzee games
 * Pure functions, no React/DOM. Runs in main thread or worker.
 */

import { scoreHand } from './scoring'
import { Category } from './types'
import type { Hand } from './types'

/* A policy drives a whole turn: which dice to keep before each reroll, and which
   category to score the final hand in. The two halves are what give each
   character its distinct (μ, σ) signature. */
export interface TurnPolicy {
  keep: (hand: number[], rerollsLeft: number, filled: Set<Category>) => boolean[]
  chooseCategory: (hand: number[], filled: Set<Category>) => Category
}

export interface GameResult {
  finalScore: number
  breakdown: {
    categoryScores: Partial<Record<Category, number>>
    upperSum: number
    upperBonus: number
    yahtzeeBonus: number
  }
}

export interface MonteCarloStats {
  mean: number
  variance: number
  stdDev: number
  min: number
  max: number
  median: number
}

/* ---- dice helpers (real rolls, so hands follow the true 7776 distribution,
   not a uniform pick over the 252 distinct multisets) ---- */
function rollFace(): number {
  return ((Math.random() * 6) | 0) + 1
}
function roll5(): number[] {
  return [rollFace(), rollFace(), rollFace(), rollFace(), rollFace()]
}
function counts(hand: number[]): number[] {
  const c = [0, 0, 0, 0, 0, 0, 0]
  for (const v of hand) c[v]++
  return c
}
function modalFace(hand: number[]): number {
  const c = counts(hand)
  let f = 1
  for (let i = 2; i <= 6; i++) if (c[i] > c[f]) f = i
  return f
}

const ALL_CATEGORIES: Category[] = [
  'ones', 'twos', 'threes', 'fours', 'fives', 'sixes',
  'three-of-a-kind', 'four-of-a-kind', 'full-house',
  'small-straight', 'large-straight', 'yahtzee', 'chance',
] as Category[]
const UPPER_OF: Record<number, Category> = {
  1: 'ones', 2: 'twos', 3: 'threes', 4: 'fours', 5: 'fives', 6: 'sixes',
} as Record<number, Category>

function openCats(filled: Set<Category>): Category[] {
  return ALL_CATEGORIES.filter((c) => !filled.has(c))
}
function bestByScore(hand: number[], filled: Set<Category>): Category {
  const open = openCats(filled)
  let best = open[0]
  let bestScore = scoreHand(hand as Hand, best)
  for (const c of open) {
    const s = scoreHand(hand as Hand, c)
    if (s > bestScore) { bestScore = s; best = c }
  }
  return best
}

// Simulate one full game (3 rolls/turn, real rerolls) under a policy.
export function simulateGame(policy: TurnPolicy): GameResult {
  const categoryScores = new Map<Category, number>()
  const filled = new Set<Category>()
  let upperSum = 0
  let yahtzeeCount = 0

  for (let turn = 0; turn < 13; turn++) {
    let hand = roll5()
    for (let rerollsLeft = 2; rerollsLeft > 0; rerollsLeft--) {
      const keep = policy.keep(hand, rerollsLeft, filled)
      hand = hand.map((v, i) => (keep[i] ? v : rollFace()))
    }

    let category = policy.chooseCategory(hand, filled)
    if (filled.has(category)) category = openCats(filled)[0] // safety

    const score = scoreHand(hand as Hand, category)
    categoryScores.set(category, score)
    filled.add(category)

    if (['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'].includes(category)) {
      upperSum += score
    }
    if (category === 'yahtzee' && score > 0) yahtzeeCount++
  }

  let finalScore = Array.from(categoryScores.values()).reduce((a, b) => a + b, 0)
  const upperBonus = upperSum >= 63 ? 35 : 0
  const yahtzeeBonus = yahtzeeCount > 0 ? yahtzeeCount * 100 : 0
  finalScore += upperBonus + yahtzeeBonus

  const categoryScoresObj: Partial<Record<Category, number>> = {}
  for (const [cat, score] of categoryScores) categoryScoresObj[cat] = score

  return {
    finalScore,
    breakdown: { categoryScores: categoryScoresObj, upperSum, upperBonus, yahtzeeBonus },
  }
}

// Run N games with a policy, return results
export function runTournament(
  _strategyName: string,
  policy: TurnPolicy,
  trials: number,
  onProgress?: (done: number, total: number) => void
): { scores: number[]; stats: MonteCarloStats } {
  const scores: number[] = []

  for (let i = 0; i < trials; i++) {
    const result = simulateGame(policy)
    scores.push(result.finalScore)
    // report progress every 256 games so the UI can show a bar without flooding
    if (onProgress && (i & 255) === 255) onProgress(i + 1, trials)
  }
  onProgress?.(trials, trials)

  // Sort for median
  scores.sort((a, b) => a - b)

  // Calculate stats
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length
  const variance =
    scores.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / scores.length
  const stdDev = Math.sqrt(variance)
  const min = scores[0]
  const max = scores[scores.length - 1]
  const median = scores[Math.floor(scores.length / 2)]

  return {
    scores,
    stats: { mean, variance, stdDev, min, max, median },
  }
}

// Histogram: count frequency of each score
export function scoreHistogram(scores: number[]): Map<number, number> {
  const hist = new Map<number, number>()
  for (const score of scores) {
    hist.set(score, (hist.get(score) || 0) + 1)
  }
  return hist
}

/* ---- keep heuristics (cheap; the EV machinery is too slow for tournaments) ---- */
function keepModal(hand: number[]): boolean[] {
  const f = modalFace(hand)
  return hand.map((v) => v === f)
}
// Conservator: bank value, gamble little — keep any pair-or-better and any high
// pip (4–6), reroll only low singletons. Tighter outcomes → small σ.
function keepGood(hand: number[]): boolean[] {
  const c = counts(hand)
  return hand.map((v) => c[v] >= 2 || v >= 4)
}
// Bonus hunter: chase the most-present still-open upper face toward the 63 line.
function keepUpper(hand: number[], filled: Set<Category>): boolean[] {
  const c = counts(hand)
  let target = 0
  let bestCount = -1
  for (let v = 6; v >= 1; v--) {
    if (!filled.has(UPPER_OF[v]) && c[v] > bestCount) { bestCount = c[v]; target = v }
  }
  if (target === 0) return keepModal(hand)
  return hand.map((v) => v === target)
}
/* ---- the five championship characters: each a distinct keep + category pair,
   no shared greedy fallback where the role must differ ---- */
export const strategies: Record<string, TurnPolicy> = {
  // EV-maximizer: build the biggest group, then take the most points. Highest μ.
  greedy: {
    keep: keepModal,
    chooseCategory: (hand, filled) => bestByScore(hand, filled),
  },

  // Conservator: gamble little, bank sure points; on a zero hand sacrifice the
  // hardest slot rather than a good one. Narrow σ.
  conservator: {
    keep: (hand) => keepGood(hand),
    chooseCategory: (hand, filled) => {
      const open = openCats(filled)
      const best = bestByScore(hand, filled)
      if (scoreHand(hand as Hand, best) > 0) return best
      const sacrifice: Category[] = ['yahtzee', 'large-straight', 'small-straight', 'full-house', 'four-of-a-kind'] as Category[]
      for (const c of sacrifice) if (open.includes(c)) return c
      return open[0]
    },
  },

  // Bonus hunter: chase the upper section toward 63 for the +35. Bimodal at the
  // threshold — a cliff if missed.
  upperFirst: {
    keep: (hand, _rr, filled) => keepUpper(hand, filled),
    chooseCategory: (hand, filled) => {
      const open = openCats(filled)
      const upperOpen = open.filter((c) => ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'].includes(c))
      let best: Category | null = null
      let bestScore = 0
      for (const c of upperOpen) {
        const s = scoreHand(hand as Hand, c)
        if (s > bestScore) { bestScore = s; best = c }
      }
      if (best && bestScore > 0) return best // bank an upper face
      return bestByScore(hand, filled) // nothing in upper to bank → best overall
    },
  },

  // Yahtzee hunter (boom or bust): chase the big group; cash ONLY the big combos,
  // dump everything else into a cheap upper to keep those slots open. Low μ, fat
  // right tail (the 50s and +100 repeat bonuses).
  yahtzeeHunter: {
    keep: keepModal,
    chooseCategory: (hand, filled) => {
      const open = openCats(filled)
      const big: Category[] = ['yahtzee', 'four-of-a-kind', 'large-straight'] as Category[]
      for (const c of big) if (open.includes(c) && scoreHand(hand as Hand, c) > 0) return c
      const dump: Category[] = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes', 'chance', 'full-house', 'small-straight', 'three-of-a-kind'] as Category[]
      for (const c of dump) if (open.includes(c)) return c
      return open[0]
    },
  },

  // Random: no plan — don't bother rerolling, write to a random open box. The
  // floor: lowest μ, and a wide spread since a stray good hand can land anywhere.
  random: {
    keep: (hand) => hand.map(() => true),
    chooseCategory: (_hand, filled) => {
      const open = openCats(filled)
      return open[Math.floor(Math.random() * open.length)]
    },
  },
}
