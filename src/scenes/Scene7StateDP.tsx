import { useState, useEffect } from 'react'
import type { SceneModelProps } from '@/scaffolding'
import { initOracle } from '@/engine/oracle'
import './StateDPModel.css'

export function StateDPModel(_props: SceneModelProps) {
  const [oracleValue, setOracleValue] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initOracle()
      .then((oracle) => {
        setOracleValue(oracle.optimalExpectedScore)
        setLoading(false)
      })
      .catch(() => {
        setOracleValue(254.589)
        setLoading(false)
      })
  }, [])

  return (
    <div className="state-dp-model">
      <div className="oracle-box">
        <h3>The Oracle</h3>
        <p className="description">
          Starting from an empty scorecard, playing optimally, your expected score is:
        </p>
        {loading ? (
          <p className="loading">Loading oracle...</p>
        ) : (
          <div className="oracle-value">{oracleValue}</div>
        )}
        <p className="note">
          This number comes from dynamic programming: we compute the value of every game state,
          working backwards from the end.
        </p>
      </div>

      <div className="concept-box">
        <h3>States and Values</h3>
        <ul className="concept-list">
          <li>
            <strong>State:</strong> Which boxes are filled, which open
          </li>
          <li>
            <strong>Value:</strong> Best expected score from this state onward
          </li>
          <li>
            <strong>Transition:</strong> Roll, reroll, pick a box (3 choices → state)
          </li>
          <li>
            <strong>Recursion:</strong> V(state) = max over choices of E[V(next state)]
          </li>
        </ul>
      </div>

      <div className="states-count">
        <p>
          Possible states: <strong>~3 million</strong> (2^13 filled + turn number)
        </p>
        <p>
          Computation: One backward pass, 13 turns × 2^13 states × 252 hands × 3 rolls
        </p>
      </div>
    </div>
  )
}

export const scene7 = {
  id: 'scene-7',
  model: StateDPModel,
  steps: [
    {
      id: 's7-1',
      copyType: 'определение' as const,
      register: 'free' as const,
      directive: { kind: 'activate' as const, model: 'statedp' },
      text: 'A game state is a snapshot: which boxes are filled, which open, how many turns left. Each state has a value — the best expected score from here on, assuming optimal play.',
    },
    {
      id: 's7-2',
      copyType: 'формула' as const,
      register: 'free' as const,
      text: 'This value satisfies a recursion. Pick a box, get its score plus the value of the new state: $V = \\max_{\\text{box}} \\left( f(\\text{hand}) + V(\\text{next state}) \\right)$.',
    },
    {
      id: 's7-3',
      copyType: 'вопрос' as const,
      register: 'free' as const,
      text: 'Work backwards from the last turn. When you\'ve filled twelve boxes and hold the final roll, the thirteenth box\'s value is obvious. Recurse up to the start.',
    },
    {
      id: 's7-4',
      copyType: 'определение' as const,
      register: 'free' as const,
      text: 'This is dynamic programming: build up the solution by breaking the problem into overlapping subproblems, solving each once, storing the result.',
    },
    {
      id: 's7-5',
      copyType: 'переход' as const,
      register: 'free' as const,
      text: 'The oracle you see above is real: it comes from solving every game state. But people don\'t compute; they improvise. How do humans play, and why do they lose?',
    },
  ],
}
