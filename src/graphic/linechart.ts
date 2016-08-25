import BaseChart, { IChartStyle } from './basechart'
import PlotModel from '../model/plot'
import { IYRange } from '../model/axisy'
import { ILineBar } from '../datasource'

export default class LineChartRenderer extends BaseChart {

  constructor (plotModel: PlotModel, style: IChartStyle) {
    super(plotModel, style)
  }

  public draw (): void {
    super.draw()

    const ctx = this.ctx
    const axisY = this.plotModel.axisY
    const bars = this.plotModel.getBars()
    const rangeY = this.plotModel.isPrice ? axisY.range : this.getRangeY()

    if (!bars.length) {
      return
    }

    ctx.beginPath()
    let first = true
    bars.forEach(bar => {
      const timerBar = bar.time
      const data = bar.bar as ILineBar
      if (first) {
        if (bar !== null) {
          ctx.moveTo(timerBar.x, axisY.getYByValue(data.val, rangeY))
          first = false
        }
      } else {
        ctx.lineTo(timerBar.x, axisY.getYByValue(data.val, rangeY))
      }
    })
    ctx.strokeStyle = this.style.lineColor
    ctx.lineWidth = this.style.lineWidth
    ctx.stroke()
    ctx.closePath()
  }

  protected calcRangeY (): IYRange {
    const bars = this.plotModel.getBars()

    if (!bars.length) {
      return null
    }

    const range: IYRange = {
      max: -Number.MAX_VALUE,
      min: Number.MAX_VALUE,
    }

    return bars.reduce((prev, cur) => {
      const bar = cur.bar as ILineBar
      if (bar.val < prev.min) {
        prev.min = bar.val
      }
      if (bar.val > prev.max) {
        prev.max = bar.val
      }
      return prev
    }, range)
  }
}
