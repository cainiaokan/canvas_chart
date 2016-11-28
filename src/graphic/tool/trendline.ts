import { BaseToolRenderer } from './basetool'
import { HIT_TEST_TOLERANCE } from '../../constant'
import { pointToSegDist } from '../../util'

export class TrendLineToolRenderer extends BaseToolRenderer {

  constructor () {
    super()
  }

  public drawTool (ctx: CanvasRenderingContext2D) {
    const chart = this._chart
    const axisX = chart.axisX
    const axisY = chart.axisY
    const rangeY = chart.axisY.range
    const cursor = this.getCursor()
    const startVertex = this._vertexes[0]
    const endVertex = this._vertexes[1]

    let x: number
    let y: number
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 1
    ctx.beginPath()
    if (this.isFinished()) {
      x = ~~axisX.getXByTime(startVertex.time)
      y = ~~axisY.getYByValue(startVertex.value, rangeY)
      ctx.moveTo(x, y)
      x = ~~axisX.getXByTime(endVertex.time)
      y = ~~axisY.getYByValue(endVertex.value, rangeY)
      ctx.lineTo(x, y)
    } else {
      x = ~~axisX.getXByTime(startVertex.time)
      y = ~~axisY.getYByValue(startVertex.value, rangeY)
      ctx.moveTo(x, y)
      ctx.lineTo(~~cursor.x, ~~cursor.y)
    }
    ctx.stroke()
  }

  public hitTestTool (): boolean {
    const chart = this._chart
    const axisX = chart.axisX
    const axisY = chart.axisY
    const rangeY = chart.axisY.range

    const point = chart.crosshair.point
    const vertex1 = this._vertexes[0]
    const vertex2 = this._vertexes[1]
    const x0 = point.x
    const y0 = point.y
    const x1 = axisX.getXByTime(vertex1.time)
    const y1 = axisY.getYByValue(vertex1.value, rangeY)
    const x2 = axisX.getXByTime(vertex2.time)
    const y2 = axisY.getYByValue(vertex2.value, rangeY)

    let distance = pointToSegDist(x0, y0, x1, y1, x2, y2)

    return distance < HIT_TEST_TOLERANCE
  }

  public isFinished (): boolean {
    return this._vertexes.length === 2
  }
}
