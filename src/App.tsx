import './App.css'
import { SceneComponent } from '@/scaffolding'
import { openingScene } from '@/scenes/OpeningScene'
import { scene0 } from '@/scenes/Scene0Intuition'
import { scene05 } from '@/scenes/Scene05Coins'
import { scene1 } from '@/scenes/Scene1OneDie'
import { scene2 } from '@/scenes/Scene2TwoDice'

function App() {
  return (
    <main className="explorable-main">
      <SceneComponent scene={openingScene} />
      <SceneComponent scene={scene0} />
      <SceneComponent scene={scene05} />
      <SceneComponent scene={scene1} />
      <SceneComponent scene={scene2} />
    </main>
  )
}

export default App
