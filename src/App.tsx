import { useState } from 'react'
import './App.css'
import { SceneComponent } from '@/scaffolding'
import { demoScene } from '@/scenes/DemoScene'
import { Die, RollButton, Histogram } from '@/components'

function ComponentGallery() {
  const [diceValues, setDiceValues] = useState<number[]>([1, 2, 3, 4, 5])
  const [rolls, setRolls] = useState(0)

  const handleRoll = () => {
    const newValues = Array.from({ length: 5 }, () =>
      Math.floor(Math.random() * 6) + 1
    )
    setDiceValues(newValues)
    setRolls(rolls + 1)
  }

  // Sample histogram data
  const histogramData = new Map([
    [1, 2],
    [2, 4],
    [3, 5],
    [4, 3],
    [5, 1],
  ])

  return (
    <div className="component-gallery">
      <h1>Component Gallery</h1>

      <section>
        <h2>Die Component</h2>
        <div className="gallery-demo">
          {diceValues.map((value, i) => (
            <Die
              key={i}
              value={value}
              size={80}
              onClick={() => {
                const newValues = [...diceValues]
                newValues[i] = Math.floor(Math.random() * 6) + 1
                setDiceValues(newValues)
              }}
            />
          ))}
        </div>
      </section>

      <section>
        <h2>Roll Button Component</h2>
        <div className="gallery-demo">
          <RollButton
            onRoll={handleRoll}
            label="Roll Dice"
            pulsing={rolls === 0}
          />
          <p>Rolls so far: {rolls}</p>
        </div>
      </section>

      <section>
        <h2>Histogram Component</h2>
        <div className="gallery-demo">
          <Histogram
            data={histogramData}
            title="Sample Distribution"
            xLabel="Value"
            yLabel="Count"
            width={400}
            height={250}
          />
        </div>
      </section>

      <section>
        <h2>Demo Scene</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Scroll to test the scrollytelling mechanics:
        </p>
      </section>

      <SceneComponent scene={demoScene} />
    </div>
  )
}

function App() {
  return (
    <main className="explorable-main">
      <ComponentGallery />
    </main>
  )
}

export default App
