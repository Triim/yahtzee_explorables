import { useState } from 'react'
import type { SceneModelProps } from '@/scaffolding'
import { Histogram, RollButton } from '@/components'
import { binomialDistribution } from '@/engine'
import './CoinsModel.css'

export function CoinsModel({ activeStepId }: SceneModelProps) {
  const [coinStates, setCoinStates] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
  ])
  const [tosses, setTosses] = useState<number[]>([]) // Empirical history
  const [isTossing, setIsTossing] = useState(false)

  const handleToss = () => {
    setIsTossing(true)
    const newStates = Array.from({ length: 5 }, () => Math.random() > 0.5)
    setCoinStates(newStates)
    const headsCount = newStates.filter((h) => h).length
    setTimeout(() => {
      setTosses([...tosses, headsCount])
      setIsTossing(false)
    }, 300)
  }

  const heads = coinStates.filter((h) => h).length
  const showTheoryOverlay = activeStepId === 's05-4'
  const showScoringPrompt = activeStepId === 's05-3'
  const showThreshold = activeStepId === 's05-4'

  // Empirical distribution from tosses
  const empiricalData = new Map<number, number>()
  for (let i = 0; i <= 5; i++) {
    empiricalData.set(i, tosses.filter((h) => h === i).length)
  }

  // Theory: binomial P(X=k)
  const theory = binomialDistribution(5, 0.5)
  const theoryData = new Map<number, number>()
  for (let i = 0; i <= 5; i++) {
    theoryData.set(i, theory[i] || 0)
  }

  // h* threshold: if heads worth 2×, tails worth 1×
  // h* = S_tails / (S_heads + S_tails) = 1 / 3 ≈ 1.67 heads
  const hThreshold = 1.67

  return (
    <div className="coins-model">
      {/* Current toss display */}
      <div className="coins-display">
        {coinStates.map((isHeads, i) => (
          <div
            key={i}
            className={`coin ${isHeads ? 'heads' : 'tails'} ${isTossing ? 'tossing' : ''}`}
          >
            {isHeads ? 'H' : 'T'}
          </div>
        ))}
      </div>

      {/* Micro-label: heads/tails count */}
      <div className="coins-result">
        <p className="result-text">
          {heads} heads, {5 - heads} tails
        </p>
      </div>

      {/* Toss button (always visible) */}
      <RollButton
        onRoll={handleToss}
        label="Toss 5 Coins"
        disabled={isTossing}
        pulsing={tosses.length === 0}
      />

      {/* Empirical histogram (builds from tosses) */}
      {tosses.length > 0 && (
        <div className="coins-histogram empirical">
          <Histogram
            data={empiricalData}
            title="Observed"
            xLabel="# Heads"
            yLabel="Count"
            width={300}
            height={180}
          />
        </div>
      )}

      {/* Theory overlay (unlocks at s05-4) */}
      {showTheoryOverlay && tosses.length > 0 && (
        <div className="coins-histogram theory-overlay">
          <Histogram
            data={theoryData}
            title="Expected (binomial)"
            xLabel="# Heads"
            yLabel="P(X)"
            width={300}
            height={180}
          />
        </div>
      )}

      {/* Scoring choice (unlocks at s05-3) */}
      {showScoringPrompt && (
        <div className="coins-scoring">
          <p className="scoring-label">Heads worth 2×, tails worth 1×</p>
          <p className="scoring-label">Current: {heads * 2} vs {(5 - heads) * 1}</p>
        </div>
      )}

      {/* h* threshold readout (unlocks at s05-4) */}
      {showThreshold && (
        <div className="coins-threshold">
          <p className="threshold-label">h* = {hThreshold.toFixed(2)}</p>
          <p className="threshold-status">
            {heads > hThreshold
              ? '✓ Take box 1 (heads)'
              : '✗ Take box 2 (reroll)'}
          </p>
        </div>
      )}
    </div>
  )
}

export const scene05 = {
  id: 'scene-05',
  model: CoinsModel,
  steps: [
    {
      id: 's05-1',
      copyType: 'инструкция' as const,
      register: 'free' as const,
      directive: { kind: 'activate' as const, model: 'coins' },
      text: 'Not a die yet — a coin. Heads or tails, nothing simpler. Toss five at once.',
    },
    {
      id: 's05-2',
      copyType: 'определение' as const,
      register: 'free' as const,
      text: 'On average, heads and tails split evenly. But "on average" is about thousands of tosses, not these five — which landed however they landed, rarely exactly half and half.',
    },
    {
      id: 's05-3',
      copyType: 'вопрос' as const,
      register: 'free' as const,
      text: 'Let\'s add a drop of difficulty. Say heads is worth twice a tail, and you may score only one of the two boxes now — the other you\'ll take later, with whatever\'s left. Which do you take?',
    },
    {
      id: 's05-4',
      copyType: 'формула' as const,
      register: 'free' as const,
      text: 'Here the math has nowhere to hide — we can write it out in full. Let $h$ be the number of heads, and $S_1, S_2$ the two box scores. Take box 1 only if $h > h^* = \\dfrac{S_2}{S_1+S_2}$. Below that threshold, reroll and hope. Sometimes it pays to refuse points now for something better later. Remember this — the whole game ahead is about it.',
    },
    {
      id: 's05-5',
      copyType: 'переход' as const,
      register: 'free' as const,
      text: 'A coin is too simple to hide its answer behind calculation. Put a die in its place, and the closed-form formulas run out fast. Let\'s start with one die.',
    },
  ],
}
