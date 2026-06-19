import './App.css'
import type { Scene } from '@/scaffolding'
import { BeatProvider } from '@/scaffolding/BeatContext'
import { useActiveBeat } from '@/scaffolding/useActiveBeat'
import { BeatTrack } from '@/scaffolding/BeatTrack'
import { ActiveSceneRenderer } from '@/scaffolding/ActiveSceneRenderer'
import { HeroTitle } from '@/scaffolding/HeroTitle'
import { NavMenu } from '@/scaffolding/NavMenu'
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

/** Attach a menu label to the scene that opens each of the eleven sections. */
function withMenu(scene: Scene, menuLabel: string): Scene {
  return { ...scene, menuLabel }
}

const allScenes: Scene[] = [
  withMenu(openingScene, 'Введение'),
  withMenu(scene0, '1 · Вероятность'),
  scene05,
  scene1,
  scene2,
  withMenu(scene3, '2 · Пять кубиков'),
  withMenu(scene35, '3 · Правила и комбинации'),
  withMenu(scene4, '4 · Переброс'),
  withMenu(scene5, '5 · Случайная величина'),
  withMenu(scene6, '6 · Линейность и жадность'),
  withMenu(scene7, '7 · Ценность положения'),
  withMenu(scene8, '8 · Стратегии'),
  withMenu(scene9, '9 · Соперник'),
  withMenu(scene10, '10 · Синтез'),
]

function AppContent() {
  useActiveBeat()

  return (
    <>
      <NavMenu />

      {/* Fixed right-hand stage: it never scrolls, only its content swaps. */}
      <ActiveSceneRenderer />

      {/* Left reading column scrolls; the page provides the scroll. */}
      <main className="reader">
        <BeatTrack />
      </main>

      {/* Full-screen hero that splits like a curtain as you scroll. */}
      <HeroTitle />

      <div className="mobile-stub">
        <p>
          Эта интерактивная история рассчитана на широкий экран. Открой её на
          компьютере.
        </p>
      </div>
    </>
  )
}

function App() {
  return (
    <BeatProvider scenes={allScenes}>
      <AppContent />
    </BeatProvider>
  )
}

export default App
