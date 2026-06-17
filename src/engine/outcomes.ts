import type { Roll, Hand } from './types'

const SAMPLE_SPACE = [1, 2, 3, 4, 5, 6] as const

// Generate all 6^5 = 7776 possible rolls
export function generateAllRolls(): Roll[] {
  const rolls: Roll[] = []
  for (let a = 1; a <= 6; a++) {
    for (let b = 1; b <= 6; b++) {
      for (let c = 1; c <= 6; c++) {
        for (let d = 1; d <= 6; d++) {
          for (let e = 1; e <= 6; e++) {
            rolls.push([a, b, c, d, e])
          }
        }
      }
    }
  }
  return rolls
}

// Convert an ordered roll to a sorted hand (multiset)
export function rollToHand(roll: Roll): Hand {
  return Object.freeze([...roll].sort((a, b) => a - b))
}

// Count unique multisets
export function countUniqueHands(): number {
  const hands = new Set<string>()
  const rolls = generateAllRolls()
  for (const roll of rolls) {
    const hand = rollToHand(roll)
    hands.add(JSON.stringify(hand))
  }
  return hands.size
}

// Get all unique hands (252 distinct multisets)
export function generateAllHands(): Hand[] {
  const hands = new Map<string, Hand>()
  const rolls = generateAllRolls()
  for (const roll of rolls) {
    const hand = rollToHand(roll)
    const key = JSON.stringify(hand)
    if (!hands.has(key)) {
      hands.set(key, hand)
    }
  }
  return Array.from(hands.values())
}

// Sample space of single die
export function singleDieSampleSpace(): typeof SAMPLE_SPACE {
  return SAMPLE_SPACE
}
