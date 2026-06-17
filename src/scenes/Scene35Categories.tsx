import { useState, useMemo } from 'react'
import type { SceneModelProps, Scene } from '@/scaffolding'
import { generateAllHands, scoreHand, Category } from '@/engine'
import './CategoriesModel.css'

const CATEGORIES = [
  'three-of-a-kind',
  'four-of-a-kind',
  'full-house',
  'small-straight',
  'large-straight',
  'yahtzee',
] as const

export function CategoriesModel({ activeStepId, satisfyGate }: SceneModelProps) {
  const [threeRolls, setThreeRolls] = useState(false)

  // Real one-roll probability per category over all 252 multisets.
  const oneRollP = useMemo(() => {
    const hands = generateAllHands()
    const out: Record<string, number> = {}
    for (const cat of CATEGORIES) {
      let count = 0
      for (const hand of hands) {
        if (scoreHand(hand, cat as Category) > 0) count++
      }
      out[cat] = count / hands.length
    }
    return out
  }, [])

  const showToggle = activeStepId === 'B35.2' || activeStepId === 'B35.3'

  const toggle = () => {
    setThreeRolls((v) => !v)
    satisfyGate?.() // gate: toggled roll mode
  }

  // Honest: probability of the category in at least one of 3 independent rolls.
  const probFor = (cat: string) =>
    threeRolls ? 1 - (1 - oneRollP[cat]) ** 3 : oneRollP[cat]

  const maxP = Math.max(...CATEGORIES.map((c) => probFor(c)))

  return (
    <div className="categories-model">
      <div className="category-bars">
        {CATEGORIES.map((cat) => {
          const p = probFor(cat)
          const width = (p / maxP) * 100
          return (
            <div key={cat} className="category-row">
              <div className="category-label">{cat.replace(/-/g, ' ')}</div>
              <div className="bar-container">
                <div className="bar-fill" style={{ width: `${width}%` }} />
              </div>
              <div className="probability-text">{(p * 100).toFixed(1)}%</div>
            </div>
          )
        })}
      </div>

      {showToggle && (
        <button className="rollmode-toggle" onClick={toggle}>
          {threeRolls ? '1 roll' : '3 rolls'}
        </button>
      )}
    </div>
  )
}

export const scene35: Scene = {
  id: 'scene-35',
  model: CategoriesModel,
  beats: [
    {
      id: 'B35.1',
      scene: 'scene-35',
      prompt:
        'A combination is just a question you ask the hand: three of a kind? a straight? a full house? The bars show how many of the 252 hands answer "yes" — on a single roll.',
    },
    {
      id: 'B35.2',
      scene: 'scene-35',
      prompt:
        "But you don't get one roll — you get three. Switch it on.",
      payoff:
        'The odds jump. Four of a kind beats a small straight; Yahtzee stays rarest by an order of magnitude. Rerolls change the whole picture — the nearly impossible becomes real.',
      gate: { kind: 'toggle' },
    },
    {
      id: 'B35.3',
      scene: 'scene-35',
      prompt:
        '"Likelier" still isn\'t "better." Before we price combinations against each other, settle the reroll itself: what\'s even worth keeping?',
    },
  ],
}
