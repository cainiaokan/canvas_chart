import * as _ from 'underscore'
import { BaseChartRenderer, ChartStyle } from './basechart'
import PlotModel from '../../model/plot'
import { YRange } from '../../model/axisy'
import { isPointInRect } from '../../util'
import { HIT_TEST_TOLERANCE } from '../../constant'

enum PLOT_DATA {
  X = 0,
  TIME,
  OPEN,
  CLOSE,
  HIGH,
  LOW,
}

const DEFAULT_STYLE = {
  color: 'rgb(215, 84, 66)',
  colorDown: 'rgb(107, 165, 131)',
}

export class CandleChartRenderer extends BaseChartRenderer {

  constructor (plotModel: PlotModel, style: ChartStyle) {
    super(plotModel, _.defaults(style, DEFAULT_STYLE))
  }

  public hitTest (): boolean {
    const plot = this._plotModel
    const graph = plot.graph
    const chart = graph.chart
    const axisX = chart.axisX
    const axisY = chart.axisY
    const rangeY = graph.isPrice ?
      graph.isComparison ? _.defaults(graph.getRangeY(), axisY.range) : axisY.range : graph.getRangeY()
    const curBar = plot.getCurBar()
    if (!curBar) {
      return false
    }
    const point = chart.crosshair.point
    const candleWidth = ~~(axisX.barWidth * 0.8 + 0.5) % 2 === 0 ?
      ~~(axisX.barWidth * 0.8 + 0.5) - 1 : ~~(axisX.barWidth * 0.8 + 0.5)
    const x0 = point.x
    const y0 = point.y
    const x1 = ~~curBar[PLOT_DATA.X] - ~~(candleWidth / 2) - HIT_TEST_TOLERANCE
    const y1 = ~~axisY.getYByValue(curBar[PLOT_DATA.HIGH], rangeY) - HIT_TEST_TOLERANCE
    const x2 = x1 + candleWidth + HIT_TEST_TOLERANCE
    const y2 = ~~axisY.getYByValue(curBar[PLOT_DATA.LOW], rangeY) + HIT_TEST_TOLERANCE
    return isPointInRect(
      x0, y0,
      x1, y1,
      x2, y2
    )
  }

  public calcRangeY (): YRange {
    const bars = this._plotModel.getVisibleBars()

    if (!bars.length) {
      return null
    }

    const range: YRange = {
      base: bars[0][PLOT_DATA.OPEN],
      max: -Number.MAX_VALUE,
      min: Number.MAX_VALUE,
    }

    return bars.reduce((prev, cur) => {
      if (cur[PLOT_DATA.HIGH] > prev.max) {
        prev.max = cur[PLOT_DATA.HIGH]
      }
      if (cur[PLOT_DATA.LOW] < prev.min) {
        prev.min = cur[PLOT_DATA.LOW]
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
    const axisX = chart.axisX
    const axisY = chart.axisY
    const candleWidth = ~~(axisX.barWidth * 0.8 + 0.5) % 2 === 0 ?
      ~~(axisX.barWidth * 0.8 + 0.5) - 1 : ~~(axisX.barWidth * 0.8 + 0.5)
    const rangeY = graph.isPrice ?
      graph.isComparison ? _.defaults(graph.getRangeY(), axisY.range) : axisY.range : graph.getRangeY()
    const high = bars.reduce((memo, cur) => {
      return cur[PLOT_DATA.HIGH] > memo ? cur[PLOT_DATA.HIGH] : memo
    }, -Number.MAX_VALUE)
    const low = bars.reduce((memo, cur) => {
      return cur[PLOT_DATA.LOW] < memo ? cur[PLOT_DATA.LOW] : memo
    }, Number.MAX_VALUE)

    plot.priceLabels = [{
      val: high,
      color: this.style.color,
    }, {
      val: low,
      color: this.style.colorDown,
    }]

    let x
    let y

    ctx.translate(0.5, 0.5)
    ctx.lineWidth = 1

    for (let i = 0, bar, len = bars.length, isUp, color; i < len; i++) {
      bar = bars[i]
      isUp = bar[PLOT_DATA.CLOSE] >= bar[PLOT_DATA.OPEN]
      color = isUp ? this.style.color : this.style.colorDown
      ctx.strokeStyle = '#333333'
      ctx.beginPath()
      ctx.moveTo(~~bar[PLOT_DATA.X], ~~axisY.getYByValue(bar[PLOT_DATA.HIGH], rangeY))
      ctx.lineTo(~~bar[PLOT_DATA.X], ~~axisY.getYByValue(bar[PLOT_DATA.LOW], rangeY))
      ctx.stroke()
    }

    for (let i = 0, bar, len = bars.length, isUp, color; i < len; i++) {
      bar = bars[i]
      isUp = bar[PLOT_DATA.CLOSE] >= bar[PLOT_DATA.OPEN]
      color = isUp ? this.style.color : this.style.colorDown
      ctx.strokeStyle = '#333333'
      ctx.lineWidth = 1
      ctx.fillStyle = color
      x = ~~bar[PLOT_DATA.X] - (candleWidth - 1) / 2
      y = ~~axisY.getYByValue(isUp ? bar[PLOT_DATA.CLOSE] : bar[PLOT_DATA.OPEN], rangeY)
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + candleWidth - 1, y)
      y = ~~Math.ceil(
        axisY.getYByValue(isUp ? bar[PLOT_DATA.OPEN] : bar[PLOT_DATA.CLOSE], rangeY)
      )
      ctx.lineTo(x + candleWidth - 1, y)
      ctx.lineTo(x, y)
      ctx.closePath()

      ctx.fill()
      ctx.stroke()
    }

    ctx.setLineDash([2, 4])
    ctx.strokeStyle = this.style.color
    ctx.beginPath()
    y = ~~axisY.getYByValue(high, rangeY)
    ctx.moveTo(0, y)
    ctx.lineTo(axisX.width, y)
    ctx.stroke()

    ctx.strokeStyle = this.style.colorDown
    ctx.beginPath()
    y = ~~axisY.getYByValue(low, rangeY)
    ctx.moveTo(0, y)
    ctx.lineTo(axisX.width, y)
    ctx.stroke()
  }

  protected getSelectionYByBar (bar: any[]): number {
    const plot = this._plotModel
    const graph = plot.graph
    const chart = graph.chart
    const axisY = chart.axisY
    const rangeY = graph.isPrice ?
      graph.isComparison ? _.defaults(graph.getRangeY(), axisY.range) : axisY.range : graph.getRangeY()
    const close = bar[PLOT_DATA.CLOSE]
    const open = bar[PLOT_DATA.OPEN]
    return ~~axisY.getYByValue(Math.abs(close - (close - open) / 2), rangeY)
  }
}
