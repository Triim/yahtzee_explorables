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
import { scene6 } from '@/scenes/Scene6FullTurn'
import { scene7 } from '@/scenes/Scene7StateDP'
import { scene8 } from '@/scenes/Scene8Strategies'
import { scene9, scene10 } from '@/scenes/Scene9And10'

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
      <SceneComponent scene={scene6} />
      <SceneComponent scene={scene7} />
      <SceneComponent scene={scene8} />
      <SceneComponent scene={scene9} />
      <SceneComponent scene={scene10} />
    </main>
  )
}

export default App
