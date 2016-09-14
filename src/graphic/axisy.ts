import AxisYModel from '../model/axisy'

export default class AxisYRenderer {
  private _axis: AxisYModel
  private _ctx: CanvasRenderingContext2D

  constructor (axis: AxisYModel) {
    this._axis = axis
  }

  public draw () {
    const ctx = this._ctx
    const axis = this._axis
    const axisY = axis
    const cursorPoint = axis.crosshair.point
    const hover = axis.crosshair.chart.hover

    ctx.save()
    ctx.fillStyle = '#ffffff'
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.fillRect(0, 0, axis.size.width, axis.size.height)
    ctx.translate(-0.5, 0)
    ctx.beginPath()
    ctx.moveTo(1, 0)
    ctx.lineTo(1, axis.size.height)

    ctx.font = '12px ans-serif'
    ctx.fillStyle = 'black'
    ctx.textAlign = 'left'

    const tickmarks = axisY.tickmark.getTickMarksByTimeBars()

    for (let i = 0, len = tickmarks.length; i < len; i++) {
      const tickmark = tickmarks[i]
      ctx.moveTo(0, tickmark.y)
      ctx.lineTo(5, tickmark.y)
      ctx.fillText(tickmark.value.toFixed(2).toString(), 10, tickmark.y + 5)
    }
    ctx.closePath()
    ctx.stroke()

    if (cursorPoint && hover && axis.range) {
      const rangeY = axis.range
      const margin = 8
      const y = cursorPoint.y
      ctx.fillStyle = '#333333'
      ctx.fillRect(0, y - 5 - margin / 2, axis.size.width + margin, 12 + margin)
      ctx.fillStyle = '#fff'
      ctx.fillText(axis.getValueByY(y, rangeY).toFixed(2).toString(), 10, y + 5)
    }
    ctx.restore()
  }

  set ctx (ctx: CanvasRenderingContext2D) {
    this._ctx = ctx
  }
}
