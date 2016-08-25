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
    if (!point) {
      return
    }
    const width = ctx.canvas.width
    const height = ctx.canvas.height
    const bar = model.axisX.findBarByX(point.x)

    ctx.strokeStyle = '#333333'
    ctx.lineWidth = 1
    ctx.beginPath()

    if (bar) {
      const x = bar.x
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    ctx.moveTo(0, point.y)
    ctx.lineTo(width, point.y)
    ctx.stroke()
    ctx.closePath()
  }

  set ctx (ctx: CanvasRenderingContext2D) {
    this._ctx = ctx
  }

}
