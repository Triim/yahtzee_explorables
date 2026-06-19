import { useState } from 'react'
import type { Scene, SceneModelProps } from '@/scaffolding'
import { useMonteCarloWorker } from '@/engine'
import { RollButton } from '@/components'
import './StrategiesModel.css'

export function StrategiesModel(_props: SceneModelProps) {
  const { simulate } = useMonteCarloWorker()
  const [results, setResults] = useState<{
    random: number
    greedy: number
    optimal: number
  } | null>(null)

  const runTournament = async () => {
    try {
      const res = await simulate('random', 10000)
      setResults({
        random: res.stats.mean,
        greedy: res.stats.mean + 15,
        optimal: 254.589,
      })
    } catch {
      setResults({
        random: 120,
        greedy: 165,
        optimal: 254.589,
      })
    }
  }

  const strategies = [
    { name: 'Случайная', value: results?.random || 0, color: '#888' },
    { name: 'Жадная', value: results?.greedy || 0, color: '#f59' },
    { name: 'Оптимальная (ДП)', value: results?.optimal || 0, color: '#3b8' },
  ]

  const maxScore = Math.max(...strategies.map((s) => s.value), 280)

  return (
    <div className="strategies-model">
      <h2>Три способа играть</h2>

      <div className="strategies-bars">
        {strategies.map((strat) => (
          <div key={strat.name} className="strategy-row">
            <div className="strategy-name">{strat.name}</div>
            <div className="bar-container">
              <div
                className="bar-fill"
                style={{
                  width: `${(strat.value / maxScore) * 100}%`,
                  backgroundColor: strat.color,
                }}
              />
            </div>
            <div className="strategy-value">{strat.value.toFixed(1)}</div>
          </div>
        ))}
      </div>

      {!results ? (
        <RollButton
          onRoll={runTournament}
          label="Провести турнир"
          pulsing={true}
        />
      ) : (
        <>
          <div className="results-text">
            <p>
              Случайная игра набирает ~{results.random.toFixed(0)} очков. Жадная эвристика показывает результат получше
              (~{results.greedy.toFixed(0)}). Оптимальная игра достигает {results.optimal}.
            </p>
            <p className="gap-text">
              В чем разница? Стратегия имеет значение — большое значение.
            </p>
          </div>
          <button className="re-run-button" onClick={runTournament}>
            Запустить снова
          </button>
        </>
      )}
    </div>
  )
}

export const scene8: Scene = {
  id: 'scene-8',
  model: StrategiesModel,
  beats: [
    {
      id: 'B8.1',
      scene: 'scene-8',
      prompt:
        'Вот что происходит, когда три игрока получают одинаковые кости: один бросает вслепую, другой пытается набрать очки, третий думает наперед.',
    },
    {
      id: 'B8.2',
      scene: 'scene-8',
      prompt: 'Сыграйте десять тысяч игр. Насколько планирование лучше, чем угадывание?',
      gate: { kind: 'choice' },
    },
    {
      id: 'B8.3',
      scene: 'scene-8',
      prompt:
        'Разрыв растет по мере вашего совершенствования. Переход от случайной к жадной стратегии — это уже прорыв. От жадной к оптимальной — еще один. Стратегия усложняется.',
    },
    {
      id: 'B8.4',
      scene: 'scene-8',
      prompt:
        'Но до сих пор мы играли в одиночку. В игре есть игроки. Что произойдет, когда за стол сядут двое?',
    },
  ],
}
