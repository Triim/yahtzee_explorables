import { useState } from 'react'
import type { SceneModelProps, Scene } from '@/scaffolding'
import { Die, RollButton, useDieRoll, FACE_COLORS } from '@/components'
import './OneDieModel.css'

/* ----------------------------------------------------------------------------
 * Scene 1 — One die, reauthored into THREE beats (Part 2 §C).
 * The model is the gate: each beat's payoff is locked until its interaction
 * happens. No narrative prose lives in the panel — only the die, button,
 * histogram with axis labels, slider, choice buttons, and one microcopy cue.
 * ------------------------------------------------------------------------- */

function randn(): number {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

// Counts for N draws of a fair die via the normal approximation to
// Binomial(N, 1/6): relative spread shrinks like 1/√N — the LLN flattening.
function lawOfLargeNumbersCounts(n: number): number[] {
  const p = 1 / 6
  const mean = n * p
  const sd = Math.sqrt(n * p * (1 - p))
  return Array.from({ length: 6 }, () => Math.max(0, Math.round(mean + randn() * sd)))
}

const sliderToN = (t: number) => Math.round(10 ** (1 + (t / 1000) * 4))

interface FaceHistogramProps {
  counts: number[]
  showOneSixthLine: boolean
}

function FaceHistogram({ counts, showOneSixthLine }: FaceHistogramProps) {
  const baseline = 140
  const maxBarHeight = 120
  const total = counts.reduce((a, b) => a + b, 0)
  const maxCount = Math.max(1, ...counts)
  const barWidth = 36
  const slot = 300 / 6
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

      {showOneSixthLine && total > 0 && (
        <line className="hist-onesixth" x1={0} x2={300} y1={lineY} y2={lineY} />
      )}

      <text className="hist-y-label" x={4} y={12}>
        frequency
      </text>
    </svg>
  )
}

export function OneDieModel({ activeStepId, satisfyGate }: SceneModelProps) {
  const [rolls, setRolls] = useState<number[]>([])
  const [sliderT, setSliderT] = useState(0)
  const [predictionRoll, setPredictionRoll] = useState<number | null>(null)

  const die = useDieRoll(1)

  const beat = activeStepId // 'B1.1' | 'B1.2' | 'B1.3'
  const isRollBeat = beat === 'B1.1'
  const isSliderBeat = beat === 'B1.2'
  const isPredictBeat = beat === 'B1.3'

  const rollsCapped = rolls.length >= 10

  const handleRoll = () => {
    if (rollsCapped || die.throwing) return
    const result = Math.floor(Math.random() * 6) + 1 // honest
    die.start(result)
    const next = [...rolls, result]
    setRolls(next)
    if (next.length >= 6) satisfyGate?.() // gate: roll ≥ 6
  }

  const handleSlider = (t: number) => {
    setSliderT(t)
    if (sliderToN(t) > 1000) satisfyGate?.() // gate: dragged past ~1000
  }

  const handlePredict = () => {
    const result = Math.floor(Math.random() * 6) + 1 // honest, never faked
    die.start(result)
    setPredictionRoll(result)
    satisfyGate?.() // gate: a choice made
  }

  const sliderN = sliderToN(sliderT)
  const counts = isSliderBeat
    ? lawOfLargeNumbersCounts(sliderN)
    : (() => {
        const c = [0, 0, 0, 0, 0, 0]
        rolls.forEach((r) => (c[r - 1] += 1))
        return c
      })()

  // Die face: streak rests on six during the prediction beat until the honest roll.
  let dieValue = die.displayValue
  if (isPredictBeat && !die.throwing) {
    dieValue = predictionRoll ?? 6
  } else if (!die.throwing && !isSliderBeat) {
    dieValue = rolls.length > 0 ? rolls[rolls.length - 1] : 1
  }

  return (
    <div className="one-die-model">
      {/* Staged six-streak strip (prediction beat) */}
      {isPredictBeat && (
        <div className="streak-strip" aria-label="A run of sixes">
          {[0, 1, 2, 3, 4].map((i) => (
            <Die key={i} value={6} size={28} />
          ))}
          <span className="streak-arrow">→</span>
        </div>
      )}

      <div className="die-display">
        <Die value={dieValue} size={80} throwing={die.throwing} />
      </div>

      {/* Base affordance: Roll (B1.1 only) */}
      {isRollBeat && (
        <div className="roll-section">
          <p className="rolls-text">{rolls.length} / 10</p>
          <RollButton
            onRoll={handleRoll}
            label="Roll"
            disabled={rollsCapped || die.throwing}
            pulsing={rolls.length < 6}
          />
        </div>
      )}

      {/* Histogram (B1.1 and B1.2) */}
      {(isRollBeat || isSliderBeat) && (
        <div className="histogram-wrap">
          <FaceHistogram counts={counts} showOneSixthLine={isSliderBeat && sliderN > 300} />
        </div>
      )}

      {/* Slider (B1.2) */}
      {isSliderBeat && (
        <div className="slider-control">
          <label htmlFor="lln-slider">rolls: {sliderN.toLocaleString()}</label>
          <input
            id="lln-slider"
            type="range"
            min={0}
            max={1000}
            value={sliderT}
            onChange={(e) => handleSlider(parseInt(e.target.value, 10))}
            className="slider"
          />
        </div>
      )}

      {/* Prediction (B1.3) */}
      {isPredictBeat && (
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

export const scene1: Scene = {
  id: 'scene-1',
  model: OneDieModel,
  beats: [
    {
      id: 'B1.1',
      scene: 'scene-1',
      prompt: "Press it. You've got ten rolls.",
      payoff:
        'Six faces, each can land — that\'s the whole sample space, $\\Omega=\\{1,2,3,4,5,6\\}$. But your bars came out uneven.',
      gate: { kind: 'roll', needed: 6 },
    },
    {
      id: 'B1.2',
      scene: 'scene-1',
      prompt: 'Crooked die, or too few rolls? Drag it up.',
      payoff:
        'They flatten toward one-sixth. The frequency converges to the probability: $f_i=n_i/N\\to P$ — the law of large numbers.',
      gate: { kind: 'slider' },
    },
    {
      id: 'B1.3',
      scene: 'scene-1',
      prompt: 'Six sixes in a row. What comes next?',
      payoff:
        'The die has no memory — the next roll starts from nothing. Rolls are independent: $P(A\\cap B)=P(A)P(B)$. (Remember your second guess?)',
      gate: { kind: 'choice' },
    },
  ],
}
