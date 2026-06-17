import type { Distribution } from './types'

// Expected value of a distribution: E[X] = Σ x * P(X=x)
export function expectedValue(dist: Distribution): number {
  let sum = 0
  for (const [value, prob] of Object.entries(dist)) {
    sum += parseInt(value, 10) * prob
  }
  return sum
}

// Expected value of a function applied to distribution
export function expectedValueOfFunction(
  dist: Distribution,
  fn: (x: number) => number
): number {
  let sum = 0
  for (const [value, prob] of Object.entries(dist)) {
    const x = parseInt(value, 10)
    sum += fn(x) * prob
  }
  return sum
}

// Weighted average of values with probabilities
export function weightedAverage(
  values: number[],
  probabilities: number[]
): number {
  if (values.length !== probabilities.length) {
    throw new Error('Values and probabilities must have equal length')
  }
  let sum = 0
  for (let i = 0; i < values.length; i++) {
    sum += values[i] * probabilities[i]
  }
  return sum
}
