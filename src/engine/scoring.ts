import type { Hand, Scorecard } from './types'
import { Category } from './types'
import { handSum, handCounts } from './combinatorics'

// Check if hand qualifies for a category
export function qualifies(hand: Hand, category: Category): boolean {
  const counts = handCounts(hand)

  // Upper section
  if (
    category === Category.Ones ||
    category === Category.Twos ||
    category === Category.Threes ||
    category === Category.Fours ||
    category === Category.Fives ||
    category === Category.Sixes
  ) {
    const value = categoryToValue(category)
    return counts[value] > 0
  }

  if (category === Category.ThreeOfAKind) {
    return counts.some((c) => c >= 3)
  }

  if (category === Category.FourOfAKind) {
    return counts.some((c) => c >= 4)
  }

  if (category === Category.FullHouse) {
    return counts.some((c) => c === 3) && counts.some((c) => c === 2)
  }

  if (category === Category.SmallStraight) {
    return (
      (hand.includes(1) &&
        hand.includes(2) &&
        hand.includes(3) &&
        hand.includes(4)) ||
      (hand.includes(2) &&
        hand.includes(3) &&
        hand.includes(4) &&
        hand.includes(5)) ||
      (hand.includes(3) &&
        hand.includes(4) &&
        hand.includes(5) &&
        hand.includes(6))
    )
  }

  if (category === Category.LargeStraight) {
    return (
      (hand.includes(1) &&
        hand.includes(2) &&
        hand.includes(3) &&
        hand.includes(4) &&
        hand.includes(5)) ||
      (hand.includes(2) &&
        hand.includes(3) &&
        hand.includes(4) &&
        hand.includes(5) &&
        hand.includes(6))
    )
  }

  if (category === Category.Yahtzee) {
    return counts.some((c) => c === 5)
  }

  if (category === Category.Chance) {
    return true
  }

  return false
}

// Score for a hand in a category
export function scoreHand(hand: Hand, category: Category): number {
  if (!qualifies(hand, category)) return 0

  const counts = handCounts(hand)

  // Upper section
  if (
    category === Category.Ones ||
    category === Category.Twos ||
    category === Category.Threes ||
    category === Category.Fours ||
    category === Category.Fives ||
    category === Category.Sixes
  ) {
    const value = categoryToValue(category)
    return value * counts[value]
  }

  if (
    category === Category.ThreeOfAKind ||
    category === Category.FourOfAKind ||
    category === Category.Chance
  ) {
    return handSum(hand)
  }

  if (category === Category.FullHouse) {
    return 25
  }

  if (category === Category.SmallStraight) {
    return 30
  }

  if (category === Category.LargeStraight) {
    return 40
  }

  if (category === Category.Yahtzee) {
    return 50
  }

  return 0
}

// Calculate upper-section bonus
export function calculateBonus(scorecard: Scorecard): number {
  const upperSum =
    (scorecard[Category.Ones] || 0) +
    (scorecard[Category.Twos] || 0) +
    (scorecard[Category.Threes] || 0) +
    (scorecard[Category.Fours] || 0) +
    (scorecard[Category.Fives] || 0) +
    (scorecard[Category.Sixes] || 0)

  return upperSum >= 63 ? 35 : 0
}

// Count Yahtzees for bonus calculation
export function yahtzeeCount(scorecard: Scorecard): number {
  const yahtzeeScore = scorecard[Category.Yahtzee]
  if (yahtzeeScore !== null && yahtzeeScore !== undefined && yahtzeeScore > 0) {
    return 1
  }
  return 0
}

// Map category to die value (for upper section)
function categoryToValue(category: Category): number {
  if (category === Category.Ones) return 1
  if (category === Category.Twos) return 2
  if (category === Category.Threes) return 3
  if (category === Category.Fours) return 4
  if (category === Category.Fives) return 5
  if (category === Category.Sixes) return 6
  return 0
}
