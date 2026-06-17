import { describe, it, expect } from 'vitest'
import { multisetCount, keeperSetCount } from './combinatorics'
import { generateAllHands, countUniqueHands } from './outcomes'
import { sumOfTwoDiceDistribution } from './distributions'
import { Category, type Hand } from './types'
import { scoreHand } from './scoring'

describe('Engine — Anchor Tests', () => {
  describe('Combinatorics', () => {
    it('252 distinct multisets of 5 dice', () => {
      expect(multisetCount()).toBe(252)
    })

    it('actual hand generation confirms 252', () => {
      expect(countUniqueHands()).toBe(252)
    })

    it('462 keeper sets', () => {
      expect(keeperSetCount()).toBe(462)
    })
  })

  describe('Two-dice sum distribution', () => {
    it('sum 7 appears 6 times out of 36', () => {
      const dist = sumOfTwoDiceDistribution()
      const p7 = dist[7]
      // 6/36 = 1/6 ≈ 0.16667
      expect(p7).toBeCloseTo(6 / 36, 4)
    })

    it('sum 2 appears 1 time out of 36', () => {
      const dist = sumOfTwoDiceDistribution()
      const p2 = dist[2]
      expect(p2).toBeCloseTo(1 / 36, 4)
    })

    it('sum 12 appears 1 time out of 36', () => {
      const dist = sumOfTwoDiceDistribution()
      const p12 = dist[12]
      expect(p12).toBeCloseTo(1 / 36, 4)
    })

    it('distribution sums to 1', () => {
      const dist = sumOfTwoDiceDistribution()
      const total = Object.values(dist).reduce((a, b) => a + b, 0)
      expect(total).toBeCloseTo(1, 4)
    })
  })

  describe('Category probabilities', () => {
    it('Yahtzee (all five dice same) is rarest', () => {
      const allHands = generateAllHands()

      let yahtzeeCount = 0
      for (const hand of allHands) {
        if (scoreHand(hand, Category.Yahtzee) > 0) {
          yahtzeeCount++
        }
      }

      // Only 6 hands are Yahtzees: [1,1,1,1,1], ..., [6,6,6,6,6]
      expect(yahtzeeCount).toBe(6)
    })

    it('Three of a kind qualifies correctly', () => {
      const hand = [1, 1, 1, 5, 6] as const as Hand
      expect(scoreHand(hand, Category.ThreeOfAKind)).toBeGreaterThan(0)
    })

    it('Full House scores 25', () => {
      const hand = [2, 2, 3, 3, 3] as const as Hand
      expect(scoreHand(hand, Category.FullHouse)).toBe(25)
    })
  })
})
