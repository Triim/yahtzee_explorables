import './App.css'
import { ActiveStepProvider } from '@/scaffolding/ActiveStepContext'
import { useGlobalActiveStep } from '@/scaffolding/useGlobalActiveStep'
import { StepTrack } from '@/scaffolding/StepTrack'
import { ActiveSceneRenderer } from '@/scaffolding/ActiveSceneRenderer'
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

const allScenes = [
  openingScene,
  scene0,
  scene05,
  scene1,
  scene2,
  scene3,
  scene35,
  scene4,
  scene5,
  scene6,
  scene7,
  scene8,
  scene9,
  scene10,
]

function AppContent() {
  useGlobalActiveStep()

  return (
    <div className="layout">
      <StepTrack scenes={allScenes} />
      <ActiveSceneRenderer scenes={allScenes} />
    </div>
  )
}

function App() {
  return (
    <ActiveStepProvider>
      <AppContent />
    </ActiveStepProvider>
  )
}

export default App
