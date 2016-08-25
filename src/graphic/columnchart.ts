import BaseChart, { IChartStyle } from './basechart'
import PlotModel from '../model/plot'
import { IYRange, MARGIN } from '../model/axisy'
import { IColumnBar } from '../datasource'

const SCALE_RATIO = 0.25

export default class ColumnChartRenderer extends BaseChart {

  constructor (plotModel: PlotModel, style: IChartStyle) {
    super(plotModel, style)
  }

  public draw (): void {
    super.draw()

    const ctx = this.ctx
    const axisY = this.plotModel.axisY
    const height = parseInt(ctx.canvas.style.height)
    const barWidth = this.plotModel.axisX.barWidth
    const bars = this.plotModel.getBars()
    const rangeY = this.plotModel.isPrice ? axisY.range : this.getRangeY()

    if (!bars.length) {
      return
    }

    ctx.save()
    ctx.lineWidth = 1
    ctx.globalAlpha = 0.3
    bars.forEach(bar => {
      const timeBar = bar.time
      const data = bar.bar as IColumnBar
      const x = timeBar.x - barWidth / 2
      const y1 = axisY.getYByValue(data.val, rangeY)
      const y = height - (height - y1 - MARGIN) * SCALE_RATIO
      ctx.fillStyle = data.positive ? this.style.highColor : this.style.lowColor
      ctx.fillRect(x, y, barWidth, height)
      ctx.strokeStyle = 'black'
      ctx.beginPath()
      ctx.moveTo(x, height)
      ctx.lineTo(x, y)
      ctx.lineTo(x + barWidth, y)
      ctx.lineTo(x + barWidth, height)
      ctx.closePath()
      ctx.stroke()
    })
    ctx.restore()
  }

  protected calcRangeY (): IYRange {
    const bars = this.plotModel.getBars()

    if (!bars.length) {
      return
    }

    const range: IYRange = {
      max: -Number.MAX_VALUE,
      min: 0,
    }

    return bars.reduce((prev, cur) => {
      const data = cur.bar as IColumnBar
      if (data.val > prev.max) {
        prev.max = data.val
      }
      return prev
    }, range)
  }
}
