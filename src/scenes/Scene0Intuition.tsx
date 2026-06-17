import { useState } from 'react'
import type { SceneModelProps, Scene } from '@/scaffolding'
import './IntuitionNotebook.css'

/* Scene 0 — three intuition guesses, one per beat. The notebook shows the
 * active beat's question and records the locked-in answer; choosing satisfies
 * the beat's gate. Answers are recalled later in the article. */

type QKey = 'q1' | 'q2' | 'q3'

const QUESTIONS: Record<
  QKey,
  { beat: string; text: string; options: { value: string; label: string }[] }
> = {
  q1: {
    beat: 'B0.1',
    text: 'Sum of 7 or sum of 12 — which comes up more often?',
    options: [
      { value: '7', label: '7' },
      { value: '12', label: '12' },
      { value: 'equally', label: 'Equally' },
    ],
  },
  q2: {
    beat: 'B0.2',
    text: "A six hasn't shown in ten rolls. Its chance now is…",
    options: [
      { value: 'higher', label: 'Higher' },
      { value: 'lower', label: 'Lower' },
      { value: 'same', label: 'Same' },
    ],
  },
  q3: {
    beat: 'B0.3',
    text: 'Four sixes, one reroll left — gamble for the fifth six?',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
}

export function IntuitionNotebook({ activeStepId, satisfyGate }: SceneModelProps) {
  const [answers, setAnswers] = useState<Record<QKey, string | null>>({
    q1: null,
    q2: null,
    q3: null,
  })

  const activeKey = (Object.keys(QUESTIONS) as QKey[]).find(
    (k) => QUESTIONS[k].beat === activeStepId
  )

  const select = (key: QKey, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
    satisfyGate?.()
  }

  return (
    <div className="intuition-notebook">
      {/* The active question */}
      {activeKey && (
        <div className="intuition-question active-question">
          <p className="question-text">{QUESTIONS[activeKey].text}</p>
          <div className="button-group">
            {QUESTIONS[activeKey].options.map((opt) => (
              <button
                key={opt.value}
                className={`option-button ${
                  answers[activeKey] === opt.value ? 'selected' : ''
                }`}
                onClick={() => select(activeKey, opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Notebook of locked-in answers */}
      <div className="intuition-ledger">
        {(Object.keys(QUESTIONS) as QKey[]).map((k, i) => (
          <div
            key={k}
            className={`ledger-row ${answers[k] ? 'filled' : ''} ${
              activeKey === k ? 'current' : ''
            }`}
          >
            <span className="ledger-index">{i + 1}</span>
            <span className="ledger-value">
              {answers[k]
                ? QUESTIONS[k].options.find((o) => o.value === answers[k])?.label
                : '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export const scene0: Scene = {
  id: 'scene-0',
  model: IntuitionNotebook,
  beats: [
    {
      id: 'B0.1',
      scene: 'scene-0',
      prompt:
        "Before any math — three guesses, on instinct. First: roll two dice. Which is more common, a sum of 7 or a sum of 12?",
      payoff: "Locked in. We'll come back to it.",
      gate: { kind: 'choice' },
    },
    {
      id: 'B0.2',
      scene: 'scene-0',
      prompt:
        "Second. A six hasn't shown up in ten rolls. Is its chance of landing now higher, lower, or the same as ever?",
      payoff: 'Noted. Hold that thought.',
      gate: { kind: 'choice' },
    },
    {
      id: 'B0.3',
      scene: 'scene-0',
      prompt:
        "And third. You're holding four sixes, one reroll left. Worth the risk for that fifth six?",
      payoff:
        "All three locked. We'll return to every one — and by the end you may answer differently. Now: the simplest random object there is.",
      gate: { kind: 'choice' },
    },
  ],
}
