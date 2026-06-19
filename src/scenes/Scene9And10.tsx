import { useState } from 'react'
import type { SceneModelProps } from '@/scaffolding'
import './Scene9And10.css'

// Scene 9: Opponent (win region)
export function OpponentModel(_props: SceneModelProps) {
  const [myScore, setMyScore] = useState(120)
  const [theirScore, setTheirScore] = useState(130)
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)

  return (
    <div className="opponent-model">
      <h3>Один на один</h3>
      <p className="intro">
        Вы набрали 120 очков. У вашего оппонента 130. Остался один ход и одна свободная ячейка.
      </p>

      <div className="score-display">
        <div className="score-box">
          <div className="score-label">Вы</div>
          <div className="score-value">{myScore}</div>
        </div>
        <div className="divider">против</div>
        <div className="score-box opponent">
          <div className="score-label">Оппонент</div>
          <div className="score-value">{theirScore}</div>
        </div>
      </div>

      <div className="regions">
        <p className="region-label">Ваш следующий результат попадает в:</p>
        <div
          className={`region ${hoveredRegion === 'win' ? 'hovered' : ''}`}
          onMouseEnter={() => setHoveredRegion('win')}
          onMouseLeave={() => setHoveredRegion(null)}
          onClick={() => {
            setMyScore(160)
            setTheirScore(130)
          }}
        >
          <strong>Зона победы</strong> (160+): Вы впереди
        </div>
        <div
          className={`region ${hoveredRegion === 'lose' ? 'hovered' : ''}`}
          onMouseEnter={() => setHoveredRegion('lose')}
          onMouseLeave={() => setHoveredRegion(null)}
          onClick={() => {
            setMyScore(95)
            setTheirScore(130)
          }}
        >
          <strong>Зона поражения</strong> (95-): Оппонент побеждает
        </div>
        <div
          className={`region ${hoveredRegion === 'tie' ? 'hovered' : ''}`}
          onMouseEnter={() => setHoveredRegion('tie')}
          onMouseLeave={() => setHoveredRegion(null)}
          onClick={() => {
            setMyScore(130)
            setTheirScore(130)
          }}
        >
          <strong>Зона ничьей</strong> (130): Ничья
        </div>
      </div>

      <p className="note">
        Ваше решение меняет не только ваш счет, но и победителя. Контекст оппонента имеет значение.
      </p>
    </div>
  )
}

// Scene 10: Adaptive Finale (capstone)
export function FinaleModel(_props: SceneModelProps) {
  return (
    <div className="finale-model">
      <h2>Адаптеры</h2>
      <div className="capstone-box">
        <p>
          Бросок костей. Появляется распределение. Ожидаемая ценность направляет. Стратегии соревнуются. Оппоненты
          формируют выбор.
        </p>
        <p>
          Теперь вы видите геометрию Яхтзи: игра адаптивных решений в условиях неопределенности,
          где каждый ход — это компромисс между настоящим и будущим, и каждый оппонент меняет математику.
        </p>
        <p className="closing">
          Играйте. Кости честны.
        </p>
      </div>
    </div>
  )
}

import type { Scene } from '@/scaffolding'

// ... existing code ...

export const scene9: Scene = {
  id: 'scene-9',
  model: OpponentModel,
  beats: [
    {
      id: 'B9.1',
      scene: 'scene-9',
      prompt:
        'Два игрока. Вы отстаете. Остался один бросок. Кликните на зону — посмотрите, куда может попасть ваш счет, и выиграете ли вы.',
    },
    {
      id: 'B9.2',
      scene: 'scene-9',
      prompt:
        'Одна и та же рука лучше, когда вы проигрываете, чем когда вы впереди. Ценность не присуща костям — это функция состояния, включая счет оппонента.',
    },
    {
      id: 'B9.3',
      scene: 'scene-9',
      prompt:
        'Вот почему теория игр и чистая вероятность расходятся. Ценность становится: $V(\\text{рука}, \\text{счет оппонента}) = \\mathbb{1}[\\text{мой счет} > \\text{оппонент}]$. Счет 160 стоит 1, если у оппонента 150, и 0, если у оппонента 170. Одна и та же рука, две разные ценности.',
    },
    {
      id: 'B9.4',
      scene: 'scene-9',
      prompt: 'Теперь вы знаете суть игры. Давайте сделаем шаг назад.',
    },
  ],
}

export const scene10: Scene = {
  id: 'scene-10',
  model: FinaleModel,
  beats: [
    {
      id: 'B10.1',
      scene: 'scene-10',
      prompt:
        'Вы начали с трех догадок и интуиции. К настоящему моменту вы прошли через вероятность, ожидаемую ценность, оптимизацию на основе состояний, стратегию и соревнование.',
    },
    {
      id: 'B10.2',
      scene: 'scene-10',
      prompt:
        'Это не просто урок по Яхтзи. Это призма: как думать о любой последовательной игре, любом неопределенном решении, любом исходе, который зависит от действий других.',
    },
    {
      id: 'B10.3',
      scene: 'scene-10',
      prompt:
        'Кости не лгут. Когда вы бросаете, вы видите распределение. Когда вы выбираете, вы делаете ход. Когда вы ждете, вы меняете настоящее на будущее. Когда вы сталкиваетесь с кем-то другим, математика меняется.',
    },
    {
      id: 'B10.4',
      scene: 'scene-10',
      prompt:
        'Идите играть в Яхтзи. Бросайте честно, думайте наперед, адаптируйтесь к столу. Игра вознаграждает за это.',
    },
  ],
}
