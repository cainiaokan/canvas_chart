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
    const axisY = this.plotModel.graph.axisY
    const bars = this.plotModel.getVisibleBars()
    const rangeY = this.plotModel.isPrice ? axisY.range : this.getRangeY()

    if (!bars.length) {
      return
    }
    ctx.strokeStyle = this.style.color
    ctx.lineWidth = this.style.lineWidth
    ctx.beginPath()

    const len = bars.length

    if (len) {
      const bar = bars[0] as ILineBar
      ctx.moveTo(bar.x, axisY.getYByValue(bar.val, rangeY))
    }

    for (let i = 0; i < len; i++) {
      const bar = bars[i] as ILineBar
      ctx.lineTo(bar.x, axisY.getYByValue(bar.val, rangeY))
    }

    ctx.stroke()
  }

  protected calcRangeY (): IYRange {
    const bars = this.plotModel.getVisibleBars()

    if (!bars.length) {
      return null
    }

    const range: IYRange = {
      max: -Number.MAX_VALUE,
      min: Number.MAX_VALUE,
    }

    return bars.reduce((prev, cur) => {
      const bar = cur as ILineBar
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
