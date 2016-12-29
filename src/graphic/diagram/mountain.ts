import * as _ from 'underscore'
import { BaseChartRenderer, ChartStyle } from './basechart'
import PlotModel from '../../model/plot'
import { YRange } from '../../model/axisy'
import { HIT_TEST_TOLERANCE } from '../../constant'
import { pointToSegDist } from '../../util'

enum PLOT_DATA {
  X = 0,
  TIME,
  VALUE
}

const DEFAULT_STYLE = {
  color: 'rgba( 60, 120, 240, 1)',
  fillColor: 'rgba( 60, 120, 216, 1)',
  lineWidth: 2,
}

export class MountainChartRenderer extends BaseChartRenderer {

  constructor (plotModel: PlotModel, style: ChartStyle) {
    super(plotModel, _.defaults(style, DEFAULT_STYLE))
  }

  public hitTest (): boolean {
    const plot = this._plotModel
    const graph = plot.graph
    const chart = graph.chart
    const axisY = chart.axisY
    const rangeY = graph.isPrice ? axisY.range : graph.getRangeY()
    const curBar = plot.getCurBar()
    const prevBar = plot.getPrevBar()
    const nextBar = plot.getNextBar()
    if (!curBar) {
      return false
    }
    const point = chart.crosshair.point
    const x0 = point.x
    const y0 = point.y
    const x1 = prevBar ? prevBar[PLOT_DATA.X] : 0
    const y1 = prevBar ? axisY.getYByValue(prevBar[PLOT_DATA.VALUE], rangeY) : 0
    const x2 = curBar[PLOT_DATA.X]
    const y2 = axisY.getYByValue(curBar[PLOT_DATA.VALUE], rangeY)
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

  public calcRangeY (): YRange {
    const bars = this._plotModel.getVisibleBars()

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

  public draw (ctx: CanvasRenderingContext2D) {
    const plot = this._plotModel
    const bars = plot.getVisibleBars()

    if (!bars.length) {
      return
    }

    const graph = plot.graph
    const chart = graph.chart
    const axisY = chart.axisY
    const height = chart.height
    const rangeY = graph.isPrice ? axisY.range : graph.getRangeY()
    const histogramBase = this.style.histogramBase
    const baseHeight = typeof histogramBase === 'number' ? axisY.getYByValue(histogramBase, rangeY) : -1

    ctx.strokeStyle = this.style.color
    ctx.lineWidth = this.style.lineWidth
    ctx.fillStyle = this.style.fillColor || this.style.color
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
    if (typeof histogramBase === 'number') {
      ctx.lineTo(bars[len - 1][PLOT_DATA.X], baseHeight)
      ctx.lineTo(bars[0][PLOT_DATA.X], baseHeight)
    } else {
      ctx.lineTo(bars[len - 1][PLOT_DATA.X], height)
      ctx.lineTo(bars[0][PLOT_DATA.X], height)
    }

    ctx.closePath()
    ctx.fill()
  }

  protected getSelectionYByBar (bar: any[]): number {
    const plot = this._plotModel
    const graph = plot.graph
    const chart = graph.chart
    const axisY = chart.axisY
    const rangeY = graph.isPrice ? axisY.range : graph.getRangeY()
    return ~~axisY.getYByValue(bar[PLOT_DATA.VALUE], rangeY)
  }
}
