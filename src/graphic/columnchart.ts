import BaseChart, { IChartStyle } from './basechart'
import PlotModel from '../model/plot'
import { IYRange } from '../model/axisy'
import { IColumnBar } from '../datasource'

const SCALE_RATIO = 0.25

export default class ColumnChartRenderer extends BaseChart {

  constructor (plotModel: PlotModel, style: IChartStyle) {
    super(plotModel, style)
  }

  public draw (): void {
    super.draw()

    const ctx = this.ctx
    const plot = this.plotModel
    const graph = plot.graph
    const axisY = graph.axisY
    const height = parseInt(ctx.canvas.style.height)
    const barWidth = graph.axisX.barWidth
    const bars = plot.getVisibleBars()
    const rangeY = plot.isPrice ? axisY.range : this.getRangeY()
    const style = this.style
    const margin = axisY.margin

    if (!bars.length) {
      return
    }

    ctx.save()
    ctx.lineWidth = 1
    ctx.globalAlpha = 0.3
    ctx.strokeStyle = 'black'
    ctx.beginPath()

    for (let i = 0, bar, len = bars.length, x, y, y1; i < len; i++) {
      bar = bars[i] as IColumnBar
      x = ~~(bar.x - barWidth / 2 + 0.5)
      y1 = axisY.getYByValue(bar.val, rangeY)
      y = ~~(height - (height - y1 - margin) * SCALE_RATIO + 0.5)
      ctx.fillStyle = bar.down ? style.colorDown : style.color
      ctx.fillRect(x, y, barWidth, height)
      ctx.moveTo(x, height)
      ctx.lineTo(x, y)
      ctx.lineTo(x + barWidth, y)
      ctx.lineTo(x + barWidth, height)
    }
    ctx.stroke()
    ctx.restore()
  }

  protected calcRangeY (): IYRange {
    const bars = this.plotModel.getVisibleBars()

    if (!bars.length) {
      return
    }

    const range: IYRange = {
      max: -Number.MAX_VALUE,
      min: 0,
    }

    return bars.reduce((prev, cur) => {
      const data = cur as IColumnBar
      if (data.val > prev.max) {
        prev.max = data.val
      }
      return prev
    }, range)
  }
}
