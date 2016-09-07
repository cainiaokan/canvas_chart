import BaseChart, { ChartStyle } from './basechart'
import PlotModel from '../model/plot'
import { YRange } from '../model/axisy'

enum PLOT_DATA {
  X = 0,
  TIME,
  VALUE
}

export default class HistogramChartRenderer extends BaseChart {

  constructor (plotModel: PlotModel, style: ChartStyle) {
    super(plotModel, style)
  }

  public hitTest (): boolean {
    return false
  }

  public draw (): void {
    super.draw()

    const plot = this.plotModel
    const graph = plot.graph
    const chart = graph.chart
    const ctx = chart.ctx
    const axisY = chart.axisY
    const axisX = chart.axisX
    const rangeY = graph.isPrice ? axisY.range : graph.getRangeY()
    const style = this.style
    const histogramBase = style.histogramBase
    const base = axisY.getYByValue(histogramBase, rangeY)
    const bars = plot.getVisibleBars()
    // 宽度为bar宽度的一半
    const width = axisX.barWidth * 0.5

    if (!bars.length) {
      return
    }

    for (let i = 0, len = bars.length, data, x, y; i < len; i++) {
      data = bars[i]
      x = data[PLOT_DATA.X]
      y = axisY.getYByValue(data[PLOT_DATA.VALUE], rangeY)
      if (data[PLOT_DATA.VALUE] > histogramBase) {
        ctx.fillStyle = style.color
        ctx.fillRect(x - width / 2, y, width, base - y)
      } else {
        ctx.fillStyle = style.colorDown
        ctx.fillRect(x - width / 2, base, width, y - base)
      }
    }
  }

  protected calcRangeY (): YRange {
    const bars = this.plotModel.getVisibleBars()

    if (!bars.length) {
      return null
    }

    const range: YRange = {
      max: -Number.MAX_VALUE,
      min: Number.MAX_VALUE,
    }

    return bars.reduce((prev, cur) => {
      const bar = cur
      if (bar[PLOT_DATA.VALUE] < prev.min) {
        prev.min = bar[PLOT_DATA.VALUE]
      }
      if (bar[PLOT_DATA.VALUE] > prev.max) {
        prev.max = bar[PLOT_DATA.VALUE]
      }
      return prev
    }, range)
  }
}
