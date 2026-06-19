import { useEffect, useState } from 'react'
import type { SceneModelProps, Scene } from '@/scaffolding'
import { Die } from '@/components'
import './Reroll.css'

/* ============================================================
   Section 4 — Reroll and conditional probability.
   Hold some dice, reroll the rest; the right panel shows the
   conditional distribution of what comes next.
   ============================================================ */

const INIT: Record<string, number[]> = {
  'B4.1': [3, 3, 5, 2, 6],
  'B4.2': [3, 3, 5, 2, 6],
  'B4.3': [3, 3, 5, 2, 6],
  'B4.4': [5, 5, 5, 1, 2],
}

function rollFace(): number {
  return ((Math.random() * 6) | 0) + 1
}

function binom(n: number, k: number): number {
  let r = 1
  for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1)
  return r
}

// distribution of how many of `face` you get when rerolling r dice
function targetDist(r: number): number[] {
  const out: number[] = []
  for (let k = 0; k <= r; k++) {
    out.push(binom(r, k) * (1 / 6) ** k * (5 / 6) ** (r - k))
  }
  return out
}

export function RerollModel({ activeBeatId, satisfyGate }: SceneModelProps) {
  const beat = activeBeatId ?? ''
  const [hand, setHand] = useState<number[]>(INIT['B4.1'])
  const [held, setHeld] = useState<boolean[]>([false, false, false, false, false])
  const [throwing, setThrowing] = useState(false)
  const [left, setLeft] = useState(2)

  // Reset the hand when the active beat changes (sync to a prop-like value).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const init = INIT[beat]
    if (init) {
      setHand(init)
      // pre-hold the obvious keep on the trap beat
      setHeld(beat === 'B4.4' ? [true, true, true, false, false] : [false, false, false, false, false])
      setLeft(2)
    }
  }, [beat])
  /* eslint-enable react-hooks/set-state-in-effect */

  const toggle = (i: number) => {
    if (throwing) return
    setHeld((h) => h.map((v, j) => (j === i ? !v : v)))
  }

  const reroll = () => {
    if (throwing || left <= 0) return
    setThrowing(true)
    setHand((h) => h.map((v, i) => (held[i] ? v : rollFace())))
    window.setTimeout(() => setThrowing(false), 600)
    setLeft((l) => {
      const nl = l - 1
      // gate: B4.3 needs both rerolls used; others on any reroll
      if (beat === 'B4.3' ? nl === 0 : true) satisfyGate?.()
      return nl
    })
  }

  // conditional panel: majority held face, reroll count
  const heldFaces = hand.filter((_, i) => held[i])
  const facecount = [0, 0, 0, 0, 0, 0, 0]
  heldFaces.forEach((v) => facecount[v]++)
  const target = facecount.indexOf(Math.max(...facecount.slice(1))) || hand[0]
  const r = held.filter((h) => !h).length
  const pAtLeastOne = 1 - (5 / 6) ** r
  const dist = targetDist(r)
  const maxd = Math.max(...dist, 0.001)

  if (beat === 'B4.6' || beat === '') {
    return <div className="rr-model rr-model--empty" />
  }

  if (beat === 'B4.5') {
    return (
      <div className="rr-model">
        <div className="rr-cond">
          <div className="rr-set rr-set--a">A — что оставил</div>
          <div className="rr-arrow">→</div>
          <div className="rr-set rr-set--b">B — цель</div>
        </div>
        <p className="rr-formula">P(B | A) = P(A∩B) / P(A)</p>
        <p className="rr-note">
          Меняешь, что держишь, — меняется всё распределение справа.
        </p>
      </div>
    )
  }

  return (
    <div className="rr-model">
      <div className="rr-hand">
        {hand.map((v, i) => (
          <button key={i} className="rr-die" onClick={() => toggle(i)} aria-pressed={held[i]}>
            <Die value={v} size={58} throwing={throwing && !held[i]} held={held[i]} />
          </button>
        ))}
      </div>
      <p className="rr-hint">кликни кубик — оставить</p>

      <button type="button" className="rr-btn" onClick={reroll} disabled={left <= 0}>
        перебросить · осталось {left}
      </button>

      {r < 5 && r > 0 && (
        <div className="rr-panel">
          <p className="rr-panel-title">
            добрать грань «{target}» из {r} перебрасываемых
          </p>
          <svg width={Math.max(r, 1) * 54 + 20} height={110} className="rr-dist">
            {dist.map((p, k) => {
              const x = 14 + k * 54
              const h = (p / maxd) * 80
              return (
                <g key={k}>
                  <rect x={x} y={90 - h} width={36} height={h} className="rr-bar" />
                  <text x={x + 18} y={104} className="rr-bar-tick">{k}</text>
                </g>
              )
            })}
          </svg>
          <p className="rr-readout">
            хотя бы одна: 1 − (5/6)<sup>{r}</sup> ≈ {pAtLeastOne.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  )
}

export const scene4: Scene = {
  id: 'scene-4',
  model: RerollModel,
  beats: [
    {
      id: 'B4.1',
      scene: 'scene-4',
      prompt:
        'Бросок не один: за ход их три, и между ними любые кубики можно перебросить. Брось, кликни те, что хочешь оставить, и перекинь остальные.',
      payoff:
        'Как только ты что-то оставил, следующая рука уже не любая — она растёт поверх сохранённого. В Разделе 1 ветки дерева не влияли друг на друга. Теперь ты сам выбираешь, от какой ветки расти, — и дерево перестало быть независимым.',
      gate: { kind: 'hold' },
    },
    {
      id: 'B4.2',
      scene: 'scene-4',
      prompt: 'Оставь две тройки и посмотри, что, скорее всего, придёт.',
      payoff:
        'Распределение справа — это будущее при условии того, что ты оставил. Какова вероятность добрать третью тройку за один переброс трёх кубиков? От обратного: $1 - (5/6)^3 = 91/216 \\approx 0{,}42$. Почти половина.',
      gate: { kind: 'hold' },
    },
    {
      id: 'B4.3',
      scene: 'scene-4',
      prompt: 'Но перебросов два. Оставь то же — и перекинь дважды.',
      payoff:
        'Со вторым перебросом шанс растёт: чего не вышло сейчас, можно добиться на следующем шаге. Ценность того, что держишь, складывается из ценностей того, что может прийти дальше. Каждый переброс — шаг по маленькому дереву, и ветки на нём зависят от твоего выбора.',
      gate: { kind: 'hold' },
    },
    {
      id: 'B4.4',
      scene: 'scene-4',
      prompt:
        'Ловушка. На руках 5·5·5·1·2 — три пятёрки. Тянет перекинуть единицу с двойкой и добить каре. Стоит ли? Перебрось два.',
      payoff:
        'Чтобы получить четвёртую пятёрку, нужна хотя бы одна из двух: $1 - (5/6)^2 = 11/36 \\approx 0{,}31$. Меньше трети. А три пятёрки у тебя уже есть — верная тройка. Интуиция гонит за редким, но чаще ты останешься с тем, что и так держал. Погоня не бесплатна.',
      gate: { kind: 'hold' },
    },
    {
      id: 'B4.5',
      scene: 'scene-4',
      prompt: 'У всего, что мы сейчас считали, есть имя.',
      payoff:
        'Это **условная вероятность** — вероятность будущего $B$ при условии того, что оставил, $A$: $P(B\\mid A) = P(A\\cap B)/P(A)$. Но какой холд лучше, распределение не скажет: оно показывает, что вероятно, а не что выгодно. А выгоду не измерить, пока у руки нет единой цены.',
    },
    {
      id: 'B4.6',
      scene: 'scene-4',
      prompt:
        'Чтобы сравнивать броски не по вероятности, а по выгоде, руке нужна одна цифра — её ожидаемая ценность. К ней и идём.',
    },
  ],
}
