import BaseChart, { ChartStyle } from './basechart'
import PlotModel from '../model/plot'
import { YRange } from '../model/axisy'
import { HIT_TEST_TOLERANCE } from '../constant'
import { isPointInRect } from '../util'

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
    const plot = this.plotModel
    const graph = plot.graph
    const chart = graph.chart
    const axisX = chart.axisX
    const axisY = chart.axisY
    const rangeY = graph.isPrice ? axisY.range : graph.getRangeY()
    const curBar = plot.getCurBar()
    if (!curBar) {
      return false
    }
    const point = chart.crosshair.point
    const width = axisX.barWidth * 0.5
    const style = this.style
    const histogramBase = style.histogramBase
    const x0 = point.x
    const y0 = point.y
    const x1 = curBar[PLOT_DATA.X] - width / 2 - HIT_TEST_TOLERANCE
    const y1 = axisY.getYByValue(curBar[PLOT_DATA.VALUE], rangeY)
    const x2 = x1 + width + 2 * HIT_TEST_TOLERANCE
    const y2 = axisY.getYByValue(histogramBase, rangeY)
    return isPointInRect(x0, y0, x1, y1, x2, y2)
  }

  public draw (): void {
    const plot = this.plotModel
    const bars = plot.getVisibleBars()

    if (!bars.length) {
      return
    }

    const graph = plot.graph
    const chart = graph.chart
    const ctx = chart.ctx
    const axisY = chart.axisY
    const axisX = chart.axisX
    // 宽度为bar宽度的一半
    const width = axisX.barWidth * 0.5
    const style = this.style
    const histogramBase = style.histogramBase
    const rangeY = graph.isPrice ? axisY.range : graph.getRangeY()
    const base = axisY.getYByValue(histogramBase, rangeY)

    for (let i = 0, len = bars.length, data, x, y; i < len; i++) {
      data = bars[i]
      x = data[PLOT_DATA.X]
      y = axisY.getYByValue(data[PLOT_DATA.VALUE], rangeY)
      ctx.fillStyle = data[PLOT_DATA.VALUE] > histogramBase ? style.color : style.colorDown
      ctx.fillRect(x - width / 2, y, width, base - y)
    }
  }

  protected getSelectionYByBar (bar: any[]): number {
    const plot = this.plotModel
    const graph = plot.graph
    const chart = graph.chart
    const axisY = chart.axisY
    const rangeY = graph.isPrice ? axisY.range : graph.getRangeY()

    return axisY.getYByValue(bar[PLOT_DATA.VALUE], rangeY)
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
