import { useEffect, useState } from 'react'
import type { SceneModelProps, Scene } from '@/scaffolding'
import { useTr, XkcdChart, usePlayerState } from '@/scaffolding'
import { Die } from '@/components'
import './Rules.css'

const ACCENT = '#059669'

/* ============================================================
   Section 3 — Rules of Yahtzee and the combinations.
   Each combination is introduced, highlighted in a hand, and its
   rarity (favorable hands out of 7776) shown on a scale.
   ============================================================ */

const CATEGORIES_RU = [
  'Единицы', 'Двойки', 'Тройки', 'Четвёрки', 'Пятёрки', 'Шестёрки',
  'Тройка', 'Каре', 'Фулл-хаус', 'Малый стрейт', 'Большой стрейт', 'Yahtzee', 'Шанс',
]
const CATEGORIES_EN = [
  'Ones', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes',
  'Three of a kind', 'Four of a kind', 'Full house', 'Small straight', 'Large straight', 'Yahtzee', 'Chance',
]

function counts(hand: number[]): number[] {
  const c = [0, 0, 0, 0, 0, 0, 0]
  hand.forEach((v) => (c[v]++))
  return c
}

function randHand(): number[] {
  return Array.from({ length: 5 }, () => ((Math.random() * 6) | 0) + 1)
}

/* Empirical histogram of "number of sixes per roll", built from the reader's
   rolls; once enough rolls land, the theoretical B(5,1/6) is overlaid as dots. */
function SixHist({ hist, rolls, tr }: { hist: number[]; rolls: number; tr: (ru: string, en: string) => string }) {
  const data = [0, 1, 2, 3, 4, 5].map((k) => (rolls > 0 ? +((hist[k] / rolls) * 100).toFixed(1) : 0))
  return (
    <XkcdChart
      type="Bar"
      width={320}
      height={190}
      config={{
        xLabel: tr('шестёрок', 'sixes'),
        yLabel: '%',
        data: { labels: ['0', '1', '2', '3', '4', '5'], datasets: [{ data }] },
        options: { yTickCount: 3, dataColors: data.map(() => ACCENT) },
      }}
    />
  )
}

/* Probability scale: favorable hands out of 7776. */
function Scale({ items }: { items: { label: string; fav: number; pct: string }[] }) {
  const W = 320
  return (
    <div className="rules-scale">
      {items.map((it) => (
        <div className="scale-row" key={it.label}>
          <span className="scale-name">{it.label}</span>
          <svg width={W} height={16} className="scale-track">
            <rect x={0} y={3} width={W} height={10} rx={5} className="scale-bg" />
            <rect
              x={0}
              y={3}
              width={Math.max((it.fav / 1656) * W, 3)}
              height={10}
              rx={5}
              className="scale-fill"
            />
          </svg>
          <span className="scale-val">{it.fav} · {it.pct}</span>
        </div>
      ))}
    </div>
  )
}

export function RulesModel({ activeBeatId, satisfyGate }: SceneModelProps) {
  const beat = activeBeatId ?? ''
  const tr = useTr()
  const { record } = usePlayerState()
  const cats = tr('ru', 'en') === 'en' ? CATEGORIES_EN : CATEGORIES_RU
  const [hand, setHand] = useState<number[]>([3, 1, 6, 1, 4])
  const [throwing, setThrowing] = useState(false)
  const [face, setFace] = useState<number | null>(null)
  const [tripleDone, setTripleDone] = useState(false)
  const [sw, setSw] = useState(0) // small-straight window 0..2
  // B3.2A/B3.2B: tally of "number of sixes" across the reader's rolls
  const [sixHist, setSixHist] = useState<number[]>([0, 0, 0, 0, 0, 0])
  const [sixRolls, setSixRolls] = useState(0)

  // cycle small-straight windows
  useEffect(() => {
    if (beat !== 'B3.7') return
    const id = window.setInterval(() => setSw((w) => (w + 1) % 3), 1200)
    return () => window.clearInterval(id)
  }, [beat])

  const roll = (after?: (h: number[]) => void) => {
    setThrowing(true)
    const h = randHand()
    setHand(h)
    window.setTimeout(() => setThrowing(false), 600)
    after?.(h)
  }

  // roll five dice and tally how many sixes came up (B3.2A / B3.2B)
  const rollSixes = () => {
    setThrowing(true)
    const h = randHand()
    setHand(h)
    window.setTimeout(() => setThrowing(false), 600)
    const s = counts(h)[6]
    setSixHist((prev) => {
      const n = [...prev]
      n[s]++
      return n
    })
    setSixRolls((n) => {
      const nn = n + 1
      if (nn >= 12) satisfyGate?.()
      return nn
    })
  }
  const sixMean = sixRolls > 0 ? sixHist.reduce((a, k, i) => a + i * k, 0) / sixRolls : 0

  // Demo hands for the illustrative (gate-less) beats.
  const demo: Record<string, number[]> = {
    'B3.4': [5, 5, 5, 5, 2],
    'B3.5': [4, 4, 4, 2, 2],
    'B3.6': [1, 2, 3, 4, 5],
    'B3.7': [1, 2, 3, 4, 6],
    'B3.9': [3, 1, 6, 2, 4],
  }
  const shown = demo[beat] ?? hand

  // Which dice to highlight.
  let hi = new Set<number>()
  const c = counts(shown)
  if (beat === 'B3.2' && face) shown.forEach((v, i) => v === face && hi.add(i))
  if (beat === 'B3.2A' || beat === 'B3.2B') shown.forEach((v, i) => v === 6 && hi.add(i))
  if (beat === 'B3.3') {
    const t = c.findIndex((n) => n >= 3)
    if (t > 0) shown.forEach((v, i) => v === t && hi.add(i))
  }
  if (beat === 'B3.4') {
    const t = c.findIndex((n) => n >= 4)
    if (t > 0) shown.forEach((v, i) => v === t && hi.add(i))
  }
  if (beat === 'B3.5' || beat === 'B3.6' || beat === 'B3.9') hi = new Set([0, 1, 2, 3, 4])
  if (beat === 'B3.7') {
    const lo = sw + 1
    shown.forEach((v, i) => v >= lo && v <= lo + 3 && hi.add(i))
  }
  if (beat === 'B3.8') {
    if (c.some((n) => n === 5)) hi = new Set([0, 1, 2, 3, 4])
  }

  const isDemo = beat in demo

  if (beat === 'B3.10' || beat === '') {
    return <div className="rules-model rules-model--empty" />
  }

  return (
    <div className="rules-model">
      <div className="rules-hand">
        {shown.map((v, i) => (
          <Die key={i} value={v} size={60} throwing={!isDemo && throwing} held={hi.has(i)} />
        ))}
      </div>
      {isDemo && <p className="rules-demo">{tr('пример', 'example')}</p>}

      {/* B3.1 — the 13-row scorecard */}
      {beat === 'B3.1' && (
        <>
          <button type="button" className="rules-btn" onClick={() => { roll(); satisfyGate?.() }}>
            {tr('бросить', 'roll')}
          </button>
          <ol className="rules-card">
            {cats.map((name, i) => (
              <li key={name} className={i === 5 ? 'card-divider' : ''}>{name}</li>
            ))}
          </ol>
        </>
      )}

      {/* B3.2 — upper section: pick a face */}
      {beat === 'B3.2' && (
        <>
          <div className="face-pick">
            {[1, 2, 3, 4, 5, 6].map((f) => (
              <button
                key={f}
                className={`face-btn ${face === f ? 'face-btn--on' : ''}`}
                onClick={() => { setFace(f); satisfyGate?.() }}
              >
                {f}
              </button>
            ))}
          </div>
          {face && (
            <p className="rules-readout">
              {face}{tr('-к', 's')}: {tr('сумма', 'sum')} {c[face] * face} ({c[face]} {tr('шт.', 'pcs')})
            </p>
          )}
          {record && (
            <p className="rules-readout">
              {record.gotBonus
                ? tr(`В своей партии верх ты добрал до ${record.upper} — бонус +35 твой.`, `In your game you reached ${record.upper} up top — the +35 bonus was yours.`)
                : tr(`В своей партии ты набрал вверху ${record.upper} из 63 — бонус ускользнул.`, `In your game you scored ${record.upper} of 63 up top — the bonus slipped away.`)}
            </p>
          )}
        </>
      )}

      {/* B3.2A — binomial: build the histogram of "number of sixes" from rolls */}
      {beat === 'B3.2A' && (
        <>
          <button type="button" className="rules-btn" onClick={rollSixes}>
            {tr('бросить', 'roll')}
          </button>
          {sixRolls > 0 && <SixHist hist={sixHist} rolls={sixRolls} tr={tr} />}
          <p className="rules-readout">
            {tr('бросков', 'rolls')}: {sixRolls} · {tr('сейчас шестёрок', 'sixes now')}: {c[6]}
            {sixRolls >= 12 && tr(' · форма — это B(5, 1/6)', ' · the shape is B(5, 1/6)')}
          </p>
        </>
      )}

      {/* B3.2B — indicators and the running mean tending to 5/6 */}
      {beat === 'B3.2B' && (
        <>
          <div className="rules-indicators">
            {shown.map((v, i) => (
              <span key={i} className={`rules-ind ${v === 6 ? 'rules-ind--on' : ''}`}>
                {v === 6 ? 1 : 0}
              </span>
            ))}
          </div>
          <p className="rules-readout">
            {tr('среднее шестёрок за бросок', 'mean sixes per roll')}:{' '}
            <strong>{sixMean.toFixed(3)}</strong> → 5/6 ≈ 0{tr(',', '.')}833
          </p>
          <button type="button" className="rules-btn" onClick={rollSixes}>
            {tr('перебросить', 'reroll')}
          </button>
        </>
      )}

      {/* B3.3 — collect a triple by rerolling */}
      {beat === 'B3.3' && (
        <>
          <button
            type="button"
            className="rules-btn"
            onClick={() =>
              roll((h) => {
                if (counts(h).some((n) => n >= 3)) {
                  setTripleDone(true)
                  satisfyGate?.()
                }
              })
            }
          >
            {tripleDone ? tr('тройка собрана', 'triple done') : tr('перебросить', 'reroll')}
          </button>
          <Scale items={[{ label: tr('тройка', 'three of a kind'), fav: 1656, pct: '≈21%' }]} />
        </>
      )}

      {beat === 'B3.4' && (
        <Scale items={[
          { label: tr('тройка', 'three of a kind'), fav: 1656, pct: '≈21%' },
          { label: tr('каре', 'four of a kind'), fav: 156, pct: '≈2%' },
        ]} />
      )}
      {beat === 'B3.5' && <Scale items={[{ label: tr('фулл-хаус', 'full house'), fav: 300, pct: tr('≈3,9%', '≈3.9%') }]} />}
      {beat === 'B3.6' && <Scale items={[{ label: tr('большой стрейт', 'large straight'), fav: 240, pct: tr('≈3,1%', '≈3.1%') }]} />}
      {beat === 'B3.7' && (
        <Scale items={[
          { label: tr('большой', 'large'), fav: 240, pct: tr('≈3,1%', '≈3.1%') },
          { label: tr('малый', 'small'), fav: 1200, pct: '≈15%' },
        ]} />
      )}

      {/* B3.8 — try to roll a Yahtzee */}
      {beat === 'B3.8' && (
        <>
          <button type="button" className="rules-btn" onClick={() => { roll(); satisfyGate?.() }}>
            {tr('попробуй выбросить', 'try to roll it')}
          </button>
          <Scale items={[{ label: 'Yahtzee', fav: 6, pct: tr('≈0,08%', '≈0.08%') }]} />
        </>
      )}

      {beat === 'B3.9' && (
        <p className="rules-readout">
          {tr('шанс', 'chance')}: {tr('сумма', 'sum')} {shown.reduce((a, b) => a + b, 0)} — {tr('подходит всегда', 'always applies')}
        </p>
      )}
    </div>
  )
}

export const scene3: Scene = {
  id: 'scene-3',
  model: RulesModel,
  beats: [
    {
      id: 'B3.1',
      scene: 'scene-3',
      prompt:
        'Чтобы у руки появилась цена, нужны правила. Брось — и посмотрим, куда это можно записать.',
      payoff:
        'Партия — это тринадцать ходов. За ход бросаешь пять кубиков и можешь дважды перебросить любые. В конце записываешь руку в одну из тринадцати строк — и она закрывается навсегда. Таблица делится надвое: верх и низ.',
      gate: { kind: 'roll', needed: 1 },
    },
    {
      id: 'B3.2',
      scene: 'scene-3',
      prompt:
        'Верх проще некуда: шесть строк — от единиц до шестёрок. Правило у всех одно: в строку идёт сумма кубиков своей грани, и только их. Перебирай грани — увидишь, что строки устроены одинаково.',
      payoff:
        'Возьмём для счёта шестёрки — для любой грани всё то же. Насколько легко зацепить хоть одну? Удобнее считать **от обратного** — через **противоположное событие** «ни одной шестёрки». У каждой из пяти костей по 5 «не-шестёрок», и по правилу произведения раскладов без единой шестёрки:\n$$5\\cdot5\\cdot5\\cdot5\\cdot5 = 5^5 = 3125$$\nДальше — та самая связка, что и на сетке 6×6: посчитали неблагоприятные исходы комбинаторикой, делим на все 7776 — получаем вероятность:\n$$P(0) = 3125/7776 \\approx 0{,}40, \\qquad P(\\ge 1) = 1 - 3125/7776 \\approx 0{,}60$$\nУ верха есть награда: набери в шести строках 63 очка — бонус +35. Порог 63 — это «средняя» норма, по три кубика на грань: $3\\cdot(1+2+3+4+5+6)=63$. Запомни его, он ещё вернётся.',
      gate: { kind: 'choice' },
    },
    {
      id: 'B3.2A',
      scene: 'scene-3',
      prompt:
        'А сколько шестёрок выпадет за бросок — 0, 1, 2, 3, 4 или 5? Это уже не «да/нет», а целая случайная величина. Бросай и копи столбики — сначала почувствуй форму.',
      payoff:
        'Столбики растут не наугад: чаще всего выпадает ноль или одна шестёрка, две — реже, а все пять почти никогда. Когда бросков набирается достаточно, гистограмма всякий раз ложится в одну и ту же форму — **биномиальное распределение** $B(5,\\ 1/6)$:\n$$P(k) = \\binom{5}{k}\\left(\\tfrac16\\right)^{k}\\left(\\tfrac56\\right)^{5-k}$$\nЧитается так: $\\binom{5}{k}$ — сколькими способами выбрать, какие именно $k$ из пяти костей легли шестёрками; $\\left(\\tfrac16\\right)^{k}$ — что они шестёрки; $\\left(\\tfrac56\\right)^{5-k}$ — что остальные нет. А $B(n,p)$ — это просто «$n$ независимых попыток, в каждой успех с вероятностью $p$».',
      gate: { kind: 'roll', needed: 12 },
    },
    {
      id: 'B3.2B',
      scene: 'scene-3',
      prompt: 'А сколько шестёрок в среднем? Брось несколько раз и следи за бегущим средним.',
      payoff:
        'Заведём на каждую кость **индикатор**: 1, если выпала шестёрка, иначе 0. Среднее одного индикатора — ровно его доля, $1/6$. Бегущее среднее числа шестёрок оседает на $5/6 \\approx 0{,}83$ — и это в точности сумма пяти средних:\n$$E = \\tfrac16 + \\tfrac16 + \\tfrac16 + \\tfrac16 + \\tfrac16 = 5\\cdot\\tfrac16 = \\tfrac56$$\nСреднее суммы равно сумме средних — даже не зная всего распределения. Это **линейность ожидания**, и дальше она станет главным рабочим инструментом.',
      gate: { kind: 'roll', needed: 1 },
    },
    {
      id: 'B3.3',
      scene: 'scene-3',
      prompt:
        'Низ — это комбинации. Первая, самая лёгкая: три одинаковых. За неё пишут сумму всех пяти кубиков. Бросай всю руку заново — без удержания — пока три одинаковых не выпадут сами.',
      payoff:
        'Часто ли три одинаковых выпадают сами? Считаем благоприятные руки. Ровно три одинаковых: грань тройки — 6, какие три кубика из пяти — $C(5,3)=10$, две оставшиеся кости — любые из пяти других граней, $5^2=25$. Выходит\n$$6\\cdot10\\cdot25 = 1500.$$\nПрибавим редкие руки, где совпавших ещё больше, — всего 1656 из 7776, около 21%: примерно каждый пятый бросок.',
      gate: { kind: 'roll', needed: 1 },
    },
    {
      id: 'B3.4',
      scene: 'scene-3',
      prompt: 'Четыре одинаковых — каре. Снова сумма всех кубиков.',
      payoff:
        'Тем же приёмом: ровно четыре $= 6\\cdot C(5,4)\\cdot 5 = 150$; плюс все пять — 6. Итого 156 из 7776, около 2%. На порядок реже тройки: один лишний совпавший кубик стоит дорого.',
    },
    {
      id: 'B3.5',
      scene: 'scene-3',
      prompt: 'Три одинаковых плюс пара — фулл-хаус, ровно 25 очков.',
      payoff:
        'Грань тройки (6) · $C(5,3)=10$ · грань пары, обязательно другая (5) $= 300$ из 7776, около 3,9%.',
    },
    {
      id: 'B3.6',
      scene: 'scene-3',
      prompt:
        'Пять подряд — большой стрейт, 40 очков. Подряд получается лишь двумя наборами: 1·2·3·4·5 или 2·3·4·5·6.',
      payoff:
        'Каждый набор раскладывается по местам $5! = 120$ способами, наборов два: 240 из 7776, около 3,1%.',
    },
    {
      id: 'B3.7',
      scene: 'scene-3',
      prompt:
        'Четыре подряд — малый стрейт, 30 очков. Тут окон уже три: 1–4, 2–5, 3–6.',
      payoff:
        'Окна пересекаются, просто сложить нельзя. По 480 на окно, но руки с пятью подряд попадают в два окна разом — их вычитаем: $3\\cdot480 - 240 = 1200$ из 7776, около 15%. Это **формула включений-исключений**: сложили, потом убрали двойной счёт.',
    },
    {
      id: 'B3.8',
      scene: 'scene-3',
      prompt: 'И вершина — пять одинаковых, Yahtzee, 50 очков. Попробуй собрать за ход.',
      payoff:
        'Благоприятных рук всего шесть — по одной на каждую грань. Значит, любой Yahtzee за один бросок — это $6/7776 \\approx 0{,}077\\%$ (то же самое, что $1/1296$). А вот конкретная пятёрка одинаковых — скажем, пять шестёрок — ещё вшестеро реже: $1/7776$. Самая редкая комбинация; оттого за неё 50 очков и бонус +100 за каждый повтор.',
      gate: { kind: 'roll', needed: 1 },
    },
    {
      id: 'B3.9',
      scene: 'scene-3',
      prompt: 'Последняя строка — шанс. Никаких условий: пиши сумму чего угодно.',
      payoff:
        'Её вероятность — единица, она подходит всегда. Это страховка: сюда сбрасывают руку, из которой больше ничего не выжать.',
    },
    {
      id: 'B3.10',
      scene: 'scene-3',
      prompt:
        'Теперь у каждой руки есть цена. Но всё это — с одного броска. А бросков три, и между ними можно перебрасывать. Что выпадет, если часть кубиков оставить?',
    },
  ],
}
