import { BaseToolRenderer, Vertex } from './basetool'
import { HIT_TEST_TOLERANCE } from '../../constant'

export class VertLineRenderer extends BaseToolRenderer {
  get vertexes (): Vertex[] {
    const range = this._chart.axisY.range

    return this._vertexes.map(vertex => ({
      time: vertex.time,
      value: (range.max + range.min) / 2,
    }))
  }

  public drawTool (ctx: CanvasRenderingContext2D) {
    const chart = this._chart
    const axisX = chart.axisX
    const vertex = this._vertexes[0]
    const x = ~~axisX.getXByTime(vertex.time)

    ctx.strokeStyle = '#000'
    ctx.lineWidth = 1
    ctx.translate(0.5, 0)
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, chart.height)
    ctx.stroke()
  }

  public hitTestTool (): boolean {
    const axisX = this._chart.axisX
    const point = this.getCursor()
    const vertex = this._vertexes[0]

    return Math.abs(point.x - ~~axisX.getXByTime(vertex.time)) < HIT_TEST_TOLERANCE
  }

  public isFinished (): boolean {
    return this._vertexes.length === 1
  }
}
