import { useState } from 'react'
import type { SceneModelProps, Scene } from '@/scaffolding'
import { useTr } from '@/scaffolding'
import './Opponent.css'

/* ============================================================
   Section 9 — The opponent: the objective changes.
   Same dice math, new win criterion. Variance becomes a weapon;
   the prediction funnel narrows toward the end.
   ============================================================ */

function erf(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t) *
      Math.exp(-x * x)
  return x >= 0 ? y : -y
}
function pAbove(T: number, mu: number, sigma: number): number {
  return 1 - 0.5 * (1 + erf((T - mu) / (sigma * Math.SQRT2)))
}

const DOMAIN: [number, number] = [60, 360]

function NormalCurve({ mu, sigma, threshold, label }: { mu: number; sigma: number; threshold: number; label: string }) {
  const W = 340
  const H = 170
  const [x0, x1] = DOMAIN
  const px = (x: number) => ((x - x0) / (x1 - x0)) * W
  const pdf = (x: number) => Math.exp(-((x - mu) ** 2) / (2 * sigma * sigma))
  const N = 80
  const pts: [number, number][] = []
  for (let i = 0; i <= N; i++) {
    const x = x0 + ((x1 - x0) * i) / N
    pts.push([px(x), H - 12 - pdf(x) * (H - 30)])
  }
  const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  // shaded area beyond threshold
  const area = pts.filter(([x]) => x >= px(threshold))
  const areaPath =
    area.length > 1
      ? `M${px(threshold)},${H - 12} ` +
        area.map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`).join(' ') +
        ` L${area[area.length - 1][0].toFixed(1)},${H - 12} Z`
      : ''

  return (
    <svg width={W} height={H} className="op-curve" role="img">
      {/* hand-drawn "xkcd" wobble, to match the chart.xkcd bar charts */}
      <defs>
        <filter id="op-rough">
          <feTurbulence type="fractalNoise" baseFrequency="0.013" numOctaves="3" seed="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
        </filter>
      </defs>
      <g filter="url(#op-rough)">
        {areaPath && <path d={areaPath} className="op-area" />}
        <polyline points={line} className="op-line" fill="none" />
        <line x1={px(threshold)} y1={8} x2={px(threshold)} y2={H - 12} className="op-threshold" />
      </g>
      <text x={px(threshold) + 4} y={18} className="op-threshold-label" style={{ fontFamily: 'var(--hand)' }}>
        {label}
      </text>
    </svg>
  )
}

export function OpponentModel({ activeBeatId, satisfyGate }: SceneModelProps) {
  const beat = activeBeatId ?? ''
  const tr = useTr()
  const [duel, setDuel] = useState<[number, number] | null>(null)
  const [winObjective, setWinObjective] = useState(false)
  const [risk, setRisk] = useState(20)
  const [remaining, setRemaining] = useState(13)

  if (beat === 'B9.6' || beat === 'B9.7' || beat === '') {
    return <div className="op-model op-model--empty" />
  }

  const sigma = 15 + risk * 0.55
  const mu = 210 - risk * 0.35

  // B9.1 — two players side by side
  if (beat === 'B9.1') {
    const mine = duel?.[0] ?? null
    const theirs = duel?.[1] ?? null
    return (
      <div className="op-model">
        <div className="op-duel">
          <div className="op-player">
            <span className="op-player-num">{mine ?? '—'}</span>
            <span className="op-player-name">{tr('ты', 'you')}</span>
          </div>
          <div className="op-player">
            <span className="op-player-num">{theirs ?? '—'}</span>
            <span className="op-player-name">{tr('соперник', 'opponent')}</span>
          </div>
        </div>
        <button
          className="op-btn"
          onClick={() => {
            setDuel([180 + ((Math.random() * 90) | 0), 180 + ((Math.random() * 90) | 0)])
            satisfyGate?.()
          }}
        >
          {tr('сыграть ход рядом', 'play a turn side by side')}
        </button>
        <p className="op-note">{tr('его случай и твой — независимы', 'his chance and yours are independent')}</p>
      </div>
    )
  }

  // B9.2 — the objective toggles
  if (beat === 'B9.2') {
    return (
      <div className="op-model">
        <button
          className={`op-toggle ${winObjective ? 'op-toggle--win' : ''}`}
          onClick={() => { setWinObjective((v) => !v); satisfyGate?.() }}
        >
          {winObjective ? tr('максимум P(победы)', 'maximize P(win)') : tr('максимум среднего', 'maximize the average')}
        </button>
        <div className="op-move">
          {tr('рекомендуемый ход:', 'recommended move:')}
          <strong>
            {winObjective
              ? tr(' идти на стрейт (рискованно)', ' go for the straight (risky)')
              : tr(' записать «шестёрки» (надёжно)', ' score “sixes” (safe)')}
          </strong>
        </div>
        <p className="op-note">
          {tr(
            'тот же бросок — а лучший ход стал другим. Сменился критерий, не игра.',
            'the same roll — yet the best move changed. The criterion changed, not the game.'
          )}
        </p>
      </div>
    )
  }

  // B9.3 / B9.4 — variance as a weapon
  if (beat === 'B9.3' || beat === 'B9.4') {
    const behind = beat === 'B9.3'
    const T = behind ? 240 : 180
    const p = pAbove(T, mu, sigma)
    return (
      <div className="op-model">
        <NormalCurve mu={mu} sigma={sigma} threshold={T} label={tr('соперник', 'opponent')} />
        <input
          type="range"
          min={0}
          max={100}
          value={risk}
          onChange={(e) => { setRisk(+e.target.value); satisfyGate?.() }}
          className="op-slider"
        />
        <p className="op-readout">
          σ ≈ {sigma.toFixed(0)} · μ ≈ {mu.toFixed(0)} · P({behind ? tr('обогнать', 'overtake') : tr('удержать', 'hold')}) ≈ {p.toFixed(2)}
        </p>
        <p className="op-note">
          {behind ? tr('отстаёшь — поднимай σ', 'behind — raise σ') : tr('ведёшь — опускай σ', 'leading — lower σ')}
        </p>
      </div>
    )
  }

  // B9.5 — prediction funnel
  const spread = 12 * Math.sqrt(remaining)
  const W = 320
  const H = 150
  return (
    <div className="op-model">
      <svg width={W} height={H} className="op-funnel" role="img">
        <polygon
          points={`10,${H / 2} ${W - 10},${H / 2 - 12 * Math.sqrt(13)} ${W - 10},${H / 2 + 12 * Math.sqrt(13)}`}
          className="op-funnel-cone"
        />
        <line
          x1={W - 10 - (remaining / 13) * (W - 20)}
          y1={H / 2 - spread}
          x2={W - 10 - (remaining / 13) * (W - 20)}
          y2={H / 2 + spread}
          className="op-funnel-now"
        />
      </svg>
      <input
        type="range"
        min={0}
        max={13}
        value={remaining}
        onChange={(e) => { setRemaining(+e.target.value); satisfyGate?.() }}
        className="op-slider"
      />
      <p className="op-readout">
        {tr('осталось ходов', 'turns left')}: {remaining} · {tr('разброс', 'spread')} ≈ {spread.toFixed(0)} {tr('(∝ √ходов)', '(∝ √turns)')}
      </p>
      <p className="op-note">
        {tr(
          'соперника по-настоящему читаешь к концу — решать поздно, зато точно',
          'you only truly read the opponent near the end — late to act, but accurate'
        )}
      </p>
    </div>
  )
}

export const scene9: Scene = {
  id: 'scene-9',
  model: OpponentModel,
  beats: [
    {
      id: 'B9.1',
      scene: 'scene-9',
      prompt:
        'До сих пор ты играл один против таблицы. Посади рядом соперника: он бросает свои кубики, ты — свои. Ты никак не влияешь на его случай, он — на твой. Сыграй ход рядом.',
      payoff:
        'Заметь: математика кубиков не изменилась ни на йоту — те же вероятности и ценности, что и раньше. Изменилось другое — и это самое важное во всей игре.',
      gate: { kind: 'choice' },
    },
    {
      id: 'B9.2',
      scene: 'scene-9',
      prompt:
        'В одиночку цель была — максимум очков в среднем. Против соперника цель другая: не больше очков, а больше, чем у него. Переключи цель и смотри на рекомендуемый ход.',
      payoff:
        'Тот же бросок, та же таблица — а лучший ход стал другим. Поменялась **целевая функция**: то, что мы называем «хорошо». Вся математика осталась на месте — сменился только критерий, под который её крутят.',
      gate: { kind: 'toggle' },
    },
    {
      id: 'B9.3',
      scene: 'scene-9',
      prompt:
        'Ты отстаёшь на 30, остался один ход. Осторожная игра не спасёт — в среднем придёшь ниже соперника. Раздуй риск.',
      payoff:
        'Раздуй разброс. Да, среднее упадёт — но тебе не нужно среднее, нужно перепрыгнуть. Широкое распределение заводит больше массы за черту соперника: вероятность обогнать растёт, даже когда μ падает. Отстаёшь — поднимай σ.',
      gate: { kind: 'slider' },
    },
    {
      id: 'B9.4',
      scene: 'scene-9',
      prompt: 'Теперь наоборот — ты ведёшь. Тот же ход? Сузь риск.',
      payoff:
        'Нет. Сужай разброс. Тебе не нужен рекорд — нужно не дать сопернику случайно перепрыгнуть. Узкое, надёжное распределение добивает партию. Ведёшь — опускай σ. Тот самый разброс σ, что прежде отличал характеры стратегий, теперь стал оружием, и направление зависит от того, впереди ты или позади.',
      gate: { kind: 'slider' },
    },
    {
      id: 'B9.5',
      scene: 'scene-9',
      prompt:
        'Насколько вообще предсказуем итог соперника? Зависит от того, сколько ходов ему осталось. Подвигай число оставшихся ходов.',
      payoff:
        'В начале партии итог соперника размыт широкой воронкой — впереди ещё много случайных ходов. Чем меньше ходов осталось, тем уже воронка:\n[[$\\sigma \\propto \\sqrt{\\text{осталось ходов}}$]]\nРазброс падает примерно как корень из числа оставшихся ходов. Поэтому соперника по-настоящему читаешь к концу.',
      gate: { kind: 'slider' },
    },
    {
      id: 'B9.6',
      scene: 'scene-9',
      prompt: 'Строго говоря, цель — не «обогнать одного», а занять место повыше.',
      payoff:
        'Точная цель — **ожидаемый ранг**, среднее место в итоговой таблице. А настоящая теория игр — с блефом и коалициями — начинается лишь от трёх игроков: там можно объединяться против лидера. Вдвоём всё проще: обгони — и всё.',
    },
    {
      id: 'B9.7',
      scene: 'scene-9',
      prompt:
        'Читать воронку соперника, крутить свой риск по ходу партии — соберём это в одну живую игру.',
    },
  ],
}
