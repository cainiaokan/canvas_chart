import BaseChart, { IChartStyle } from './basechart'
import PlotModel from '../model/plot'
import { IYRange } from '../model/axisy'

const SCALE_RATIO = 0.25

enum PLOT_DATA {
  X = 0,
  TIME,
  VOLUME,
  IS_DOWN
}

export default class ColumnChartRenderer extends BaseChart {

  constructor (plotModel: PlotModel, style: IChartStyle) {
    super(plotModel, style)
  }

  public draw (): void {
    super.draw()

    const plot = this.plotModel
    const graph = plot.graph
    const chart = graph.chart
    const ctx = chart.ctx
    const axisY = chart.axisY
    const height = parseInt(ctx.canvas.style.height)
    const barWidth = chart.axisX.barWidth
    const bars = plot.getVisibleBars()
    const rangeY = graph.isPrice ? axisY.range : graph.getRangeY()
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
      bar = bars[i]
      x = bar[PLOT_DATA.X] - barWidth / 2
      y1 = ~~axisY.getYByValue(bar[PLOT_DATA.VOLUME], rangeY)
      y = ~~(height - (height - y1 - margin) * SCALE_RATIO)
      ctx.fillStyle = bar[PLOT_DATA.IS_DOWN] ? style.colorDown : style.color
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
      return null
    }

    const range: IYRange = {
      max: -Number.MAX_VALUE,
      min: 0,
    }

    return bars.reduce((prev, cur) => {
      const data = cur
      if (data[PLOT_DATA.VOLUME] > prev.max) {
        prev.max = data[PLOT_DATA.VOLUME]
      }
      return prev
    }, range)
  }
}
