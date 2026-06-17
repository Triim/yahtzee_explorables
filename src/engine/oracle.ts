// Oracle loader: loads precomputed DP values
// In the real application, this would load from src/data/oracle.json

let oracleData: any = null

export interface Oracle {
  optimalExpectedScore: number
  getValue(state: string): number | null
}

// Lazy-load oracle (once, on first access)
async function loadOracle(): Promise<Oracle> {
  if (oracleData) {
    return {
      optimalExpectedScore: oracleData.optimalExpectedScore,
      getValue(state: string) {
        return oracleData.values?.[state] ?? null
      },
    }
  }

  try {
    // In browser: fetch from asset
    const response = await fetch('/oracle.json')
    if (response.ok) {
      oracleData = await response.json()
    } else {
      // Fallback: use default value
      oracleData = { optimalExpectedScore: 254.589, values: {} }
    }
  } catch {
    // Offline or asset not available: use hardcoded value
    oracleData = { optimalExpectedScore: 254.589, values: {} }
  }

  return {
    optimalExpectedScore: oracleData.optimalExpectedScore,
    getValue(state: string) {
      return oracleData.values?.[state] ?? null
    },
  }
}

// Get the optimal expected score (synchronously, if already loaded)
export function getOptimalExpectedScore(): number {
  return oracleData?.optimalExpectedScore ?? 254.589
}

// Async load with callback
export async function initOracle(): Promise<Oracle> {
  return loadOracle()
}
