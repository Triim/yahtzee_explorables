import type { SceneModelProps } from '@/scaffolding'
import { generateAllHands, scoreHand, Category } from '@/engine'
import './CategoriesModel.css'

export function CategoriesModel(_props: SceneModelProps) {
  const allHands = generateAllHands()
  const categories = [
    'ones', 'twos', 'threes', 'fours', 'fives', 'sixes',
    'three-of-a-kind', 'four-of-a-kind', 'full-house',
    'small-straight', 'large-straight', 'yahtzee', 'chance'
  ] as const

  // Count hands that qualify for each category
  const getCategoryStats = (cat: typeof categories[number]) => {
    let count = 0
    for (const hand of allHands) {
      if (scoreHand(hand, cat as Category) > 0) {
        count++
      }
    }
    const probability = count / allHands.length
    return { count, probability }
  }

  return (
    <div className="categories-model">
      <h2>Category Probabilities (1 roll of 5 dice)</h2>
      <div className="category-bars">
        {categories.map((cat) => {
          const { probability } = getCategoryStats(cat)
          const displayName = cat.replace('-', ' ')
          return (
            <div key={cat} className="category-row">
              <div className="category-label">{displayName}</div>
              <div className="bar-container">
                <div
                  className="bar-fill"
                  style={{ width: `${probability * 100}%` }}
                />
              </div>
              <div className="probability-text">
                {(probability * 100).toFixed(1)}%
              </div>
            </div>
          )
        })}
      </div>
      <p className="note">
        Yahtzee is rarest by far. Four of a kind beats small straight.
      </p>
    </div>
  )
}

export const scene35 = {
  id: 'scene-35',
  model: CategoriesModel,
  steps: [
    {
      id: 's35-1',
      copyType: 'определение' as const,
      register: 'free' as const,
      directive: { kind: 'activate' as const, model: 'categories' },
      text: 'In Yahtzee a hand is worth something only if it forms a combination. And a combination is just a question you ask the hand: are there three of a kind here? four? a straight? a full house?',
    },
    {
      id: 's35-2',
      copyType: 'вопрос' as const,
      register: 'free' as const,
      text: 'Which combination is easier to get? Don\'t guess — look at the odds from a single roll.',
    },
    {
      id: 's35-3',
      copyType: 'определение' as const,
      register: 'free' as const,
      text: 'Four of a kind turns out likelier than a small straight, and Yahtzee rarest of all by an order of magnitude.',
    },
    {
      id: 's35-4',
      copyType: 'переход' as const,
      register: 'free' as const,
      text: 'Except "likelier" isn\'t yet "better." Before we price combinations, let\'s settle the reroll itself.',
    },
  ],
}
