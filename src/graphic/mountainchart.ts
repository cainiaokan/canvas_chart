import BaseChart, { IChartStyle } from './basechart'
import PlotModel from '../model/plot'
import { IYRange } from '../model/axisy'
import { ILineBar } from '../datasource'

export default class MountainChartRenderer extends BaseChart {

  constructor (plotModel: PlotModel, style: IChartStyle) {
    super(plotModel, style)
  }

  public draw (): void {
    super.draw()

    let bars = this.plotModel.getVisibleBars()

    if (!bars.length) {
      return
    }

    const ctx = this.ctx
    const axisY = this.plotModel.graph.axisY
    const rangeY = this.plotModel.isPrice ? axisY.range : this.getRangeY()
    const height = parseInt(this.plotModel.graphic.ctx.canvas.style.height)

    ctx.strokeStyle = this.style.color
    ctx.lineWidth = this.style.lineWidth
    ctx.fillStyle = this.style.fillColor
    ctx.beginPath()

    const len = bars.length
    let bar

    if (len) {
      bar = bars[0] as ILineBar
      ctx.moveTo(bar.x, axisY.getYByValue(bar.val, rangeY))
    }

    for (let i = 0; i < len; i++) {
      bar = bars[i] as ILineBar
      ctx.lineTo(bar.x, axisY.getYByValue(bar.val, rangeY))
    }

    ctx.stroke()
    ctx.lineTo(bars[len - 1].x, height)
    ctx.lineTo(bars[0].x, height)
    ctx.closePath()
    ctx.fill()
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
