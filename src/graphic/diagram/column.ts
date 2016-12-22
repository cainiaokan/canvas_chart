import * as _ from 'underscore'
import { BaseChartRenderer, ChartStyle } from './basechart'
import PlotModel from '../../model/plot'
import { YRange } from '../../model/axisy'
import { isPointInRect } from '../../util'

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
  opacity: 1,
}

export class ColumnChartRenderer extends BaseChartRenderer {

  constructor (plotModel: PlotModel, style: ChartStyle) {
    super(plotModel, _.defaults(style, DEFAULT_STYLE))
  }

  public hitTest (): boolean {
    const plot = this._plotModel
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
    const width = axisX.barWidth
    const height = chart.height
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
    const bars = this._plotModel.getVisibleBars()

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
    const barWidth = ~~chart.axisX.barWidth
    const rangeY = graph.isPrice ? axisY.range : graph.getRangeY()
    const style = this.style
    const margin = axisY.margin
    const scale = style.scale || 1
    const histogramBase = style.histogramBase

    let x
    let y
    let y1
    let bar
    let lastBarX = 0
    let lastBarY = 0

    ctx.lineWidth = 1
    ctx.globalAlpha = style.opacity
    ctx.strokeStyle = 'black'
    ctx.translate(0.5, 0.5)
    ctx.beginPath()
    for (let i = 0, len = bars.length; i < len; i++) {
      bar = bars[i]
      x = ~~bar[PLOT_DATA.X] - ~~(barWidth / 2)
      y1 = ~~axisY.getYByValue(bar[PLOT_DATA.VOLUME], rangeY)

      // 如果设置了基准线baseline
      if (typeof histogramBase === 'number') {
        y = y1
        y1 = ~~axisY.getYByValue(histogramBase, rangeY)
        ctx.fillStyle = y - y1 > 0 ? style.colorDown : style.color
        if (lastBarX > 0) {
          ctx.fillRect(lastBarX, y, barWidth + x - lastBarX, y1 - y)
          ctx.moveTo(lastBarX, lastBarY)
          ctx.lineTo(lastBarX, y)
        } else {
          ctx.fillRect(x, y, barWidth, y1 - y)
          ctx.moveTo(x, y1)
          ctx.lineTo(x, y)
        }
        ctx.lineTo(x + barWidth, y)
        ctx.lineTo(x + barWidth, y1)
      } else if (typeof style.scale === 'number') {
        ctx.fillStyle = bar[PLOT_DATA.IS_DOWN] ? style.colorDown : style.color
        y = ~~(height - (height - y1 - margin) * scale)
        if (lastBarX > 0) {
          ctx.fillRect(lastBarX, y, barWidth + x - lastBarX, height - y)
          ctx.moveTo(lastBarX, lastBarY)
          ctx.lineTo(lastBarX, y)
        } else {
          ctx.fillRect(x, y, barWidth, height - y)
          ctx.moveTo(x, height)
          ctx.lineTo(x, y)
        }
        ctx.lineTo(x + barWidth, y)
        ctx.lineTo(x + barWidth, height)
      } else {
        ctx.fillStyle = bar[PLOT_DATA.IS_DOWN] ? style.colorDown : style.color
        y = y1
        if (lastBarX > 0) {
          ctx.fillRect(lastBarX, y, barWidth + x - lastBarX, height - y)
          ctx.moveTo(lastBarX, lastBarY)
          ctx.lineTo(lastBarX, y)
        } else {
          ctx.fillRect(x, y, barWidth, height - y)
          ctx.moveTo(x, height)
          ctx.lineTo(x, y)
        }
        ctx.lineTo(x + barWidth, y)
        ctx.lineTo(x + barWidth, height)
      }
      lastBarX = x + barWidth
      lastBarY = y
    }
    ctx.stroke()
  }

  protected getSelectionYByBar (bar: any[]): number {
    const plot = this._plotModel
    const graph = plot.graph
    const chart = graph.chart
    const axisY = chart.axisY
    const height = chart.height
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
