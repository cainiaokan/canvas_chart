import * as _ from 'underscore'
import BaseChart, { ChartStyle } from './basechart'
import PlotModel from '../model/plot'
import { YRange } from '../model/axisy'

enum PLOT_DATA {
  X = 0,
  TIME,
  UP,
  DOWN,
}

const DEFAULT_STYLE = {
  color: '#000080',
  transparency: .3,
}

export default class BandRenderer extends BaseChart {

  constructor (plotModel: PlotModel, style: ChartStyle) {
    super(plotModel, _.defaults(style, DEFAULT_STYLE))
  }

  public hitTest (): boolean {
    return false
  }

  public draw (): void {
    const plot = this.plotModel
    const bars = plot.getVisibleBars()

    if (!bars.length) {
      return
    }

    const graph = plot.graph
    const chart = graph.chart
    const ctx = chart.ctx
    const axisY = chart.axisY
    const rangeY = graph.isPrice ? axisY.range : graph.getRangeY()

    ctx.globalAlpha = this.style.transparency
    ctx.fillStyle = this.style.color
    ctx.beginPath()

    const len = bars.length

    if (len) {
      const bar = bars[0]
      ctx.moveTo(bar[PLOT_DATA.X], axisY.getYByValue(bar[PLOT_DATA.UP], rangeY))
    }

    for (let i = 1; i < len; i++) {
      const bar = bars[i]
      ctx.lineTo(bar[PLOT_DATA.X], axisY.getYByValue(bar[PLOT_DATA.UP], rangeY))
    }

    for (let i = len - 1; i >= 0; i--) {
      const bar = bars[i]
      ctx.lineTo(bar[PLOT_DATA.X], axisY.getYByValue(bar[PLOT_DATA.DOWN], rangeY))
    }

    ctx.closePath()
    ctx.fill()
    ctx.globalAlpha = 1
  }

  protected getSelectionYByBar (bar: any[]): number {
    return null
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
      if (bar[PLOT_DATA.UP] < prev.min) {
        prev.min = bar[PLOT_DATA.UP]
      }
      if (bar[PLOT_DATA.DOWN] > prev.max) {
        prev.max = bar[PLOT_DATA.DOWN]
      }
      return prev
    }, range)
  }
}
