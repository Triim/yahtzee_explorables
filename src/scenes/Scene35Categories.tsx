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

export function CategoriesModel({ activeBeatId, satisfyGate }: SceneModelProps) {
  const [threeRolls, setThreeRolls] = useState(false)

  // Реальная вероятность для каждой категории за один бросок по всем 252 мультимножествам.
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

  const showToggle = activeBeatId === 'B35.2' || activeBeatId === 'B35.3'

  const toggle = () => {
    setThreeRolls((v) => !v)
    satisfyGate?.() // гейт: переключить режим броска
  }

  // Честно: вероятность категории хотя бы в одном из 3 независимых бросков.
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
          {threeRolls ? '1 бросок' : '3 броска'}
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
        'Комбинация — это просто вопрос к руке: есть ли здесь три одинаковых? стрит? фулл-хаус? Столбцы показывают, сколько из 252 рук отвечают "да" — за один бросок.',
    },
    {
      id: 'B35.2',
      scene: 'scene-35',
      prompt: 'Но у вас не один бросок, а три. Включите этот режим.',
      payoff:
        'Шансы взлетают. Каре обгоняет малый стрит; Yahtzee остаётся редчайшей комбинацией. Перебросы меняют всю картину — почти невозможное становится реальным.',
      gate: { kind: 'toggle' },
    },
    {
      id: 'B35.3',
      scene: 'scene-35',
      prompt:
        '"Более вероятно" ещё не значит "лучше". Прежде чем оценивать комбинации друг против друга, разберёмся с самим перебросом: что вообще стоит оставлять?',
    },
  ],
}
