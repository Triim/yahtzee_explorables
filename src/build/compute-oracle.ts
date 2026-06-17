/**
 * Offline DP solver stub: computes optimal value V(state) for game states.
 * For the full build pipeline, the oracle is generated via npm script.
 * This file serves as documentation of the oracle build process.
 *
 * In a full implementation, this would:
 * 1. Use backward induction over all game states
 * 2. Compute V(state) = max_action E[score + V(next_state)]
 * 3. Return oracle value ≈ 254.589
 */

export interface OracleData {
  version: string
  timestamp: string
  optimalExpectedScore: number
  estimatedBySimulation: boolean
  note: string
}

// Documentation: oracle build process
export const ORACLE_BUILD_INFO = {
  description: 'Precomputed DP values for Yahtzee optimal play',
  optimalExpectedScore: 254.589,
  source: 'Yahtzee optimal play analysis (Pawlewicz, et al.)',
  builtVia: 'npm run build:oracle',
  output: 'src/data/oracle.json',
}
