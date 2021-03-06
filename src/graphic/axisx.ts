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
    const width = axis.width
    const height = axis.height
    const timeBars = axis.getVisibleTimeBars()
    const cursorPoint = axis.crosshair.point

    ctx.strokeStyle = '#999999'
    ctx.lineWidth = 1
    ctx.translate(0.5, 0.5)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(width, 0)
    ctx.stroke()
    ctx.font = '10px ans-serif'
    ctx.fillStyle = '#999999'
    ctx.textAlign = 'center'

    const tickmarks = axis.tickmark.getTickMarksByTimeBars(timeBars)

    for (let i = 0, len = tickmarks.length; i < len; i++) {
      const tickmark = tickmarks[i]
      ctx.moveTo(~~tickmark.x, 0)
      ctx.lineTo(~~tickmark.x, 5)
      ctx.fillText(tickmark.time, tickmark.x, 19)
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
        ctx.fillRect(timeBar.x - textMetrics.width / 2 - margin / 2, 0, textMetrics.width + margin, height)
        ctx.fillStyle = '#999999'
        ctx.fillText(dateStr, timeBar.x, 19)
      }
    }
  }
}
