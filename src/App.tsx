import './App.css'
import { SceneComponent } from '@/scaffolding'
import { openingScene } from '@/scenes/OpeningScene'
import { scene0 } from '@/scenes/Scene0Intuition'
import { scene05 } from '@/scenes/Scene05Coins'
import { scene1 } from '@/scenes/Scene1OneDie'
import { scene2 } from '@/scenes/Scene2TwoDice'
import { scene3 } from '@/scenes/Scene3FiveDice'
import { scene35 } from '@/scenes/Scene35Categories'
import { scene4, scene5 } from '@/scenes/Scene4And5'

function App() {
  return (
    <main className="explorable-main">
      <SceneComponent scene={openingScene} />
      <SceneComponent scene={scene0} />
      <SceneComponent scene={scene05} />
      <SceneComponent scene={scene1} />
      <SceneComponent scene={scene2} />
      <SceneComponent scene={scene3} />
      <SceneComponent scene={scene35} />
      <SceneComponent scene={scene4} />
      <SceneComponent scene={scene5} />
    </main>
  )
}

export default App
