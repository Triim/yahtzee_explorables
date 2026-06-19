import { useEffect, useState } from 'react'
import type { SceneModelProps, Scene } from '@/scaffolding'
import { Die } from '@/components'
import './Rules.css'

/* ============================================================
   Section 3 — Rules of Yahtzee and the combinations.
   Each combination is introduced, highlighted in a hand, and its
   rarity (favorable hands out of 7776) shown on a scale.
   ============================================================ */

const CATEGORIES = [
  'Единицы', 'Двойки', 'Тройки', 'Четвёрки', 'Пятёрки', 'Шестёрки',
  'Тройка', 'Каре', 'Фулл-хаус', 'Малый стрейт', 'Большой стрейт', 'Yahtzee', 'Шанс',
]

function counts(hand: number[]): number[] {
  const c = [0, 0, 0, 0, 0, 0, 0]
  hand.forEach((v) => (c[v]++))
  return c
}

function randHand(): number[] {
  return Array.from({ length: 5 }, () => ((Math.random() * 6) | 0) + 1)
}

/* Probability scale: favorable hands out of 7776. */
function Scale({ items }: { items: { label: string; fav: number; pct: string }[] }) {
  const W = 320
  return (
    <div className="rules-scale">
      {items.map((it) => (
        <div className="scale-row" key={it.label}>
          <span className="scale-name">{it.label}</span>
          <svg width={W} height={16} className="scale-track">
            <rect x={0} y={3} width={W} height={10} rx={5} className="scale-bg" />
            <rect
              x={0}
              y={3}
              width={Math.max((it.fav / 1656) * W, 3)}
              height={10}
              rx={5}
              className="scale-fill"
            />
          </svg>
          <span className="scale-val">{it.fav} · {it.pct}</span>
        </div>
      ))}
    </div>
  )
}

export function RulesModel({ activeBeatId, satisfyGate }: SceneModelProps) {
  const beat = activeBeatId ?? ''
  const [hand, setHand] = useState<number[]>([3, 1, 6, 1, 4])
  const [throwing, setThrowing] = useState(false)
  const [face, setFace] = useState<number | null>(null)
  const [tripleDone, setTripleDone] = useState(false)
  const [sw, setSw] = useState(0) // small-straight window 0..2

  // cycle small-straight windows
  useEffect(() => {
    if (beat !== 'B3.7') return
    const id = window.setInterval(() => setSw((w) => (w + 1) % 3), 1200)
    return () => window.clearInterval(id)
  }, [beat])

  const roll = (after?: (h: number[]) => void) => {
    setThrowing(true)
    const h = randHand()
    setHand(h)
    window.setTimeout(() => setThrowing(false), 600)
    after?.(h)
  }

  // Demo hands for the illustrative (gate-less) beats.
  const demo: Record<string, number[]> = {
    'B3.4': [5, 5, 5, 5, 2],
    'B3.5': [4, 4, 4, 2, 2],
    'B3.6': [1, 2, 3, 4, 5],
    'B3.7': [1, 2, 3, 4, 6],
    'B3.9': [3, 1, 6, 2, 4],
  }
  const shown = demo[beat] ?? hand

  // Which dice to highlight.
  let hi = new Set<number>()
  const c = counts(shown)
  if (beat === 'B3.2' && face) shown.forEach((v, i) => v === face && hi.add(i))
  if (beat === 'B3.3') {
    const t = c.findIndex((n) => n >= 3)
    if (t > 0) shown.forEach((v, i) => v === t && hi.add(i))
  }
  if (beat === 'B3.4') {
    const t = c.findIndex((n) => n >= 4)
    if (t > 0) shown.forEach((v, i) => v === t && hi.add(i))
  }
  if (beat === 'B3.5' || beat === 'B3.6' || beat === 'B3.9') hi = new Set([0, 1, 2, 3, 4])
  if (beat === 'B3.7') {
    const lo = sw + 1
    shown.forEach((v, i) => v >= lo && v <= lo + 3 && hi.add(i))
  }
  if (beat === 'B3.8') {
    if (c.some((n) => n === 5)) hi = new Set([0, 1, 2, 3, 4])
  }

  const isDemo = beat in demo

  if (beat === 'B3.10' || beat === '') {
    return <div className="rules-model rules-model--empty" />
  }

  return (
    <div className="rules-model">
      <div className="rules-hand">
        {shown.map((v, i) => (
          <Die key={i} value={v} size={60} throwing={!isDemo && throwing} held={hi.has(i)} />
        ))}
      </div>
      {isDemo && <p className="rules-demo">пример</p>}

      {/* B3.1 — the 13-row scorecard */}
      {beat === 'B3.1' && (
        <>
          <button type="button" className="rules-btn" onClick={() => { roll(); satisfyGate?.() }}>
            бросить
          </button>
          <ol className="rules-card">
            {CATEGORIES.map((name, i) => (
              <li key={name} className={i === 5 ? 'card-divider' : ''}>{name}</li>
            ))}
          </ol>
        </>
      )}

      {/* B3.2 — upper section: pick a face */}
      {beat === 'B3.2' && (
        <>
          <div className="face-pick">
            {[1, 2, 3, 4, 5, 6].map((f) => (
              <button
                key={f}
                className={`face-btn ${face === f ? 'face-btn--on' : ''}`}
                onClick={() => { setFace(f); satisfyGate?.() }}
              >
                {f}
              </button>
            ))}
          </div>
          {face && (
            <p className="rules-readout">
              {face}-к: сумма {c[face] * face} ({c[face]} шт.)
            </p>
          )}
        </>
      )}

      {/* B3.3 — collect a triple by rerolling */}
      {beat === 'B3.3' && (
        <>
          <button
            type="button"
            className="rules-btn"
            onClick={() =>
              roll((h) => {
                if (counts(h).some((n) => n >= 3)) {
                  setTripleDone(true)
                  satisfyGate?.()
                }
              })
            }
          >
            {tripleDone ? 'тройка собрана' : 'перебросить'}
          </button>
          <Scale items={[{ label: 'тройка', fav: 1656, pct: '≈21%' }]} />
        </>
      )}

      {beat === 'B3.4' && (
        <Scale items={[
          { label: 'тройка', fav: 1656, pct: '≈21%' },
          { label: 'каре', fav: 156, pct: '≈2%' },
        ]} />
      )}
      {beat === 'B3.5' && <Scale items={[{ label: 'фулл-хаус', fav: 300, pct: '≈3,9%' }]} />}
      {beat === 'B3.6' && <Scale items={[{ label: 'большой стрейт', fav: 240, pct: '≈3,1%' }]} />}
      {beat === 'B3.7' && (
        <Scale items={[
          { label: 'большой', fav: 240, pct: '≈3,1%' },
          { label: 'малый', fav: 1200, pct: '≈15%' },
        ]} />
      )}

      {/* B3.8 — try to roll a Yahtzee */}
      {beat === 'B3.8' && (
        <>
          <button type="button" className="rules-btn" onClick={() => { roll(); satisfyGate?.() }}>
            попробуй выбросить
          </button>
          <Scale items={[{ label: 'Yahtzee', fav: 6, pct: '≈0,08%' }]} />
        </>
      )}

      {beat === 'B3.9' && (
        <p className="rules-readout">шанс: сумма {shown.reduce((a, b) => a + b, 0)} — подходит всегда</p>
      )}
    </div>
  )
}

export const scene3: Scene = {
  id: 'scene-3',
  model: RulesModel,
  beats: [
    {
      id: 'B3.1',
      scene: 'scene-3',
      prompt:
        'Чтобы у руки появилась цена, нужны правила. Брось — и посмотрим, куда это можно записать.',
      payoff:
        'Партия — это тринадцать ходов. За ход бросаешь пять кубиков и можешь дважды перебросить любые. В конце записываешь руку в одну из тринадцати строк — и она закрывается навсегда. Таблица делится надвое: верх и низ.',
      gate: { kind: 'roll', needed: 1 },
    },
    {
      id: 'B3.2',
      scene: 'scene-3',
      prompt:
        'Верх проще некуда: шесть строк — от единиц до шестёрок. В строку «шестёрки» идёт сумма всех выпавших шестёрок, и только их. Выбери грань.',
      payoff:
        'Насколько легко зацепить хоть одну шестёрку? От обратного: $P(0) = (5/6)^5 = 3125/7776$, значит хотя бы одна — $1 - 3125/7776 \\approx 0{,}60$. У верха есть награда: набери 63 — получишь +35. Откуда 63? По три кубика на грань: $3\\cdot(1+2+3+4+5+6)=63$. Запомни этот порог.',
      gate: { kind: 'choice' },
    },
    {
      id: 'B3.3',
      scene: 'scene-3',
      prompt:
        'Низ — это комбинации. Первая, самая лёгкая: три одинаковых. За неё пишут сумму всех пяти кубиков. Собери тройку.',
      payoff:
        'Часто ли три одинаковых выпадают сразу? Ровно три: $6\\cdot C(5,3)\\cdot 25 = 1500$; ровно четыре: $150$; все пять: $6$. Вместе 1656 из 7776 — около 21%, примерно каждый пятый бросок.',
      gate: { kind: 'roll', needed: 1 },
    },
    {
      id: 'B3.4',
      scene: 'scene-3',
      prompt: 'Четыре одинаковых — каре. Снова сумма всех кубиков.',
      payoff:
        'Тем же приёмом: ровно четыре $= 6\\cdot C(5,4)\\cdot 5 = 150$; плюс все пять — 6. Итого 156 из 7776, около 2%. На порядок реже тройки: один лишний совпавший кубик стоит дорого.',
    },
    {
      id: 'B3.5',
      scene: 'scene-3',
      prompt: 'Три одинаковых плюс пара — фулл-хаус, ровно 25 очков.',
      payoff:
        'Грань тройки (6) · $C(5,3)=10$ · грань пары, обязательно другая (5) $= 300$ из 7776, около 3,9%.',
    },
    {
      id: 'B3.6',
      scene: 'scene-3',
      prompt:
        'Пять подряд — большой стрейт, 40 очков. Подряд получается лишь двумя наборами: 1·2·3·4·5 или 2·3·4·5·6.',
      payoff:
        'Каждый набор раскладывается по местам $5! = 120$ способами, наборов два: 240 из 7776, около 3,1%.',
    },
    {
      id: 'B3.7',
      scene: 'scene-3',
      prompt:
        'Четыре подряд — малый стрейт, 30 очков. Тут окон уже три: 1–4, 2–5, 3–6.',
      payoff:
        'Окна пересекаются, просто сложить нельзя. По 480 на окно, но руки с пятью подряд попадают в два окна разом — их вычитаем: $3\\cdot480 - 240 = 1200$ из 7776, около 15%. Это формула включений-исключений: сложили, потом убрали двойной счёт.',
    },
    {
      id: 'B3.8',
      scene: 'scene-3',
      prompt: 'И вершина — пять одинаковых, Yahtzee, 50 очков. Попробуй собрать за ход.',
      payoff:
        'Благоприятных рук всего шесть — по одной на грань: 6 из 7776 = 1/1296, около 0,08%. Самая редкая комбинация; оттого за неё 50 очков и особый бонус +100 за каждый повтор.',
      gate: { kind: 'roll', needed: 1 },
    },
    {
      id: 'B3.9',
      scene: 'scene-3',
      prompt: 'Последняя строка — шанс. Никаких условий: пиши сумму чего угодно.',
      payoff:
        'Её вероятность — единица, она подходит всегда. Это страховка: сюда сбрасывают руку, из которой больше ничего не выжать.',
    },
    {
      id: 'B3.10',
      scene: 'scene-3',
      prompt:
        'Теперь у каждой руки есть цена. Но всё это — с одного броска. А бросков три, и между ними можно перебрасывать. Что выпадет, если часть кубиков оставить?',
    },
  ],
}
