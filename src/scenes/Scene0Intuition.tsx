import { useState } from 'react'
import type { SceneModelProps } from '@/scaffolding'
import './IntuitionNotebook.css'

interface Answer {
  q1: string | null // 7 vs 12
  q2: string | null // gambler's fallacy
  q3: string | null // yahtzee decision
}

export function IntuitionNotebook(_props: SceneModelProps) {
  const [answers, setAnswers] = useState<Answer>({
    q1: null,
    q2: null,
    q3: null,
  })

  const selectAnswer = (question: keyof Answer, value: string) => {
    setAnswers((prev) => ({ ...prev, [question]: value }))
  }

  const answeredCount = Object.values(answers).filter((a) => a !== null).length

  return (
    <div className="intuition-notebook">
      <h2>Three Quick Guesses</h2>

      <div className="intuition-question">
        <p className="question-text">
          You roll two dice. Which comes up more often: a sum of <strong>7</strong> or a sum of <strong>12</strong>?
        </p>
        <div className="button-group">
          {['7', '12', 'equally'].map((option) => (
            <button
              key={option}
              className={`option-button ${
                answers.q1 === option ? 'selected' : ''
              }`}
              onClick={() => selectAnswer('q1', option)}
            >
              {option === '7' && '7'}
              {option === '12' && '12'}
              {option === 'equally' && 'Equally'}
            </button>
          ))}
        </div>
      </div>

      <div className="intuition-question">
        <p className="question-text">
          A six hasn't shown up in ten rolls. Is its chance of landing now higher, lower, or the same as ever?
        </p>
        <div className="button-group">
          {['higher', 'lower', 'same'].map((option) => (
            <button
              key={option}
              className={`option-button ${
                answers.q2 === option ? 'selected' : ''
              }`}
              onClick={() => selectAnswer('q2', option)}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="intuition-question">
        <p className="question-text">
          You're holding four sixes; the fifth die shows something else, and you have one reroll left. Worth the risk for that fifth six?
        </p>
        <div className="button-group">
          {['yes', 'no'].map((option) => (
            <button
              key={option}
              className={`option-button ${
                answers.q3 === option ? 'selected' : ''
              }`}
              onClick={() => selectAnswer('q3', option)}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="intuition-footer">
        <p className="progress-text">
          Answered {answeredCount} of 3
        </p>
        {answeredCount === 3 && (
          <p className="confirm-text">✓ Answers locked. We'll return to these.</p>
        )}
      </div>
    </div>
  )
}

export const scene0 = {
  id: 'scene-0',
  model: IntuitionNotebook,
  steps: [
    {
      id: 's0-1',
      copyType: 'вопрос' as const,
      register: 'free' as const,
      directive: { kind: 'activate' as const, model: 'intuition' },
      text: 'Let\'s not start with math. Let\'s start with three guesses — answer on instinct, we\'ll check them later. You roll two dice. Which comes up more often: a sum of **7** or a sum of **12**?',
    },
    {
      id: 's0-2',
      copyType: 'вопрос' as const,
      register: 'free' as const,
      text: 'Second. A six hasn\'t shown up in ten rolls. Is its chance of landing now higher, lower, or the same as ever?',
    },
    {
      id: 's0-3',
      copyType: 'вопрос' as const,
      register: 'free' as const,
      text: 'And third. You\'re holding four sixes; the fifth die shows something else, and you have one reroll left. Worth the risk for that fifth six?',
    },
    {
      id: 's0-4',
      copyType: 'переход' as const,
      register: 'free' as const,
      text: 'Got your answers? Good. We\'ll come back to every one of them — and by the end you may answer differently. For now, let\'s pick up the simplest random object there is and see what it can do.',
    },
  ],
}
