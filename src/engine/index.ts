// Core types
export type { Roll, Hand, Distribution, Stats, Scorecard, GameState } from './types'
export { Category } from './types'

// Outcomes (sample space)
export {
  generateAllRolls,
  rollToHand,
  countUniqueHands,
  generateAllHands,
  singleDieSampleSpace,
} from './outcomes'

// Combinatorics (multisets)
export {
  multisetCount,
  keeperSetCount,
  computeHandFrequencies,
  getHandFrequency,
  getHandProbability,
  handSum,
  handCounts,
} from './combinatorics'

// Scoring
export {
  qualifies,
  scoreHand,
  calculateBonus,
  yahtzeeCount,
} from './scoring'

// Distributions
export {
  binomialPMF,
  binomialDistribution,
  normalPDF,
  sumOfTwoDiceDistribution,
  mean,
  variance,
  computeStats,
  normalOverlayParams,
} from './distributions'

// Expected value
export { expectedValue, expectedValueOfFunction, weightedAverage } from './ev'

// Conditional probability
export {
  rerollDistribution,
  expectedScoreAfterReroll,
  evForAllCategories,
} from './conditional'

// Game state encoding
export {
  encodeGameState,
  decodeGameState,
  isCategoryFilled,
  markCategoryFilled,
  isGameOver,
  filledCategoryCount,
  remainingTurns,
  type GameStateKey,
} from './game-state'

// Oracle (precomputed DP values)
export { initOracle, getOptimalExpectedScore, type Oracle } from './oracle'

// Monte Carlo simulation
export {
  simulateGame,
  runTournament,
  scoreHistogram,
  strategies,
  type GameResult,
  type MonteCarloStats,
} from './montecarlo'

// Worker hook (React)
export { useMonteCarloWorker, type SimulationResult, type WorkerStats } from './useMonteCarloWorker'
