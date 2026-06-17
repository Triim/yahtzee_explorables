import { useState } from 'react'
import type { SceneModelProps } from '@/scaffolding'
import { Die, RollButton, Histogram } from '@/components'
import './OneDieModel.css'

export function OneDieModel({ activeStepId }: SceneModelProps) {
  const [rolls, setRolls] = useState<number[]>([])
  const [isRolling, setIsRolling] = useState(false)
  const [prediction, setPrediction] = useState<number | null>(null)
  const [stagedPrediction, setStagedPrediction] = useState(false)

  const handleRoll = () => {
    setIsRolling(true)
    const newRoll = Math.floor(Math.random() * 6) + 1
    setTimeout(() => {
      setRolls([...rolls, newRoll])
      setIsRolling(false)
    }, 600)
  }

  const lastRoll = rolls.length > 0 ? rolls[rolls.length - 1] : 1

  // Empirical histogram (only from real rolls, no synthetic)
  const histData = new Map<number, number>()
  for (let i = 1; i <= 6; i++) {
    const count = rolls.filter((r) => r === i).length
    const freq = rolls.length > 0 ? count / rolls.length : 0
    histData.set(i, freq)
  }

  // Theory overlay (1/6 line)
  const theoryData = new Map<number, number>()
  for (let i = 1; i <= 6; i++) {
    theoryData.set(i, 1 / 6)
  }

  const showSlider = activeStepId && activeStepId.startsWith('s1-4')
  const showTheoryLine = activeStepId && activeStepId.startsWith('s1-5')
  const showPredictionSetup = activeStepId && activeStepId.startsWith('s1-6')

  return (
    <div className="one-die-model">
      {/* Die display (always visible) */}
      <div className="die-display">
        <Die value={lastRoll} size={100} isRolling={isRolling} />
      </div>

      {/* Roll button for first 10 rolls (base affordance) */}
      {rolls.length < 10 && (
        <div className="roll-section">
          <p className="rolls-text">Rolls: {rolls.length} / 10</p>
          <RollButton
            onRoll={handleRoll}
            label="Roll"
            disabled={isRolling}
            pulsing={rolls.length === 0}
          />
        </div>
      )}

      {/* Empirical histogram (builds from real rolls) */}
      {rolls.length > 0 && (
        <div className="histogram-section empirical">
          <Histogram
            data={histData}
            title="Observed"
            xLabel="Face"
            yLabel="Frequency"
            width={300}
            height={180}
          />
        </div>
      )}

      {/* Theory line overlay (unlocks at s1-5) */}
      {showTheoryLine && rolls.length > 0 && (
        <div className="histogram-section theory-line">
          <p className="theory-label">1/6 line (expected)</p>
          <Histogram
            data={theoryData}
            title="Theory"
            xLabel="Face"
            yLabel="P(X)"
            width={300}
            height={180}
          />
        </div>
      )}

      {/* Slider (unlocks at s1-4) — manual for now, will be driven later */}
      {showSlider && rolls.length > 0 && (
        <div className="slider-control">
          <p className="slider-label">More rolls to see LLN</p>
          <p className="slider-note">(Scroll to see effect)</p>
        </div>
      )}

      {/* Prediction setup (clearly staged at s1-6) */}
      {showPredictionSetup && rolls.length >= 10 && prediction === null && (
        <div className="prediction-section staged">
          <p className="prediction-prompt">
            <span className="prediction-label">[Demonstration]</span>
            Six sixes. The next roll is...
          </p>
          <button
            className="prediction-button"
            onClick={() => {
              setStagedPrediction(true)
              setPrediction(Math.floor(Math.random() * 6) + 1)
            }}
          >
            Show next
          </button>
        </div>
      )}

      {/* Prediction result */}
      {prediction !== null && stagedPrediction && (
        <div className="prediction-result">
          <p className="prediction-outcome">{prediction}</p>
          <p className="prediction-note">
            The die doesn't remember. Rolls are independent.
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
