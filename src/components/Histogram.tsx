import './Histogram.css'

interface HistogramProps {
  data: Map<number, number> | Record<number, number>
  width?: number
  height?: number
  title?: string
  xLabel?: string
  yLabel?: string
  className?: string
}

export function Histogram({
  data,
  width = 400,
  height = 250,
  title = '',
  xLabel = '',
  yLabel = 'Frequency',
  className = '',
}: HistogramProps) {
  // Convert data to array if it's a Map
  let entries: Array<[number, number]> = []
  if (data instanceof Map) {
    entries = Array.from(data.entries())
  } else {
    entries = Object.entries(data).map(([k, v]) => [parseInt(k, 10), v])
  }

  if (entries.length === 0) {
    return <div className="histogram-empty">No data</div>
  }

  // Sort by key
  entries.sort((a, b) => a[0] - b[0])

  // Calculate max for scaling
  const maxValue = Math.max(...entries.map(([_, v]) => v))
  const padding = { top: 30, right: 30, bottom: 40, left: 50 }
  const innerWidth = width - padding.left - padding.right
  const innerHeight = height - padding.top - padding.bottom

  // Calculate bar positions
  const minKey = entries[0][0]
  const maxKey = entries[entries.length - 1][0]
  const keyRange = maxKey - minKey || 1
  const barWidth = innerWidth / (keyRange + 1)

  return (
    <svg
      width={width}
      height={height}
      className={`histogram ${className}`}
      role="img"
      aria-label={title}
    >
      {/* Title */}
      {title && (
        <text x={width / 2} y={20} className="histogram-title">
          {title}
        </text>
      )}

      {/* Y-axis label */}
      {yLabel && (
        <text
          x={-height / 2}
          y={15}
          className="histogram-label"
          transform="rotate(-90)"
        >
          {yLabel}
        </text>
      )}

      {/* X-axis label */}
      {xLabel && (
        <text
          x={width / 2}
          y={height - 5}
          className="histogram-label"
        >
          {xLabel}
        </text>
      )}

      {/* Y-axis */}
      <line
        x1={padding.left}
        y1={padding.top}
        x2={padding.left}
        y2={height - padding.bottom}
        className="histogram-axis"
      />

      {/* X-axis */}
      <line
        x1={padding.left}
        y1={height - padding.bottom}
        x2={width - padding.right}
        y2={height - padding.bottom}
        className="histogram-axis"
      />

      {/* Grid lines and bars */}
      {entries.map(([key, value]) => {
        const x =
          padding.left +
          ((key - minKey) / keyRange) * innerWidth +
          barWidth / 4
        const barHeight = (value / maxValue) * innerHeight
        const y = height - padding.bottom - barHeight

        return (
          <g key={key}>
            {/* Grid line */}
            <line
              x1={x + barWidth / 2}
              y1={y}
              x2={x + barWidth / 2}
              y2={height - padding.bottom}
              className="histogram-grid"
            />

            {/* Bar */}
            <rect
              x={x}
              y={y}
              width={barWidth * 0.8}
              height={barHeight}
              className="histogram-bar"
            />

            {/* Tick label */}
            <text
              x={x + barWidth / 2}
              y={height - padding.bottom + 15}
              className="histogram-tick"
              textAnchor="middle"
            >
              {key}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
