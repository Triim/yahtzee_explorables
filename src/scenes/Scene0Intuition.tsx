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
    text: 'Сумма 7 или сумма 12 — что выпадает чаще?',
    options: [
      { value: '7', label: '7' },
      { value: '12', label: '12' },
      { value: 'equally', label: 'Одинаково' },
    ],
  },
  q2: {
    beat: 'B0.2',
    text: 'Шестёрка не выпадала десять бросков. Её шанс сейчас…',
    options: [
      { value: 'higher', label: 'Выше' },
      { value: 'lower', label: 'Ниже' },
      { value: 'same', label: 'Тот же' },
    ],
  },
  q3: {
    beat: 'B0.3',
    text: 'Четыре шестёрки, один переброс. Рискнуть ради пятой?',
    options: [
      { value: 'yes', label: 'Да' },
      { value: 'no', label: 'Нет' },
    ],
  },
}

export function IntuitionNotebook({ activeBeatId, satisfyGate }: SceneModelProps) {
  const [answers, setAnswers] = useState<Record<QKey, string | null>>({
    q1: null,
    q2: null,
    q3: null,
  })

  const activeKey = (Object.keys(QUESTIONS) as QKey[]).find(
    (k) => QUESTIONS[k].beat === activeBeatId
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
        'Прежде чем погрузиться в математику — три быстрых вопроса на интуицию. Первый: бросаем две кости. Что выпадает чаще, сумма 7 или 12?',
      payoff: 'Ответ зафиксирован. Мы к нему ещё вернёмся.',
      gate: { kind: 'choice' },
    },
    {
      id: 'B0.2',
      scene: 'scene-0',
      prompt:
        'Второй. Шестёрка не выпадала уже десять бросков. Её шанс выпасть сейчас выше, ниже или такой же, как всегда?',
      payoff: 'Принято. Запомним этот ответ.',
      gate: { kind: 'choice' },
    },
    {
      id: 'B0.3',
      scene: 'scene-0',
      prompt:
        'И третий. У вас на руках четыре шестёрки и остался один переброс. Стоит ли рисковать ради пятой шестёрки?',
      payoff:
        'Все три ответа заперты. Мы вернёмся к каждому из них — и, возможно, к концу статьи вы ответите иначе. А теперь — к простейшему из случайных объектов.',
      gate: { kind: 'choice' },
    },
  ],
}
