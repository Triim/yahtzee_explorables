import { useEffect, useRef } from 'react'
import chartXkcd from 'chart.xkcd'
import type { XkcdConfig } from 'chart.xkcd'
import { useSettings } from './SettingsContext'
import './XkcdChart.css'

/* ============================================================
   Thin React wrapper around chart.xkcd (an imperative, D3-based
   library). It renders the sketchy "hand-drawn" charts into a
   plain <svg>; chart.xkcd reads the svg's width/height ATTRS, so
   the wrapper is immune to the stage's CSS scale transform.

   Theme: chart.xkcd takes literal colours, so we read the live
   CSS custom properties (--text-color / --bg) at render time —
   that makes the charts follow light/dark mode automatically.
   ============================================================ */

export type XkcdChartType = 'Bar' | 'StackedBar' | 'Line' | 'XY' | 'Pie' | 'Radar'

export interface XkcdChartProps {
  type: XkcdChartType
  config: XkcdConfig
  width?: number
  height?: number
  className?: string
}

function themeOptions(): Record<string, unknown> {
  if (typeof window === 'undefined') return { fontFamily: 'xkcd' }
  const cs = getComputedStyle(document.documentElement)
  const stroke = cs.getPropertyValue('--text-color').trim()
  const bg = cs.getPropertyValue('--bg').trim()
  return {
    // The xkcd font (Latin + Cyrillic) — chart.xkcd's native font, so RU and EN
    // labels both render in the sketch style.
    fontFamily: 'xkcd',
    strokeColor: stroke || 'black',
    backgroundColor: bg || 'white',
  }
}

export function XkcdChart({ type, config, width = 340, height = 200, className }: XkcdChartProps) {
  const ref = useRef<SVGSVGElement>(null)
  // The colours are baked in at instantiation, so a theme switch must
  // re-instantiate the chart — otherwise dark mode shows stale light colours.
  const { theme } = useSettings()
  // Re-instantiate only when the data/options actually change (not on every
  // unrelated parent render) — otherwise the draw-in animation re-fires.
  const key = JSON.stringify(config)

  useEffect(() => {
    const svg = ref.current
    if (!svg) return
    svg.innerHTML = ''
    const merged: XkcdConfig = {
      ...config,
      options: { ...themeOptions(), ...(config.options ?? {}) },
    }
    try {
      const Ctor = chartXkcd[type]
      new Ctor(svg, merged)
    } catch (err) {
      console.error('XkcdChart: failed to render', err)
    }
    return () => {
      svg.innerHTML = ''
    }
    // `config` is captured through `key`; deps intentionally use the serialised form.
    // `theme` forces a re-instantiation so the baked-in colours follow the mode.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, key, width, height, theme])

  return <svg ref={ref} width={width} height={height} className={`xkcd-chart ${className ?? ''}`} role="img" />
}
