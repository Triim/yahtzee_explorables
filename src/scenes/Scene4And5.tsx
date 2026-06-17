import type { SceneModelProps } from '@/scaffolding'
import './Scene4And5.css'

// Scene 4: Reroll (simplified)
export function RerollModel(_props: SceneModelProps) {
  return (
    <div className="reroll-model">
      <div className="step-box">
        <h3>The Reroll</h3>
        <p>
          Click the dice you want to keep. The rest go back for a reroll.
        </p>
        <p className="explanation">
          The future distribution depends on your choice.
          Conditional probability: P(B|A) = P(A∩B) / P(A).
        </p>
        <p className="explanation">
          Change what you keep, and the whole distribution changes with it.
        </p>
      </div>
    </div>
  )
}

// Scene 5: Score & EV (simplified)
export function EVModel(_props: SceneModelProps) {
  return (
    <div className="ev-model">
      <div className="step-box">
        <h3>Expected Value</h3>
        <p>
          Give the hand a price. Score = f(hand).
        </p>
        <p className="explanation">
          Expected value: E[X] = Σ x · P(X=x)
        </p>
        <p className="explanation">
          The obvious move often loses by expected value.
        </p>
      </div>
    </div>
  )
}

export const scene4 = {
  id: 'scene-4',
  model: RerollModel,
  steps: [
    {
      id: 's4-1',
      copyType: 'инструкция' as const,
      register: 'free' as const,
      directive: { kind: 'activate' as const, model: 'reroll' },
      text: 'Here\'s a hand. Click the dice you want to keep — the rest go back for a reroll.',
    },
    {
      id: 's4-2',
      copyType: 'определение' as const,
      register: 'free' as const,
      text: 'The moment you keep something, the future stops being blind chance. Here\'s the distribution of what will likely come up — given your choice.',
    },
    {
      id: 's4-3',
      copyType: 'формула' as const,
      register: 'free' as const,
      text: 'This is conditional probability — the probability of a future given a present: $P(B|A)=\\dfrac{P(A\\cap B)}{P(A)}$. Change what you keep, and the whole distribution changes with it.',
    },
    {
      id: 's4-4',
      copyType: 'переход' as const,
      register: 'free' as const,
      text: 'We have the distribution. But which choice is better — it won\'t say. And it can\'t: we have no goal yet.',
    },
  ],
}

export const scene5 = {
  id: 'scene-5',
  model: EVModel,
  steps: [
    {
      id: 's5-1',
      copyType: 'определение' as const,
      register: 'free' as const,
      directive: { kind: 'activate' as const, model: 'ev' },
      text: 'Let\'s give the hand a price. Score is just a function of the hand: $\\text{score}=f(\\text{hand})$.',
    },
    {
      id: 's5-2',
      copyType: 'вопрос' as const,
      register: 'free' as const,
      text: 'And now the choice stops being obvious. You\'re holding a fat six — surely that\'s the one to protect. But is it really the best?',
    },
    {
      id: 's5-3',
      copyType: 'определение' as const,
      register: 'free' as const,
      text: 'We\'ll compare not probabilities but the average haul — how many points each choice brings on average.',
    },
    {
      id: 's5-4',
      copyType: 'формула' as const,
      register: 'free' as const,
      text: 'This is expected value: $E[X]=\\sum_x x\\,P(X=x)$ — each outcome weighted by its probability. Again and again the "obvious" move loses.',
    },
    {
      id: 's5-5',
      copyType: 'переход' as const,
      register: 'free' as const,
      text: 'Expectation picks the best move in this roll. But a turn has three rolls, a game has thirteen turns, and every box is closed for good.',
    },
  ],
}
