import AxisYModel from '../model/axisy'

export default class AxisYRenderer {
  private _axis: AxisYModel

  constructor (axis: AxisYModel) {
    this._axis = axis
  }

  public draw () {
    const axis = this._axis
    const ctx = axis.ctx
    const width = axis.width
    const height = axis.height
    const axisY = axis
    const cursorPoint = axis.crosshair.point
    const hover = axis.crosshair.chart.hover

    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 1

    ctx.translate(0.5, 0.5)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(0, height)

    ctx.font = '12px ans-serif'
    ctx.fillStyle = 'black'
    ctx.textAlign = 'left'

    const tickmarks = axisY.tickmark.getTickMarksByTimeBars()

    for (let i = 0, len = tickmarks.length; i < len; i++) {
      const tickmark = tickmarks[i]
      ctx.moveTo(0, ~~tickmark.y)
      ctx.lineTo(5, ~~tickmark.y)
      ctx.fillText(tickmark.value.toFixed(2).toString(), 10, tickmark.y + 5)
    }

    ctx.closePath()
    ctx.stroke()

    if (cursorPoint && hover && axis.range) {
      const margin = 8
      const y = cursorPoint.y
      ctx.fillStyle = '#333333'
      ctx.fillRect(0, y - 5 - margin / 2, width + margin, 12 + margin)
      ctx.fillStyle = '#fff'
      ctx.fillText(axis.getValueByY(y).toFixed(2).toString(), 10, y + 5)
    }
  }
}
