import { useState } from 'react'
import type { SceneModelProps, Scene } from '@/scaffolding'
import { useTr } from '@/scaffolding'
import { Die } from '@/components'
import './RandomVariable.css'

const ROW_NAMES_EN = [
  'Ones', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes',
  'Three of a kind', 'Four of a kind', 'Full house', 'Chance',
]

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
  const tr = useTr()
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
        <p className="rv-note">
          {tr(
            'каждый исход, умноженный на свою вероятность — средняя добыча хода',
            'each outcome times its probability — the average haul of a turn'
          )}
        </p>
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
                <span>{tr(row.name, ROW_NAMES_EN[i])}</span>
                <span className="rv-row-score">{row.score(hand)}</span>
              </button>
            </li>
          ))}
        </ol>
      )}

      {beat === 'B5.2' && (
        <div className="rv-paths">
          <PathCard
            title={tr('писать тройку сейчас', 'score the triple now')}
            value="15"
            sub={tr('4+4+4+2+1 наверняка', '4+4+4+2+1 for sure')}
            on={path === 'now'}
            onClick={() => { setPath('now'); satisfyGate?.() }}
          />
          <PathCard
            title={tr('перебросить 2 и 1', 'reroll the 2 and 1')}
            value="≈ 19"
            sub={tr('12 + в среднем 7 (2 × 3,5)', '12 + 7 on average (2 × 3.5)')}
            on={path === 'reroll'}
            onClick={() => { setPath('reroll'); satisfyGate?.() }}
          />
        </div>
      )}

      {beat === 'B5.3' && (
        <div className="rv-paths">
          <PathCard
            title={tr('держать 6·6 → каре', 'keep 6·6 → four of a kind')}
            value="≈ 13"
            sub={tr('каре редко — чаще останешься с 12 за шестёрки', 'four of a kind is rare — usually you keep 12 for sixes')}
            on={path === 'now'}
            onClick={() => { setPath('now'); satisfyGate?.() }}
          />
          <PathCard
            title={tr('держать 2·3·4 → стрейт', 'keep 2·3·4 → straight')}
            value="≈ 17"
            sub={tr('≈0,56 на малый стрейт 30 за переброс, и их два', '≈0.56 for a small straight 30 per reroll, and there are two')}
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
        'Та же рука 4·4·4·2·1 стоит по-разному в разных строках. Нажми на несколько строк в таблице — увидишь, какие очки она даёт в каждой.',
      payoff:
        'Очки — это функция от руки и строки: $\\text{score} = f(\\text{рука}, \\text{строка})$. А пока ты ещё не бросил, рука случайна — и будущие очки тоже: это число, которое зависит от того, что выпадет. Такую величину называют **случайной**.',
      gate: { kind: 'select' },
    },
    {
      id: 'B5.2',
      scene: 'scene-5',
      prompt:
        'На руках 4·4·4·2·1 — три четвёрки. Записать тройку сейчас или перебросить два младших кубика? Сравни два пути.',
      payoff:
        'Тройку ты не теряешь в любом случае — три четвёрки остаются, весь вопрос в сумме. Считаем по шагам:\n[[сейчас: $4+4+4+2+1 = 15$ наверняка]]\n[[переброс: держишь $12$, два кубика в среднем дают $2\\cdot3{,}5 = 7$ → $12 + 7 = 19$]]\nДевятнадцать в среднем против пятнадцати наверняка — и сверху ещё шанс на четвёртую четвёрку. Перебрасывать выгоднее.',
      gate: { kind: 'pick' },
    },
    {
      id: 'B5.3',
      scene: 'scene-5',
      prompt:
        'Та же развилка 6·6·2·3·4, но теперь — по деньгам. Что выгоднее оставлять: пару шестёрок под каре или 2·3·4 под большой стрейт? Сравни ценности.',
      payoff:
        'Глаз цепляется за крупные шестёрки, но каре из них — редкость: чаще удержишь лишь 12 за «шестёрки», и вся затея стоит около 13. А 2·3·4 — три подряд, до малого стрейта не хватает одного кубика:\n[[поймать единицу или пятёрку: $1 - (4/6)^2 \\approx 0{,}56$]]\n[[$0{,}56\\cdot30 \\approx 17$ за переброс, а перебросов два, и маячит большой стрейт на 40]]\nОставлять стоит 2·3·4, а не шестёрки. Глаз цепляется за крупные кубики; ценность смотрит на всю руку.',
      gate: { kind: 'pick' },
    },
    {
      id: 'B5.4',
      scene: 'scene-5',
      prompt: 'То, что мы оба раза считали, и есть ответ на вопрос «что выгоднее».',
      payoff:
        'Это **математическое ожидание** — каждый исход, умноженный на свою вероятность, и всё сложено:\n[[$E[X] = \\sum x\\cdot P(x)$]]\nПростейший пример — цена одной кости: каждая грань 1…6 выпадает с долей $1/6$, складываем $x\\cdot P(x)$:\n[[$1\\cdot\\tfrac16 + 2\\cdot\\tfrac16 + \\dots + 6\\cdot\\tfrac16 = \\dfrac{1+2+3+4+5+6}{6} = 3{,}5$]]\nИменно эти $3{,}5$ за кубик мы и подставляли в перебросах. А когда взвешивали холды, считали $E[\\text{очки}\\mid\\text{оставленные}]$ — **условное ожидание**, и оно движет выбором. Но ожидание выбирает лучший ход в одном броске. А партия — тринадцать ходов, и каждая строка закрывается навсегда. Достаточно ли смотреть на один ход?',
    },
    {
      id: 'B5.5',
      scene: 'scene-5',
      prompt:
        'Лучший ход сейчас и лучший ход для всей партии — не одно и то же. Посмотрим, где они расходятся.',
    },
  ],
}
