import { useState } from 'react'
import type { SceneModelProps, Scene } from '@/scaffolding'
import { multisetCount } from '@/engine'
import './FiveDiceModel.css'

export function FiveDiceModel({ activeStepId, satisfyGate }: SceneModelProps) {
  const [hand, setHand] = useState<number[]>([5, 3, 2, 1, 1])
  const [sorted, setSorted] = useState(false)
  const [showCollapse, setShowCollapse] = useState(false)

  const handleToggleSorted = () => {
    if (!sorted) {
      setHand([1, 1, 2, 3, 5])
      setShowCollapse(true)
      setTimeout(() => setShowCollapse(false), 800)
    } else {
      setHand([5, 3, 2, 1, 1])
    }
    setSorted(!sorted)
    satisfyGate?.() // gate: toggled order on/off
  }

  const displayHand = hand
  const uniqueCount = multisetCount()
  const showToggle = activeStepId === 'B3.2'
  const showCount = activeStepId === 'B3.2' || activeStepId === 'B3.3'

  return (
    <div className="five-dice-model">
      {/* Hand display (base) */}
      <div className="dice-visualization">
        <div className={`five-dice-display ${showCollapse ? 'collapsing' : ''}`}>
          {displayHand.map((value, i) => (
            <div key={i} className="die-dot">
              {value}
            </div>
          ))}
        </div>
      </div>

      {/* Ordered stat (always visible) */}
      <div className="stats-section">
        <p className="stat-item">
          Ordered rolls: <strong>6<sup>5</sup> = 7,776</strong>
        </p>
      </div>

      {/* Toggle button (unlocks at s3-3) */}
      {showToggle && (
        <button className="toggle-button" onClick={handleToggleSorted}>
          {sorted ? '→ Shuffle' : '→ Sort'}
        </button>
      )}

      {/* Unique count (unlocks at s3-4) */}
      {showCount && (
        <div className="stats-section collapse-reveal">
          <p className="stat-item collapse-stat">
            Multisets: <strong>{uniqueCount}</strong>
          </p>
          <p className="stat-note">7,776 → {uniqueCount} (order ignored)</p>
        </div>
      )}
    </div>
  )
}

export const scene3: Scene = {
  id: 'scene-3',
  model: FiveDiceModel,
  beats: [
    {
      id: 'B3.1',
      scene: 'scene-3',
      prompt:
        'Five dice. Counting pairs won\'t work — there are $6^5 = 7776$ ways for them to fall, and no table in five dimensions.',
    },
    {
      id: 'B3.2',
      scene: 'scene-3',
      prompt:
        "The trick: order doesn't matter — only which faces showed. Sort the hand and watch.",
      payoff:
        'Stop telling order apart and 7776 outcomes collapse into just 252 states: $\\binom{6+5-1}{5}=252$. A multiset — the most economical description of a hand. From here on a "hand" is one state.',
      gate: { kind: 'toggle' },
    },
    {
      id: 'B3.3',
      scene: 'scene-3',
      prompt:
        'Now the hand is a clean object. And here, for the first time, the real question of the game: what do you keep?',
    },
  ],
}
