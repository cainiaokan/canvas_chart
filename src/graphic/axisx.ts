import AxisXModel from '../model/axisx'
import { pad } from '../util'

export default class AxisXRenderer {
  private _axis: AxisXModel
  private _ctx: CanvasRenderingContext2D

  constructor (axis: AxisXModel) {
    this._axis = axis
  }
  public draw () {
    const ctx = this._ctx
    const axis = this._axis
    const timeBars = axis.getVisibleTimeBars()
    const cursorPoint = axis.crosshair.point

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, axis.size.width, axis.size.height)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(axis.size.width, 0)
    ctx.stroke()
    ctx.closePath()
    ctx.font = '12px ans-serif'
    ctx.fillStyle = 'black'
    ctx.textAlign = 'center'

    axis.tickmark
      .getTickMarksByTimeBars(timeBars)
      .forEach(bar => {
        ctx.beginPath()
        ctx.moveTo(bar.x, 0)
        ctx.lineTo(bar.x, 5)
        ctx.stroke()
        ctx.closePath()
        ctx.fillText(bar.time, bar.x, 20)
      })

    if (cursorPoint) {
      const timeBar = axis.findBarByX(cursorPoint.x)
      if (!timeBar) {
        return
      }
      const date = new Date(timeBar.time * 1000)
      const margin = 8
      let dateStr = ''
      let textMetrics = null
      if (axis.datasource.getResolution() >= 'D') {
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

  set ctx (ctx: CanvasRenderingContext2D) {
    this._ctx = ctx
  }
}
