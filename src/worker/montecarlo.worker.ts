/**
 * Web Worker: runs Monte Carlo tournaments without blocking the UI thread
 * Receives messages with simulation parameters, sends back results as they compute
 */

import { runTournament, strategies } from '../engine/montecarlo'

interface SimulationRequest {
  id: string
  strategyName: string
  trials: number
}

interface SimulationResult {
  id: string
  type: 'result'
  strategyName: string
  scores: number[]
  stats: {
    mean: number
    variance: number
    stdDev: number
    min: number
    max: number
    median: number
  }
}

// Listen for simulation requests
self.onmessage = (event: MessageEvent<SimulationRequest>) => {
  const { id, strategyName, trials } = event.data

  const strategy = (strategies as any)[strategyName]
  if (!strategy) {
    self.postMessage({
      id,
      type: 'error',
      message: `Unknown strategy: ${strategyName}`,
    })
    return
  }

  try {
    const { scores, stats } = runTournament(strategyName, strategy, trials, (done, total) => {
      self.postMessage({ id, type: 'progress', done, total })
    })

    const result: SimulationResult = {
      id,
      type: 'result',
      strategyName,
      scores,
      stats,
    }

    self.postMessage(result)
  } catch (error) {
    self.postMessage({
      id,
      type: 'error',
      message: error instanceof Error ? error.message : String(error),
    })
  }
}
