import { useState } from 'react'
import type { SceneModelProps } from '@/scaffolding'
import { multisetCount } from '@/engine'
import './FiveDiceModel.css'

export function FiveDiceModel({ activeStepId }: SceneModelProps) {
  const [hand, setHand] = useState<number[]>([1, 1, 2, 3, 5])
  const [sorted, setSorted] = useState(false)
  const [showCollapse, setShowCollapse] = useState(false)

  const handleToggleSorted = () => {
    if (!sorted) {
      setHand([...hand].sort((a, b) => a - b))
      setShowCollapse(true)
      setTimeout(() => setShowCollapse(false), 800)
    } else {
      setHand([5, 3, 2, 1, 1])
    }
    setSorted(!sorted)
  }

  const displayHand = sorted ? hand : [5, 3, 2, 1, 1]
  const uniqueCount = multisetCount()
  const showToggle = activeStepId && activeStepId.startsWith('s3-3')
  const showCount = activeStepId && activeStepId.startsWith('s3-4')

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

export const scene3 = {
  id: 'scene-3',
  model: FiveDiceModel,
  steps: [
    {
      id: 's3-1',
      copyType: 'инструкция' as const,
      register: 'free' as const,
      directive: { kind: 'activate' as const, model: 'fivedice' },
      text: 'Five dice. Counting pairs won\'t work anymore — there are $6^5 = 7776$ ways for them to fall.',
    },
    {
      id: 's3-2',
      copyType: 'вопрос' as const,
      register: 'free' as const,
      text: 'You can\'t draw a 7776-cell table in five dimensions. And yet these outcomes have to be described somehow. How?',
    },
    {
      id: 's3-3',
      copyType: 'инструкция' as const,
      register: 'free' as const,
      text: 'The trick: the order of the dice doesn\'t matter — only which faces showed. Sort them. $(6,1,5,1,2)$ and $(1,1,2,5,6)$ are the same thing, however you shuffle them.',
    },
    {
      id: 's3-4',
      copyType: 'определение' as const,
      register: 'free' as const,
      text: 'Stop telling order apart, and 7776 outcomes collapse into just 252 states: $\\binom{6+5-1}{5}=252$. This is a multiset — the most economical description of a hand. From here on, a "hand" isn\'t five dice in places; it\'s one state.',
    },
    {
      id: 's3-5',
      copyType: 'переход' as const,
      register: 'free' as const,
      text: 'Now the hand is a clean object you can work with. And here, for the first time, the real question of the game appears: what do you keep?',
    },
  ],
}
