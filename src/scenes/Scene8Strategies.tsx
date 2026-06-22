import { useState } from 'react'
import type { SceneModelProps, Scene } from '@/scaffolding'
import { XkcdChart, useTr } from '@/scaffolding'
import { useMonteCarloWorker, type SimulationResult } from '@/engine'
import './Strategies.css'

/* Binned scores → chart.xkcd {labels, data}. Labels are thinned to round
   marks so the x-axis of a ~20-bar histogram stays readable. */
function binsToBars(m: Map<number, number>): { labels: string[]; data: number[] } {
  const entries = [...m.entries()].sort((a, b) => a[0] - b[0])
  return {
    // unique zero-width labels for the thinned bars, or chart.xkcd collapses
    // every empty label into a single stacked column
    labels: entries.map(([k], i) => (k % 60 === 0 ? String(k) : '\u200b'.repeat(i + 1))),
    data: entries.map(([, v]) => v),
  }
}

/* ============================================================
   Section 8 — Strategies and the distribution.
   Monte Carlo (in a worker): one game is noise, a thousand draw
   the bell; variance is a strategy's signature; the heavy tail
   reaches the staged 1575 maximum.
   ============================================================ */

const LABEL_RU: Record<string, string> = {
  greedy: 'жадная',
  upperFirst: 'бережёт верх',
  random: 'случайная',
}
const LABEL_EN: Record<string, string> = {
  greedy: 'greedy',
  upperFirst: 'upper first',
  random: 'random',
}

function histFromScores(scores: number[], binW = 15): Map<number, number> {
  const m = new Map<number, number>()
  scores.forEach((s) => {
    const b = Math.round(s / binW) * binW
    m.set(b, (m.get(b) ?? 0) + 1)
  })
  return m
}

/** Progress bar shown while the Monte Carlo worker grinds through many games. */
export function SimProgress({ value, tr }: { value: number; tr: (ru: string, en: string) => string }) {
  return (
    <div className="st-progress">
      <div className="st-progress-track">
        <div className="st-progress-fill" style={{ width: `${Math.round(value * 100)}%` }} />
      </div>
      <span className="st-progress-label">
        {tr('считаю партии…', 'simulating games…')} {Math.round(value * 100)}%
      </span>
    </div>
  )
}

export function StrategiesModel({ activeBeatId, satisfyGate }: SceneModelProps) {
  const beat = activeBeatId ?? ''
  const tr = useTr()
  const LABEL = tr('ru', 'en') === 'en' ? LABEL_EN : LABEL_RU
  const { simulate } = useMonteCarloWorker()
  const [res, setRes] = useState<Record<string, SimulationResult>>({})
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)

  const run = async (strats: string[], trials: number) => {
    if (busy) return
    setBusy(true)
    setProgress(0)
    try {
      const out: Record<string, SimulationResult> = {}
      for (let i = 0; i < strats.length; i++) {
        out[strats[i]] = await simulate(strats[i], trials, (done, total) =>
          setProgress((i + done / total) / strats.length)
        )
      }
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
          {busy ? tr('играю…', 'playing…') : tr('сыграй по одной партии', 'play one game each')}
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
          <p className="st-note">
            {a > b
              ? tr('сильная впереди', 'the strong one leads')
              : tr('на этот раз победила жадная — это шум', 'greedy won this time — that’s noise')}
          </p>
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
          {busy ? tr('считаю 1000…', 'computing 1000…') : tr('прогнать тысячу', 'run a thousand')}
        </button>
        {busy && <SimProgress value={progress} tr={tr} />}
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
        <p className="st-note">{tr('потолок одиночной игры — около 254,6', 'the solitaire ceiling is about 254.6')}</p>
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
            {busy ? tr('считаю…', 'computing…') : tr('собрать гистограмму', 'build the histogram')}
          </button>
        )}
        {busy && <SimProgress value={progress} tr={tr} />}
        {r && (() => {
          const { labels, data } = binsToBars(histFromScores(r.scores))
          return (
            <>
              <XkcdChart
                type="Bar"
                width={400}
                height={230}
                config={{
                  xLabel: tr('очки за партию', 'points per game'),
                  yLabel: tr('партий', 'games'),
                  data: { labels, datasets: [{ data }] },
                  options: { yTickCount: 3, dataColors: data.map(() => '#059669') },
                }}
              />
              <p className="st-note">
                {tr('центр μ ≈ ', 'center μ ≈ ')}{r.stats.mean.toFixed(0)}{tr(' — колокол, как у суммы двух кубиков', ' — a bell, like the sum of two dice')}
              </p>
            </>
          )
        })()}
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
            {busy ? tr('считаю…', 'computing…') : tr('сравнить две стратегии', 'compare two strategies')}
          </button>
        )}
        {busy && <SimProgress value={progress} tr={tr} />}
        {a && b && (() => {
          const ba = binsToBars(histFromScores(a.scores))
          const bb = binsToBars(histFromScores(b.scores))
          return (
            <>
              <XkcdChart
                type="Bar"
                width={360}
                height={160}
                className="st-hist-a"
                config={{
                  yLabel: LABEL.upperFirst,
                  data: { labels: ba.labels, datasets: [{ data: ba.data }] },
                  options: { yTickCount: 2, dataColors: ba.data.map(() => '#059669') },
                }}
              />
              <XkcdChart
                type="Bar"
                width={360}
                height={160}
                className="st-hist-b"
                config={{
                  xLabel: tr('очки', 'points'),
                  yLabel: LABEL.random,
                  data: { labels: bb.labels, datasets: [{ data: bb.data }] },
                  options: { yTickCount: 2, dataColors: bb.data.map(() => '#ef4444') },
                }}
              />
              <p className="st-note">
                {LABEL.upperFirst}: σ ≈ {a.stats.stdDev.toFixed(0)} · {LABEL.random}: σ ≈ {b.stats.stdDev.toFixed(0)} — {tr('ширина и есть дисперсия', 'the width is the variance')}
              </p>
            </>
          )
        })()}
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
          <text x={300} y={24} className="st-tail-label" style={{ fontFamily: 'var(--hand)' }}>{tr('хвост →', 'tail →')}</text>
        </svg>
      </div>
      <div className="st-demo">
        <span className="st-demo-num">1575</span>
        <span className="st-demo-eq">= 140 + 50 + 1200 + 185</span>
        <span className="st-demo-tag">{tr('показ — так не выпадает', 'demo — it doesn’t roll like this')}</span>
      </div>
      <p className="st-note">
        {tr(
          '1200 из 1575 — двенадцать бонусов по сто за повторные Yahtzee. Шанс — порядка 1 к 100 квадриллионам.',
          '1200 of 1575 — twelve hundred-point bonuses for repeated Yahtzees. The chance is on the order of 1 in 100 quadrillion.'
        )}
      </p>
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
        'Знакомая форма — колокол. Это то самое нормальное распределение, что вставало на сумме пяти костей; теперь так ложится итог целой партии. У колокола есть центр — μ, среднее.',
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
        'У каждого исхода партии теперь своя подпись (μ, σ). Но складывается она из решений на каждом ходу. Разберём, как их принимать: что проще выбросить — и куда потом эту руку девать.',
    },
  ],
}
