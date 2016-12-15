import PlotModel from '../../model/plot'
import { YRange } from '../../model/axisy'

enum PLOT_DATA {
  X = 0,
  TIME,
  VALUE
}

export type ChartStyle = {
  color?: string
  colorDown?: string
  lineWidth?: number
  fillColor?: string
  histogramBase?: number
  scale?: number
  opacity?: number
  noLegend?: boolean
}

export abstract class BaseChartRenderer {
  protected plotModel: PlotModel
  protected style: ChartStyle

  constructor (plotModel: PlotModel, style: ChartStyle) {
    this.plotModel = plotModel
    this.style = style
  }

  public drawSelection () {
    const plot = this.plotModel
    const graph = plot.graph
    const chart = graph.chart
    const ctx = chart.ctx
    const axisX = chart.axisX
    const span = ~~(60 / axisX.barWidth + 0.5)
    const bars = plot.getVisibleBars()

    if (!bars.length) {
      return
    }

    for (let i = span, len = bars.length, bar, y; i < len; i += span) {
      bar = bars[i]
      y = this.getSelectionYByBar(bar)
      if (!y) {
        return
      }
      ctx.beginPath()
      ctx.arc(bar[PLOT_DATA.X], y, 3, 0, 2 * Math.PI)
      ctx.closePath()
      ctx.fillStyle = '#D6D6D6'
      ctx.strokeStyle = '#6B6B6B'
      ctx.fill()
      ctx.stroke()
    }
  }

  public abstract calcRangeY (): YRange

  public abstract draw (ctx: CanvasRenderingContext2D): void

  public abstract hitTest (): boolean

  protected abstract getSelectionYByBar (bar: any[]): number
}
