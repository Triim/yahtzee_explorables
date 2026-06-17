import { useState } from 'react'
import type { SceneModelProps } from '@/scaffolding'
import { Die, RollButton, Histogram } from '@/components'
import { sumOfTwoDiceDistribution } from '@/engine'
import './TwoDiceModel.css'

export function TwoDiceModel(_props: SceneModelProps) {
  const [rolls, setRolls] = useState<Array<[number, number]>>([])
  const [selectedSum, setSelectedSum] = useState<number | null>(null)

  const handleRoll = () => {
    const d1 = Math.floor(Math.random() * 6) + 1
    const d2 = Math.floor(Math.random() * 6) + 1
    setRolls([...rolls, [d1, d2]])
  }

  // Calculate sum distribution
  const dist = sumOfTwoDiceDistribution()
  const histData = new Map<number, number>()
  for (let i = 2; i <= 12; i++) {
    histData.set(i, dist[i] || 0)
  }

  // Count rolls by sum
  const rollCountBySum = new Map<number, number>()
  for (const [d1, d2] of rolls) {
    const sum = d1 + d2
    rollCountBySum.set(sum, (rollCountBySum.get(sum) || 0) + 1)
  }

  // Ways to make a sum (6x6 grid visualization)
  const getWaysForSum = (sum: number): Array<[number, number]> => {
    const ways: Array<[number, number]> = []
    for (let d1 = 1; d1 <= 6; d1++) {
      for (let d2 = 1; d2 <= 6; d2++) {
        if (d1 + d2 === sum) {
          ways.push([d1, d2])
        }
      }
    }
    return ways
  }

  return (
    <div className="two-dice-model">
      <div className="dice-display">
        {rolls.length > 0 ? (
          <>
            <Die value={rolls[rolls.length - 1][0]} size={80} />
            <span className="plus">+</span>
            <Die value={rolls[rolls.length - 1][1]} size={80} />
            <span className="equals">=</span>
            <span className="sum-display">
              {rolls[rolls.length - 1][0] + rolls[rolls.length - 1][1]}
            </span>
          </>
        ) : (
          <p className="no-rolls">No rolls yet</p>
        )}
      </div>

      {rolls.length < 20 && (
        <RollButton onRoll={handleRoll} label="Roll Two Dice" pulsing={rolls.length === 0} />
      )}

      {rolls.length > 0 && (
        <div className="distribution-section">
          <Histogram
            data={histData}
            title={`Distribution (sums 2-12)`}
            xLabel="Sum"
            yLabel="P(X)"
            width={350}
            height={200}
          />

          <div className="grid-section">
            <p className="grid-title">All 36 pairs:</p>
            <div className="grid-6x6">
              {Array.from({ length: 6 }, (_, i) =>
                Array.from({ length: 6 }, (_, j) => {
                  const d1 = i + 1
                  const d2 = j + 1
                  const sum = d1 + d2
                  const isSelected =
                    selectedSum !== null && sum === selectedSum
                  return (
                    <div
                      key={`${d1}-${d2}`}
                      className={`grid-cell ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedSum(selectedSum === sum ? null : sum)}
                    >
                      <span className="cell-text">{sum}</span>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {selectedSum !== null && (
            <div className="sum-details">
              <p>
                Sum <strong>{selectedSum}</strong>: {getWaysForSum(selectedSum).length} ways
              </p>
              <p className="formula">
                P({selectedSum}) = {getWaysForSum(selectedSum).length}/36 ≈{' '}
                {(getWaysForSum(selectedSum).length / 36).toFixed(3)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export const scene2 = {
  id: 'scene-2',
  model: TwoDiceModel,
  steps: [
    {
      id: 's2-1',
      copyType: 'инструкция' as const,
      register: 'free' as const,
      directive: { kind: 'activate' as const, model: 'twodice' },
      text: 'Two dice — and now we care not about each one, but about their sum. Roll, and watch which sums show up most.',
    },
    {
      id: 's2-2',
      copyType: 'вопрос' as const,
      register: 'free' as const,
      text: 'Strange: the sums don\'t come out evenly. Seven keeps appearing, while two and twelve almost never do. But the dice are fair. So where\'s the bias from?',
    },
    {
      id: 's2-3',
      copyType: 'инструкция' as const,
      register: 'free' as const,
      text: 'Let\'s lay it all out. Here are all thirty-six pairs that can come up. Click a sum — and see how many ways it can be made.',
    },
    {
      id: 's2-4',
      copyType: 'формула' as const,
      register: 'free' as const,
      text: 'Seven is made by six pairs; twelve by a single one. That\'s the bias: $P(A)=|A|/|\\Omega|$. // Notice: this is the same probability we just measured by rolling. There we **measured** it; here we **counted** it. Two faces of one idea — and they agree.',
    },
    {
      id: 's2-5',
      copyType: 'переход' as const,
      register: 'free' as const,
      text: 'Thirty-six pairs you can still draw. But what about five dice?',
    },
  ],
}
