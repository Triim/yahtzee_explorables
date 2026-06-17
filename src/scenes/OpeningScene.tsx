import type { SceneModelProps } from '@/scaffolding'
import { Die, RollButton, useDieRoll } from '@/components'
import './HeroModel.css'

export function HeroModel(_props: SceneModelProps) {
  const die = useDieRoll(1)

  const handleRoll = () => {
    die.start(Math.floor(Math.random() * 6) + 1) // honest
  }

  return (
    <div className="hero-model">
      <div className="hero-die-container">
        <Die value={die.displayValue} size={120} throwing={die.throwing} />
      </div>
      <RollButton
        onRoll={handleRoll}
        label="Roll"
        pulsing={!die.throwing}
        disabled={die.throwing}
      />
    </div>
  )
}

export const openingScene = {
  id: 'opening',
  model: HeroModel,
  steps: [
    {
      id: 'int-1',
      copyType: 'инструкция' as const,
      register: 'free' as const,
      directive: { kind: 'activate' as const, model: 'hero' },
      text: 'A pair of dice. You\'ve held them a hundred times. Yahtzee is just five of them, thirteen turns, and a scorecard — a game simple enough to teach a child in a minute.',
    },
    {
      id: 'int-2',
      copyType: 'определение' as const,
      register: 'free' as const,
      text: 'But stay with it a while, and the simple game starts asking quiet questions that plain arithmetic can\'t answer. And every time you outgrow one piece of math, the game calmly hands you the next.',
    },
    {
      id: 'int-3',
      copyType: 'определение' as const,
      register: 'free' as const,
      text: 'So this isn\'t really a guide to winning Yahtzee. It\'s a story about how a game this small keeps forcing you to invent harder and harder mathematics — until, near the very end, it changes what "winning" even means.',
    },
    {
      id: 'int-4',
      copyType: 'определение' as const,
      register: 'free' as const,
      text: 'One thing before we begin. The piece on the right is the point — roll it, drag it, poke at it. The words on the left are only here to nudge. And nothing here is rigged: when you roll, you really roll.',
    },
    {
      id: 'int-5',
      copyType: 'переход' as const,
      register: 'free' as const,
      text: 'We\'ll build the whole thing up from a single die. But before the first die — humor me with three quick guesses.',
    },
  ],
}
