import BaseChart, { ChartStyle } from './basechart'
import PlotModel from '../model/plot'
import { YRange } from '../model/axisy'
import { HIT_TEST_TOLERANCE } from '../constant'
import { pointToSegDist } from '../util'

enum PLOT_DATA {
  X = 0,
  TIME,
  VALUE
}

export default class LineChartRenderer extends BaseChart {

  constructor (plotModel: PlotModel, style: ChartStyle) {
    super(plotModel, style)
  }

  public hitTest (): boolean {
    const plot = this.plotModel
    const graph = plot.graph
    const chart = graph.chart
    const axisY = chart.axisY
    const rangeY = graph.isPrice ? axisY.range : graph.getRangeY()
    const curBar = plot.getCurBar()
    const prevBar = plot.getPrevBar()
    const nextBar = plot.getNextBar()
    const point = chart.crosshair.point
    const x0 = point.x
    const y0 = point.y
    const x1 = prevBar ? prevBar[PLOT_DATA.X] : 0
    const y1 = prevBar ? axisY.getYByValue(prevBar[PLOT_DATA.VALUE], rangeY) : 0
    const x2 = curBar[PLOT_DATA.X]
    const y2 = axisY.getYByValue(curBar[2], rangeY)
    const x3 = nextBar ? nextBar[PLOT_DATA.X] : 0
    const y3 = nextBar ? axisY.getYByValue(nextBar[PLOT_DATA.VALUE], rangeY) : 0
    let distance1 = Number.MAX_VALUE
    let distance2 = Number.MAX_VALUE
    if (prevBar) {
      distance1 = pointToSegDist(x0, y0, x1, y1, x2, y2)
    }
    if (nextBar) {
      distance2 = pointToSegDist(x0, y0, x2, y2, x3, y3)
    }
    return distance1 < HIT_TEST_TOLERANCE || distance2 < HIT_TEST_TOLERANCE
  }

  public draw (): void {
    super.draw()

    const plot = this.plotModel
    const graph = plot.graph
    const chart = graph.chart
    const ctx = chart.ctx
    const axisY = chart.axisY
    const rangeY = graph.isPrice ? axisY.range : graph.getRangeY()
    const bars = plot.getVisibleBars()

    if (!bars.length) {
      return
    }
    ctx.strokeStyle = this.style.color
    ctx.lineWidth = this.style.lineWidth
    ctx.beginPath()

    const len = bars.length

    if (len) {
      const bar = bars[0]
      ctx.moveTo(~~bar[PLOT_DATA.X], ~~axisY.getYByValue(bar[PLOT_DATA.VALUE], rangeY))
    }

    for (let i = 0; i < len; i++) {
      const bar = bars[i]
      ctx.lineTo(~~bar[PLOT_DATA.X], ~~axisY.getYByValue(bar[PLOT_DATA.VALUE], rangeY))
    }

    ctx.stroke()
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
