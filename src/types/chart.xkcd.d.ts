/* Ambient declaration for chart.xkcd (ships no types of its own).
   Only the surface we actually use is described. */
declare module 'chart.xkcd' {
  export interface XkcdDataset {
    label?: string
    data: unknown[]
  }

  export interface XkcdConfig {
    title?: string
    xLabel?: string
    yLabel?: string
    data: {
      labels?: string[]
      datasets: XkcdDataset[]
    }
    options?: Record<string, unknown>
  }

  type XkcdChartCtor = new (svg: SVGSVGElement, config: XkcdConfig) => unknown

  interface ChartXkcd {
    Bar: XkcdChartCtor
    StackedBar: XkcdChartCtor
    Line: XkcdChartCtor
    XY: XkcdChartCtor
    Pie: XkcdChartCtor
    Radar: XkcdChartCtor
  }

  const chartXkcd: ChartXkcd
  export default chartXkcd
}
