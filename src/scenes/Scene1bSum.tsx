import { useEffect, useState } from 'react'
import type { SceneModelProps, Scene } from '@/scaffolding'
import { Formula, XkcdChart, useTr } from '@/scaffolding'
import './SumDice.css'

/* ============================================================
   Section «Sum of the dice» — convolution / generating functions.
   The sum distribution of n dice, built up one die at a time, is an
   exact convolution; its shape tends to a bell (CLT). Distributions are
   drawn through the shared XkcdChart so the whole article stays one style.
   ============================================================ */

const ACCENT = '#059669'

/** Exact distribution of the sum of n dice (convolution of the uniform die),
    indexed by sum value. */
function sumDist(n: number): number[] {
  let cur = [0, 1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6]
  for (let k = 2; k <= n; k++) {
    const next = new Array(cur.length + 6).fill(0)
    for (let s = 0; s < cur.length; s++) {
      if (cur[s] > 0) for (let f = 1; f <= 6; f++) next[s + f] += cur[s] / 6
    }
    cur = next
  }
  return cur
}

/** {labels, data} for XkcdChart. For wide ranges the labels are thinned to
   multiples of five (others become a UNIQUE zero-width string so chart.xkcd
   doesn't collapse equal labels into one bar) — that keeps the x-axis legible. */
function sumBars(n: number): { labels: string[]; data: number[] } {
  const dist = sumDist(n)
  const lo = n
  const hi = 6 * n
  const labels: string[] = []
  const data: number[] = []
  const dense = hi - lo > 13
  const ZW = String.fromCharCode(0x200b) // zero-width space: unique blank labels
  for (let s = lo; s <= hi; s++) {
    labels.push(dense ? (s % 5 === 0 ? String(s) : ZW.repeat(s)) : String(s))
    data.push(+(dist[s] * 100).toFixed(1))
  }
  return { labels, data }
}

/* ---- convolution, made tactile: release one source column at a time and watch
   it rain into six shifted copies that stack into the next distribution ---- */
function ConvolutionViz({
  tr,
  onFirstDie,
}: {
  tr: (ru: string, en: string) => string
  onFirstDie: () => void
}) {
  const [n, setN] = useState(1)
  const [spread, setSpread] = useState(0)

  const src = sumDist(n)
  const sLo = n
  const sHi = 6 * n
  const L = sHi - sLo + 1
  const tLo = n + 1
  const tHi = 6 * (n + 1)
  const tgt = sumDist(n + 1)

  const dLo = sLo
  const dHi = tHi
  const W = 480
  const padL = 14
  const padR = 14
  const padT = 8
  const PH = 104
  const gap = 40
  const innerW = W - padL - padR
  const nCols = dHi - dLo + 1
  const step = innerW / nCols
  const barW = Math.min(step * 0.66, 22)
  const cx = (s: number) => padL + (s - dLo + 0.5) * step
  const topBase = padT + PH
  const botTop = topBase + gap
  const botBase = botTop + PH
  const H = botBase + 22

  const srcMax = Math.max(...src.slice(sLo, sHi + 1))
  const tgtMax = Math.max(...tgt.slice(tLo, tHi + 1))
  const topH = (p: number) => (p / srcMax) * PH
  const segH = (contrib: number) => (contrib / tgtMax) * PH

  const done = spread >= L
  const sActive = sLo + spread

  const next = () => {
    if (!done) {
      const ns = spread + 1
      setSpread(ns)
      if (ns === L && n === 1) onFirstDie()
    } else if (n < 2) {
      setN(n + 1)
      setSpread(0)
    }
  }

  // contributing sources for a target sum t, in increasing order (for stable stacking)
  const sourcesFor = (t: number) => {
    const out: number[] = []
    for (let sp = t - 6; sp <= t - 1; sp++) if (sp >= sLo && sp <= sHi) out.push(sp)
    return out
  }

  return (
    <div className="conv-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="conv-chart" role="img" style={{ maxWidth: '100%' }}>
        {/* top: source distribution */}
        {Array.from({ length: L }, (_, i) => {
          const s = sLo + i
          const cls = i < spread ? 'conv-src--spent' : i === spread ? 'conv-src--active' : ''
          return (
            <rect
              key={s}
              x={cx(s) - barW / 2}
              y={topBase - topH(src[s])}
              width={barW}
              height={topH(src[s])}
              rx={2}
              className={`conv-src ${cls}`}
            />
          )
        })}

        {/* bottom: target columns, stacked from released source contributions */}
        {Array.from({ length: tHi - tLo + 1 }, (_, i) => {
          const t = tLo + i
          let yAcc = botBase
          const rects = sourcesFor(t).map((sp) => {
            const idx = sp - sLo
            if (idx > spread) return null
            const h = segH(src[sp] / 6)
            const yTop = yAcc - h
            yAcc = yTop
            return (
              <rect
                key={sp}
                x={cx(t) - barW / 2}
                y={yTop}
                width={barW}
                height={h}
                rx={1}
                className={`conv-seg ${idx === spread ? 'conv-seg--preview' : ''}`}
              />
            )
          })
          return <g key={t}>{rects}</g>
        })}

        <line x1={padL} y1={topBase} x2={W - padR} y2={topBase} className="conv-axis" />
        <line x1={padL} y1={botBase} x2={W - padR} y2={botBase} className="conv-axis" />
      </svg>

      <p className="sum-readout">
        {done
          ? n < 2
            ? tr(`два кубика собраны из ${L} столбиков`, `two dice assembled from ${L} columns`)
            : tr('готово — форма растёт сама', 'done — the shape grows on its own')
          : tr(
              `столбик ${sActive} раздаётся в ${sActive + 1}…${sActive + 6} · ${spread}/${L}`,
              `column ${sActive} fans into ${sActive + 1}…${sActive + 6} · ${spread}/${L}`
            )}
      </p>

      <button
        type="button"
        className="sum-btn"
        onClick={next}
        disabled={done && n >= 2}
      >
        {done
          ? n < 2
            ? tr('добавить ещё кость', 'add one more die')
            : tr('готово', 'done')
          : tr('разнести столбик', 'spread a column')}
      </button>
    </div>
  )
}

export function SumDiceModel({ activeBeatId, satisfyGate }: SceneModelProps) {
  const beat = activeBeatId ?? ''
  const tr = useTr()
  const [n, setN] = useState(1)

  // The dice count persists across beats; if five were reached early, SUM.3's
  // gate would have nothing to click — satisfy it directly once we're there.
  useEffect(() => {
    if (beat === 'SUM.3' && n >= 5) satisfyGate?.()
  }, [beat, n, satisfyGate])

  if (beat === 'SUM.4' || beat === '') {
    return <div className="sum-model sum-model--empty" />
  }

  if (beat === 'SUM.1b') {
    return (
      <div className="sum-model">
        <ConvolutionViz tr={tr} onFirstDie={() => satisfyGate?.()} />
      </div>
    )
  }

  const lo = n
  const hi = 6 * n
  const mid = (lo + hi) / 2
  const { labels, data } = sumBars(n)

  const addDie = () => {
    setN((k) => {
      const nk = Math.min(k + 1, 5)
      if (beat === 'SUM.1' ? nk >= 2 : nk >= 5) satisfyGate?.()
      return nk
    })
  }

  return (
    <div className="sum-model">
      <div className="sum-dice-count">
        {Array.from({ length: n }, (_, i) => (
          <span key={i} className="sum-pip" />
        ))}
        <span className="sum-n">{n} {n === 1 ? tr('кость', 'die') : tr('костей', 'dice')}</span>
      </div>

      <XkcdChart
        type="Bar"
        width={Math.min(180 + (hi - lo) * 14, 460)}
        height={220}
        config={{
          xLabel: tr('сумма', 'sum'),
          yLabel: '%',
          data: { labels, datasets: [{ data }] },
          options: { yTickCount: 3, dataColors: data.map(() => ACCENT) },
        }}
      />

      {beat === 'SUM.2' && (
        <div className="sum-formula">
          <Formula latex={`(x + x^2 + \\dots + x^6)^{${n}}`} />
        </div>
      )}

      <p className="sum-readout">
        {tr('диапазон', 'range')} {lo}…{hi}
        {n >= 2 && <> · {tr('центр', 'center')} {mid}</>}
      </p>

      {beat !== 'SUM.2' && (
        <button type="button" className="sum-btn" onClick={addDie} disabled={n >= 5}>
          {n >= 5 ? tr('пять костей', 'five dice') : tr('добавить кость', 'add a die')}
        </button>
      )}
    </div>
  )
}

export const sceneSum: Scene = {
  id: 'scene-sum',
  model: SumDiceModel,
  beats: [
    {
      id: 'SUM.1',
      scene: 'scene-sum',
      prompt:
        'Сумма двух кубиков складывалась в треугольник с пиком на семёрке. А если костей больше? Добавляй по одной и смотри на форму.',
      payoff:
        'Одна кость плоская — шесть равных граней. Две дают треугольник, три — холм, и с каждой костью склон всё глаже. Форма явно живёт по какому-то правилу — осталось увидеть, по какому.',
      gate: { kind: 'build' },
    },
    {
      id: 'SUM.1b',
      scene: 'scene-sum',
      prompt:
        'Откуда берётся эта форма? Добавить кость — значит к каждой уже набранной сумме прибавить новую грань, 1…6. Разнеси по одному столбику и смотри, куда он падает.',
      payoff:
        'Каждый столбик старого распределения раздаётся в шесть копий поменьше, сдвинутых на 1…6, и копии разных столбиков **стекаются** в новые. Вот и вся механика: новая сумма — это старая плюс выпавшая грань.\n[[«разнести и сложить» = **свёртка** распределений]]\nИменно свёртка превращает плоскую кость сначала в треугольник, потом в холм.',
      gate: { kind: 'step' },
    },
    {
      id: 'SUM.2',
      scene: 'scene-sum',
      prompt: 'У этого «разнести и сложить» есть компактная запись — через многочлены.',
      payoff:
        'Запиши кость как $x + x^2 + \\dots + x^6$ — по слагаемому на грань. Перемножить две такие скобки значит перебрать все пары граней и сложить их показатели: степень $x^s$ — это сумма, а её коэффициент — сколькими парами она набирается. То самое разнесение-и-сложение, только буквами.\n[[$(x + x^2 + \\dots + x^6)^n$]]\nТакой многочлен называют **производящей функцией**: степени — суммы, коэффициенты — числа способов.',
    },
    {
      id: 'SUM.3',
      scene: 'scene-sum',
      prompt: 'Доведи до пяти костей и посмотри на форму столбиков.',
      payoff:
        'Сумма пяти костей живёт на $5\\dots30$, симметрична вокруг $17{,}5$, с вершиной на 17 и 18. Сами столбики складываются в гладкий колокол — это **нормальное распределение**.\n[[почти всё — в одном шаге $\\sigma$ (мера разброса) $\\approx 3{,}8$ от центра: суммы 14…21 набирают около двух третей всех бросков, а края 5 и 30 не выпадают почти никогда]]\nИ дело не в самой кости: когда складываешь много мелких независимых случайностей, их сумма всегда тянется к колоколу. Это **центральная предельная теорема**.',
      gate: { kind: 'build' },
    },
    {
      id: 'SUM.4',
      scene: 'scene-sum',
      prompt:
        'Но у суммы есть слепое пятно: она стирает, какие именно грани выпали. 6·6·1·1·1 и 3·3·3·3·3 дают одно и то же — 15. А игре важна не сумма, а сама рука — какие грани и сколько каждой. Ею и займёмся.',
    },
  ],
}
