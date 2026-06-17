import type { SceneModelProps, Scene } from '@/scaffolding'
import { Die, RollButton, useDieRoll } from '@/components'
import './HeroModel.css'

export function HeroModel({ satisfyGate }: SceneModelProps) {
  const die = useDieRoll(1)

  const handleRoll = () => {
    die.start(Math.floor(Math.random() * 6) + 1) // honest
    satisfyGate?.() // gate: a single roll opens the door
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

export const openingScene: Scene = {
  id: 'opening',
  model: HeroModel,
  beats: [
    {
      id: 'INT.1',
      scene: 'opening',
      prompt:
        "A pair of dice — you've held them a hundred times. Go on, roll the one on the right.",
      payoff:
        "Nothing rigged: when you roll, you really roll. This isn't a guide to winning Yahtzee — it's how a game this small keeps forcing you to invent harder mathematics, until it changes what \"winning\" even means.",
      gate: { kind: 'roll', needed: 1 },
    },
    {
      id: 'INT.2',
      scene: 'opening',
      prompt:
        "We'll build the whole thing up from a single die. But first — humor me with three quick guesses.",
    },
  ],
}
