import type { Category } from './types'

// Represent a score state as a bitfield:
// - 12 bits for which categories are filled (0-12)
// - 6 bits for upper section sum (0-63)
// - 2 bits for Yahtzee count (0-3)
// Total: 20 bits (fits in number)

export interface GameStateKey {
  filledMask: number // bitmask of filled categories
  upperSum: number // sum of upper section (0-63)
  yahtzeeCount: number // count of Yahtzees (0-3)
}

const CATEGORY_INDICES = {
  ones: 0,
  twos: 1,
  threes: 2,
  fours: 3,
  fives: 4,
  sixes: 5,
  'three-of-a-kind': 6,
  'four-of-a-kind': 7,
  'full-house': 8,
  'small-straight': 9,
  'large-straight': 10,
  yahtzee: 11,
  chance: 12,
} as const

// Encode game state to a unique key
export function encodeGameState(
  filledMask: number,
  upperSum: number,
  yahtzeeCount: number
): number {
  return (filledMask << 8) | (upperSum << 2) | yahtzeeCount
}

// Decode game state from key
export function decodeGameState(key: number): GameStateKey {
  const yahtzeeCount = key & 0x3
  const upperSum = (key >> 2) & 0x3f
  const filledMask = key >> 8
  return { filledMask, upperSum, yahtzeeCount }
}

// Check if category is filled
export function isCategoryFilled(filledMask: number, category: Category): boolean {
  const idx = CATEGORY_INDICES[category as keyof typeof CATEGORY_INDICES]
  return (filledMask & (1 << idx)) !== 0
}

// Mark category as filled
export function markCategoryFilled(filledMask: number, category: Category): number {
  const idx = CATEGORY_INDICES[category as keyof typeof CATEGORY_INDICES]
  return filledMask | (1 << idx)
}

// Get all possible next states after filling a category
export function getNextStates(
  currentFilled: number,
  upperSum: number,
  yahtzeeCount: number,
  category: Category,
  scoreGained: number
): Array<{ filled: number; upperSum: number; yahtzeeCount: number }> {
  if (isCategoryFilled(currentFilled, category)) {
    return [] // Category already filled
  }

  const newFilled = markCategoryFilled(currentFilled, category)

  // Update upper sum if category is in upper section
  let newUpperSum = upperSum
  const upperIdx = CATEGORY_INDICES[category as keyof typeof CATEGORY_INDICES]
  if (upperIdx <= 5) {
    newUpperSum = Math.min(63, upperSum + scoreGained)
  }

  // Update Yahtzee count if Yahtzee scored
  let newYahtzeeCount = yahtzeeCount
  if (category === 'yahtzee' && scoreGained > 0) {
    newYahtzeeCount = Math.min(3, yahtzeeCount + 1)
  }

  return [{ filled: newFilled, upperSum: newUpperSum, yahtzeeCount: newYahtzeeCount }]
}

// Check if game is over (all categories filled)
export function isGameOver(filledMask: number): boolean {
  return filledMask === 0x1fff // All 13 bits set
}

// Count filled categories
export function filledCategoryCount(filledMask: number): number {
  let count = 0
  for (let i = 0; i < 13; i++) {
    if (filledMask & (1 << i)) count++
  }
  return count
}

// Get remaining turns
export function remainingTurns(filledMask: number): number {
  return 13 - filledCategoryCount(filledMask)
}
