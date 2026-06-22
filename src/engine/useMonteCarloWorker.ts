import { useEffect, useRef, useState } from 'react'

export interface WorkerStats {
  mean: number
  variance: number
  stdDev: number
  min: number
  max: number
  median: number
}

export interface SimulationResult {
  strategyName: string
  scores: number[]
  stats: WorkerStats
}

interface PendingRequest {
  resolve: (result: SimulationResult) => void
  reject: (error: Error) => void
  onProgress?: (done: number, total: number) => void
}

export function useMonteCarloWorker() {
  const workerRef = useRef<Worker | null>(null)
  const pendingRef = useRef<Map<string, PendingRequest>>(new Map())
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Initialize worker
    const worker = new Worker(
      new URL('../worker/montecarlo.worker.ts', import.meta.url),
      { type: 'module' }
    )

    worker.onmessage = (event) => {
      const { id, type, strategyName, scores, stats, message, done, total } = event.data

      const pending = pendingRef.current.get(id)
      if (!pending) return

      if (type === 'progress') {
        pending.onProgress?.(done, total)
        return
      }

      pendingRef.current.delete(id)

      if (type === 'result') {
        pending.resolve({
          strategyName,
          scores,
          stats,
        })
      } else if (type === 'error') {
        pending.reject(new Error(message))
      }
    }

    worker.onerror = (error) => {
      console.error('Worker error:', error)
      pendingRef.current.forEach((pending) => {
        pending.reject(new Error('Worker error'))
      })
      pendingRef.current.clear()
    }

    workerRef.current = worker
    setIsReady(true)

    return () => {
      worker.terminate()
      workerRef.current = null
    }
  }, [])

  const simulate = (
    strategyName: string,
    trials: number,
    onProgress?: (done: number, total: number) => void
  ): Promise<SimulationResult> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Worker not initialized'))
        return
      }

      const id = `${strategyName}-${Date.now()}-${Math.random()}`
      pendingRef.current.set(id, { resolve, reject, onProgress })

      workerRef.current.postMessage({
        id,
        strategyName,
        trials,
      })
    })
  }

  return { isReady, simulate }
}
