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

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, axis.size.width, axis.size.height)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(0, axis.size.height)
    ctx.stroke()
    ctx.closePath()
    ctx.font = '12px ans-serif'
    ctx.fillStyle = 'black'
    ctx.textAlign = 'left'

    axisY.tickmark
      .getTickMarksByTimeBars()
      .forEach(tickmark => {
        const y = axisY.getYByValue(tickmark, axisY.range)
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(5, y)
        ctx.stroke()
        ctx.closePath()
        ctx.fillText(tickmark.toFixed(2).toString(), 10, y + 5)
      })

    if (cursorPoint) {
      const rangeY = this._axis.range
      const margin = 8
      const y = cursorPoint.y
      ctx.fillStyle = '#333333'
      ctx.fillRect(0, y - 5 - margin / 2, this._axis.size.width + margin, 12 + margin)
      ctx.fillStyle = '#fff'
      ctx.fillText(this._axis.getValueByY(y, rangeY).toFixed(2).toString(), 10, y + 5)
    }
  }

  set ctx (ctx: CanvasRenderingContext2D) {
    this._ctx = ctx
  }
}
