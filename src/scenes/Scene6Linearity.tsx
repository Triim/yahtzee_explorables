import { useState } from 'react'
import type { SceneModelProps, Scene } from '@/scaffolding'
import './Linearity.css'

/* ============================================================
   Section 6 — Sum over the game: linearity and greedy's failure.
   ============================================================ */

const OPTIMUM = 254.6

// Illustrative average contribution per row (relative bars only).
const CONTRIB: { name: string; v: number }[] = [
  { name: 'Единицы', v: 1.9 }, { name: 'Двойки', v: 5.3 }, { name: 'Тройки', v: 8.6 },
  { name: 'Четвёрки', v: 12 }, { name: 'Пятёрки', v: 15 }, { name: 'Шестёрки', v: 19 },
  { name: 'Тройка', v: 21 }, { name: 'Каре', v: 13 }, { name: 'Фулл-хаус', v: 23 },
  { name: 'Малый стрейт', v: 29 }, { name: 'Большой стрейт', v: 32 }, { name: 'Yahtzee', v: 17 },
  { name: 'Шанс', v: 23 },
]

function rollFace() {
  return ((Math.random() * 6) | 0) + 1
}
function roll5() {
  return Array.from({ length: 5 }, rollFace)
}
function countsOf(h: number[]) {
  const c = [0, 0, 0, 0, 0, 0, 0]
  h.forEach((v) => c[v]++)
  return c
}
function sum(h: number[]) {
  return h.reduce((a, b) => a + b, 0)
}
function mostFrequent(h: number[]) {
  const c = countsOf(h)
  let f = 1
  for (let i = 2; i <= 6; i++) if (c[i] > c[f]) f = i
  return f
}
// score hand for category 0..12
function scoreCat(h: number[], cat: number): number {
  const c = countsOf(h)
  if (cat < 6) return c[cat + 1] * (cat + 1)
  if (cat === 6) return c.some((x) => x >= 3) ? sum(h) : 0
  if (cat === 7) return c.some((x) => x >= 4) ? sum(h) : 0
  if (cat === 8) return c.some((x) => x === 3) && c.some((x) => x === 2) ? 25 : 0
  if (cat === 9) {
    const has = (a: number) => h.includes(a)
    const ss = (has(1) && has(2) && has(3) && has(4)) || (has(2) && has(3) && has(4) && has(5)) || (has(3) && has(4) && has(5) && has(6))
    return ss ? 30 : 0
  }
  if (cat === 10) {
    const has = (a: number) => h.includes(a)
    const ls = (has(1) && has(2) && has(3) && has(4) && has(5)) || (has(2) && has(3) && has(4) && has(5) && has(6))
    return ls ? 40 : 0
  }
  if (cat === 11) return c.some((x) => x === 5) ? 50 : 0
  return sum(h) // chance
}

function playGreedy(): number {
  const used = new Set<number>()
  let total = 0
  let upper = 0
  for (let turn = 0; turn < 13; turn++) {
    let hand = roll5()
    for (let rr = 0; rr < 2; rr++) {
      const f = mostFrequent(hand)
      hand = hand.map((v) => (v === f ? v : rollFace()))
    }
    let best = -1
    let bestScore = -1
    for (let cat = 0; cat < 13; cat++) {
      if (used.has(cat)) continue
      const s = scoreCat(hand, cat)
      if (s > bestScore) {
        bestScore = s
        best = cat
      }
    }
    used.add(best)
    total += bestScore
    if (best < 6) upper += bestScore
  }
  if (upper >= 63) total += 35
  return total
}

export function LinearityModel({ activeBeatId, satisfyGate }: SceneModelProps) {
  const beat = activeBeatId ?? ''
  const [added, setAdded] = useState(false)
  const [greedyAvg, setGreedyAvg] = useState<number | null>(null)
  const [upper, setUpper] = useState<62 | 63 | null>(null)
  const [dumped, setDumped] = useState(false)

  const maxC = Math.max(...CONTRIB.map((c) => c.v))

  if (beat === 'B6.5' || beat === 'B6.6' || beat === '') {
    return <div className="lin-model lin-model--empty" />
  }

  if (beat === 'B6.1') {
    return (
      <div className="lin-model">
        <div className="lin-contrib">
          {CONTRIB.map((c) => (
            <div className="lin-row" key={c.name}>
              <span className="lin-name">{c.name}</span>
              <div className="lin-bar-track">
                <div className="lin-bar" style={{ width: `${(c.v / maxC) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <button type="button" className="lin-btn" onClick={() => { setAdded(true); satisfyGate?.() }}>
          сложить вклады
        </button>
        {added && <p className="lin-total">средний итог ≈ {OPTIMUM}</p>}
      </div>
    )
  }

  if (beat === 'B6.2') {
    return (
      <div className="lin-model">
        <button
          type="button"
          className="lin-btn"
          onClick={() => {
            let s = 0
            const N = 400
            for (let i = 0; i < N; i++) s += playGreedy()
            setGreedyAvg(s / N)
            satisfyGate?.()
          }}
        >
          прогнать жадного (400 партий)
        </button>
        {greedyAvg !== null && (
          <div className="lin-compare">
            <div className="lin-cmp">
              <span className="lin-cmp-val">{greedyAvg.toFixed(0)}</span>
              <span className="lin-cmp-label">жадный</span>
            </div>
            <div className="lin-cmp">
              <span className="lin-cmp-val">{OPTIMUM}</span>
              <span className="lin-cmp-label">оптимум</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (beat === 'B6.3') {
    return (
      <div className="lin-model">
        <div className="lin-bonus">
          <div className="lin-bonus-num">{upper ?? '—'}</div>
          <div className={`lin-bonus-tag ${upper === 63 ? 'lin-bonus-tag--on' : ''}`}>
            бонус {upper === 63 ? '+35' : '0'}
          </div>
        </div>
        <div className="lin-bonus-btns">
          <button className="lin-btn" onClick={() => { setUpper(62); satisfyGate?.() }}>верх = 62</button>
          <button className="lin-btn" onClick={() => { setUpper(63); satisfyGate?.() }}>верх = 63</button>
        </div>
        <p className="lin-note">шестьдесят два — ноль; шестьдесят три — сразу +35. Это порог, не линейный вклад.</p>
      </div>
    )
  }

  // B6.4 — irreversibility
  return (
    <div className="lin-model">
      <button
        type="button"
        className="lin-btn"
        onClick={() => { setDumped(true); satisfyGate?.() }}
      >
        свалить отличную руку в «шанс» рано
      </button>
      {dumped && (
        <div className="lin-irrev">
          <p className="lin-irrev-line">ход 2 · «шанс» закрыт ✓</p>
          <p className="lin-irrev-line lin-irrev-late">ход 13 · пришёл Yahtzee… писать некуда → <strong>0</strong></p>
        </div>
      )}
      <p className="lin-note">записал — строка закрыта навсегда. Слот, потраченный сейчас, недоступен потом.</p>
    </div>
  )
}

export const scene6: Scene = {
  id: 'scene-6',
  model: LinearityModel,
  beats: [
    {
      id: 'B6.1',
      scene: 'scene-6',
      prompt:
        'Итог партии — сумма тринадцати строк. А среднее у суммы устроено просто: среднее суммы равно сумме средних.',
      payoff:
        '$E[\\sum X_i] = \\sum E[X_i]$ — это **линейность ожидания**, и она верна всегда, даже когда строки связаны. Отсюда напрашивается рецепт: набей каждую строку на максимум — и сумма выйдет максимальной.',
      gate: { kind: 'choice' },
    },
    {
      id: 'B6.2',
      scene: 'scene-6',
      prompt:
        'Проверим рецепт на жадном игроке: каждый ход он пишет туда, где очков больше прямо сейчас. Прогони жадного.',
      payoff:
        'Жадный систематически отстаёт от оптимума. Странно — он ведь каждый ход берёт максимум. Значит «максимум каждый ход» и «максимум за партию» — не одно и то же. Рецепт сломался; найдём, где именно.',
      gate: { kind: 'choice' },
    },
    {
      id: 'B6.3',
      scene: 'scene-6',
      prompt:
        'Первая трещина — бонус. Помнишь порог 63 в верхней секции? За него дают +35, но только целиком, ступенькой. Подведи жадного к 62 и к 63.',
      payoff:
        'Шестьдесят два — ноль бонуса; шестьдесят три — сразу +35. Это не линейный вклад, а **порог**. Поэтому верхние строки связаны: записать «шестёрки» одной шестёркой локально не страшно, а в сумме это может стоить всех тридцати пяти очков.',
      gate: { kind: 'choice' },
    },
    {
      id: 'B6.4',
      scene: 'scene-6',
      prompt:
        'Вторая трещина — строки одноразовые. Свали хорошую руку в «шанс» рано — и упрись в ноль позже.',
      payoff:
        'Записал — строка закрыта навсегда. Сбросил отличную руку в «шанс» ради быстрых очков, а под конец пришла рука на Yahtzee — и писать её некуда, кроме как в ноль. Ходы связаны во времени: слот, потраченный сейчас, недоступен потом.',
      gate: { kind: 'choice' },
    },
    {
      id: 'B6.5',
      scene: 'scene-6',
      prompt: 'Сложим обе трещины.',
      payoff:
        'Порог бонуса связывает строки, необратимость связывает ходы — значит партия не распадается на тринадцать отдельных задач, и «максимум каждый ход» не равен «максимуму за партию». **Локальный оптимум ≠ глобальный.** Чтобы выбрать ход сейчас правильно, надо знать ценность всего, что будет после.',
    },
    {
      id: 'B6.6',
      scene: 'scene-6',
      prompt:
        'Значит, у каждого положения в игре есть своя ценность — лучшее, чего из него можно добиться. Научимся её считать.',
    },
  ],
}
