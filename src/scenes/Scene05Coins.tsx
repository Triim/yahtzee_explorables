import { useState } from 'react'
import type { SceneModelProps } from '@/scaffolding'
import { Histogram, RollButton } from '@/components'
import { binomialDistribution } from '@/engine'
import './CoinsModel.css'

export function CoinsModel(_props: SceneModelProps) {
  const [coinStates, setCoinStates] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
  ])
  const [rolls, setRolls] = useState(0)

  const handleToss = () => {
    setCoinStates(Array.from({ length: 5 }, () => Math.random() > 0.5))
    setRolls(rolls + 1)
  }

  const heads = coinStates.filter((h) => h).length

  // Binomial distribution for 5 tosses, p=0.5
  const dist = binomialDistribution(5, 0.5)
  const histData = new Map<number, number>()
  for (let i = 0; i <= 5; i++) {
    histData.set(i, dist[i] || 0)
  }

  return (
    <div className="coins-model">
      <div className="coins-display">
        {coinStates.map((isHeads, i) => (
          <div key={i} className={`coin ${isHeads ? 'heads' : 'tails'}`}>
            {isHeads ? 'H' : 'T'}
          </div>
        ))}
      </div>
      <div className="coins-result">
        <p className="result-text">
          {heads} heads, {5 - heads} tails
        </p>
      </div>
      <RollButton onRoll={handleToss} label="Toss 5 Coins" pulsing={rolls === 0} />

      {rolls > 0 && (
        <div className="coins-histogram">
          <Histogram
            data={histData}
            title="Expected distribution (5 tosses, p=0.5)"
            xLabel="# Heads"
            yLabel="P(X)"
            width={350}
            height={200}
          />
        </div>
      )}
    </div>
  )
}

export const scene05 = {
  id: 'scene-05',
  model: CoinsModel,
  steps: [
    {
      id: 's05-1',
      copyType: 'инструкция' as const,
      register: 'free' as const,
      directive: { kind: 'activate' as const, model: 'coins' },
      text: 'Not a die yet — a coin. Heads or tails, nothing simpler. Toss five at once.',
    },
    {
      id: 's05-2',
      copyType: 'определение' as const,
      register: 'free' as const,
      text: 'On average, heads and tails split evenly. But "on average" is about thousands of tosses, not these five — which landed however they landed, rarely exactly half and half.',
    },
    {
      id: 's05-3',
      copyType: 'вопрос' as const,
      register: 'free' as const,
      text: 'Let\'s add a drop of difficulty. Say heads is worth twice a tail, and you may score only one of the two boxes now — the other you\'ll take later, with whatever\'s left. Which do you take?',
    },
    {
      id: 's05-4',
      copyType: 'формула' as const,
      register: 'free' as const,
      text: 'Here the math has nowhere to hide — we can write it out in full. Let $h$ be the number of heads, and $S_1, S_2$ the two box scores. Take box 1 only if $h > h^* = \\dfrac{S_2}{S_1+S_2}$. Below that threshold, reroll and hope. Sometimes it pays to refuse points now for something better later. Remember this — the whole game ahead is about it.',
    },
    {
      id: 's05-5',
      copyType: 'переход' as const,
      register: 'free' as const,
      text: 'A coin is too simple to hide its answer behind calculation. Put a die in its place, and the closed-form formulas run out fast. Let\'s start with one die.',
    },
  ],
}
