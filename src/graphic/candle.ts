import * as _ from 'underscore'
import BaseChart, { ChartStyle } from './basechart'
import PlotModel from '../model/plot'
import { YRange } from '../model/axisy'
import { isPointInRect } from '../util'

enum PLOT_DATA {
  X = 0,
  TIME,
  OPEN,
  CLOSE,
  HIGH,
  LOW,
}

const DEFAULT_STYLE = {
  color: '#ff524f',
  colorDown: '#2bbe65',
}

export default class CandleChartRenderer extends BaseChart {

  constructor (plotModel: PlotModel, style: ChartStyle) {
    super(plotModel, _.defaults(style, DEFAULT_STYLE))
  }

  public hitTest (): boolean {
    const plot = this.plotModel
    const graph = plot.graph
    const chart = graph.chart
    const axisX = chart.axisX
    const axisY = chart.axisY
    const rangeY = graph.isPrice ? axisY.range : graph.getRangeY()
    const curBar = plot.getCurBar()
    if (!curBar) {
      return false
    }
    const point = chart.crosshair.point
    const candleWidth = axisX.barWidth * 0.6
    const x0 = point.x
    const y0 = point.y
    const x1 = curBar[PLOT_DATA.X] - candleWidth / 2
    const y1 = axisY.getYByValue(curBar[PLOT_DATA.HIGH], rangeY)
    const x2 = x1 + candleWidth
    const y2 = axisY.getYByValue(curBar[PLOT_DATA.LOW], rangeY)
    return isPointInRect(
      x0, y0,
      x1, y1,
      x2, y2
    )
  }

  public calcRangeY (): YRange {
    const bars = this.plotModel.getVisibleBars()

    if (!bars.length) {
      return null
    }

    const range: YRange = {
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

  public draw () {
    const plot = this.plotModel
    const bars = plot.getVisibleBars()

    if (!bars.length) {
      return
    }

    const graph = plot.graph
    const chart = graph.chart
    const ctx = chart.ctx
    const axisY = chart.axisY
    const barWidth = chart.axisX.barWidth
    const candleWidth = barWidth * 0.6
    const rangeY = graph.isPrice ? axisY.range : graph.getRangeY()

    ctx.save()
    ctx.translate(0.5, 0)
    ctx.lineWidth = 1

    for (let i = 0, bar, len = bars.length, isUp, color; i < len; i++) {
      bar = bars[i]
      isUp = bar[PLOT_DATA.CLOSE] > bar[PLOT_DATA.OPEN]
      color = isUp ? this.style.color : this.style.colorDown
      ctx.strokeStyle = color
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(~~bar[PLOT_DATA.X], ~~axisY.getYByValue(bar[PLOT_DATA.HIGH], rangeY))
      ctx.lineTo(~~bar[PLOT_DATA.X], ~~axisY.getYByValue(bar[PLOT_DATA.LOW], rangeY))
      ctx.stroke()
    }

    ctx.translate(-0.5, 0)
    for (let i = 0, bar, len = bars.length, x, y, isUp, color; i < len; i++) {
      bar = bars[i]
      isUp = bar[PLOT_DATA.CLOSE] > bar[PLOT_DATA.OPEN]
      color = isUp ? this.style.color : this.style.colorDown
      ctx.strokeStyle = color
      ctx.fillStyle = color
      x = ~~(bar[PLOT_DATA.X] - candleWidth / 2 + 0.5)
      y = ~~axisY.getYByValue(isUp ? bar[PLOT_DATA.CLOSE] : bar[PLOT_DATA.OPEN], rangeY)
      ctx.fillRect(
        x,
        y,
        ~~candleWidth,
        ~~Math.abs(
          axisY.getYByValue(isUp ? bar[PLOT_DATA.OPEN] : bar[PLOT_DATA.CLOSE], rangeY) - y
        )
      )
    }

    ctx.restore()
  }

  protected getSelectionYByBar (bar: any[]): number {
    const plot = this.plotModel
    const graph = plot.graph
    const chart = graph.chart
    const axisY = chart.axisY
    const rangeY = graph.isPrice ? axisY.range : graph.getRangeY()
    const close = bar[PLOT_DATA.CLOSE]
    const open = bar[PLOT_DATA.OPEN]
    return ~~axisY.getYByValue(Math.abs(close - (close - open) / 2), rangeY)
  }
}
