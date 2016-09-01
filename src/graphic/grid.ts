import ChartModel from '../model/chart'

export default class GridRenderer {
  private _chart: ChartModel
  private _ctx: CanvasRenderingContext2D

  constructor (chart: ChartModel) {
    this._chart = chart
  }

  public draw () {
    const ctx = this._ctx
    const axisX = this._chart.axisX
    const axisY = this._chart.axisY
    const width = parseInt(ctx.canvas.style.width)
    const height = parseInt(ctx.canvas.style.height)

    let tickmarks
    let tickmark

    ctx.strokeStyle = '#E6E6E6'
    ctx.beginPath()
    tickmarks = axisX.tickmark.getTickMarksByTimeBars(axisX.getVisibleTimeBars())

    for (let i = 0, len = tickmarks.length; i < len; i++) {
      tickmark = tickmarks[i]
      ctx.moveTo(tickmark.x, 0)
      ctx.lineTo(tickmark.x, height)
    }

    tickmarks = axisY.tickmark.getTickMarksByTimeBars()

    for (let i = 0, len = tickmarks.length; i < len; i++) {
      tickmark = tickmarks[i]
      ctx.moveTo(0, tickmark.y)
      ctx.lineTo(width, tickmark.y)
    }

    ctx.stroke()
  }

  set ctx (ctx: CanvasRenderingContext2D) {
    this._ctx = ctx
  }

}
