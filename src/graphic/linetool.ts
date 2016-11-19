import BaseToolRenderer from './basetool'

export default class LineToolRenderer extends BaseToolRenderer {

  constructor () {
    super()
  }

  public drawTool () {
    const chart = this._chart
    const ctx = this.getContext()
    const startVertex = this._vertexes[0]
    const endVertex = this._vertexes[1]
    const cursor = chart.crosshair.point || this._lastCursorPoint

    this._lastCursorPoint = cursor

    let x: number
    let y: number
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 1
    ctx.beginPath()
    if (this.isFinished()) {
      x = chart.axisX.getXByTime(startVertex.time)
      y = chart.axisY.getYByValue(startVertex.value, chart.getRangeY())
      ctx.moveTo(x, y)
      x = chart.axisX.getXByTime(endVertex.time)
      y = chart.axisY.getYByValue(endVertex.value, chart.getRangeY())
      ctx.lineTo(x, y)
    } else {
      x = chart.axisX.getXByTime(startVertex.time)
      y = chart.axisY.getYByValue(startVertex.value, chart.getRangeY())
      ctx.moveTo(x, y)
      ctx.lineTo(cursor.x, cursor.y)
    }
    ctx.stroke()
  }

  public hitTest (): boolean {
    return false
  }

  public isFinished (): boolean {
    return this._vertexes.length === 2
  }
}
