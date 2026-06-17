import { useState } from 'react'
import type { SceneModelProps } from '@/scaffolding'
import { Die, RollButton } from '@/components'
import './FullTurnModel.css'

export function FullTurnModel(_props: SceneModelProps) {
  const [rollNum, setRollNum] = useState(0)
  const [hand, setHand] = useState<number[]>([1, 2, 3, 4, 5])
  const [kept, setKept] = useState<boolean[]>([false, false, false, false, false])
  const [selectedBox, setSelectedBox] = useState<string | null>(null)

  const handleRoll = () => {
    if (rollNum < 3) {
      const rolled = Array.from({ length: 5 }, (_, i) => {
        if (kept[i]) return hand[i]
        return Math.floor(Math.random() * 6) + 1
      })
      setHand(rolled)
      setRollNum(rollNum + 1)
    }
  }

  const toggleKeep = (idx: number) => {
    if (rollNum < 3) {
      setKept(kept.map((k, i) => (i === idx ? !k : k)))
    }
  }

  const resetTurn = () => {
    setRollNum(0)
    setHand([1, 2, 3, 4, 5])
    setKept([false, false, false, false, false])
    setSelectedBox(null)
  }

  const categories = [
    'Ones', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes',
    'Three of a Kind', 'Four of a Kind', 'Full House',
    'Small Straight', 'Large Straight', 'Yahtzee', 'Chance'
  ]

  return (
    <div className="full-turn-model">
      <div className="turn-status">
        <p className="roll-counter">Roll {rollNum} / 3</p>
        {rollNum === 3 && (
          <p className="status-text">Final hand — pick a box to score.</p>
        )}
      </div>

      <div className="dice-section">
        <div className="hand-display">
          {hand.map((value, i) => (
            <button
              key={i}
              className={`die-keeper ${kept[i] ? 'kept' : ''}`}
              onClick={() => toggleKeep(i)}
              disabled={rollNum === 3}
            >
              <Die value={value} size={60} />
              {kept[i] && <div className="kept-label">kept</div>}
            </button>
          ))}
        </div>

        {rollNum < 3 && (
          <RollButton
            onRoll={handleRoll}
            label={`Roll ${rollNum === 0 ? '5 Dice' : 'Remaining'}`}
            pulsing={rollNum === 0}
          />
        )}
      </div>

      {rollNum === 3 && (
        <div className="scorecard-section">
          <p className="scorecard-label">Which box scores this hand?</p>
          <div className="scorecard-grid">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`scorecard-box ${selectedBox === cat ? 'selected' : ''}`}
                onClick={() => setSelectedBox(cat)}
              >
                <div className="box-name">{cat}</div>
                <div className="box-value">{Math.floor(Math.random() * 20)}</div>
              </button>
            ))}
          </div>

          {selectedBox && (
            <p className="confirm-text">
              Locked in: <strong>{selectedBox}</strong>. (13 boxes total; this one is gone forever.)
            </p>
          )}

          <button className="reset-button" onClick={resetTurn}>
            Start new turn
          </button>
        </div>
      )}
    </div>
  )
}

export const scene6 = {
  id: 'scene-6',
  model: FullTurnModel,
  steps: [
    {
      id: 's6-1',
      copyType: 'инструкция' as const,
      register: 'free' as const,
      directive: { kind: 'activate' as const, model: 'fullturn' },
      text: 'A real turn: three rolls, keep what you choose, score once at the end. Go.',
    },
    {
      id: 's6-2',
      copyType: 'определение' as const,
      register: 'free' as const,
      text: 'The box you pick is gone forever. Thirteen boxes, thirteen turns — each a one-way choice. The game is a sequence of irreversible decisions.',
    },
    {
      id: 's6-3',
      copyType: 'вопрос' as const,
      register: 'free' as const,
      text: 'Do you score when you\'re sure, or gamble on a reroll? Do you take a big box or guard a small one for later? Every move trades off now against later.',
    },
    {
      id: 's6-4',
      copyType: 'формула' as const,
      register: 'free' as const,
      text: 'The state of the game is the filled scorecard: which boxes are closed, which open. From that state, you can ask: what is the best expected score from here on?',
    },
    {
      id: 's6-5',
      copyType: 'переход' as const,
      register: 'free' as const,
      text: 'That is a value — $V(\\text{state})$ — and it defines optimal play. This value function is computed by dynamic programming: work backwards from the end.',
    },
  ],
}
