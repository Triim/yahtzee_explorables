import { useState } from 'react'
import type { SceneModelProps, Scene } from '@/scaffolding'
import { useTr } from '@/scaffolding'
import './Counting.css'

/* ============================================================
   Section «Counting» — the combinatorics apparatus, built from scratch
   on balls & boxes, exactly as much as the article uses:
   product rule → permutations/factorial → combinations →
   permutations with repeats → stars & bars, and finally the 252 = C(10,5).
   Notation is earned last, never handed down. Each beat uses a DIFFERENT
   manipulation (drag sliders, seat one-by-one, tap chips, drag-and-drop
   stars, toggle a row) so the ideas feel distinct in the hand.
   ============================================================ */

const COLORS = ['#dc2626', '#2563eb', '#059669', '#d97706']

/* Four shapes drawn at one uniform size, so the product grid reads evenly
   (unicode glyphs ●▲■◆ render at very different sizes). */
function ShapeIcon({ kind, color }: { kind: number; color: string }) {
  return (
    <svg viewBox="0 0 24 24" width={28} height={28} className="cnt-shape" aria-hidden="true">
      {kind === 0 && <circle cx={12} cy={12} r={9} fill={color} />}
      {kind === 1 && <polygon points="12,3 21.5,20 2.5,20" fill={color} />}
      {kind === 2 && <rect x={3.5} y={3.5} width={17} height={17} rx={1.5} fill={color} />}
      {kind === 3 && <polygon points="12,2 22,12 12,22 2,12" fill={color} />}
    </svg>
  )
}

function factorial(n: number): number {
  let f = 1
  for (let i = 2; i <= n; i++) f *= i
  return f
}
function choose(n: number, k: number): number {
  return factorial(n) / (factorial(k) * factorial(n - k))
}

export function CountingModel({ activeBeatId, satisfyGate }: SceneModelProps) {
  const beat = activeBeatId ?? ''
  const tr = useTr()

  const [prodA, setProdA] = useState(3) // CNT.1 shapes
  const [prodB, setProdB] = useState(2) // CNT.1 colors
  const [seated, setSeated] = useState(0) // CNT.2 items seated so far
  const [chosen, setChosen] = useState<Set<number>>(new Set()) // CNT.3 pick from 5
  const [reds, setReds] = useState(3) // CNT.4 reds among 5
  const [boxes, setBoxes] = useState<number[]>([0, 0, 0, 0, 0, 0]) // CNT.5 stars per face
  const [stars10, setStars10] = useState<Set<number>>(new Set()) // CNT.6 which of 10 are stars

  if (beat === 'CNT.7' || beat === '') {
    return <div className="cnt-model cnt-model--empty" />
  }

  /* ---- CNT.1 product rule — two sliders, the grid grows live ---- */
  if (beat === 'CNT.1') {
    return (
      <div className="cnt-model">
        <div className="cnt-sliders">
          <label className="cnt-slider-row">
            <span>{prodA} {tr('фигур', 'shapes')}</span>
            <input
              type="range"
              min={2}
              max={4}
              value={prodA}
              className="cnt-slider"
              onChange={(e) => { setProdA(+e.target.value); satisfyGate?.() }}
            />
          </label>
          <label className="cnt-slider-row">
            <span>{prodB} {tr('цветов', 'colors')}</span>
            <input
              type="range"
              min={2}
              max={4}
              value={prodB}
              className="cnt-slider"
              onChange={(e) => { setProdB(+e.target.value); satisfyGate?.() }}
            />
          </label>
        </div>
        <div className="cnt-grid" style={{ gridTemplateColumns: `repeat(${prodA}, 1fr)` }}>
          {Array.from({ length: prodB }, (_, c) =>
            Array.from({ length: prodA }, (_, s) => (
              <span key={`${c}-${s}`} className="cnt-combo">
                <ShapeIcon kind={s} color={COLORS[c]} />
              </span>
            ))
          )}
        </div>
        <p className="cnt-readout">
          {prodA} × {prodB} = <strong>{prodA * prodB}</strong> {tr('вариантов', 'options')}
        </p>
      </div>
    )
  }

  /* ---- CNT.2 permutations / factorial — seat items one at a time ---- */
  if (beat === 'CNT.2') {
    const N = 5
    const candidates = Array.from({ length: N }, (_, i) => N - i) // [5,4,3,2,1]
    const place = () =>
      setSeated((s) => {
        const ns = Math.min(s + 1, N)
        if (ns === N) satisfyGate?.()
        return ns
      })
    return (
      <div className="cnt-model">
        <div className="cnt-seats">
          {Array.from({ length: N }, (_, i) => (
            <span key={i} className={`cnt-seat ${i < seated ? 'cnt-seat--on' : ''}`}>
              <span className="cnt-seat-box">{i < seated ? i + 1 : ''}</span>
              <span className="cnt-seat-cnt">{i < seated ? candidates[i] : ''}</span>
            </span>
          ))}
        </div>
        <div className="cnt-controls">
          <button type="button" className="cnt-btn" onClick={place} disabled={seated >= N}>
            {seated >= N ? tr('все на местах', 'all seated') : tr('посадить следующего', 'seat the next')}
          </button>
          {seated > 0 && (
            <button type="button" className="cnt-btn cnt-btn--ghost" onClick={() => setSeated(0)}>
              {tr('сброс', 'reset')}
            </button>
          )}
        </div>
        <p className="cnt-readout">
          {seated === 0
            ? tr('на первое место — 5 кандидатов; сажай по одному', 'first place — 5 candidates; seat them one by one')
            : seated < N
              ? `${candidates.slice(0, seated).join(' × ')} …`
              : (
                <>
                  {candidates.join(' × ')} = {N}! = <strong>{factorial(N)}</strong> {tr('перестановок', 'orderings')}
                </>
              )}
        </p>
      </div>
    )
  }

  /* ---- CNT.3 combinations — tap a subset ---- */
  if (beat === 'CNT.3') {
    const k = chosen.size
    const toggle = (i: number) =>
      setChosen((prev) => {
        const n = new Set(prev)
        if (n.has(i)) n.delete(i)
        else n.add(i)
        return n
      })
    return (
      <div className="cnt-model">
        <div className="cnt-chips">
          {[0, 1, 2, 3, 4].map((i) => (
            <button
              key={i}
              type="button"
              className={`cnt-chip ${chosen.has(i) ? 'cnt-chip--on' : ''}`}
              onClick={() => { toggle(i); satisfyGate?.() }}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <p className="cnt-readout">
          {k === 0
            ? tr('выбери несколько из пяти', 'pick some of the five')
            : (
              <>
                {tr('выбрать', 'choose')} {k} {tr('из', 'of')} 5 = {' '}
                <strong>{choose(5, k)}</strong> {tr('наборов', 'sets')}
              </>
            )}
        </p>
      </div>
    )
  }

  /* ---- CNT.4 permutations with repeats — drag the red count ---- */
  if (beat === 'CNT.4') {
    const blues = 5 - reds
    const distinct = factorial(5) / (factorial(reds) * factorial(blues))
    return (
      <div className="cnt-model">
        <label className="cnt-slider-row">
          <span>{reds} {tr('красных', 'red')} · {blues} {tr('синих', 'blue')}</span>
          <input
            type="range"
            min={1}
            max={4}
            value={reds}
            className="cnt-slider"
            onChange={(e) => { setReds(+e.target.value); satisfyGate?.() }}
          />
        </label>
        <div className="cnt-balls">
          {Array.from({ length: reds }, (_, i) => (
            <span key={`r${i}`} className="cnt-ball" style={{ background: COLORS[0] }} />
          ))}
          {Array.from({ length: blues }, (_, i) => (
            <span key={`b${i}`} className="cnt-ball" style={{ background: COLORS[1] }} />
          ))}
        </div>
        <p className="cnt-readout">
          5! / ({reds}! · {blues}!) = 120 / {factorial(reds) * factorial(blues)} ={' '}
          <strong>{distinct}</strong> {tr('различимых', 'distinct')}
        </p>
      </div>
    )
  }

  /* ---- CNT.5 stars & bars — drag stars into boxes (click is a fallback) ---- */
  if (beat === 'CNT.5') {
    const total = boxes.reduce((s, b) => s + b, 0)
    const addStar = (face: number) => {
      if (total >= 5) return
      setBoxes((prev) => {
        const n = [...prev]
        n[face] += 1
        if (n.reduce((s, b) => s + b, 0) >= 5) satisfyGate?.()
        return n
      })
    }
    const row = boxes.map((b) => '★'.repeat(b)).join('|')
    return (
      <div className="cnt-model">
        <div className="cnt-pool">
          {Array.from({ length: 5 - total }, (_, i) => (
            <span
              key={i}
              className="cnt-star-token"
              draggable
              onDragStart={(e) => e.dataTransfer.setData('text/plain', 'star')}
            >
              ★
            </span>
          ))}
        </div>
        <div className="cnt-boxes">
          {boxes.map((b, f) => (
            <button
              key={f}
              type="button"
              className="cnt-box"
              onClick={() => addStar(f)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); addStar(f) }}
            >
              <span className="cnt-box-face">{f + 1}</span>
              <span className="cnt-box-stars">
                {Array.from({ length: b }, (_, i) => (
                  <span key={i} className="cnt-star">★</span>
                ))}
              </span>
            </button>
          ))}
        </div>
        <p className="cnt-encoded">{row || '|||||'}</p>
        <p className="cnt-readout">
          {total < 5
            ? tr(
                `${total} из 5 звёзд разложено — тяни звёзды в коробки (или кликай)`,
                `${total} of 5 stars placed — drag stars into boxes (or click)`
              )
            : tr('рука ↔ один ряд из звёзд и перегородок', 'a hand ↔ one row of stars and bars')}
        </p>
        {total > 0 && (
          <button type="button" className="cnt-btn cnt-btn--ghost" onClick={() => setBoxes([0, 0, 0, 0, 0, 0])}>
            {tr('сбросить', 'reset')}
          </button>
        )}
      </div>
    )
  }

  /* ---- CNT.6 choose 5 of 10 → 252 — toggle the row ---- */
  if (beat === 'CNT.6') {
    const k = stars10.size
    const toggle = (i: number) =>
      setStars10((prev) => {
        const n = new Set(prev)
        if (n.has(i)) n.delete(i)
        else if (n.size < 5) n.add(i)
        else return prev
        return n
      })
    return (
      <div className="cnt-model">
        <div className="cnt-row10">
          {Array.from({ length: 10 }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`cnt-slot10 ${stars10.has(i) ? 'cnt-slot10--star' : 'cnt-slot10--bar'}`}
              onClick={() => { toggle(i); if (stars10.size >= 4) satisfyGate?.() }}
            >
              {stars10.has(i) ? '★' : '|'}
            </button>
          ))}
        </div>
        <p className="cnt-readout">
          {k < 5
            ? tr(`${k} из 5 звёзд выбрано — какие 5 из 10 позиций?`, `${k} of 5 stars chosen — which 5 of 10 positions?`)
            : (
              <>
                {tr('выбрать 5 из 10', 'choose 5 of 10')} ={' '}
                <strong>{choose(10, 5)}</strong> {tr('рук', 'hands')}
              </>
            )}
        </p>
      </div>
    )
  }

  return <div className="cnt-model cnt-model--empty" />
}

export const sceneCounting: Scene = {
  id: 'scene-counting',
  model: CountingModel,
  beats: [
    {
      id: 'CNT.1',
      scene: 'scene-counting',
      prompt:
        'Чтобы из 7776 добраться до 252, нужен счёт. Соберём его инструмент с нуля — на шарах и коробках. Первое правило ты уже видел: тяни число фигур и цветов.',
      payoff:
        'Каждый независимый выбор умножает число вариантов: фигура и цвет дают «фигур × цветов». Два кубика — 6×6, пять — $6^5$.\n[[правило произведения: независимые выборы перемножаются]]\nС него весь аппарат и вырастает.',
      gate: { kind: 'slider' },
    },
    {
      id: 'CNT.2',
      scene: 'scene-counting',
      prompt:
        'Сколькими способами выстроить пять разных предметов в ряд по местам? Рассаживай их по одному и смотри, сколько кандидатов на каждое место.',
      payoff:
        'На первое место — все пять кандидатов, на второе остаётся четыре, и так далее. Перемножаем убывающие числа:\n[[$5! = 5\\cdot4\\cdot3\\cdot2\\cdot1 = 120$]]\nЧисло способов упорядочить $n$ различных предметов — это **факториал** $n!$, а сами упорядочивания — **перестановки**.',
      gate: { kind: 'build' },
    },
    {
      id: 'CNT.3',
      scene: 'scene-counting',
      prompt:
        'А если порядок не важен — сколькими способами просто ВЫБРАТЬ часть из пяти? Отметь несколько.',
      payoff:
        'Выбрать 2 из 5 по порядку — это $5\\cdot4=20$ способов, но «первый-второй» и «второй-первый» дают один и тот же набор, поэтому делим на $2!$.\n[[$\\binom{5}{2} = \\dfrac{5\\cdot4}{2!} = 10$]]\nВыбор без порядка называют **сочетанием** $\\binom{n}{k}$ — «$n$ по $k$».',
      gate: { kind: 'select' },
    },
    {
      id: 'CNT.4',
      scene: 'scene-counting',
      prompt:
        'Ещё случай: часть предметов одинаковы. Поменяй местами два одинаковых шара — ничего не изменится. Тяни, сколько шаров красные.',
      payoff:
        'Пять мест дают $5! = 120$ расстановок, но перестановки одинаковых шаров между собой неразличимы. Делим на перестановки внутри каждого цвета:\n[[$\\dfrac{5!}{3!\\,2!} = \\dfrac{120}{12} = 10$]]\nЭто **перестановки с повторами**.',
      gate: { kind: 'slider' },
    },
    {
      id: 'CNT.5',
      scene: 'scene-counting',
      prompt:
        'Теперь главный приём. Рука — это сколько каких граней: перетащи пять звёзд по шести коробкам-граням.',
      payoff:
        'Запиши раскладку одним рядом: звёзды по коробкам, а между шестью коробками — пять перегородок. ★★|·|★|★|·|★ — это рука «две единицы, одна тройка, одна четвёрка, одна шестёрка».\n[[любая рука ↔ один ряд из 5 звёзд и 5 перегородок]]\nЭтот приём — **звёзды и перегородки**.',
      gate: { kind: 'place' },
    },
    {
      id: 'CNT.6',
      scene: 'scene-counting',
      prompt:
        'У ряда всегда 10 позиций: 5 звёзд и 5 перегородок. Вся рука — это просто выбор, какие 5 из 10 позиций отдать звёздам. Выбери.',
      payoff:
        'А выбор без порядка мы уже умеем считать — это сочетание:\n[[$\\binom{10}{5} = \\dfrac{10\\cdot9\\cdot8\\cdot7\\cdot6}{5!} = 252$]]\nВот откуда берётся 252 — не с потолка, а собрано руками. В общем виде «$k$ шаров по $m$ коробкам» — это $\\binom{m+k-1}{k}$, здесь $\\binom{6+5-1}{5}$.',
      gate: { kind: 'select' },
    },
    {
      id: 'CNT.7',
      scene: 'scene-counting',
      prompt:
        'Итак, 252 руки сосчитаны. Но сосчитать — не значит уравнять: за разными руками прячется разное число раскладов. Посмотрим, сколько именно.',
    },
  ],
}
