import BaseChart, { IChartStyle } from './basechart'
import PlotModel from '../model/plot'
import { IYRange } from '../model/axisy'
import { ICandleBar } from '../datasource'

export default class CandleChartRenderer extends BaseChart {

  constructor (plotModel: PlotModel, style: IChartStyle) {
    super(plotModel, style)
  }

  public draw (): void {
    super.draw()

    const ctx = this.ctx
    const plot = this.plotModel
    const graph = plot.graph
    const axisY = graph.axisY
    const barWidth = graph.axisX.barWidth
    const candleWidth = barWidth * 0.8
    const bars = plot.getVisibleBars() as Array<ICandleBar>
    const rangeY = plot.isPrice ? axisY.range : this.getRangeY()

    if (!bars.length) {
      return
    }

    for (let i = 0, bar, len = bars.length, x, y, isUp, color; i < len; i++) {
      bar = bars[i]
      isUp = bar.close > bar.open
      color = isUp ? 'red' : 'green'
      ctx.strokeStyle = color
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(bar.x, axisY.getYByValue(bar.high, rangeY))
      ctx.lineTo(bar.x, axisY.getYByValue(bar.low, rangeY))
      ctx.stroke()
      x = bar.x - candleWidth / 2
      y = axisY.getYByValue(isUp ? bar.close : bar.open, rangeY)
      ctx.fillRect(x, y, candleWidth, Math.abs(axisY.getYByValue(isUp ? bar.open : bar.close, rangeY) - y))
    }
  }

  protected calcRangeY (): IYRange {
    const bars = this.plotModel.getVisibleBars()

    if (!bars.length) {
      return
    }

    const range: IYRange = {
      max: -Number.MAX_VALUE,
      min: Number.MAX_VALUE,
    }

    return bars.reduce((prev, cur) => {
      const data = cur as ICandleBar
      if (data.high > prev.max) {
        prev.max = data.high
      }
      if (data.low < prev.min) {
        prev.min = data.low
      }
      return prev
    }, range)
  }
}
