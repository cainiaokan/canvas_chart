import CrosshairModel from '../model/crosshair'

export default class CrosshairRenderer {
  private _model: CrosshairModel

  constructor (model: CrosshairModel) {
    this._model = model
  }

  public draw () {
    const model = this._model
    const chart = model.chart
    const ctx = chart.topCtx
    const point = model.point
    const height = ctx.canvas.height
    const width = ctx.canvas.width
    ctx.clearRect(0, 0, width, height)

    if (!point) {
      return
    }
    const bar = chart.axisX.findTimeBarByX(point.x)

    ctx.strokeStyle = '#333333'
    ctx.lineWidth = 1
    ctx.beginPath()

    if (bar) {
      ctx.moveTo(bar.x, 0)
      ctx.lineTo(bar.x, height)
      ctx.stroke()
    }

    if (model.hover && chart.axisY.range) {
      ctx.moveTo(0, point.y)
      ctx.lineTo(width, point.y)
      ctx.stroke()
      ctx.closePath()
    }
  }

}
