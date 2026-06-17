// Game-independent types

export type Roll = [number, number, number, number, number]
export type Hand = readonly number[] // sorted multiset of 1-6 values

export const Category = {
  Ones: 'ones',
  Twos: 'twos',
  Threes: 'threes',
  Fours: 'fours',
  Fives: 'fives',
  Sixes: 'sixes',
  ThreeOfAKind: 'three-of-a-kind',
  FourOfAKind: 'four-of-a-kind',
  FullHouse: 'full-house',
  SmallStraight: 'small-straight',
  LargeStraight: 'large-straight',
  Yahtzee: 'yahtzee',
  Chance: 'chance',
} as const

export type Category = (typeof Category)[keyof typeof Category]

export type CardState = number | null // score in a box, or null if unfilled

export type Scorecard = Partial<Record<Category, CardState>>

export interface GameState {
  scorecard: Scorecard
  rollsUsed: number // 0, 1, or 2 (before or after)
  rerollsRemaining: number // 0, 1, or 2
  hand: Hand
  held: readonly number[] // indices into hand
}

export interface Distribution {
  [value: number]: number // value → probability
}

export interface Stats {
  mean: number
  variance: number
  stdDev: number
}
