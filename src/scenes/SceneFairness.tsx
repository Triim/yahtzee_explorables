import { useState } from 'react'
import type { SceneModelProps, Scene } from '@/scaffolding'
import { XkcdChart, Formula, useTr } from '@/scaffolding'
import './Fairness.css'

/* ============================================================
   Section «Is the die fair?» — the inverse question (a side-quest).
   Goodness-of-fit: observed face counts vs the uniform expectation,
   the chi-square statistic and its 5% threshold, then a Bayes update
   that is *derived* — prior, likelihood, posterior — not printed.
   ============================================================ */

const ACCENT = '#059669'
const LOADED = [0, 0.14, 0.14, 0.14, 0.14, 0.14, 0.3] // index by face; six is heavy
const CHI_CRIT = 11.07 // chi-square, 5 d.f., 5%

function chiSquare(counts: number[], total: number): number {
  if (total === 0) return 0
  const e = total / 6
  let s = 0
  for (let f = 1; f <= 6; f++) s += ((counts[f] - e) ** 2) / e
  return s
}

/** Posterior P(loaded) from a fair-vs-loaded likelihood ratio and a prior. */
function posteriorLoaded(counts: number[], total: number, prior: number): number {
  if (total === 0) return prior
  let logFair = 0
  let logLoaded = 0
  for (let f = 1; f <= 6; f++) {
    logFair += counts[f] * Math.log(1 / 6)
    logLoaded += counts[f] * Math.log(LOADED[f])
  }
  // posterior odds = likelihood ratio × prior odds
  const logLR = logLoaded - logFair
  const priorOdds = prior / (1 - prior)
  const postOdds = Math.exp(logLR) * priorOdds
  return postOdds / (1 + postOdds)
}

export function FairnessModel({ activeBeatId, satisfyGate }: SceneModelProps) {
  const beat = activeBeatId ?? ''
  const tr = useTr()
  const [loaded, setLoaded] = useState(false)
  const [counts, setCounts] = useState<number[]>([0, 0, 0, 0, 0, 0, 0])
  const [total, setTotal] = useState(0)
  const [prior, setPrior] = useState(0.1)

  if (beat === 'FAIR.4' || beat === '') {
    return <div className="fair-model fair-model--empty" />
  }

  const rollBatch = () => {
    const add = [0, 0, 0, 0, 0, 0, 0]
    for (let i = 0; i < 200; i++) {
      const r = Math.random()
      let face = 6
      if (loaded) {
        let acc = 0
        for (let f = 1; f <= 6; f++) {
          acc += LOADED[f]
          if (r < acc) { face = f; break }
        }
      } else {
        face = (r * 6 | 0) + 1
      }
      add[face]++
    }
    setCounts((c) => c.map((v, f) => v + add[f]))
    setTotal((t) => {
      const nt = t + 200
      if (nt >= 600) satisfyGate?.()
      return nt
    })
  }

  const reset = (next: boolean) => {
    setLoaded(next)
    setCounts([0, 0, 0, 0, 0, 0, 0])
    setTotal(0)
  }

  const chi = chiSquare(counts, total)
  const suspect = chi > CHI_CRIT
  const post = posteriorLoaded(counts, total, prior)
  const expected = total / 6
  const isBayes = beat === 'FAIR.B1' || beat === 'FAIR.B2' || beat === 'FAIR.B3'

  return (
    <div className="fair-model">
      <div className="fair-switch">
        <button
          className={`fair-opt ${!loaded ? 'fair-opt--on' : ''}`}
          onClick={() => reset(false)}
        >
          {tr('честная', 'fair')}
        </button>
        <button
          className={`fair-opt ${loaded ? 'fair-opt--on' : ''}`}
          onClick={() => reset(true)}
        >
          {tr('подкручена', 'loaded')}
        </button>
      </div>

      {/* FAIR.B1 — the prior */}
      {beat === 'FAIR.B1' && (
        <div className="fair-prior">
          <label className="fair-prior-label">
            {tr('априори P(подкручена)', 'prior P(loaded)')}: <b>{prior.toFixed(2)}</b>
          </label>
          <input
            type="range"
            min={0}
            max={0.5}
            step={0.01}
            value={prior}
            onChange={(e) => { setPrior(parseFloat(e.target.value)); satisfyGate?.() }}
            className="fair-prior-range"
          />
          <p className="fair-readout">{tr('до бросков ты знаешь только это', 'before any roll, this is all you know')}</p>
        </div>
      )}

      {total > 0 && (
        <XkcdChart
          type="Bar"
          width={360}
          height={190}
          config={{
            xLabel: tr('грань', 'face'),
            yLabel: tr('выпало', 'count'),
            data: {
              labels: ['1', '2', '3', '4', '5', '6'],
              datasets: [{ data: [1, 2, 3, 4, 5, 6].map((f) => counts[f]) }],
            },
            options: { yTickCount: 3, dataColors: [1, 2, 3, 4, 5, 6].map(() => ACCENT) },
          }}
        />
      )}

      {beat !== 'FAIR.B1' && (
        <button type="button" className="fair-btn" onClick={rollBatch}>
          +200 {tr('бросков', 'rolls')}
        </button>
      )}

      <p className="fair-readout">
        {total} {tr('бросков', 'rolls')}
        {total > 0 && <> · {tr('ждём по', 'expect')} {expected.toFixed(0)} {tr('на грань', 'per face')}</>}
      </p>

      {/* FAIR.2 — the chi-square verdict */}
      {beat === 'FAIR.2' && total > 0 && (
        <div className="fair-chi">
          <Formula latex={`\\chi^2 = ${chi.toFixed(1)}`} />
          <span className={`fair-verdict ${suspect ? 'fair-verdict--bad' : 'fair-verdict--ok'}`}>
            {suspect
              ? tr(`> ${CHI_CRIT} · под подозрением`, `> ${CHI_CRIT} · suspicious`)
              : tr(`< ${CHI_CRIT} · похоже на честную`, `< ${CHI_CRIT} · looks fair`)}
          </span>
        </div>
      )}

      {/* FAIR.B2 — which hypothesis the data leans toward */}
      {beat === 'FAIR.B2' && total > 0 && (
        <div className="fair-lean">
          <span className="fair-lean-end">{tr('честная', 'fair')}</span>
          <span className="fair-lean-track">
            <span className="fair-lean-dot" style={{ left: `${(post * 100).toFixed(0)}%` }} />
          </span>
          <span className="fair-lean-end">{tr('подкручена', 'loaded')}</span>
          <span className="fair-lean-note">
            {tr('шестёрок', 'sixes')}: {counts[6]} {tr('из ожидаемых', 'vs expected')} {expected.toFixed(0)}
          </span>
        </div>
      )}

      {/* FAIR.B3 — the posterior bar crawls, with the Bayes formula */}
      {beat === 'FAIR.B3' && (
        <div className="fair-bayes">
          <Formula latex="P(L\mid D) = \dfrac{P(D\mid L)\,P(L)}{P(D)}" />
          <div className="fair-bayes-track">
            <div className="fair-bayes-fill" style={{ width: `${(post * 100).toFixed(0)}%` }} />
          </div>
          <span className="fair-bayes-label">
            P({tr('подкручена', 'loaded')}) ≈ {post.toFixed(2)} {isBayes && <>· {tr('априори', 'prior')} {prior.toFixed(2)}</>}
          </span>
        </div>
      )}
    </div>
  )
}

export const sceneFair: Scene = {
  id: 'scene-fair',
  model: FairnessModel,
  beats: [
    {
      id: 'FAIR.1',
      scene: 'scene-fair',
      prompt:
        'Side-quest. Всю дорогу мы верили кости на слово: шесть равновероятных граней. А если она подкручена — как вообще это заметить? Тайно выбери кость и накидай бросков.',
      payoff:
        'На горстке бросков перекос не виден — случай шумит, как на первых бросках монеты. Нужна мера: насколько сильно наблюдаемые частоты граней расходятся с ожидаемыми $n/6$. Пока счёт мал, и честная кость гуляет туда-сюда.',
      gate: { kind: 'choice' },
    },
    {
      id: 'FAIR.2',
      scene: 'scene-fair',
      prompt: 'Эту меру расхождения даёт один критерий. Накидай побольше — и следи за ним.',
      payoff:
        'Это **критерий хи-квадрат** — сумма квадратов отклонений наблюдаемого $O$ от ожидаемого $E$, нормированных на ожидание:\n[[$\\chi^2 = \\sum \\dfrac{(O-E)^2}{E}$]]\nУ него есть порог. [[11,07 — не магия: это граница для шести граней (пять степеней свободы) на уровне 5%. Накопленное отклонение выше неё у честной кости случается реже, чем в 5% случаев; ниже — обычный разброс.]] Перешагнул порог — кость под подозрением.',
      gate: { kind: 'choice' },
    },
    {
      id: 'FAIR.B1',
      scene: 'scene-fair',
      prompt:
        'Порог отвечает «да/нет». А уверенность можно копить числом — и начать надо с того, во что веришь до бросков. Кость могла быть подкручена, а могла и нет; пусть шанс подкрутки, скажем, 1 из 10. Задай это априори.',
      payoff:
        'Это твоя **априорная вера** — P(подкручена) до единого броска. Здесь 0,1: подкрутка возможна, но маловероятна. С неё и стартует оценка, а дальше её будут двигать наблюдения.',
      gate: { kind: 'slider' },
    },
    {
      id: 'FAIR.B2',
      scene: 'scene-fair',
      prompt: 'Брось. Каждый исход чуть сдвигает веру — смотри, в какую сторону.',
      payoff:
        'Если подкрученная кость любит шестёрки, то выпавшая шестёрка — довод в пользу подкрутки, а ровные броски — против. Насколько силён довод, говорит **правдоподобие**: вероятность именно этого исхода у честной кости против подкрученной. Один бросок решает мало, довод копится из многих.',
      gate: { kind: 'choice' },
    },
    {
      id: 'FAIR.B3',
      scene: 'scene-fair',
      prompt: 'Как именно вера обновляется? Продолжай бросать и смотри на полосу.',
      payoff:
        'Новая вера = (насколько наблюдение вероятно при подкрутке × старая вера) ÷ (насколько оно вероятно вообще). Это и есть **формула Байеса**:\n[[$P(\\text{подкручена}\\mid D) = \\dfrac{P(D\\mid \\text{подкручена})\\,P(\\text{подкручена})}{P(D)}$]]\nЧем больше шестёрок сверх нормы, тем выше апостериорная вера; чем ровнее броски — тем ниже. Полоса ползёт сама с каждым наблюдением, стартуя от твоего априори.',
      gate: { kind: 'choice' },
    },
    {
      id: 'FAIR.4',
      scene: 'scene-fair',
      prompt:
        'Хи-квадрат отвечал жёстко: честная или нет. Байес — мягче: насколько ты теперь уверен, числом от 0 до 1, и эта уверенность растёт с каждым броском. На этом круг замыкается — мы не только считаем шансы по честной кости, но и умеем проверить саму честность.',
    },
  ],
}
