import { useState } from 'react'
import type { SceneModelProps } from '@/scaffolding'
import './Scene9And10.css'

// Scene 9: Opponent (win region)
export function OpponentModel(_props: SceneModelProps) {
  const [myScore, setMyScore] = useState(120)
  const [theirScore, setTheirScore] = useState(130)
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)

  return (
    <div className="opponent-model">
      <h3>Head to Head</h3>
      <p className="intro">
        You've scored 120. Your opponent has 130. One turn left, and one box remains.
      </p>

      <div className="score-display">
        <div className="score-box">
          <div className="score-label">You</div>
          <div className="score-value">{myScore}</div>
        </div>
        <div className="divider">vs</div>
        <div className="score-box opponent">
          <div className="score-label">Opponent</div>
          <div className="score-value">{theirScore}</div>
        </div>
      </div>

      <div className="regions">
        <p className="region-label">Your next score lands in:</p>
        <div
          className={`region ${hoveredRegion === 'win' ? 'hovered' : ''}`}
          onMouseEnter={() => setHoveredRegion('win')}
          onMouseLeave={() => setHoveredRegion(null)}
          onClick={() => {
            setMyScore(160)
            setTheirScore(130)
          }}
        >
          <strong>Win zone</strong> (160+): You're ahead
        </div>
        <div
          className={`region ${hoveredRegion === 'lose' ? 'hovered' : ''}`}
          onMouseEnter={() => setHoveredRegion('lose')}
          onMouseLeave={() => setHoveredRegion(null)}
          onClick={() => {
            setMyScore(95)
            setTheirScore(130)
          }}
        >
          <strong>Lose zone</strong> (95-): Opponent wins
        </div>
        <div
          className={`region ${hoveredRegion === 'tie' ? 'hovered' : ''}`}
          onMouseEnter={() => setHoveredRegion('tie')}
          onMouseLeave={() => setHoveredRegion(null)}
          onClick={() => {
            setMyScore(130)
            setTheirScore(130)
          }}
        >
          <strong>Tie zone</strong> (130): Tied
        </div>
      </div>

      <p className="note">
        Your decision changes not just your score, but the winner. Opponent context matters.
      </p>
    </div>
  )
}

// Scene 10: Adaptive Finale (capstone)
export function FinaleModel(_props: SceneModelProps) {
  return (
    <div className="finale-model">
      <h2>The Adapters</h2>
      <div className="capstone-box">
        <p>
          Dice roll. Distribution emerges. Expected value guides. Strategies compete. Opponents
          shape choices.
        </p>
        <p>
          You now see the geometry of Yahtzee: a game of adaptive decisions under uncertainty,
          where each move trades now against later, and every opponent changes the math.
        </p>
        <p className="closing">
          Go play. The dice are honest.
        </p>
      </div>
    </div>
  )
}

export const scene9 = {
  id: 'scene-9',
  model: OpponentModel,
  steps: [
    {
      id: 's9-1',
      copyType: 'инструкция' as const,
      register: 'free' as const,
      directive: { kind: 'activate' as const, model: 'opponent' },
      text: 'Two players. You\'re behind. One roll left. Click a zone — see where your score might land, and whether you win.',
    },
    {
      id: 's9-2',
      copyType: 'вопрос' as const,
      register: 'free' as const,
      text: 'The same hand is better when losing than when ahead. Value is not intrinsic to the dice — it\'s a function of the state, including the opponent.',
    },
    {
      id: 's9-3',
      copyType: 'определение' as const,
      register: 'free' as const,
      text: 'This is why game theory and pure probability diverge. The number 160 is only good if it beats the other player. Alone it means nothing; with an opponent it means everything.',
    },
    {
      id: 's9-4',
      copyType: 'переход' as const,
      register: 'free' as const,
      text: 'You now know the core of the game. Let\'s step back.',
    },
  ],
}

export const scene10 = {
  id: 'scene-10',
  model: FinaleModel,
  steps: [
    {
      id: 's10-1',
      copyType: 'определение' as const,
      register: 'free' as const,
      directive: { kind: 'activate' as const, model: 'finale' },
      text: 'You started with three guesses and intuition. By now you\'ve moved through probability, expected value, state-based optimization, strategy, and competition.',
    },
    {
      id: 's10-2',
      copyType: 'определение' as const,
      register: 'free' as const,
      text: 'This is not a lesson in Yahtzee alone. It\'s a lens: how to think about any sequential game, any uncertain decision, any outcome that depends on what others do.',
    },
    {
      id: 's10-3',
      copyType: 'определение' as const,
      register: 'free' as const,
      text: 'The dice don\'t lie. When you roll, you see a distribution. When you choose, you pick a move. When you wait, you trade now for later. When you face someone else, the math shifts.',
    },
    {
      id: 's10-4',
      copyType: 'определение' as const,
      register: 'free' as const,
      text: 'Go play Yahtzee. Roll honestly, think ahead, adapt to the table. The game rewards it.',
    },
  ],
}
