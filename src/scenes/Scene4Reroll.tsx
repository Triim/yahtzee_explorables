import { useEffect, useState } from 'react'
import type { SceneModelProps, Scene } from '@/scaffolding'
import { XkcdChart, useTr } from '@/scaffolding'
import { Die } from '@/components'
import './Reroll.css'

const ACCENT = '#059669'

/* --- Yahtzee-over-a-turn (B4.5A/B): honest chase, keep the majority face. --- */
function roll5(): number[] {
  return Array.from({ length: 5 }, rollFace)
}
function majorityFace(hand: number[]): number {
  const c = [0, 0, 0, 0, 0, 0, 0]
  hand.forEach((v) => c[v]++)
  let f = 1
  for (let i = 2; i <= 6; i++) if (c[i] > c[f]) f = i
  return f
}
/** One turn chasing a Yahtzee: keep the most frequent face, reroll twice. */
function chaseYahtzee(): boolean {
  let hand = roll5()
  for (let rr = 0; rr < 2; rr++) {
    const f = majorityFace(hand)
    hand = hand.map((v) => (v === f ? v : rollFace()))
  }
  return new Set(hand).size === 1
}
/* ============================================================
   Section 4 — Reroll and conditional probability.
   Hold some dice, reroll the rest; the right panel shows the
   conditional distribution of what comes next.
   ============================================================ */

const INIT: Record<string, number[]> = {
  'B4.1': [3, 3, 5, 2, 6],
  'B4.2': [3, 3, 5, 2, 6],
  'B4.3': [3, 3, 5, 2, 6],
  'B4.4': [6, 6, 2, 3, 4],
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
  const tr = useTr()
  const [hand, setHand] = useState<number[]>(INIT['B4.1'])
  const [held, setHeld] = useState<boolean[]>([false, false, false, false, false])
  const [throwing, setThrowing] = useState(false)
  const [left, setLeft] = useState(2)
  const [yah, setYah] = useState<{ hits: number; n: number } | null>(null)
  // B4.5B: empirical "turn of the first Yahtzee", accumulated from races
  const GEOM_K = 18
  const [geom, setGeom] = useState<{ hist: number[]; n: number; sumTurns: number }>({
    hist: Array(GEOM_K).fill(0),
    n: 0,
    sumTurns: 0,
  })

  // Reset the hand when the active beat changes (sync to a prop-like value).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const init = INIT[beat]
    if (init) {
      setHand(init)
      // pre-hold the pair of sixes on the competing-targets beat
      setHeld(beat === 'B4.4' ? [true, true, false, false, false] : [false, false, false, false, false])
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

  if (beat === 'B4.6' || beat === '') {
    return <div className="rr-model rr-model--empty" />
  }

  // B4.5A — Yahtzee over a full turn (honest chase)
  if (beat === 'B4.5A') {
    const rate = yah && yah.n > 0 ? (yah.hits / yah.n) * 100 : null
    return (
      <div className="rr-model">
        <button
          type="button"
          className="rr-btn"
          onClick={() => {
            let hits = 0
            const N = 500
            for (let i = 0; i < N; i++) if (chaseYahtzee()) hits++
            setYah((y) => ({ hits: (y?.hits ?? 0) + hits, n: (y?.n ?? 0) + N }))
            satisfyGate?.()
          }}
        >
          {tr('гнаться за Yahtzee · 500 ходов', 'chase Yahtzee · 500 turns')}
        </button>
        {rate !== null && (
          <div className="rr-yah">
            <span className="rr-yah-num">{rate.toFixed(1)}%</span>
            <span className="rr-yah-label">
              {tr('Yahtzee за ход', 'Yahtzee per turn')} · {yah!.n.toLocaleString(tr('ru-RU', 'en-US'))} {tr('ходов', 'turns')}
            </span>
          </div>
        )}
        <p className="rr-note">{tr('за один бросок — 6/7776 = 1/1296 ≈ 0,077%', 'a single roll — 6/7776 = 1/1296 ≈ 0.077%')}</p>
      </div>
    )
  }

  // B4.5B — geometric waiting time, accumulated from the reader's own races
  if (beat === 'B4.5B') {
    const runGeom = () => {
      const hist = [...geom.hist]
      const RACES = 150
      let sumTurns = 0
      for (let r = 0; r < RACES; r++) {
        let k = 1
        while (k < 300 && !chaseYahtzee()) k++
        sumTurns += k // true turn count, for an unbiased mean
        hist[Math.min(k, GEOM_K) - 1]++ // histogram bucket; last = "GEOM_K+"
      }
      setGeom((g) => ({ hist, n: g.n + RACES, sumTurns: g.sumTurns + sumTurns }))
      satisfyGate?.()
    }
    // Mean from the raw turn counts, not the capped histogram (which would bias it low).
    const meanTurn = geom.n > 0 ? geom.sumTurns / geom.n : 0
    const labels = Array.from({ length: GEOM_K }, (_, k) => (k < GEOM_K - 1 ? String(k + 1) : `${GEOM_K}+`))
    return (
      <div className="rr-model">
        <button type="button" className="rr-btn" onClick={runGeom}>
          {geom.n === 0 ? tr('сыграть 150 гонок до Yahtzee', 'play 150 races to a Yahtzee') : tr('ещё гонки', 'more races')}
        </button>
        {geom.n > 0 && (
          <XkcdChart
            type="Bar"
            width={400}
            height={190}
            config={{
              xLabel: tr('ход первого Yahtzee', 'turn of first Yahtzee'),
              yLabel: tr('гонок', 'races'),
              data: { labels, datasets: [{ data: geom.hist }] },
              options: { yTickCount: 3, dataColors: geom.hist.map(() => ACCENT) },
            }}
          />
        )}
        <p className="rr-note">
          {geom.n === 0
            ? tr('каждая гонка — ходы до первого Yahtzee', 'each race — turns until the first Yahtzee')
            : tr(`${geom.n} гонок · в среднем ${meanTurn.toFixed(0)} ходов`, `${geom.n} races · ${meanTurn.toFixed(0)} turns on average`)}
        </p>
      </div>
    )
  }

  if (beat === 'B4.5') {
    return (
      <div className="rr-model">
        <div className="rr-cond">
          <div className="rr-set rr-set--a">{tr('A — что оставил', 'A — what you kept')}</div>
          <div className="rr-arrow">→</div>
          <div className="rr-set rr-set--b">{tr('B — цель', 'B — the target')}</div>
        </div>
        <p className="rr-formula">P(B | A) = P(A∩B) / P(A)</p>
        <p className="rr-note">
          {tr(
            'Меняешь, что держишь, — меняется всё распределение справа.',
            'Change what you hold — the whole distribution on the right changes.'
          )}
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
      <p className="rr-hint">{tr('кликни кубик — оставить', 'click a die to keep')}</p>

      <button type="button" className="rr-btn" onClick={reroll} disabled={left <= 0}>
        {tr('перебросить', 'reroll')} · {tr('осталось', 'left')} {left}
      </button>

      {r < 5 && r > 0 && (
        <div className="rr-panel">
          <p className="rr-panel-title">
            {tr('добрать грань', 'reach face')} «{target}» {tr('из', 'of')} {r} {tr('перебрасываемых', 'rerolled')}
          </p>
          <XkcdChart
            type="Bar"
            width={Math.max(r, 1) * 64 + 60}
            height={200}
            config={{
              xLabel: tr('сколько добрал', 'how many you got'),
              yLabel: '%',
              data: {
                labels: dist.map((_, k) => String(k)),
                datasets: [{ data: dist.map((p) => Math.round(p * 100)) }],
              },
              options: { yTickCount: 3, dataColors: dist.map(() => ACCENT) },
            }}
          />
          <p className="rr-readout">
            {tr('хотя бы одна', 'at least one')}: 1 − (5/6)<sup>{r}</sup> ≈ {pAtLeastOne.toFixed(2)}
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
        'Как только ты что-то оставил, следующая рука уже не любая — она растёт поверх сохранённого. У двух монет ветки дерева не влияли друг на друга. Теперь ты сам выбираешь, от какой ветки расти, — и дерево перестало быть независимым.',
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
        'Вот где выбор реально стоит. На руках 6·6·2·3·4 две цели сразу: пара шестёрок просит добивать каре, а 2·3·4 просится в стрейт. Но обе не удержать. Попробуй оба холда.',
      payoff:
        'Держишь шестёрки — добрать хотя бы ещё одну из трёх перебрасываемых: $1 - (5/6)^3 \\approx 0{,}42$, но 2·3·4 при этом ломаешь. Держишь 2·3·4 и тянешь стрейт — теряешь пару. Вот настоящая цена выбора: за каждой погоней ты платишь уже собранным. Какой холд выгоднее, одно распределение не скажет — нужна цена руки.',
      gate: { kind: 'hold' },
    },
    {
      id: 'B4.5',
      scene: 'scene-4',
      prompt: 'У всего, что мы сейчас считали, есть имя.',
      payoff:
        'Это **условная вероятность**: вероятность цели $B$ при условии того, что ты оставил, $A$. Возьмём конкретно две оставленные тройки. $A$ — «держу две тройки», $B$ — «добрал третью». Из всех раскладов трёх перебрасываемых костей берём только те, где выпала хотя бы одна тройка, — их доля и есть ответ:\n[[$P(B\\mid A) = 1-(5/6)^3 = 91/216 \\approx 0{,}42$]]\nФормально $P(B\\mid A) = P(A\\cap B)/P(A)$ — мы сужаем мир до случаев $A$ и смотрим долю $B$ в нём. Но какой холд лучше, распределение не скажет: оно говорит, что вероятно, а не что выгодно. А выгоду не измерить, пока у руки нет единой цены.',
    },
    {
      id: 'B4.5A',
      scene: 'scene-4',
      prompt:
        'За один бросок любой Yahtzee — это шесть благоприятных раскладов из 7776 (по одному на грань): 6/7776 = 1/1296. Но у тебя три броска за ход и право оставлять кости. Гонись за Yahtzee оптимально много ходов подряд.',
      payoff:
        'С перебросами Yahtzee выпадает примерно за **4,6 %** ходов — почти в шестьдесят раз чаще, чем 1/1296 за один бросок. Три попытки и право держать нужное превращают почти невозможное в просто редкое. (Это честная симуляция, числа чуть пляшут от запуска к запуску.)',
      gate: { kind: 'choice' },
    },
    {
      id: 'B4.5B',
      scene: 'scene-4',
      prompt: 'А сколько ходов ждать первого Yahtzee? Сыграй несколько сотен гонок и собери распределение того, на каком ходу он впервые выпадает.',
      gate: { kind: 'choice' },
      payoff:
        'Yahtzee за ход выходит примерно у каждого 22-го ($p \\approx 4{,}6\\% \\approx 1/22$). Если каждый ход — независимая попытка с шансом $p$, число ходов до первого успеха подчиняется **геометрическому распределению**:\n[[$P(k) = (1-p)^{k-1}\\,p$, а в среднем ждать $E = 1/p$]]\nОжидание геометрического распределения — это просто $1/p$, то есть около 22 ходов — меньше двух партий. (За один бросок, $p=1/1296$, ждать пришлось бы 1296 бросков.)',
    },
    {
      id: 'B4.6',
      scene: 'scene-4',
      prompt:
        'Чтобы сравнивать броски не по вероятности, а по выгоде, руке нужна одна цифра — её ожидаемая ценность. К ней и идём.',
    },
  ],
}
