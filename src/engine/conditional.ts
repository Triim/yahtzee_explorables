import type { Hand, Category } from './types'
import { generateAllRolls, rollToHand } from './outcomes'
import { scoreHand } from './scoring'

// Conditional distribution: P(future hand | kept dice)
// Returns distribution of possible future hands after reroll
export function rerollDistribution(kept: Hand): Map<string, number> {
  const dist = new Map<string, number>()
  const rolls = generateAllRolls()
  const keptCount = kept.length
  const diceToReroll = 5 - keptCount

  for (const roll of rolls) {
    const future = rollToHand([...kept, ...roll.slice(0, diceToReroll)] as any)
    const key = JSON.stringify(future)
    dist.set(key, (dist.get(key) || 0) + 1)
  }

  // Normalize
  const total = rolls.length
  for (const [key] of dist) {
    dist.set(key, dist.get(key)! / total)
  }

  return dist
}

// Expected score in a category after reroll, given kept dice
export function expectedScoreAfterReroll(
  kept: Hand,
  category: Category
): number {
  const dist = rerollDistribution(kept)
  let expectedScore = 0

  for (const [handStr, prob] of dist) {
    const hand = JSON.parse(handStr) as Hand
    const score = scoreHand(hand, category)
    expectedScore += score * prob
  }

  return expectedScore
}

// For each category, compute EV if we keep this subset
export function evForAllCategories(kept: Hand): Map<Category, number> {
  const evs = new Map<Category, number>()

  const categories = [
    'ones',
    'twos',
    'threes',
    'fours',
    'fives',
    'sixes',
    'three-of-a-kind',
    'four-of-a-kind',
    'full-house',
    'small-straight',
    'large-straight',
    'yahtzee',
    'chance',
  ] as Category[]

  for (const category of categories) {
    evs.set(category, expectedScoreAfterReroll(kept, category))
  }

  return evs
}
