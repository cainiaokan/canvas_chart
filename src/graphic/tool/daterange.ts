import { BaseToolRenderer, Vertex } from './basetool'
import { Datasource } from '../../datasource'
import { HIT_TEST_TOLERANCE } from '../../constant'

export class DateRangeRenderer extends BaseToolRenderer {

  private _datasource: Datasource

  constructor (datasource: Datasource) {
    super()
    this._datasource = datasource
  }

  /**
   * @override
   * 画图工具当前是否可见
   */
  public isNowVisible (): boolean {
    const axisX = this._chart.axisX
    const visibleBars = axisX.getVisibleTimeBars()
    const vertexes = this._vertexes
    return vertexes[0].time <= visibleBars[visibleBars.length - 1].time &&
           vertexes[1].time >= visibleBars[0].time
  }

  get vertexes (): Vertex[] {
    const axisY = this._chart.axisY
    const range = axisY.range

    return this._vertexes.map(vertex => ({
      time: vertex.time,
      value: (range.max + range.min) / 2,
    }))
  }

  public drawTool (ctx: CanvasRenderingContext2D) {
    const chart = this._chart
    const axisX = chart.axisX
    const vertexes = this._vertexes
    const curPoint = this.getCursor()
    const isFinished = this.isFinished()
    const height = chart.height

    ctx.strokeStyle = '#ababab'
    ctx.lineWidth = 1
    ctx.beginPath()

    let x1
    let x2

    if (isFinished) {
      x1 = ~~axisX.getXByTime(vertexes[0].time)
      ctx.moveTo(x1, 0)
      ctx.lineTo(x1, height)
      x2 = ~~axisX.getXByTime(vertexes[1].time)
      ctx.moveTo(x2, 0)
      ctx.lineTo(x2, height)
    } else {
      x1 = ~~axisX.getXByTime(vertexes[0].time)
      ctx.moveTo(x1, 0)
      ctx.lineTo(x1, height)
      x2 = curPoint.x
      ctx.moveTo(x2, 0)
      ctx.lineTo(x2, height)
    }
    ctx.stroke()

    ctx.beginPath()
    ctx.strokeStyle = '#a000a0'
    ctx.setLineDash([6, 6])
    ctx.moveTo(x1, height / 2)
    ctx.lineTo(x2, height / 2)
    ctx.moveTo(x2 - 8, height / 2 - 8)
    ctx.lineTo(x2, height / 2)
    ctx.moveTo(x2 - 8, height / 2 + 8)
    ctx.lineTo(x2, height / 2)
    ctx.stroke()

    ctx.globalAlpha = .3
    ctx.fillStyle = '#6b91c5'
    x1 = ~~axisX.getXByTime(vertexes[0].time)

    if (isFinished) {
      x2 = ~~axisX.getXByTime(vertexes[1].time)
    } else {
      x2 = curPoint.x
    }

    ctx.rect(x1, 0, x2 - x1, height)
    ctx.fill()
  }

  public hitTestTool (): boolean {
    const curPoint = this.getCursor()
    const isFinished = this.isFinished()
    let vertexes = this._vertexes

    if (isFinished) {
      return vertexes.some(vertex => {
        const axisX = this._chart.axisX
        return Math.abs(curPoint.x - ~~axisX.getXByTime(vertex.time)) < HIT_TEST_TOLERANCE
      })
    }
  }

  public isFinished (): boolean {
    return this._vertexes.length === 2
  }
}
