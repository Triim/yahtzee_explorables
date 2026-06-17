/**
 * Monte Carlo: simulate complete Yahtzee games
 * Pure functions, no React/DOM. Runs in main thread or worker.
 */

import { generateAllHands } from './outcomes'
import { scoreHand } from './scoring'
import { Category } from './types'
import type { Hand } from './types'

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

// Simulate a single game with a strategy
export function simulateGame(
  strategy: (hand: Hand, filledCategories: Set<Category>) => Category
): GameResult {
  const categoryScores = new Map<Category, number>()
  const filledCategories = new Set<Category>()
  let upperSum = 0
  let yahtzeeCount = 0

  for (let turn = 0; turn < 13; turn++) {
    // Roll 5 dice (random hand from all 252 possible)
    const allHands = generateAllHands()
    const hand = allHands[Math.floor(Math.random() * allHands.length)]

    // Strategy chooses which category to score
    const category = strategy(hand, filledCategories)

    if (filledCategories.has(category)) {
      // Should not happen with valid strategy, skip
      turn--
      continue
    }

    // Score the hand
    const score = scoreHand(hand, category)
    categoryScores.set(category, score)
    filledCategories.add(category)

    // Track upper sum for bonus
    if (category === 'ones' || category === 'twos' || category === 'threes' ||
        category === 'fours' || category === 'fives' || category === 'sixes') {
      upperSum += score
    }

    // Track Yahtzee bonus
    if (category === 'yahtzee' && score > 0) {
      yahtzeeCount++
    }
  }

  // Calculate final score
  let finalScore = Array.from(categoryScores.values()).reduce((a, b) => a + b, 0)

  // Add bonuses
  const upperBonus = upperSum >= 63 ? 35 : 0
  const yahtzeeBonus = yahtzeeCount > 0 ? yahtzeeCount * 100 : 0

  finalScore += upperBonus + yahtzeeBonus

  // Convert map to object
  const categoryScoresObj: Partial<Record<Category, number>> = {}
  for (const [cat, score] of categoryScores) {
    categoryScoresObj[cat] = score
  }

  return {
    finalScore,
    breakdown: {
      categoryScores: categoryScoresObj,
      upperSum,
      upperBonus,
      yahtzeeBonus,
    },
  }
}

// Run N games with a strategy, return results
export function runTournament(
  _strategyName: string,
  strategy: (hand: Hand, filledCategories: Set<Category>) => Category,
  trials: number
): { scores: number[]; stats: MonteCarloStats } {
  const scores: number[] = []

  for (let i = 0; i < trials; i++) {
    const result = simulateGame(strategy)
    scores.push(result.finalScore)
  }

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

// Common strategies for testing

export const strategies = {
  // Random: pick any unfilled category
  random: (_hand: Hand, filledCategories: Set<Category>): Category => {
    const available = [
      'ones', 'twos', 'threes', 'fours', 'fives', 'sixes',
      'three-of-a-kind', 'four-of-a-kind', 'full-house',
      'small-straight', 'large-straight', 'yahtzee', 'chance'
    ].filter(c => !filledCategories.has(c as any))
    return available[Math.floor(Math.random() * available.length)] as Category
  },

  // Greedy: pick highest-scoring unfilled category
  greedy: (hand: Hand, filledCategories: Set<Category>): Category => {
    const available = [
      'ones', 'twos', 'threes', 'fours', 'fives', 'sixes',
      'three-of-a-kind', 'four-of-a-kind', 'full-house',
      'small-straight', 'large-straight', 'yahtzee', 'chance'
    ].filter(c => !filledCategories.has(c as any))

    let bestCategory = available[0] as Category
    let bestScore = scoreHand(hand, bestCategory)

    for (const category of available) {
      const cat = category as Category
      const score = scoreHand(hand, cat)
      if (score > bestScore) {
        bestScore = score
        bestCategory = cat
      }
    }

    return bestCategory
  },

  // Upper sum first: prioritize upper section to reach 63
  upperFirst: (hand: Hand, filledCategories: Set<Category>): Category => {
    const available = [
      'ones', 'twos', 'threes', 'fours', 'fives', 'sixes',
      'three-of-a-kind', 'four-of-a-kind', 'full-house',
      'small-straight', 'large-straight', 'yahtzee', 'chance'
    ].filter(c => !filledCategories.has(c as any))

    // Prefer upper section
    const upperAvailable = available.filter(c =>
      ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'].includes(c)
    )

    if (upperAvailable.length > 0) {
      // Pick highest value in upper
      let best = upperAvailable[0] as Category
      let bestScore = scoreHand(hand, best)
      for (const c of upperAvailable) {
        const score = scoreHand(hand, c as Category)
        if (score > bestScore) {
          bestScore = score
          best = c as Category
        }
      }
      return best
    }

    // Fall back to greedy
    return strategies.greedy(hand, filledCategories)
  },
}
