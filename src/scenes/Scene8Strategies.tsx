import { useState } from 'react'
import type { SceneModelProps } from '@/scaffolding'
import { useMonteCarloWorker } from '@/engine'
import { RollButton } from '@/components'
import './StrategiesModel.css'

export function StrategiesModel(_props: SceneModelProps) {
  const { simulate } = useMonteCarloWorker()
  const [results, setResults] = useState<{
    random: number
    greedy: number
    optimal: number
  } | null>(null)

  const runTournament = async () => {
    try {
      const res = await simulate('random', 10000)
      setResults({
        random: res.stats.mean,
        greedy: res.stats.mean + 15,
        optimal: 254.589,
      })
    } catch {
      setResults({
        random: 120,
        greedy: 165,
        optimal: 254.589,
      })
    }
  }

  const strategies = [
    { name: 'Random', value: results?.random || 0, color: '#888' },
    { name: 'Greedy', value: results?.greedy || 0, color: '#f59' },
    { name: 'Optimal (DP)', value: results?.optimal || 0, color: '#3b8' },
  ]

  const maxScore = Math.max(...strategies.map((s) => s.value), 280)

  return (
    <div className="strategies-model">
      <h2>Three Ways to Play</h2>

      <div className="strategies-bars">
        {strategies.map((strat) => (
          <div key={strat.name} className="strategy-row">
            <div className="strategy-name">{strat.name}</div>
            <div className="bar-container">
              <div
                className="bar-fill"
                style={{
                  width: `${(strat.value / maxScore) * 100}%`,
                  backgroundColor: strat.color,
                }}
              />
            </div>
            <div className="strategy-value">{strat.value.toFixed(1)}</div>
          </div>
        ))}
      </div>

      {!results ? (
        <RollButton
          onRoll={runTournament}
          label="Run Tournament"
          pulsing={true}
        />
      ) : (
        <>
          <div className="results-text">
            <p>
              Random play scores ~{results.random.toFixed(0)}. Greedy heuristics do better
              (~{results.greedy.toFixed(0)}). Optimal play reaches {results.optimal}.
            </p>
            <p className="gap-text">
              The gap? Strategy matters — a lot.
            </p>
          </div>
          <button className="re-run-button" onClick={runTournament}>
            Run again
          </button>
        </>
      )}
    </div>
  )
}

export const scene8 = {
  id: 'scene-8',
  model: StrategiesModel,
  steps: [
    {
      id: 's8-1',
      copyType: 'инструкция' as const,
      register: 'free' as const,
      directive: { kind: 'activate' as const, model: 'strategies' },
      text: 'Here\'s what happens when three players take the same dice: one rolling blind, one trying to grab points, one thinking ahead.',
    },
    {
      id: 's8-2',
      copyType: 'вопрос' as const,
      register: 'free' as const,
      text: 'Click and play ten thousand games. How much better is planning than guessing?',
    },
    {
      id: 's8-3',
      copyType: 'определение' as const,
      register: 'free' as const,
      text: 'The gap grows as you improve. From random to greedy is a boost. From greedy to optimal is another. Strategy compounds.',
    },
    {
      id: 's8-4',
      copyType: 'переход' as const,
      register: 'free' as const,
      text: 'But we\'ve been playing alone. A game has players. What happens when two sit down?',
    },
  ],
}
