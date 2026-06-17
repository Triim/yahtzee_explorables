import { useState } from 'react'
import type { SceneModelProps } from '@/scaffolding'
import { Die, RollButton, useDieRoll, FACE_COLORS } from '@/components'
import './OneDieModel.css'

/* ----------------------------------------------------------------------------
 * Scene 1 — One die. This model is the TEMPLATE every other scene copies:
 *   - all visible tools are a pure function of the active step (reversible)
 *   - the model carries NO narrative prose (only labels/axes/buttons)
 *   - the histogram starts empty and builds from the reader's own rolls
 * ------------------------------------------------------------------------- */

function toolsFor(stepId: string | null) {
  return {
    showSlider: stepId === 's1-4' || stepId === 's1-5',
    showOneSixthLine: stepId === 's1-5',
    showPrediction: stepId === 's1-6' || stepId === 's1-7',
  }
}

// Box–Muller standard normal.
function randn(): number {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

// Counts for N draws of a fair die via the normal approximation to
// Binomial(N, 1/6): mean N/6, sd sqrt(N·(1/6)·(5/6)). Fluctuations grow like
// √N, so the *relative* spread shrinks as N grows — the LLN flattening.
function lawOfLargeNumbersCounts(n: number): number[] {
  const p = 1 / 6
  const mean = n * p
  const sd = Math.sqrt(n * p * (1 - p))
  const counts = [0, 0, 0, 0, 0, 0]
  for (let i = 0; i < 6; i++) {
    counts[i] = Math.max(0, Math.round(mean + randn() * sd))
  }
  return counts
}

// Slider position 0..1000 → N on a log scale 10 → 100000.
const sliderToN = (t: number) => Math.round(10 ** (1 + (t / 1000) * 4))

interface FaceHistogramProps {
  counts: number[] // index 0..5 → faces 1..6
  showOneSixthLine: boolean
}

function FaceHistogram({ counts, showOneSixthLine }: FaceHistogramProps) {
  const baseline = 140
  const maxBarHeight = 120
  const total = counts.reduce((a, b) => a + b, 0)
  const maxCount = Math.max(1, ...counts)
  const barWidth = 36
  const slot = 300 / 6

  // y for the 1/6 reference: the count that equals total/6.
  const oneSixthCount = total / 6
  const lineY = baseline - (oneSixthCount / maxCount) * maxBarHeight

  return (
    <svg
      viewBox="0 0 300 160"
      className="face-histogram"
      role="img"
      aria-label="Histogram of die-face counts"
    >
      {counts.map((c, i) => {
        const face = i + 1
        const h = (c / maxCount) * maxBarHeight
        const x = i * slot + (slot - barWidth) / 2
        const y = baseline - h
        return (
          <g key={face}>
            <rect
              className="hist-bar"
              x={x}
              y={y}
              width={barWidth}
              height={h}
              rx={3}
              fill={FACE_COLORS[face]}
            />
            <text className="hist-x-label" x={x + barWidth / 2} y={154}>
              {face}
            </text>
          </g>
        )
      })}

      {/* 1/6 reference line (fades in only at S1.5) */}
      {showOneSixthLine && total > 0 && (
        <line
          className="hist-onesixth"
          x1={0}
          x2={300}
          y1={lineY}
          y2={lineY}
        />
      )}

      <text className="hist-y-label" x={4} y={12}>
        frequency
      </text>
    </svg>
  )
}

export function OneDieModel({ activeStepId }: SceneModelProps) {
  const [rolls, setRolls] = useState<number[]>([])
  const [sliderT, setSliderT] = useState(0)
  const [predictionRoll, setPredictionRoll] = useState<number | null>(null)

  const die = useDieRoll(1)

  const { showSlider, showOneSixthLine, showPrediction } = toolsFor(activeStepId)

  const rollsCapped = rolls.length >= 10

  const handleRoll = () => {
    if (rollsCapped) return
    const result = Math.floor(Math.random() * 6) + 1 // honest
    die.start(result)
    setRolls((r) => [...r, result])
  }

  const handlePredict = () => {
    const result = Math.floor(Math.random() * 6) + 1 // honest, never faked
    die.start(result)
    setPredictionRoll(result)
  }

  // Counts feeding the histogram: synthetic LLN distribution while the slider
  // is active, otherwise the reader's real rolls.
  const sliderN = sliderToN(sliderT)
  const counts = showSlider
    ? lawOfLargeNumbersCounts(sliderN)
    : (() => {
        const c = [0, 0, 0, 0, 0, 0]
        rolls.forEach((r) => (c[r - 1] += 1))
        return c
      })()

  // What face the die shows.
  let dieValue = die.displayValue
  if (showPrediction) {
    dieValue = predictionRoll ?? 6 // staged streak rests on a six until predicted
  } else if (!die.rolling && !die.settling) {
    dieValue = rolls.length > 0 ? rolls[rolls.length - 1] : 1
  }

  return (
    <div className="one-die-model">
      {/* Staged six-streak strip (shown only during the prediction beat) */}
      {showPrediction && (
        <div className="streak-strip" aria-label="A run of sixes">
          {[0, 1, 2, 3, 4].map((i) => (
            <Die key={i} value={6} size={28} />
          ))}
          <span className="streak-arrow">→</span>
        </div>
      )}

      <div className="die-display">
        <Die
          value={dieValue}
          size={80}
          rolling={die.rolling}
          settling={die.settling}
        />
      </div>

      {/* Base affordance: Roll (hidden while the slider is the focus) */}
      {!showSlider && !showPrediction && (
        <div className="roll-section">
          <p className="rolls-text">{rolls.length} / 10</p>
          <RollButton
            onRoll={handleRoll}
            label="Roll"
            disabled={rollsCapped || die.rolling}
            pulsing={rolls.length === 0}
          />
        </div>
      )}

      {/* Histogram: empty until the first roll, grows per roll */}
      <div className="histogram-wrap">
        <FaceHistogram counts={counts} showOneSixthLine={showOneSixthLine} />
      </div>

      {/* Slider (S1.4 / S1.5) */}
      {showSlider && (
        <div className="slider-control">
          <label htmlFor="lln-slider">rolls: {sliderN.toLocaleString()}</label>
          <input
            id="lln-slider"
            type="range"
            min={0}
            max={1000}
            value={sliderT}
            onChange={(e) => setSliderT(parseInt(e.target.value, 10))}
            className="slider"
          />
        </div>
      )}

      {/* Prediction (S1.6 / S1.7) */}
      {showPrediction && (
        <div className="prediction-control">
          {predictionRoll === null ? (
            <div className="predict-buttons">
              <button onClick={handlePredict}>1–5</button>
              <button onClick={handlePredict}>6</button>
              <button onClick={handlePredict}>can't tell</button>
            </div>
          ) : (
            <p className="predict-result">{predictionRoll}</p>
          )}
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
