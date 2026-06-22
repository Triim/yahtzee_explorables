import './App.css'
import type { Scene } from '@/scaffolding'
import { BeatProvider } from '@/scaffolding/BeatContext'
import { useActiveBeat } from '@/scaffolding/useActiveBeat'
import { BeatTrack } from '@/scaffolding/BeatTrack'
import { ActiveSceneRenderer } from '@/scaffolding/ActiveSceneRenderer'
import { HeroTitle } from '@/scaffolding/HeroTitle'
import { SectionHeroes } from '@/scaffolding/SectionHeroes'
import { NavMenu } from '@/scaffolding/NavMenu'
import { SkipTutorial } from '@/scaffolding/SkipTutorial'
import { Toggles } from '@/scaffolding/Toggles'
import { SettingsProvider, useSettings } from '@/scaffolding/SettingsContext'
import { PlayerStateProvider } from '@/scaffolding/PlayerStateContext'
import { UI, pick } from '@/i18n'
import { openingScene } from '@/scenes/OpeningScene'
import { sceneTutorial } from '@/scenes/SceneTutorial'
import { scene1 } from '@/scenes/Scene1Probability'
import { sceneSum } from '@/scenes/Scene1bSum'
import { scene2 } from '@/scenes/Scene2FiveDiceState'
import { sceneCounting } from '@/scenes/SceneCounting'
import { sceneMultiset } from '@/scenes/Scene2bMultiset'
import { scene3 } from '@/scenes/Scene3Rules'
import { scene4 } from '@/scenes/Scene4Reroll'
import { scene5 } from '@/scenes/Scene5RandomVariable'
import { scene6 } from '@/scenes/Scene6Linearity'
import { scene7 } from '@/scenes/Scene7Value'
import { scene8 } from '@/scenes/Scene8Strategies'
import { sceneStrat } from '@/scenes/Scene8bStrategy'
import { sceneFair } from '@/scenes/SceneFairness'
import { scene9 } from '@/scenes/Scene9Opponent'
import { scene10 } from '@/scenes/Scene10Synthesis'

/** Attach a menu label to the scene that opens each section. */
function withMenu(scene: Scene, menuLabel: string): Scene {
  return { ...scene, menuLabel }
}

// Mainline runs Value → Distribution → Strategies → Opponent → Synthesis; the
// fairness section is an optional side-quest parked at the very end so it never
// breaks the competitive build-up.
const allScenes: Scene[] = [
  withMenu(openingScene, 'Введение'),
  withMenu(sceneTutorial, 'Туториал · Сыграй сам'),
  withMenu(scene1, '1 · Что значит «вероятно»?'),
  withMenu(sceneSum, '2 · Какие суммы выпадают чаще?'),
  withMenu(scene2, '3 · Сколько бывает раскладов?'),
  withMenu(sceneCounting, '4 · Откуда берётся 252?'),
  withMenu(sceneMultiset, '5 · Все ли руки равновероятны?'),
  withMenu(scene3, '6 · Как считаются очки?'),
  withMenu(scene4, '7 · Что выгоднее оставить?'),
  withMenu(scene5, '8 · Сколько рука стоит в среднем?'),
  withMenu(scene6, '9 · Почему «брать максимум» проигрывает?'),
  withMenu(scene7, '10 · Чего стоит каждое положение?'),
  withMenu(scene8, '11 · Насколько разбросан счёт?'),
  withMenu(sceneStrat, '12 · Как вообще играть?'),
  withMenu(scene9, '13 · Что меняет соперник?'),
  withMenu(scene10, '14 · Мастерство или удача?'),
  withMenu(sceneFair, 'Доп · А честная ли кость?'),
]

function AppContent() {
  useActiveBeat()
  const { lang } = useSettings()

  return (
    <>
      <NavMenu />
      <Toggles />
      <SkipTutorial />

      {/* Fixed right-hand stage: it never scrolls, only its content swaps. */}
      <ActiveSceneRenderer />

      {/* Left reading column scrolls; the page provides the scroll. */}
      <main className="reader">
        <BeatTrack />
      </main>

      {/* Full-screen hero that splits like a curtain as you scroll. */}
      <HeroTitle />

      {/* A title curtain for each section, by the same split-and-lift logic. */}
      <SectionHeroes />

      <div className="mobile-stub">
        <p>{pick(UI.mobile, lang)}</p>
      </div>
    </>
  )
}

function App() {
  return (
    <SettingsProvider>
      <PlayerStateProvider>
        <BeatProvider scenes={allScenes}>
          <AppContent />
        </BeatProvider>
      </PlayerStateProvider>
    </SettingsProvider>
  )
}

export default App
