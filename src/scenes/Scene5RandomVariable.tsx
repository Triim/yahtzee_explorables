import { useState } from 'react'
import type { SceneModelProps, Scene } from '@/scaffolding'
import { Die } from '@/components'
import './RandomVariable.css'

/* ============================================================
   Section 5 — Random variable and expectation.
   One hand scores differently per row; expectation picks the
   best move for a single roll.
   ============================================================ */

function counts(hand: number[]): number[] {
  const c = [0, 0, 0, 0, 0, 0, 0]
  hand.forEach((v) => c[v]++)
  return c
}
function sum(hand: number[]): number {
  return hand.reduce((a, b) => a + b, 0)
}

const ROWS: { name: string; score: (h: number[]) => number }[] = [
  { name: 'Единицы', score: (h) => counts(h)[1] * 1 },
  { name: 'Двойки', score: (h) => counts(h)[2] * 2 },
  { name: 'Тройки', score: (h) => counts(h)[3] * 3 },
  { name: 'Четвёрки', score: (h) => counts(h)[4] * 4 },
  { name: 'Пятёрки', score: (h) => counts(h)[5] * 5 },
  { name: 'Шестёрки', score: (h) => counts(h)[6] * 6 },
  { name: 'Тройка', score: (h) => (counts(h).some((c) => c >= 3) ? sum(h) : 0) },
  { name: 'Каре', score: (h) => (counts(h).some((c) => c >= 4) ? sum(h) : 0) },
  { name: 'Фулл-хаус', score: (h) => (counts(h).some((c) => c === 3) && counts(h).some((c) => c === 2) ? 25 : 0) },
  { name: 'Шанс', score: (h) => sum(h) },
]

function PathCard({
  title,
  value,
  sub,
  on,
  onClick,
}: {
  title: string
  value: string
  sub: string
  on: boolean
  onClick: () => void
}) {
  return (
    <button className={`rv-path ${on ? 'rv-path--on' : ''}`} onClick={onClick}>
      <span className="rv-path-title">{title}</span>
      <span className="rv-path-value">{value}</span>
      <span className="rv-path-sub">{sub}</span>
    </button>
  )
}

export function RandomVariableModel({ activeBeatId, satisfyGate }: SceneModelProps) {
  const beat = activeBeatId ?? ''
  const [written, setWritten] = useState<Set<number>>(new Set())
  const [path, setPath] = useState<'now' | 'reroll' | null>(null)

  const HANDS: Record<string, number[]> = {
    'B5.1': [4, 4, 4, 2, 1],
    'B5.2': [4, 4, 4, 2, 1],
    'B5.3': [6, 6, 2, 3, 4],
  }
  const hand = HANDS[beat] ?? [4, 4, 4, 2, 1]

  if (beat === 'B5.5' || beat === '') {
    return <div className="rv-model rv-model--empty" />
  }

  if (beat === 'B5.4') {
    return (
      <div className="rv-model">
        <div className="rv-formula-big">E[X] = Σ x · P(x)</div>
        <p className="rv-note">каждый исход, умноженный на свою вероятность — средняя добыча хода</p>
      </div>
    )
  }

  return (
    <div className="rv-model">
      <div className="rv-hand">
        {hand.map((v, i) => (
          <Die key={i} value={v} size={56} />
        ))}
      </div>

      {beat === 'B5.1' && (
        <ol className="rv-card">
          {ROWS.map((row, i) => (
            <li key={row.name}>
              <button
                className={`rv-row ${written.has(i) ? 'rv-row--on' : ''}`}
                onClick={() => {
                  setWritten((w) => {
                    const n = new Set(w)
                    n.add(i)
                    if (n.size >= 2) satisfyGate?.()
                    return n
                  })
                }}
              >
                <span>{row.name}</span>
                <span className="rv-row-score">{row.score(hand)}</span>
              </button>
            </li>
          ))}
        </ol>
      )}

      {beat === 'B5.2' && (
        <div className="rv-paths">
          <PathCard
            title="писать тройку сейчас"
            value="15"
            sub="4+4+4+2+1 наверняка"
            on={path === 'now'}
            onClick={() => { setPath('now'); satisfyGate?.() }}
          />
          <PathCard
            title="перебросить 2 и 1"
            value="≈ 19"
            sub="12 + в среднем 7 (2 × 3,5)"
            on={path === 'reroll'}
            onClick={() => { setPath('reroll'); satisfyGate?.() }}
          />
        </div>
      )}

      {beat === 'B5.3' && (
        <div className="rv-paths">
          <PathCard
            title="записать «шестёрки»"
            value="12"
            sub="две шестёрки наверняка"
            on={path === 'now'}
            onClick={() => { setPath('now'); satisfyGate?.() }}
          />
          <PathCard
            title="к стрейту 2·3·4"
            value="≈ 17"
            sub="0,56 · 30 за переброс, и их два"
            on={path === 'reroll'}
            onClick={() => { setPath('reroll'); satisfyGate?.() }}
          />
        </div>
      )}
    </div>
  )
}

export const scene5: Scene = {
  id: 'scene-5',
  model: RandomVariableModel,
  beats: [
    {
      id: 'B5.1',
      scene: 'scene-5',
      prompt:
        'Каждая рука превращается в очки по правилу строки. Запиши одну и ту же руку в разные строки — и очки выйдут разные.',
      payoff:
        'Очки — это функция от руки и строки: $\\text{score} = f(\\text{рука}, \\text{строка})$. А пока ты ещё не бросил, рука случайна — и будущие очки тоже: это число, которое зависит от того, что выпадет. Такую величину называют **случайной**.',
      gate: { kind: 'choice' },
    },
    {
      id: 'B5.2',
      scene: 'scene-5',
      prompt:
        'На руках 4·4·4·2·1 — три четвёрки. Записать тройку сейчас или перебросить два младших кубика?',
      payoff:
        'Тройку ты не теряешь — три четвёрки остаются, весь вопрос в сумме. Сейчас 15. Перебросишь 2 и 1 — каждый кубик в среднем даёт 3,5, два — 7. Держишь 12, добавляешь 7 → 19. Девятнадцать в среднем против пятнадцати наверняка, и сверху шанс на четвёртую четвёрку. Перебрасывать выгоднее.',
      gate: { kind: 'choice' },
    },
    {
      id: 'B5.3',
      scene: 'scene-5',
      prompt:
        'Ловушка. Рука 6·6·2·3·4. Тянет записать «шестёрки», 12 очков. Лучший ли это ход? Посмотри второй вариант.',
      payoff:
        'Двенадцать выглядят солидно. Но 2·3·4 — три подряд, до малого стрейта не хватает одного кубика. Перебрось две шестёрки: поймать единицу или пятёрку — $1 - (4/6)^2 \\approx 0{,}56$, это уже $0{,}56\\cdot30 \\approx 17$, больше двенадцати, — а перебросов два, и маячит большой стрейт в 40. Глаз цепляется за крупные кубики; число смотрит на всю руку.',
      gate: { kind: 'choice' },
    },
    {
      id: 'B5.4',
      scene: 'scene-5',
      prompt: 'То, что мы оба раза считали, и есть ответ на вопрос «что выгоднее».',
      payoff:
        '**Математическое ожидание**: $E[X] = \\sum x\\cdot P(x)$ — каждый исход, умноженный на свою вероятность, всё сложено. Это средняя добыча хода. Но ожидание выбирает лучший ход в одном броске. А партия — тринадцать ходов, и каждая строка закрывается навсегда. Достаточно ли смотреть на один ход?',
    },
    {
      id: 'B5.5',
      scene: 'scene-5',
      prompt:
        'Лучший ход сейчас и лучший ход для всей партии — не одно и то же. Посмотрим, где они расходятся.',
    },
  ],
}
