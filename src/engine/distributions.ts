import type { Distribution, Stats } from './types'

// Binomial distribution P(k successes in n trials, p probability)
export function binomialPMF(n: number, p: number, k: number): number {
  const q = 1 - p
  let binom = 1
  for (let i = 0; i < k; i++) {
    binom *= (n - i) / (i + 1)
  }
  return binom * Math.pow(p, k) * Math.pow(q, n - k)
}

// Full binomial distribution for n trials, p probability
export function binomialDistribution(n: number, p: number): Distribution {
  const dist: Distribution = {}
  for (let k = 0; k <= n; k++) {
    dist[k] = binomialPMF(n, p, k)
  }
  return dist
}

// Normal distribution PDF (Gaussian)
export function normalPDF(x: number, mean: number, stdDev: number): number {
  const variance = stdDev * stdDev
  const exponent = -Math.pow(x - mean, 2) / (2 * variance)
  return (
    (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent)
  )
}

// Distribution of sum of two dice (1-12)
export function sumOfTwoDiceDistribution(): Distribution {
  const dist: Distribution = {}
  for (let i = 2; i <= 12; i++) {
    dist[i] = 0
  }

  for (let d1 = 1; d1 <= 6; d1++) {
    for (let d2 = 1; d2 <= 6; d2++) {
      const sum = d1 + d2
      dist[sum] += 1 / 36
    }
  }

  return dist
}

// Compute mean of a distribution
export function mean(dist: Distribution): number {
  let sum = 0
  for (const [value, prob] of Object.entries(dist)) {
    sum += parseInt(value, 10) * prob
  }
  return sum
}

// Compute variance of a distribution
export function variance(dist: Distribution): number {
  const m = mean(dist)
  let sum = 0
  for (const [value, prob] of Object.entries(dist)) {
    const v = parseInt(value, 10)
    sum += prob * Math.pow(v - m, 2)
  }
  return sum
}

// Compute stats for a distribution
export function computeStats(dist: Distribution): Stats {
  const m = mean(dist)
  const v = variance(dist)
  return {
    mean: m,
    variance: v,
    stdDev: Math.sqrt(v),
  }
}

// Normal overlay parameters for histograms
export function normalOverlayParams(
  values: number[]
): { mean: number; stdDev: number } {
  const m = values.reduce((a, b) => a + b, 0) / values.length
  const v =
    values.reduce((sum, x) => sum + Math.pow(x - m, 2), 0) /
    values.length
  return { mean: m, stdDev: Math.sqrt(v) }
}
