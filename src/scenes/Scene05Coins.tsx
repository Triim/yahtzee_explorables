import { useState } from 'react'
import type { SceneModelProps, Scene } from '@/scaffolding'
import { Histogram, RollButton } from '@/components'
import './CoinsModel.css'

/* Scene 0.5 — coins warm-up, three beats.
 * B05.1 toss (gate: roll) → empirical heads tally builds
 * B05.2 score choice (gate: choice) → h* threshold readout
 * B05.3 read → hands to the one-die scene
 * Heads worth S1=2, tails S2=1; threshold fraction h* = S1/(S1+S2). */

const S1 = 2 // heads value
const S2 = 1 // tails value
const H_STAR = S1 / (S1 + S2) // ≈ 0.667 (fraction of heads)

export function CoinsModel({ activeStepId, satisfyGate }: SceneModelProps) {
  const [coins, setCoins] = useState<boolean[]>([false, false, false, false, false])
  const [tosses, setTosses] = useState<number[]>([]) // heads-count history
  const [isTossing, setIsTossing] = useState(false)
  const [choice, setChoice] = useState<'heads' | 'hold' | null>(null)

  const handleToss = () => {
    setIsTossing(true)
    const next = Array.from({ length: 5 }, () => Math.random() > 0.5) // honest
    setCoins(next)
    const heads = next.filter(Boolean).length
    window.setTimeout(() => {
      setTosses((t) => [...t, heads])
      setIsTossing(false)
    }, 300)
    satisfyGate?.() // gate: a toss
  }

  const handleChoice = (c: 'heads' | 'hold') => {
    setChoice(c)
    satisfyGate?.() // gate: a choice
  }

  const heads = coins.filter(Boolean).length
  const headsFraction = heads / 5

  const isScoreBeat = activeStepId === 'B05.2'

  // Empirical tally
  const empirical = new Map<number, number>()
  for (let i = 0; i <= 5; i++) empirical.set(i, tosses.filter((h) => h === i).length)

  return (
    <div className="coins-model">
      <div className="coins-display">
        {coins.map((isHeads, i) => (
          <div
            key={i}
            className={`coin ${isHeads ? 'heads' : 'tails'} ${isTossing ? 'tossing' : ''}`}
          >
            {isHeads ? 'H' : 'T'}
          </div>
        ))}
      </div>

      <div className="coins-result">
        <p className="result-text">
          {heads} heads, {5 - heads} tails
        </p>
      </div>

      <RollButton
        onRoll={handleToss}
        label="Toss 5"
        disabled={isTossing}
        pulsing={tosses.length === 0}
      />

      {tosses.length > 0 && (
        <div className="coins-histogram empirical">
          <Histogram
            data={empirical}
            title="Observed"
            xLabel="# Heads"
            yLabel="Count"
            width={300}
            height={170}
          />
        </div>
      )}

      {/* Scoring choice + threshold (B05.2) */}
      {isScoreBeat && (
        <div className="coins-scoring">
          <p className="scoring-label">Heads ×{S1}, tails ×{S2}. Score now or hold?</p>
          <div className="scoring-buttons">
            <button
              className={`scoring-btn ${choice === 'heads' ? 'selected' : ''}`}
              onClick={() => handleChoice('heads')}
            >
              Take heads box
            </button>
            <button
              className={`scoring-btn ${choice === 'hold' ? 'selected' : ''}`}
              onClick={() => handleChoice('hold')}
            >
              Hold
            </button>
          </div>
          <div className="coins-threshold">
            <p className="threshold-label">
              h* = {H_STAR.toFixed(2)} · you: {headsFraction.toFixed(2)}
            </p>
            <p className="threshold-status">
              {headsFraction > H_STAR ? '✓ above threshold — take it' : '✗ below — hold'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export const scene05: Scene = {
  id: 'scene-05',
  model: CoinsModel,
  beats: [
    {
      id: 'B05.1',
      scene: 'scene-05',
      prompt: 'Not a die yet — a coin. Toss five at once.',
      payoff:
        'On average, heads and tails split evenly. But "on average" is about thousands of tosses, not these five — which landed however they landed.',
      gate: { kind: 'roll', needed: 1 },
    },
    {
      id: 'B05.2',
      scene: 'scene-05',
      prompt:
        'Heads is worth twice a tail, and you may score only one box now — the other later. Which do you take?',
      payoff:
        'Take the expensive box only if its face beat a threshold: $h^* \\approx \\dfrac{S_1}{S_1+S_2}$. Below it, hold off. Sometimes it pays to refuse points now for something better later — the whole game ahead is about this.',
      gate: { kind: 'choice' },
    },
    {
      id: 'B05.3',
      scene: 'scene-05',
      prompt:
        'A coin is too simple to hide its answer behind a formula. Put a die in its place, and the closed forms run out fast. Start with one die.',
    },
  ],
}
