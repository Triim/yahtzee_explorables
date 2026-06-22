import { useEffect, useRef, useState } from 'react'
import type { SceneModelProps, Scene } from '@/scaffolding'
import { useTr } from '@/scaffolding'
import { Die } from '@/components'
import './FiveDiceState.css'

/* ============================================================
   Section 2 — Five dice and state.
   7776 ordered rolls collapse into 252 distinct hands.
   ============================================================ */

const START: number[] = [3, 1, 6, 1, 4]

export function FiveDiceStateModel({ activeBeatId, satisfyGate }: SceneModelProps) {
  const beat = activeBeatId ?? ''
  const tr = useTr()

  const [hand] = useState<number[]>(START)
  const [ordered, setOrdered] = useState(true) // B2.2: does order matter?
  const [collapsed, setCollapsed] = useState(false)
  const [count, setCount] = useState(7776)
  const [buildK, setBuildK] = useState(1) // B2.1: dice added so far while building 6^k
  const rafRef = useRef<number | null>(null)

  // While building the count (B2.1) only k dice are on the table; elsewhere all five.
  const handBase = beat === 'B2.1' ? hand.slice(0, buildK) : hand
  const shown = ordered ? handBase : [...handBase].sort((a, b) => a - b)

  const addBuildDie = () => {
    setBuildK((k) => {
      const nk = Math.min(k + 1, 5)
      if (nk >= 5) satisfyGate?.()
      return nk
    })
  }

  const countDistinct = () => {
    if (collapsed) return
    setCollapsed(true)
    satisfyGate?.()
    const from = 7776
    const to = 252
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - t0) / 1100, 1)
      const eased = 1 - (1 - p) ** 3
      setCount(Math.round(from + (to - from) * eased))
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
  }, [])

  if (beat === 'B2.4' || beat === '') {
    return <div className="fds-model fds-model--empty" />
  }

  return (
    <div className="fds-model">
      <div className="fds-hand">
        {shown.map((v, i) => (
          <Die key={i} value={v} size={64} />
        ))}
      </div>

      {beat === 'B2.1' && (
        <>
          <button
            type="button"
            className="fds-btn"
            onClick={addBuildDie}
            disabled={buildK >= 5}
          >
            {buildK >= 5 ? tr('пять кубиков', 'five dice') : tr('добавить кубик', 'add a die')}
          </button>
          <p className="fds-count">
            {Array.from({ length: buildK }, () => '6').join(' × ')} ={' '}
            <strong>{(6 ** buildK).toLocaleString(tr('ru-RU', 'en-US'))}</strong>
            {buildK >= 2 && <> {tr('раскладов', 'arrangements')}</>}
          </p>
        </>
      )}

      {beat === 'B2.2' && (
        <>
          <button
            type="button"
            className={`fds-btn ${!ordered ? 'fds-btn--on' : ''}`}
            onClick={() => {
              setOrdered((o) => !o)
              satisfyGate?.()
            }}
          >
            {ordered ? tr('учитывать порядок', 'order matters') : tr('порядок не важен', 'order doesn’t matter')}
          </button>
          <p className="fds-note">
            {ordered
              ? tr('3·1·6·1·4 — пять кубиков по местам', '3·1·6·1·4 — five dice in their places')
              : tr('та же рука: 1·1·3·4·6', 'same hand: 1·1·3·4·6')}
          </p>
        </>
      )}

      {beat === 'B2.3' && (
        <>
          <div className="fds-cloud" data-collapsed={collapsed}>
            <span className="fds-bignum">{count.toLocaleString(tr('ru-RU', 'en-US'))}</span>
            <span className="fds-cloud-label">
              {collapsed ? tr('разных рук', 'distinct hands') : tr('упорядоченных раскладов', 'ordered arrangements')}
            </span>
          </div>
          <button type="button" className="fds-btn" onClick={countDistinct}>
            {tr('посчитать разные руки', 'count distinct hands')}
          </button>
        </>
      )}
    </div>
  )
}

export const scene2: Scene = {
  id: 'scene-2',
  model: FiveDiceStateModel,
  beats: [
    {
      id: 'B2.1',
      scene: 'scene-2',
      prompt:
        'Два кубика мы разложили по тридцати шести клеткам. Возьмём пять — ровно столько в самой игре. Сколько вообще бывает раскладов? Начни с одного кубика и добавляй по одному.',
      payoff:
        'У одного кубика шесть исходов. Добавишь второй — каждый из его шести исходов встаёт в пару с каждым из шести первого, выходит 6 × 6 = 36. Третий умножает ещё на шесть, и так далее — это **правило произведения**.\n[[$6 \\times 6 \\times 6 \\times 6 \\times 6 = 6^5 = 7776$ раскладов]]\nИ тут прежний приём ломается: 36 пар умещались в одну табличку 6×6, а для пяти костей такой таблице нужно пять осей. Перечислять 7776 раскладов руками бессмысленно — нужен счёт.',
      gate: { kind: 'choice' },
    },
    {
      id: 'B2.2',
      scene: 'scene-2',
      prompt:
        'Но приглядись к своей руке. Важно ли, какой кубик лежит первым, а какой третьим?',
      payoff:
        '3·1·6·1·4 и 1·6·4·1·3 — это одна и та же рука: те же грани, просто разложены иначе. Как ни перемешивай, важно лишь, какие числа выпали и сколько каких.',
      gate: { kind: 'toggle' },
    },
    {
      id: 'B2.3',
      scene: 'scene-2',
      prompt: 'Раз порядок не важен — посчитаем не расклады, а разные руки.',
      payoff:
        '7776 упорядоченных раскладов схлопываются всего в 252 разные руки. Такую руку — «какие грани и сколько каждой, без порядка» — называют **мультимножеством**, а для нас это просто **состояние**: рука стала одним объектом. Мы выбросили лишнее — порядок — и оставили только то, что влияет на игру. Откуда взялось ровно 252, мы аккуратно посчитаем чуть позже.',
      gate: { kind: 'choice' },
    },
    {
      id: 'B2.4',
      scene: 'scene-2',
      prompt:
        'Теперь рука — аккуратный объект, и таких объектов 252. Но откуда взялось именно это число? Соберём счёт по косточкам — на шарах и коробках.',
    },
  ],
}
