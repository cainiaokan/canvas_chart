import * as _ from 'underscore'
import BaseChart, { ChartStyle } from './basechart'
import PlotModel from '../model/plot'
import { YRange } from '../model/axisy'
import { isPointInRect } from '../util'

enum PLOT_DATA {
  X = 0,
  TIME,
  VOLUME,
  IS_DOWN
}

const DEFAULT_STYLE = {
  color: '#ff524f',
  colorDown: '#2bbe65',
  lineWidth: 1,
}

export default class ColumnChartRenderer extends BaseChart {

  constructor (plotModel: PlotModel, style: ChartStyle) {
    super(plotModel, _.defaults(style, DEFAULT_STYLE))
  }

  public hitTest (): boolean {
    const plot = this.plotModel
    const graph = plot.graph
    const chart = graph.chart
    const ctx = chart.ctx
    const axisX = chart.axisX
    const axisY = chart.axisY
    const rangeY = graph.isPrice ? axisY.range : graph.getRangeY()
    const curBar = plot.getCurBar()
    if (!curBar) {
      return false
    }
    const point = chart.crosshair.point
    const width = axisX.barWidth
    const height = parseInt(ctx.canvas.style.height)
    const histogramBase = this.style.histogramBase
    const scale = this.style.scale || 1
    const margin = axisY.margin
    const x0 = point.x
    const y0 = point.y
    let x1
    let y1
    let x2
    let y2
    if (typeof histogramBase === 'number') {
      x1 = curBar[PLOT_DATA.X] - width / 2
      y1 = axisY.getYByValue(curBar[PLOT_DATA.VOLUME], rangeY)
      x2 = x1 + width
      y2 = axisY.getYByValue(histogramBase, rangeY)
      return isPointInRect(
        x0, y0,
        x1, y1,
        x2, y2
      )
    } else if (typeof this.style.scale === 'number') {
      x1 = curBar[PLOT_DATA.X] - width / 2
      y1 = ~~(height - (height - axisY.getYByValue(curBar[PLOT_DATA.VOLUME], rangeY) - margin) * scale)
      x2 = x1 + width
      y2 = height
      return isPointInRect(
        x0, y0,
        x1, y1,
        x2, y2
      )
    } else {
      x1 = curBar[PLOT_DATA.X] - width / 2
      y1 = ~~axisY.getYByValue(curBar[PLOT_DATA.VOLUME], rangeY)
      x2 = x1 + width
      y2 = height
      return isPointInRect(
        x0, y0,
        x1, y1,
        x2, y2
      )
    }
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
      const data = cur
      if (data[PLOT_DATA.VOLUME] > prev.max) {
        prev.max = data[PLOT_DATA.VOLUME]
      }
      if (data[PLOT_DATA.VOLUME] < prev.min) {
        prev.min = data[PLOT_DATA.VOLUME]
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
    const height = parseInt(ctx.canvas.style.height)
    const barWidth = chart.axisX.barWidth
    const rangeY = graph.isPrice ? axisY.range : graph.getRangeY()
    const style = this.style
    const margin = axisY.margin
    const scale = style.scale || 1
    const histogramBase = style.histogramBase

    ctx.lineWidth = 1
    ctx.globalAlpha = 0.6
    ctx.strokeStyle = 'black'
    ctx.beginPath()

    for (let i = 0, bar, len = bars.length, x, y, y1; i < len; i++) {
      bar = bars[i]
      x = bar[PLOT_DATA.X] - barWidth / 2
      y1 = ~~axisY.getYByValue(bar[PLOT_DATA.VOLUME], rangeY)

      if (typeof histogramBase === 'number') {
        y = ~~y1
        y1 = axisY.getYByValue(histogramBase, rangeY)
        ctx.fillStyle = y - y1 > 0 ? style.colorDown : style.color
        ctx.fillRect(x, y, barWidth, y1 - y)
        ctx.moveTo(x, y1)
        ctx.lineTo(x, y)
        ctx.lineTo(x + barWidth, y)
        ctx.lineTo(x + barWidth, y1)
      } else if (typeof style.scale === 'number') {
        ctx.fillStyle = bar[PLOT_DATA.IS_DOWN] ? style.colorDown : style.color
        y = ~~(height - (height - y1 - margin) * scale)
        ctx.fillRect(x, y, barWidth, height - y)
        ctx.moveTo(x, height)
        ctx.lineTo(x, y)
        ctx.lineTo(x + barWidth, y)
        ctx.lineTo(x + barWidth, height)
      } else {
        ctx.fillStyle = bar[PLOT_DATA.IS_DOWN] ? style.colorDown : style.color
        y = y1
        ctx.fillRect(x, y, barWidth, height - y)
        ctx.moveTo(x, height)
        ctx.lineTo(x, y)
        ctx.lineTo(x + barWidth, y)
        ctx.lineTo(x + barWidth, height)
      }
    }

    ctx.stroke()
    ctx.globalAlpha = 1
  }

  protected getSelectionYByBar (bar: any[]): number {
    const plot = this.plotModel
    const graph = plot.graph
    const chart = graph.chart
    const ctx = chart.ctx
    const axisY = chart.axisY
    const height = parseInt(ctx.canvas.style.height)
    const rangeY = graph.isPrice ? axisY.range : graph.getRangeY()
    const margin = axisY.margin
    const style = this.style
    const scale = style.scale || 1
    const histogramBase = style.histogramBase

    if (typeof histogramBase === 'number') {
      return ~~axisY.getYByValue(bar[PLOT_DATA.VOLUME], rangeY)
    } else if (typeof style.scale === 'number') {
      return ~~(height - (height - ~~axisY.getYByValue(bar[PLOT_DATA.VOLUME], rangeY) - margin) * scale)
    } else {
      return ~~axisY.getYByValue(bar[PLOT_DATA.VOLUME], rangeY)
    }
  }
}
