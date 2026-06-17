import './App.css'
import { SceneComponent } from '@/scaffolding'
import { openingScene } from '@/scenes/OpeningScene'
import { scene0 } from '@/scenes/Scene0Intuition'

function App() {
  return (
    <main className="explorable-main">
      <SceneComponent scene={openingScene} />
      <SceneComponent scene={scene0} />
    </main>
  )
}

export default App
