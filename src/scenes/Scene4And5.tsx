import { useState, useMemo } from 'react'
import type { SceneModelProps, Scene } from '@/scaffolding'
import { Die } from '@/components'
import { rerollDistribution, evForAllCategories } from '@/engine'
import type { Category } from '@/engine'
import './Scene4And5.css'

const START_HAND = [6, 6, 3, 2, 1]

function rollFace() {
  return Math.floor(Math.random() * 6) + 1
}

// Sum distribution after rerolling the non-held dice, from the engine's
// conditional reroll distribution.
function sumDistribution(kept: number[]): Map<number, number> {
  const dist = rerollDistribution(kept)
  const sums = new Map<number, number>()
  for (const [handStr, prob] of dist) {
    const hand = JSON.parse(handStr) as number[]
    const s = hand.reduce((a, b) => a + b, 0)
    sums.set(s, (sums.get(s) || 0) + prob)
  }
  return sums
}

interface HoldRerollProps extends SceneModelProps {
  mode: 'conditional' | 'ev'
}

function HoldReroll({ activeStepId, satisfyGate, mode }: HoldRerollProps) {
  const [hand, setHand] = useState<number[]>(START_HAND)
  const [held, setHeld] = useState<boolean[]>([true, true, false, false, false])

  const kept = hand.filter((_, i) => held[i])

  const toggleHold = (i: number) => {
    setHeld((h) => h.map((v, j) => (j === i ? !v : v)))
    satisfyGate?.() // gate: hold/release a die
  }

  const reroll = () => {
    setHand((h) => h.map((v, i) => (held[i] ? v : rollFace()))) // honest reroll
  }

  // Conditional sum distribution (Scene 4)
  const sums = useMemo(
    () => (mode === 'conditional' ? sumDistribution(kept) : new Map<number, number>()),
    [mode, kept.join(',')]
  )
  const maxSumProb = Math.max(0.0001, ...Array.from(sums.values()))

  // EV per category (Scene 5)
  const evs = useMemo(
    () => (mode === 'ev' ? evForAllCategories(kept) : new Map<Category, number>()),
    [mode, kept.join(',')]
  )
  const evList = Array.from(evs.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
  const maxEv = Math.max(0.0001, ...evList.map(([, v]) => v))

  const showDist = mode === 'conditional' && activeStepId !== 'B4.1-pre'
  const showEv =
    mode === 'ev' && (activeStepId === 'B5.2' || activeStepId === 'B5.3')

  return (
    <div className="holdreroll-model">
      <div className="hr-dice">
        {hand.map((v, i) => (
          <Die
            key={i}
            value={v}
            size={64}
            held={held[i]}
            onClick={() => toggleHold(i)}
          />
        ))}
      </div>

      <button className="hr-reroll" onClick={reroll}>
        Reroll loose dice
      </button>

      {/* Scene 4: conditional distribution of the resulting sum */}
      {showDist && (
        <div className="hr-dist">
          <p className="hr-dist-label">P(sum | kept)</p>
          <svg viewBox="0 0 320 140" className="hr-dist-svg" role="img" aria-label="Conditional sum distribution">
            {Array.from(sums.entries())
              .sort((a, b) => a[0] - b[0])
              .map(([s, p]) => {
                const minS = 5
                const maxS = 30
                const x = ((s - minS) / (maxS - minS)) * 300 + 6
                const h = (p / maxSumProb) * 110
                return (
                  <rect
                    key={s}
                    className="hr-bar"
                    x={x}
                    y={120 - h}
                    width={10}
                    height={h}
                    rx={2}
                  />
                )
              })}
            <line x1={0} x2={320} y1={120} y2={120} className="hr-axis" />
          </svg>
        </div>
      )}

      {/* Scene 5: EV per category, best highlighted */}
      {showEv && (
        <div className="hr-ev">
          {evList.map(([cat, v], idx) => (
            <div key={cat} className={`hr-ev-row ${idx === 0 ? 'best' : ''}`}>
              <span className="hr-ev-label">{cat.replace(/-/g, ' ')}</span>
              <div className="hr-ev-bar-bg">
                <div className="hr-ev-bar" style={{ width: `${(v / maxEv) * 100}%` }} />
              </div>
              <span className="hr-ev-val">{v.toFixed(1)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function RerollModel(props: SceneModelProps) {
  return <HoldReroll {...props} mode="conditional" />
}

export function EVModel(props: SceneModelProps) {
  return <HoldReroll {...props} mode="ev" />
}

export const scene4: Scene = {
  id: 'scene-4',
  model: RerollModel,
  beats: [
    {
      id: 'B4.1',
      scene: 'scene-4',
      prompt: "Here's a hand. Click the dice you want to keep — the rest reroll.",
      payoff:
        'The moment you keep something, the future stops being blind chance. This is conditional probability — the distribution of a future given a present: $P(B\\mid A)=\\dfrac{P(A\\cap B)}{P(A)}$. Change what you keep and the whole curve shifts.',
      gate: { kind: 'hold' },
    },
    {
      id: 'B4.2',
      scene: 'scene-4',
      prompt:
        'Under the hood each reroll is a step along a small chain: the value of what you hold is built from the values of what could arrive — $\\text{keep}[K]=\\frac{1}{6}\\sum_d \\text{keep}[K\\cup\\{d\\}]$.',
    },
    {
      id: 'B4.3',
      scene: 'scene-4',
      prompt:
        "We have the distribution. But which choice is better — it won't say. We have no goal yet to choose toward.",
    },
  ],
}

export const scene5: Scene = {
  id: 'scene-5',
  model: EVModel,
  beats: [
    {
      id: 'B5.1',
      scene: 'scene-5',
      prompt:
        'Give the hand a price: every hand turns into points by a category\'s rule, so points are a function of the hand — $\\text{score}=f(\\text{hand})$.',
    },
    {
      id: 'B5.2',
      scene: 'scene-5',
      prompt:
        "You're holding a fat six — surely that's the one to protect. Try it. Then try keeping something else and watch the averages.",
      payoff:
        'We compare not probabilities but the average haul: the expected value $E[X]=\\sum_x x\\,P(X=x)$. Again and again the "obvious" move loses to the unobvious one. The eye deceives; the number doesn\'t.',
      gate: { kind: 'hold' },
    },
    {
      id: 'B5.3',
      scene: 'scene-5',
      prompt:
        'Expectation picks the best move in this roll. But a turn has three rolls, a game has thirteen turns, and every box you fill is closed for good. Is expectation alone enough?',
    },
  ],
}
