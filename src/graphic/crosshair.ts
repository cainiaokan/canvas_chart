import CrosshairModel from '../model/crosshair'

export default class CrosshairRenderer {
  private _model: CrosshairModel
  private _ctx: CanvasRenderingContext2D

  constructor (model: CrosshairModel) {
    this._model = model
  }

  public draw () {
    const ctx = this._ctx
    const model = this._model
    const point = model.point
    const height = ctx.canvas.height
    const width = ctx.canvas.width
    this._ctx.clearRect(0, 0, width, height)

    if (!point) {
      return
    }
    const bar = model.axisX.findTimeBarByX(point.x)

    ctx.strokeStyle = '#333333'
    ctx.lineWidth = 1
    ctx.beginPath()

    if (bar) {
      ctx.moveTo(bar.x, 0)
      ctx.lineTo(bar.x, height)
      ctx.stroke()
    }

    if (model.hover && model.axisY.range) {
      ctx.moveTo(0, point.y)
      ctx.lineTo(width, point.y)
      ctx.stroke()
      ctx.closePath()
    }
  }

  set ctx (ctx: CanvasRenderingContext2D) {
    this._ctx = ctx
  }

}
