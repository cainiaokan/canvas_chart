import { BaseToolRenderer, Vertex } from './basetool'
import { HIT_TEST_TOLERANCE } from '../../constant'
import { pointToSegDist } from '../../util'

export class HorzLineRenderer extends BaseToolRenderer {
  /**
   * @override
   * 画图工具当前是否可见
   */
  public isNowVisible (): boolean {
    const axisY = this._chart.axisY
    const vertex = this._vertexes[0]
    return vertex.value > axisY.minVal && vertex.value < axisY.maxVal
  }

  get vertexes (): Vertex[] {
    const axisX = this._chart.axisX

    return this._vertexes.map(vertex => ({
      time: axisX.findTimeBarByX(axisX.width / 2).time,
      value: vertex.value,
    }))
  }

  public drawTool (ctx: CanvasRenderingContext2D) {
    const chart = this._chart
    const axisY = chart.axisY
    const vertex = this._vertexes[0]
    const y = ~~axisY.getYByValue(vertex.value)

    ctx.strokeStyle = '#000'
    ctx.lineWidth = 1
    ctx.translate(0, 0.5)
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(chart.width, y)
    ctx.stroke()
  }

  public hitTestTool (): boolean {
    const chart = this._chart
    const axisY = chart.axisY
    const point = this.getCursor()
    const vertex = this._vertexes[0]

    const x0 = point.x
    const y0 = point.y
    const x1 = 0
    const x2 = chart.width
    const y = axisY.getYByValue(vertex.value)

    let distance = pointToSegDist(x0, y0, x1, y, x2, y)

    return distance < HIT_TEST_TOLERANCE
  }

  public isFinished (): boolean {
    return this._vertexes.length === 1
  }
}
