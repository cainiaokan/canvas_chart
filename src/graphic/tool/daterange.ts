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

    let lTime
    let rTime
    let lx
    let rx

    if (isFinished) {
      lTime = vertexes[0].time <= vertexes[1].time ? vertexes[0].time : vertexes[1].time
      rTime = lTime === vertexes[0].time ? vertexes[1].time : vertexes[0].time
      lx = ~~axisX.getXByTime(lTime)
      rx = ~~axisX.getXByTime(rTime)
      ctx.moveTo(lx, 0)
      ctx.lineTo(lx, height)
      ctx.moveTo(rx, 0)
      ctx.lineTo(rx, height)
    } else {
      lx = ~~axisX.getXByTime(vertexes[0].time)
      rx = lx <= curPoint.x ? curPoint.x : lx
      lx = lx === rx ? curPoint.x : lx
      ctx.moveTo(lx, 0)
      ctx.lineTo(lx, height)
      ctx.moveTo(rx, 0)
      ctx.lineTo(rx, height)
    }
    ctx.stroke()

    ctx.beginPath()
    ctx.strokeStyle = '#a000a0'
    ctx.setLineDash([6, 6])
    ctx.moveTo(lx, height / 2)
    ctx.lineTo(rx, height / 2)
    ctx.moveTo(rx - 8, height / 2 - 8)
    ctx.lineTo(rx, height / 2)
    ctx.moveTo(rx - 8, height / 2 + 8)
    ctx.lineTo(rx, height / 2)
    ctx.stroke()

    ctx.globalAlpha = .3
    ctx.fillStyle = '#6b91c5'

    ctx.rect(lx, 0, rx - lx, height)
    ctx.fill()
  }

  public hitTestTool (): boolean {
    const chart = this._chart
    const height = chart.height
    const axisX = chart.axisX
    let vertexes = this._vertexes
    const { x, y } = this.getCursor()
    const x1 = ~~axisX.getXByTime(vertexes[0].time)
    const x2 = ~~axisX.getXByTime(vertexes[1].time)
    const lx = x1 <= x2 ? x1 : x2
    const rx = x1 <= x2 ? x2 : x1

    return Math.abs(lx - x) < HIT_TEST_TOLERANCE ||
           Math.abs(rx - x) < HIT_TEST_TOLERANCE ||
           (x >= lx && y <= rx && Math.abs(y - height / 2) < HIT_TEST_TOLERANCE)
  }

  public isFinished (): boolean {
    return this._vertexes.length === 2
  }
}
