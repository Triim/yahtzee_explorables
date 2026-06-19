import { useState } from 'react'
import type { SceneModelProps, Scene } from '@/scaffolding'
import { multisetCount } from '@/engine'
import './FiveDiceModel.css'

export function FiveDiceModel({ activeBeatId, satisfyGate }: SceneModelProps) {
  const [hand, setHand] = useState<number[]>([5, 3, 2, 1, 1])
  const [sorted, setSorted] = useState(false)
  const [showCollapse, setShowCollapse] = useState(false)

  const handleToggleSorted = () => {
    if (!sorted) {
      setHand([1, 1, 2, 3, 5])
      setShowCollapse(true)
      setTimeout(() => setShowCollapse(false), 800)
    } else {
      setHand([5, 3, 2, 1, 1])
    }
    setSorted(!sorted)
    satisfyGate?.() // гейт: переключить порядок
  }

  const displayHand = hand
  const uniqueCount = multisetCount()
  const showToggle = activeBeatId === 'B3.2'
  const showCount = activeBeatId === 'B3.2' || activeBeatId === 'B3.3'

  return (
    <div className="five-dice-model">
      {/* Отображение руки (базовое) */}
      <div className="dice-visualization">
        <div className={`five-dice-display ${showCollapse ? 'collapsing' : ''}`}>
          {displayHand.map((value, i) => (
            <div key={i} className="die-dot">
              {value}
            </div>
          ))}
        </div>
      </div>

      {/* Упорядоченная статистика (видна всегда) */}
      <div className="stats-section">
        <p className="stat-item">
          Упорядоченные броски: <strong>6<sup>5</sup> = 7,776</strong>
        </p>
      </div>

      {/* Кнопка переключения (открывается на s3-3) */}
      {showToggle && (
        <button className="toggle-button" onClick={handleToggleSorted}>
          {sorted ? '→ Перемешать' : '→ Сортировать'}
        </button>
      )}

      {/* Количество уникальных (открывается на s3-4) */}
      {showCount && (
        <div className="stats-section collapse-reveal">
          <p className="stat-item collapse-stat">
            Мультимножества: <strong>{uniqueCount}</strong>
          </p>
          <p className="stat-note">7,776 → {uniqueCount} (порядок не важен)</p>
        </div>
      )}
    </div>
  )
}

export const scene3: Scene = {
  id: 'scene-3',
  model: FiveDiceModel,
  beats: [
    {
      id: 'B3.1',
      scene: 'scene-3',
      prompt:
        'Пять костей. Подсчёт пар не сработает — есть $6^5 = 7776$ способов их выпадения, и никакой таблицы в пяти измерениях не хватит.',
    },
    {
      id: 'B3.2',
      scene: 'scene-3',
      prompt:
        'Хитрость в том, что порядок не имеет значения — важны только выпавшие грани. Отсортируйте руку и смотрите.',
      payoff:
        'Перестаньте различать порядок, и 7776 исходов схлопнутся всего в 252 состояния: $\\binom{6+5-1}{5}=252$. Мультимножество — самое экономное описание руки. С этого момента "рука" — это одно состояние.',
      gate: { kind: 'toggle' },
    },
    {
      id: 'B3.3',
      scene: 'scene-3',
      prompt:
        'Теперь рука — это чистый объект. И здесь, впервые, возникает настоящий вопрос игры: что оставить?',
    },
  ],
}
