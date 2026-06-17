import { useState } from 'react'
import type { SceneModelProps, Scene } from '@/scaffolding'
import { Die, RollButton, Histogram, useDieRoll } from '@/components'
import './TwoDiceModel.css'

export function TwoDiceModel({ activeStepId, satisfyGate }: SceneModelProps) {
  const [rolls, setRolls] = useState<Array<[number, number]>>([])
  const [selectedSum, setSelectedSum] = useState<number | null>(null)
  const dieA = useDieRoll(1)
  const dieB = useDieRoll(1)
  const throwing = dieA.throwing || dieB.throwing

  const handleRoll = () => {
    const d1 = Math.floor(Math.random() * 6) + 1 // honest
    const d2 = Math.floor(Math.random() * 6) + 1 // honest
    dieA.start(d1)
    window.setTimeout(() => dieB.start(d2), 70) // stagger
    const next = [...rolls, [d1, d2]] as Array<[number, number]>
    setRolls(next)
    if (next.length >= 6) satisfyGate?.() // gate: roll ≥ 6
  }

  // Empirical histogram (from real rolls)
  const empiricalData = new Map<number, number>()
  for (let i = 2; i <= 12; i++) {
    const count = rolls.filter(([d1, d2]) => d1 + d2 === i).length
    const freq = rolls.length > 0 ? count / rolls.length : 0
    empiricalData.set(i, freq)
  }

  // Ways to make each sum (6x6 grid)
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

  const showGrid = activeStepId === 'B2.2'
  const lastRoll = rolls.length > 0 ? rolls[rolls.length - 1] : null
  const lastSum = lastRoll ? lastRoll[0] + lastRoll[1] : null

  const selectSum = (sum: number) => {
    setSelectedSum(selectedSum === sum ? null : sum)
    satisfyGate?.() // gate: a sum chosen on the grid
  }

  return (
    <div className="two-dice-model">
      {/* Dice display (base) */}
      <div className="dice-display">
        {rolls.length > 0 ? (
          <>
            <Die value={dieA.displayValue} size={80} throwing={dieA.throwing} />
            <span className="plus">+</span>
            <Die value={dieB.displayValue} size={80} throwing={dieB.throwing} />
            <span className="equals">=</span>
            <span className="sum-display">{throwing ? '?' : lastSum}</span>
          </>
        ) : (
          <p className="no-rolls">Roll two dice</p>
        )}
      </div>

      {/* Roll button (always visible) */}
      {rolls.length < 20 && (
        <RollButton
          onRoll={handleRoll}
          label="Roll"
          disabled={throwing}
          pulsing={rolls.length === 0}
        />
      )}

      {/* Empirical histogram (builds from real rolls) */}
      {rolls.length > 0 && (
        <div className="distribution-section empirical">
          <Histogram
            data={empiricalData}
            title="Observed"
            xLabel="Sum"
            yLabel="Frequency"
            width={320}
            height={180}
          />
        </div>
      )}

      {/* Grid (unlocks at s2-3) */}
      {showGrid && (
        <div className="grid-section">
          <p className="grid-label">All 36 pairs — click a sum</p>
          <div className="grid-6x6">
            {Array.from({ length: 6 }, (_, i) =>
              Array.from({ length: 6 }, (_, j) => {
                const d1 = i + 1
                const d2 = j + 1
                const sum = d1 + d2
                const isSelected = selectedSum === sum
                return (
                  <div
                    key={`${d1}-${d2}`}
                    className={`grid-cell ${isSelected ? 'selected' : ''}`}
                    onClick={() => selectSum(sum)}
                  >
                    <span className="cell-text">{sum}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Sum details (from grid selection) */}
      {selectedSum !== null && (
        <div className="sum-details">
          <p className="sum-count">
            Sum <strong>{selectedSum}</strong>: {getWaysForSum(selectedSum).length} of 36
          </p>
          <p className="sum-freq">
            {(getWaysForSum(selectedSum).length / 36).toFixed(3)}
          </p>
        </div>
      )}
    </div>
  )
}

export const scene2: Scene = {
  id: 'scene-2',
  model: TwoDiceModel,
  beats: [
    {
      id: 'B2.1',
      scene: 'scene-2',
      prompt: 'Two dice now — we care about their sum. Roll a handful and watch.',
      payoff:
        "Strange: the sums don't come out evenly. Seven keeps appearing, two and twelve almost never. The dice are fair — so where's the bias from?",
      gate: { kind: 'roll', needed: 6 },
    },
    {
      id: 'B2.2',
      scene: 'scene-2',
      prompt: 'Here are all thirty-six pairs. Pick a sum — see how many ways make it.',
      payoff:
        'Seven is made by six pairs; twelve by one. That\'s the bias: $P(A)=|A|/|\\Omega|$. The same probability you just measured by rolling — there measured, here counted. Two faces of one idea.',
      gate: { kind: 'choice' },
    },
    {
      id: 'B2.3',
      scene: 'scene-2',
      prompt: 'Thirty-six pairs you can still draw. But what about five dice?',
    },
  ],
}
