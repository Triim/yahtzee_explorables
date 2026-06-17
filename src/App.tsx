import './App.css'
import { SceneComponent } from '@/scaffolding'
import { demoScene } from '@/scenes/DemoScene'

function App() {
  return (
    <main className="explorable-main">
      <SceneComponent scene={demoScene} />
    </main>
  )
}

export default App
