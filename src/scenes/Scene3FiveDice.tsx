import { useState } from 'react'
import type { SceneModelProps } from '@/scaffolding'
import { generateAllHands, multisetCount } from '@/engine'
import './FiveDiceModel.css'

export function FiveDiceModel(_props: SceneModelProps) {
  const [hand, setHand] = useState<number[]>([1, 1, 2, 3, 5])
  const [sorted, setSorted] = useState(true)
  const [uniqueCount, setUniqueCount] = useState(252)

  const allHands = generateAllHands()

  const handleToggleSorted = () => {
    if (!sorted) {
      setHand([...hand].sort((a, b) => a - b))
    }
    setSorted(!sorted)
    setUniqueCount(multisetCount())
  }

  const displayHand = sorted ? hand : hand.slice().reverse()

  return (
    <div className="five-dice-model">
      <div className="dice-visualization">
        <div className="five-dice-display">
          {displayHand.map((value, i) => (
            <div key={i} className="die-dot">
              {value}
            </div>
          ))}
        </div>
      </div>

      <div className="stats-section">
        <p className="stat-item">
          Possible rolls: <strong>6^5 = 7,776</strong>
        </p>
        <p className="stat-item">
          Unique hands: <strong>{uniqueCount}</strong>
        </p>
      </div>

      <button className="toggle-button" onClick={handleToggleSorted}>
        {sorted ? 'Show unsorted' : 'Sort dice'}
      </button>

      <p className="explanation">
        Order doesn't matter — only which faces showed. Hand{' '}
        <code>{displayHand.join(',')}</code> is one state, however shuffled.
      </p>

      <div className="all-hands-preview">
        <p className="preview-label">252 unique multisets (sample):</p>
        <div className="hand-grid">
          {allHands.slice(0, 12).map((h, i) => (
            <div key={i} className="hand-preview">
              {h.join('')}
            </div>
          ))}
          <div className="hand-preview">...</div>
        </div>
      </div>
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
