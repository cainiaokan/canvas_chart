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

    let bars = this.plotModel.getBars()

    if (!bars.length) {
      return
    }

    const ctx = this.ctx
    const axisY = this.plotModel.axisY
    const rangeY = this.plotModel.isPrice ? axisY.range : this.getRangeY()
    const height = parseInt(this.plotModel.graphic.ctx.canvas.style.height)
    let firstPosX: number = 0
    let lastPosX: number = 0
    let first = true

    ctx.beginPath()
    bars.forEach(bar => {
      const timeBar = bar.time
      const data = bar.bar as ILineBar
      if (first) {
        ctx.moveTo(timeBar.x, axisY.getYByValue(data.val, rangeY))
        first = false
        firstPosX = timeBar.x
      } else {
        ctx.lineTo(timeBar.x, axisY.getYByValue(data.val, rangeY))
        lastPosX = timeBar.x
      }
    })
    ctx.strokeStyle = this.style.lineColor
    ctx.lineWidth = this.style.lineWidth
    ctx.stroke()
    ctx.lineTo(lastPosX, height)
    ctx.lineTo(firstPosX, height)
    ctx.closePath()
    ctx.fillStyle = this.style.fillColor
    ctx.fill()
  }

  protected calcRangeY (): IYRange {
    const bars = this.plotModel.getBars()

    if (!bars.length) {
      return
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
