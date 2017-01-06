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
    const isEditMode = chart.chartLayout.isEditMode

    if (!point) {
      return
    }
    const bar = chart.axisX.findTimeBarByX(point.x)

    ctx.save()
    ctx.strokeStyle = isEditMode ? '#a000a0' : '#333333'
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
    }
    ctx.closePath()

    if (isEditMode && chart.hover) {
      ctx.fillStyle = '#a000a0'
      ctx.beginPath()
      ctx.arc(~~bar.x, ~~point.y, 3, 0, 2 * Math.PI)
      ctx.closePath()
      ctx.fill()
    }
    ctx.restore()
  }

}
