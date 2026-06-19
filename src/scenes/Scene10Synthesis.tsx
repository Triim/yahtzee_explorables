import { useState } from 'react'
import type { SceneModelProps, Scene } from '@/scaffolding'
import './Synthesis.css'

/* ============================================================
   Section 10 — Synthesis and the honest capstone.
   Everything folds into one adaptive policy; then the honest
   truth about math vs luck.
   ============================================================ */

function erf(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t) *
      Math.exp(-x * x)
  return x >= 0 ? y : -y
}

function turnScore(): number {
  // a rough per-turn yield, honest random
  return 8 + ((Math.random() * 34) | 0)
}

export function SynthesisModel({ activeBeatId, satisfyGate }: SceneModelProps) {
  const beat = activeBeatId ?? ''
  const [turn, setTurn] = useState(0)
  const [you, setYou] = useState(0)
  const [opp, setOpp] = useState(0)

  if (beat === 'B10.4' || beat === '') {
    return <div className="sy-model sy-model--empty" />
  }

  // B10.1 — live adaptive game
  if (beat === 'B10.1') {
    const remaining = 13 - turn
    const spread = Math.max(12 * Math.sqrt(Math.max(remaining, 0) * 2), 1)
    const diff = you - opp
    const winP = remaining <= 0 ? (diff > 0 ? 1 : 0) : 0.5 * (1 + erf(diff / (spread * Math.SQRT2)))

    return (
      <div className="sy-model">
        <div className="sy-scores">
          <div className="sy-score">
            <span className="sy-score-num">{you}</span>
            <span className="sy-score-name">ты</span>
          </div>
          <div className="sy-score">
            <span className="sy-score-num">{opp}</span>
            <span className="sy-score-name">соперник</span>
          </div>
        </div>

        <div className="sy-winbar">
          <div className="sy-winbar-fill" style={{ width: `${(winP * 100).toFixed(0)}%` }} />
          <span className="sy-winbar-label">P(победа) ≈ {winP.toFixed(2)}</span>
        </div>

        <p className="sy-readout">
          ход {Math.min(turn, 13)} из 13 · воронка ∝ √{remaining}
        </p>

        <button
          className="sy-btn"
          disabled={turn >= 13}
          onClick={() => {
            setYou((y) => y + turnScore())
            setOpp((o) => o + turnScore())
            setTurn((t) => {
              const nt = t + 1
              if (nt >= 3) satisfyGate?.()
              return nt
            })
          }}
        >
          {turn >= 13 ? 'партия сыграна' : 'сыграть ход'}
        </button>
      </div>
    )
  }

  // B10.2 — read, then decide
  if (beat === 'B10.2') {
    return (
      <div className="sy-model">
        <div className="sy-halves">
          <div className="sy-half">
            <svg width={130} height={90} role="img">
              <polygon points="6,45 124,18 124,72" className="sy-cone sy-cone--wide" />
            </svg>
            <span className="sy-half-label">начало · широкая</span>
            <span className="sy-half-sub">играешь на среднее</span>
          </div>
          <div className="sy-half">
            <svg width={130} height={90} role="img">
              <polygon points="6,45 124,40 124,50" className="sy-cone sy-cone--narrow" />
            </svg>
            <span className="sy-half-label">конец · узкая</span>
            <span className="sy-half-sub">играешь на победу</span>
          </div>
        </div>
        <p className="sy-readout">стратегия стала функцией положения: π(состояние, ходов, цель)</p>
      </div>
    )
  }

  // B10.3 — honest capstone
  return (
    <div className="sy-model">
      <div className="sy-capstone">
        <span className="sy-cap-num">23 млн</span>
        <span className="sy-cap-label">реальных партий: оптимум против людей</span>
      </div>
      <div className="sy-cap-edge">
        перевес идеальной игры — лишь несколько процентов
      </div>
      <p className="sy-readout">
        гора случайности выше зазора в мастерстве. В одной партии везение громче любой стратегии.
      </p>
    </div>
  )
}

export const scene10: Scene = {
  id: 'scene-10',
  model: SynthesisModel,
  beats: [
    {
      id: 'B10.1',
      scene: 'scene-10',
      prompt:
        'Соберём всё в одну живую игру против соперника — с приборами на виду: воронка его итога и твоя выигрышная масса на каждый ход. Сыграй несколько ходов.',
      payoff:
        'Каждый твой ход — уже не «возьми максимум очков». Это функция трёх вещей: где ты сейчас (состояние), сколько ходов осталось и какая цель — обгонять или удерживать. Такую стратегию-функцию называют **политикой**: $\\pi(\\text{состояние}, \\text{ходов}, \\text{цель})$.',
      gate: { kind: 'choice' },
    },
    {
      id: 'B10.2',
      scene: 'scene-10',
      prompt: 'И она сама собой делит партию надвое.',
      payoff:
        'В начале воронка соперника широкая, читать нечего — играешь почти как в одиночку, на максимум среднего. К концу воронка сужается, соперник прочитан — и ты крутишь риск под него: отстаёшь — раздуваешь, ведёшь — поджимаешь. Стратегия стала функцией положения.',
    },
    {
      id: 'B10.3',
      scene: 'scene-10',
      prompt: 'И вот честный итог всей этой математики.',
      payoff:
        'Идеальная стратегия обыгрывает лучших живых игроков лишь чуть-чуть — склоняет вероятность победы на несколько процентов. Не потому что математика слаба, а потому что разброс огромен: гора случайности из Раздела 8 куда выше, чем зазор в мастерстве. Yahtzee — игра, в которой почти всё решает удача.',
    },
    {
      id: 'B10.4',
      scene: 'scene-10',
      prompt:
        'Большую часть партии ты играешь против формы случая. Потом против правил. Потом против собственных будущих решений. И лишь в конце — против того, кто меняет единственное: критерий победы. Простая игра в кости заставила выстроить почти всю математику случайности. Ради этого пути всё и затевалось.',
    },
  ],
}
