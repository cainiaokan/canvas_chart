import { BaseChartRenderer } from './basechart'
import PlotModel from '../../model/plot'
import { YRange } from '../../model/axisy'

enum PLOT_DATA {
  X = 0,
  TIME,
  TYPE,
  VAL,
}

export class ArrowRenderer extends BaseChartRenderer {
  constructor (plotModel: PlotModel) {
    super(plotModel, null)
  }

  public hitTest (): boolean {
    return false
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

    const len = bars.length

    ctx.textAlign = 'center'
    for (let i = 0; i < len; i++) {
      const bar = bars[i]
      switch (bar[PLOT_DATA.TYPE]) {
        case 0:
          ctx.font = '48px Verdana, Arial, sans-serif'
          ctx.fillStyle = '#FF3333'
          ctx.fillText('↑', bar[PLOT_DATA.X], ~~axisY.getYByValue(bar[PLOT_DATA.VAL]) - 16)
          break
        case 1:
          ctx.font = '48px Verdana, Arial, sans-serif'
          ctx.fillStyle = '#99FF33'
          ctx.fillText('↓', bar[PLOT_DATA.X], ~~axisY.getYByValue(bar[PLOT_DATA.VAL]) + 40)
          break
        // case 2:
        //   ctx.fillStyle = 'blue'
        //   ctx.beginPath()
        //   ctx.arc(bar[PLOT_DATA.X], axisY.height / 2, 3, 0, 2 * Math.PI)
        //   ctx.closePath()
        //   ctx.fill()
        //   break
        default:
      }
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

    return range
  }

  protected getSelectionYByBar (bar: any[]): number {
    return null
  }
}
