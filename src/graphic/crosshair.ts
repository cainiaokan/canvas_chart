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
    const height = chart.height
    const width = chart.width

    if (!point) {
      return
    }
    const bar = chart.axisX.findTimeBarByX(point.x)

    ctx.save()
    ctx.strokeStyle = '#333333'
    ctx.translate(0.5, 0.5)

    if (ctx.setLineDash) {
      ctx.setLineDash([3, 3])
    }
    ctx.lineWidth = 1
    ctx.beginPath()

    if (bar) {
      ctx.moveTo(~~bar.x, 0)
      ctx.lineTo(~~bar.x, ~~height)
      ctx.stroke()
    }

    if (chart.hover && chart.axisY.range) {
      ctx.moveTo(0, ~~point.y)
      ctx.lineTo(~~width, ~~point.y)
      ctx.stroke()
      ctx.closePath()
    }
    ctx.restore()
  }

}
