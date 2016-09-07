import BaseChart, { ChartStyle } from './basechart'
import PlotModel from '../model/plot'
import { YRange } from '../model/axisy'

enum PLOT_DATA {
  X = 0,
  TIME,
  OPEN,
  CLOSE,
  HIGH,
  LOW,
}

export default class CandleChartRenderer extends BaseChart {

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
    const barWidth = chart.axisX.barWidth
    const candleWidth = barWidth * 0.8
    const bars = plot.getVisibleBars()
    const rangeY = graph.isPrice ? axisY.range : graph.getRangeY()

    if (!bars.length) {
      return
    }

    ctx.lineWidth = 2

    for (let i = 0, bar, len = bars.length, x, y, isUp, color; i < len; i++) {
      bar = bars[i]
      isUp = bar[PLOT_DATA.CLOSE] > bar[PLOT_DATA.OPEN]
      color = isUp ? this.style.color : this.style.colorDown
      ctx.strokeStyle = color
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(bar[PLOT_DATA.X], ~~axisY.getYByValue(bar[PLOT_DATA.HIGH], rangeY))
      ctx.lineTo(bar[PLOT_DATA.X], ~~axisY.getYByValue(bar[PLOT_DATA.LOW], rangeY))
      ctx.stroke()
      x = bar[PLOT_DATA.X] - candleWidth / 2
      y = axisY.getYByValue(isUp ? bar[PLOT_DATA.CLOSE] : bar[PLOT_DATA.OPEN], rangeY)
      ctx.fillRect(
        x,
        ~~y,
        ~~candleWidth,
        Math.abs(
          axisY.getYByValue(isUp ? bar[PLOT_DATA.OPEN] : bar[PLOT_DATA.CLOSE], rangeY) - y
        )
      )
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
      if (cur[PLOT_DATA.HIGH] > prev.max) {
        prev.max = cur[PLOT_DATA.HIGH]
      }
      if (cur[PLOT_DATA.LOW] < prev.min) {
        prev.min = cur[PLOT_DATA.LOW]
      }
      return prev
    }, range)
  }
}
