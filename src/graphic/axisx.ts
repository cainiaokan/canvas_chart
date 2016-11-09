import AxisXModel from '../model/axisx'
import { pad } from '../util'

export default class AxisXRenderer {
  private _axis: AxisXModel

  constructor (axis: AxisXModel) {
    this._axis = axis
  }
  public draw () {
    const axis = this._axis
    const ctx = axis.ctx
    const timeBars = axis.getVisibleTimeBars()
    const cursorPoint = axis.crosshair.point

    ctx.fillStyle = '#ffffff'
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 1

    ctx.save()
    ctx.translate(0.5, 0.5)

    ctx.fillRect(0, 0, axis.size.width, axis.size.height)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(axis.size.width, 0)
    ctx.stroke()
    ctx.font = '12px ans-serif'
    ctx.fillStyle = 'black'
    ctx.textAlign = 'center'

    const tickmarks = axis.tickmark.getTickMarksByTimeBars(timeBars)

    for (let i = 0, len = tickmarks.length; i < len; i++) {
      const tickmark = tickmarks[i]
      ctx.moveTo(~~tickmark.x, 0)
      ctx.lineTo(~~tickmark.x, 5)
      ctx.fillText(tickmark.time, tickmark.x, 20)
    }
    ctx.stroke()
    ctx.closePath()

    if (cursorPoint) {
      const timeBar = axis.findTimeBarByX(cursorPoint.x)
      if (timeBar) {
        const date = new Date(timeBar.time * 1000)
        const margin = 8
        let dateStr = ''
        let textMetrics = null
        if (axis.datasource.resolution >= 'D') {
          dateStr = date.getFullYear() + '-' +
            pad(date.getMonth() + 1 + '', 2) + '-' +
            pad(date.getDate() + '', 2)
        } else {
          dateStr = date.getFullYear() + '-' +
            pad(date.getMonth() + 1 + '', 2) + '-' +
            pad(date.getDate() + '', 2) + ' ' +
            pad(date.getHours() + '', 2) + ':' +
            pad(date.getMinutes() + '', 2)
        }
        textMetrics = ctx.measureText(dateStr)
        ctx.fillStyle = '#333333'
        ctx.fillRect(timeBar.x - textMetrics.width / 2 - margin / 2, 0, textMetrics.width + margin, axis.size.height)
        ctx.fillStyle = '#ffffff'
        ctx.fillText(dateStr, timeBar.x, 20)
      }
    }
    ctx.restore()
  }
}
