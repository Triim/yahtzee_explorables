import type { Hand } from './types'
import { generateAllRolls, rollToHand } from './outcomes'

// Binomial coefficient C(n, k)
function binomial(n: number, k: number): number {
  if (k > n) return 0
  if (k === 0 || k === n) return 1
  if (k > n - k) k = n - k

  let result = 1
  for (let i = 0; i < k; i++) {
    result *= n - i
    result /= i + 1
  }
  return Math.round(result)
}

// Multiset count: C(n + k - 1, k) where n=6 (faces), k=5 (dice)
export function multisetCount(): number {
  return binomial(6 + 5 - 1, 5)
}

// Count keeper sets C(7 + 5 - 1, 5)
// (7 faces: 0,1,2,3,4,5,6 where 0 means "none kept")
export function keeperSetCount(): number {
  return binomial(7 + 5 - 1, 5)
}

// Frequency of each hand in the sample space (7776 rolls)
export function computeHandFrequencies(): Map<string, number> {
  const frequencies = new Map<string, number>()
  const rolls = generateAllRolls()

  for (const roll of rolls) {
    const hand = rollToHand(roll)
    const key = JSON.stringify(hand)
    frequencies.set(key, (frequencies.get(key) || 0) + 1)
  }

  return frequencies
}

// Get frequency for a specific hand
export function getHandFrequency(hand: Hand): number {
  const frequencies = computeHandFrequencies()
  const key = JSON.stringify(hand)
  return frequencies.get(key) || 0
}

// Probability of a hand P(hand) = frequency / 7776
export function getHandProbability(hand: Hand): number {
  const freq = getHandFrequency(hand)
  return freq / 7776
}

// Count ways to partition N identical items into k bins (stars and bars)
export function starsAndBars(n: number, k: number): number {
  return binomial(n + k - 1, k - 1)
}

// Sum of dice
export function handSum(hand: Hand): number {
  return hand.reduce((a, b) => a + b, 0)
}

// Count occurrences of each value in hand
export function handCounts(hand: Hand): readonly number[] {
  const counts = new Array(7).fill(0)
  for (const value of hand) {
    counts[value]++
  }
  return counts as readonly number[]
}
