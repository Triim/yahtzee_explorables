import { useState, useMemo } from 'react'
import type { SceneModelProps } from '@/scaffolding'
import { Die, RollButton, Histogram } from '@/components'
import './OneDieModel.css'

export function OneDieModel(_props: SceneModelProps) {
  const [rolls, setRolls] = useState<number[]>([])
  const [numRollsDisplay, setNumRollsDisplay] = useState(10)
  const [prediction, setPrediction] = useState<number | null>(null)

  const handleRoll = () => {
    const newRoll = Math.floor(Math.random() * 6) + 1
    setRolls([...rolls, newRoll])
  }

  // Generate synthetic rolls if needed
  const displayedRolls = useMemo(() => {
    if (rolls.length === 0) return []

    // If we have some rolls, extend synthetically to show LLN
    const extended = [...rolls]
    while (extended.length < numRollsDisplay) {
      extended.push(Math.floor(Math.random() * 6) + 1)
    }
    return extended.slice(0, numRollsDisplay)
  }, [rolls, numRollsDisplay])

  // Calculate histogram
  const histData = new Map<number, number>()
  for (let i = 1; i <= 6; i++) {
    const count = displayedRolls.filter((r) => r === i).length
    const freq = displayedRolls.length > 0 ? count / displayedRolls.length : 0
    histData.set(i, freq)
  }

  return (
    <div className="one-die-model">
      <div className="die-display">
        <Die
          value={rolls.length > 0 ? rolls[rolls.length - 1] : 1}
          size={100}
        />
      </div>

      {rolls.length < 10 && (
        <div className="roll-section">
          <p className="rolls-text">Rolls so far: {rolls.length} / 10</p>
          <RollButton onRoll={handleRoll} label="Roll" pulsing={rolls.length === 0} />
        </div>
      )}

      {rolls.length > 0 && (
        <div className="histogram-section">
          <div className="slider-control">
            <label htmlFor="rolls-slider">Display: {numRollsDisplay} rolls</label>
            <input
              id="rolls-slider"
              type="range"
              min={10}
              max={100000}
              step={100}
              value={numRollsDisplay}
              onChange={(e) => setNumRollsDisplay(parseInt(e.target.value, 10))}
              className="slider"
            />
            <span className="slider-value">{numRollsDisplay.toLocaleString()}</span>
          </div>

          <Histogram
            data={histData}
            title={`Observed frequencies (${displayedRolls.length.toLocaleString()} rolls)`}
            xLabel="Face value"
            yLabel="Frequency"
            width={350}
            height={200}
          />
        </div>
      )}

      {rolls.length >= 10 && prediction === null && (
        <div className="prediction-section">
          <p className="prediction-prompt">
            Five sixes in a row. What comes next?
          </p>
          <button
            className="prediction-button"
            onClick={() => {
              setPrediction(Math.floor(Math.random() * 6) + 1)
            }}
          >
            Roll for next
          </button>
        </div>
      )}

      {prediction !== null && (
        <div className="prediction-result">
          <p>You predicted the next roll... and got: <strong>{prediction}</strong></p>
          <p className="prediction-note">
            The die has no memory. Rolls are independent.
          </p>
        </div>
      )}
    </div>
  )
}

export const scene1 = {
  id: 'scene-1',
  model: OneDieModel,
  steps: [
    {
      id: 's1-1',
      copyType: 'инструкция' as const,
      register: 'free' as const,
      directive: { kind: 'activate' as const, model: 'die' },
      text: 'Here it is. Press, and it lands on one of its faces. You have ten rolls; spend them however you like.',
    },
    {
      id: 's1-2',
      copyType: 'определение' as const,
      register: 'free' as const,
      text: 'What can come up, you already see: one of six faces, no more, no less. That\'s everything that can possibly happen — the sample space: $\\Omega=\\{1,2,3,4,5,6\\}$.',
    },
    {
      id: 's1-3',
      copyType: 'вопрос' as const,
      register: 'free' as const,
      text: 'But those ten rolls came out uneven — one face got three, another got none. Is the die crooked? Or are ten rolls just too few to tell?',
    },
    {
      id: 's1-4',
      copyType: 'инструкция' as const,
      register: 'driven' as const,
      text: 'Let\'s check. Drag the slider — make it not ten rolls but a thousand. Then a hundred thousand.',
    },
    {
      id: 's1-5',
      copyType: 'формула' as const,
      register: 'free' as const,
      text: 'The more rolls, the flatter the bars: each face\'s frequency settles toward one-sixth and stays there. That settling point is the probability — the number a frequency converges to. $f_i = n_i/N \\to P$. This is the law of large numbers.',
    },
    {
      id: 's1-6',
      copyType: 'вопрос' as const,
      register: 'free' as const,
      text: 'Now watch. Six sixes in a row — rare, but it happens. What do you think the seventh will be?',
    },
    {
      id: 's1-7',
      copyType: 'определение' as const,
      register: 'free' as const,
      text: 'Whatever lands — the die doesn\'t care. It doesn\'t remember the six rolls before; the seventh starts from a blank slate. The rolls are independent: $P(A\\cap B)=P(A)\\,P(B)$. (Remember your second guess? There\'s your answer.)',
    },
    {
      id: 's1-8',
      copyType: 'переход' as const,
      register: 'free' as const,
      text: 'We\'ve taken one die down to the bottom. What changes with two?',
    },
  ],
}
