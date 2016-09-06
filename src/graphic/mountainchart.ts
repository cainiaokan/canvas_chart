import BaseChart, { IChartStyle } from './basechart'
import PlotModel from '../model/plot'
import { IYRange } from '../model/axisy'

enum PLOT_DATA {
  X = 0,
  TIME,
  VALUE
}

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
    const rangeY = this.plotModel.graph.isPrice ? axisY.range : this.plotModel.graph.getRangeY()
    const height = parseInt(this.plotModel.graphic.ctx.canvas.style.height)

    ctx.strokeStyle = this.style.color
    ctx.lineWidth = this.style.lineWidth
    ctx.fillStyle = this.style.fillColor
    ctx.beginPath()

    const len = bars.length
    let bar

    if (len) {
      bar = bars[0]
      ctx.moveTo(~~bar[PLOT_DATA.X], ~~axisY.getYByValue(bar[PLOT_DATA.VALUE], rangeY))
    }

    for (let i = 0; i < len; i++) {
      bar = bars[i]
      ctx.lineTo(~~bar[PLOT_DATA.X], ~~axisY.getYByValue(bar[PLOT_DATA.VALUE], rangeY))
    }

    ctx.stroke()
    ctx.lineTo(bars[len - 1][PLOT_DATA.X], height)
    ctx.lineTo(bars[0][PLOT_DATA.X], height)
    ctx.closePath()
    ctx.fill()
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
