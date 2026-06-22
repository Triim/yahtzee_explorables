import { useState } from 'react'
import type { SceneModelProps, Scene } from '@/scaffolding'
import { useTr } from '@/scaffolding'
import { Die } from '@/components'
import './Multiset.css'

/* ============================================================
   Section «Counting hands» — multiset, stars & bars, multinomial.
   How many of the 7776 ordered rolls map to one hand, and why the
   252 hands are NOT equally likely (the bridge §2 → §3).
   ============================================================ */

interface Sample {
  ru: string
  en: string
  hand: number[]
}
const SAMPLES: Sample[] = [
  { ru: 'всё разные', en: 'all different', hand: [1, 2, 3, 4, 5] },
  { ru: 'пара', en: 'one pair', hand: [3, 1, 6, 1, 4] },
  { ru: 'фулл-хаус', en: 'full house', hand: [4, 4, 4, 2, 2] },
  { ru: 'пять пятёрок', en: 'five fives', hand: [5, 5, 5, 5, 5] },
]

function counts(hand: number[]): number[] {
  const c = [0, 0, 0, 0, 0, 0, 0]
  hand.forEach((v) => c[v]++)
  return c
}
function fact(k: number): number {
  let f = 1
  for (let i = 2; i <= k; i++) f *= i
  return f
}
/** Multinomial coefficient: how many ordered rolls map to this hand. */
function weight(hand: number[]): number {
  const c = counts(hand)
  let den = 1
  for (let f = 1; f <= 6; f++) den *= fact(c[f])
  return fact(5) / den
}

/** Stars-and-bars string for a hand: stars per face, bars between the six faces. */
function starsAndBars(hand: number[]): string {
  const c = counts(hand)
  return [1, 2, 3, 4, 5, 6].map((f) => '★'.repeat(c[f])).join('|')
}

/** Roll five dice many times; tally how often each sample hand comes up exactly. */
function simulateMatches(n: number): number[] {
  const keys = SAMPLES.map((s) => [...s.hand].sort((a, b) => a - b).join(''))
  const counts = [0, 0, 0, 0]
  const roll = [0, 0, 0, 0, 0]
  for (let i = 0; i < n; i++) {
    for (let d = 0; d < 5; d++) roll[d] = ((Math.random() * 6) | 0) + 1
    const key = [...roll].sort((a, b) => a - b).join('')
    const k = keys.indexOf(key)
    if (k >= 0) counts[k]++
  }
  return counts
}

export function MultisetModel({ activeBeatId, satisfyGate }: SceneModelProps) {
  const beat = activeBeatId ?? ''
  const tr = useTr()
  const [idx, setIdx] = useState(1)
  const [sim, setSim] = useState<{ n: number; counts: number[] }>({ n: 0, counts: [0, 0, 0, 0] })

  if (beat === 'MUL.4' || beat === '') {
    return <div className="mset-model mset-model--empty" />
  }

  const sample = SAMPLES[idx]
  const w = weight(sample.hand)
  const simMax = Math.max(1, ...sim.counts)
  const runSim = () => {
    const n = 60000
    setSim({ n, counts: simulateMatches(n) })
    satisfyGate?.()
  }

  return (
    <div className="mset-model">
      <div className="mset-hand">
        {sample.hand.map((v, i) => (
          <Die key={i} value={v} size={52} />
        ))}
      </div>

      {/* pattern picker (MUL.1 / MUL.3) */}
      {beat !== 'MUL.2' && (
        <div className="mset-pick">
          {SAMPLES.map((s, i) => (
            <button
              key={s.en}
              className={`mset-pick-btn ${i === idx ? 'mset-pick-btn--on' : ''}`}
              onClick={() => {
                setIdx(i)
                satisfyGate?.()
              }}
            >
              {tr(s.ru, s.en)}
            </button>
          ))}
        </div>
      )}

      {/* MUL.1 — the multinomial weight */}
      {beat === 'MUL.1' && (
        <div className="mset-weight">
          <span className="mset-weight-num">{w}</span>
          <span className="mset-weight-label">
            {w === 1 ? tr('расклад', 'ordering') : tr('раскладов из 7776', 'orderings of 7776')}
          </span>
        </div>
      )}

      {/* MUL.2 — the same hand in the stars-and-bars code (callback) */}
      {beat === 'MUL.2' && <div className="mset-stars">{starsAndBars(sample.hand)}</div>}

      {/* MUL.3 — the 252 are NOT equally likely: roll a lot and watch them diverge */}
      {beat === 'MUL.3' && (
        <>
          <button type="button" className="mset-toggle" onClick={runSim}>
            {sim.n === 0 ? tr('бросить 60 000 раз', 'roll 60,000 times') : tr('бросить ещё', 'roll again')}
          </button>
          {sim.n > 0 && (
            <div className="mset-sim">
              {SAMPLES.map((s, i) => (
                <div key={s.en} className="mset-sim-row">
                  <span className="mset-sim-label">{tr(s.ru, s.en)}</span>
                  <span className="mset-sim-track">
                    <span
                      className="mset-sim-fill"
                      style={{ width: `${(sim.counts[i] / simMax) * 100}%` }}
                    />
                  </span>
                  <span className="mset-sim-num">{sim.counts[i]}</span>
                </div>
              ))}
            </div>
          )}
          <p className="mset-note">
            {sim.n === 0
              ? tr('252 руки — но равны ли они? проверь броском', '252 hands — but are they equal? test it by rolling')
              : tr('частоты ≈ 120 : 60 : 10 : 1 — ровно веса, а не поровну', 'frequencies ≈ 120 : 60 : 10 : 1 — the weights, not equal')}
          </p>
        </>
      )}
    </div>
  )
}

export const sceneMultiset: Scene = {
  id: 'scene-multiset',
  model: MultisetModel,
  beats: [
    {
      id: 'MUL.1',
      scene: 'scene-multiset',
      prompt:
        'Мы сосчитали 252 руки. Но сколько раскладов прячется за одной рукой? Выбери руку — и посчитаем, сколькими способами её можно разложить по местам.',
      payoff:
        'Это ровно перестановки с повторами, только применённые к руке. Пять костей по пяти местам — $5! = 120$ расстановок, но одинаковые грани между собой не различить, поэтому делим на перестановки внутри каждого повтора. Получается **мультиномиальный коэффициент**:\n[[$\\dfrac{5!}{n_1!\\,n_2!\\,\\cdots\\,n_6!}$, где $n_k$ — сколько костей показали грань $k$]]\nВсё разное даёт $120$ раскладов; пара — $120/2! = 60$; фулл-хаус — $120/(3!\\,2!) = 10$; пять одинаковых — $120/5! = 1$. Пять пятёрок — ровно один расклад: как их ни переставляй, выпавшее не меняется. А вот пять единиц — это уже **другой** расклад; категория «Yahtzee» собирает все шесть таких рук, то есть 6 раскладов из 7776.',
      gate: { kind: 'choice' },
    },
    {
      id: 'MUL.2',
      scene: 'scene-multiset',
      prompt: 'Та же рука, записанная звёздами и перегородками, — узнаёшь?',
      payoff:
        'Вот она в той самой записи: звёзды — кости, перегородки — границы между гранями. Каждой из 252 рук отвечает свой ряд, и наоборот. Руки сосчитаны и разложены по полочкам — но раскладов за ними, мы только что видели, прячется разное число. А значит, пора спросить: равны ли они в шансах?',
    },
    {
      id: 'MUL.3',
      scene: 'scene-multiset',
      prompt:
        'Раз за разными руками стоит разное число раскладов — значит, и шансы должны быть разными. Не угадывай: брось много раз и посмотри, как часто выпадает каждая.',
      payoff:
        'Частоты расходятся в разы: всё-разное выпадает снова и снова, а пять пятёрок — почти никогда. Каждая рука весит ровно столько, сколько за ней раскладов: пять пятёрок — 1 из 7776, всё-разное — 120, в сто двадцать раз чаще. Сложи веса всех 252 рук — получишь обратно 7776. Та же история, что с суммой на сетке 6×6: к семёрке вело больше дорог. Поэтому **шансы считают по 7776 равновероятным раскладам**, а 252 руки — удобные ярлыки, а не равные доли.',
      gate: { kind: 'roll' },
    },
    {
      id: 'MUL.4',
      scene: 'scene-multiset',
      prompt:
        'Значит, у руки два лица: 252 состояния — чтобы думать и выбирать, 7776 раскладов — чтобы считать шансы. С этим различением и разберём, чего рука стоит. Пора к правилам Yahtzee.',
    },
  ],
}
