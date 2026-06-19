import { useState } from 'react'
import type { SceneModelProps, Scene } from '@/scaffolding'
import { useMonteCarloWorker, type SimulationResult } from '@/engine'
import { Histogram } from '@/components'
import './Strategies.css'

/* ============================================================
   Section 8 — Strategies and the distribution.
   Monte Carlo (in a worker): one game is noise, a thousand draw
   the bell; variance is a strategy's signature; the heavy tail
   reaches the staged 1575 maximum.
   ============================================================ */

const LABEL: Record<string, string> = {
  greedy: 'жадная',
  upperFirst: 'бережёт верх',
  random: 'случайная',
}

function histFromScores(scores: number[], binW = 15): Map<number, number> {
  const m = new Map<number, number>()
  scores.forEach((s) => {
    const b = Math.round(s / binW) * binW
    m.set(b, (m.get(b) ?? 0) + 1)
  })
  return m
}

export function StrategiesModel({ activeBeatId, satisfyGate }: SceneModelProps) {
  const beat = activeBeatId ?? ''
  const { simulate } = useMonteCarloWorker()
  const [res, setRes] = useState<Record<string, SimulationResult>>({})
  const [busy, setBusy] = useState(false)

  const run = async (strats: string[], trials: number) => {
    if (busy) return
    setBusy(true)
    try {
      const out: Record<string, SimulationResult> = {}
      for (const s of strats) out[s] = await simulate(s, trials)
      setRes((r) => ({ ...r, ...out }))
      satisfyGate?.()
    } finally {
      setBusy(false)
    }
  }

  if (beat === 'B8.6' || beat === '') {
    return <div className="st-model st-model--empty" />
  }

  // B8.1 — one game each
  if (beat === 'B8.1') {
    const a = res['upperFirst']?.scores[0]
    const b = res['greedy']?.scores[0]
    return (
      <div className="st-model">
        <button className="st-btn" disabled={busy} onClick={() => run(['upperFirst', 'greedy'], 1)}>
          {busy ? 'играю…' : 'сыграй по одной партии'}
        </button>
        {a !== undefined && b !== undefined && (
          <div className="st-duel">
            <div className="st-duel-side">
              <span className="st-duel-num">{a}</span>
              <span className="st-duel-name">{LABEL.upperFirst}</span>
            </div>
            <span className="st-vs">vs</span>
            <div className="st-duel-side">
              <span className="st-duel-num">{b}</span>
              <span className="st-duel-name">{LABEL.greedy}</span>
            </div>
          </div>
        )}
        {a !== undefined && b !== undefined && (
          <p className="st-note">{a > b ? 'сильная впереди' : 'на этот раз победила жадная — это шум'}</p>
        )}
      </div>
    )
  }

  // B8.2 — a thousand each, means settle
  if (beat === 'B8.2') {
    const a = res['upperFirst']?.stats
    const b = res['greedy']?.stats
    return (
      <div className="st-model">
        <button className="st-btn" disabled={busy} onClick={() => run(['upperFirst', 'greedy'], 1000)}>
          {busy ? 'считаю 1000…' : 'прогнать тысячу'}
        </button>
        {a && b && (
          <div className="st-means">
            <div className="st-mean">
              <span className="st-mean-num">{a.mean.toFixed(0)}</span>
              <span className="st-mean-name">{LABEL.upperFirst}</span>
            </div>
            <div className="st-mean">
              <span className="st-mean-num">{b.mean.toFixed(0)}</span>
              <span className="st-mean-name">{LABEL.greedy}</span>
            </div>
          </div>
        )}
        <p className="st-note">потолок одиночной игры — около 254,6</p>
      </div>
    )
  }

  // B8.3 — the bell
  if (beat === 'B8.3') {
    const r = res['upperFirst']
    return (
      <div className="st-model">
        {!r && (
          <button className="st-btn" disabled={busy} onClick={() => run(['upperFirst'], 2000)}>
            {busy ? 'считаю…' : 'собрать гистограмму'}
          </button>
        )}
        {r && (
          <>
            <Histogram data={histFromScores(r.scores)} width={360} height={210} xLabel="очки за партию" yLabel="партий" />
            <p className="st-note">центр μ ≈ {r.stats.mean.toFixed(0)} — колокол, как у суммы двух кубиков</p>
          </>
        )}
      </div>
    )
  }

  // B8.4 — variance as a signature
  if (beat === 'B8.4') {
    const a = res['upperFirst']
    const b = res['random']
    return (
      <div className="st-model">
        {!(a && b) && (
          <button className="st-btn" disabled={busy} onClick={() => run(['upperFirst', 'random'], 2000)}>
            {busy ? 'считаю…' : 'сравнить две стратегии'}
          </button>
        )}
        {a && b && (
          <>
            <Histogram data={histFromScores(a.scores)} width={340} height={150} xLabel="" yLabel="" className="st-hist-a" />
            <Histogram data={histFromScores(b.scores)} width={340} height={150} xLabel="очки" yLabel="" className="st-hist-b" />
            <p className="st-note">
              {LABEL.upperFirst}: σ ≈ {a.stats.stdDev.toFixed(0)} · {LABEL.random}: σ ≈ {b.stats.stdDev.toFixed(0)} — ширина и есть дисперсия
            </p>
          </>
        )}
      </div>
    )
  }

  // B8.5 — heavy tail and the staged 1575
  return (
    <div className="st-model">
      <div className="st-tail">
        <svg width={340} height={120} role="img">
          <path d="M10,100 C70,20 110,15 150,30 C200,50 240,92 330,98" className="st-tail-curve" fill="none" />
          <line x1={330} y1={10} x2={330} y2={110} className="st-tail-mark" />
          <text x={300} y={24} className="st-tail-label">хвост →</text>
        </svg>
      </div>
      <div className="st-demo">
        <span className="st-demo-num">1575</span>
        <span className="st-demo-eq">= 140 + 50 + 1200 + 185</span>
        <span className="st-demo-tag">показ — так не выпадает</span>
      </div>
      <p className="st-note">1200 из 1575 — двенадцать бонусов по сто за повторные Yahtzee. Шанс — порядка 1 к 100 квадриллионам.</p>
    </div>
  )
}

export const scene8: Scene = {
  id: 'scene-8',
  model: StrategiesModel,
  beats: [
    {
      id: 'B8.1',
      scene: 'scene-8',
      prompt:
        'У нас есть идеальная стратегия и её среднее, 254,6. Но сыграй одну сильную партию против одной жадной — и иногда выигрывает жадная. Сыграй.',
      payoff:
        'Одна партия почти ничего не говорит: случай громче стратегии. Чтобы увидеть, кто сильнее на самом деле, играть надо не раз, а тысячу раз.',
      gate: { kind: 'choice' },
    },
    {
      id: 'B8.2',
      scene: 'scene-8',
      prompt: 'Прогони обе стратегии по тысяче партий и следи за их средним.',
      payoff:
        'Средние перестают скакать и встают на свои места — сильная выше. Это снова закон больших чисел, только теперь как рабочий инструмент: считать не формулой, а прогоном множества случайных партий. Такой приём называют **методом Монте-Карло**.',
      gate: { kind: 'choice' },
    },
    {
      id: 'B8.3',
      scene: 'scene-8',
      prompt: 'Сложи итоги тысяч партий в гистограмму.',
      payoff:
        'Знакомая форма — колокол. Это то самое **нормальное распределение**, что мы видели на сумме двух кубиков в Разделе 1; теперь так ложится итог целой партии. У колокола есть центр — μ, среднее.',
    },
    {
      id: 'B8.4',
      scene: 'scene-8',
      prompt: 'Возьми две стратегии с разным характером. Сравни их.',
      payoff:
        'Ширина разная: одна держится кучно у среднего, другая широко разбрасывает. Эту меру разброса называют **дисперсией** (а её корень — σ). Теперь у стратегии не одна цифра, а две: где центр (μ) и насколько широко (σ). Это её подпись.',
      gate: { kind: 'choice' },
    },
    {
      id: 'B8.5',
      scene: 'scene-8',
      prompt: 'Но колокол — это идеализация. Посмотри на правый край.',
      payoff:
        'Справа итог тянется длинным хвостом — дальше, чем позволил бы ровный колокол. Тянут его бонусы за Yahtzee, +100 за каждый повтор. Самый край — тринадцать Yahtzee подряд, максимум 1575. *(Это показ, а не твой бросок.)* Почти весь максимум, 1200 из 1575, — двенадцать бонусов по сто.',
    },
    {
      id: 'B8.6',
      scene: 'scene-8',
      prompt:
        'У каждой стратегии теперь своя подпись (μ, σ). Но какая из них лучшая — и вообще, лучшая для чего?',
    },
  ],
}
