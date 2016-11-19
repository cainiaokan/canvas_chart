import ChartModel from '../model/chart'

type Vertex = { time: number, value: number }
abstract class BaseToolRenderer {
  protected _chart: ChartModel
  protected _isValid: boolean
  protected _lastCursorPoint: { x: number, y: number }
  protected _vertexes: Vertex[]

  constructor () {
    this._vertexes = []
    this._isValid = false
  }

  public abstract drawTool (): void

  public abstract hitTest (): boolean

  public abstract isFinished (): boolean

  public setChart (chart: ChartModel) {
    this._chart = chart
  }

  public getContext () {
    return this.isFinished() ? this._chart.ctx : this._chart.topCtx
  }

  public addVertex (point: {x: number, y: number}) {
    this._vertexes.push({
      time: this._chart.axisX.findTimeBarByX(point.x).time,
      value: this._chart.axisY.getValueByY(point.y, this._chart.getRangeY()),
    })
  }

  public drawVertex () {
    const ctx = this.getContext()
    ctx.strokeStyle = '#000'
    ctx.fillStyle = '#333'
    ctx.beginPath()
    for (let i = 0, len = this._vertexes.length; i < len; i++) {
      ctx.arc(this._chart.axisX.getXByTime(this._vertexes[i].time),
              this._chart.axisY.getYByValue(this._vertexes[i].value, this._chart.getRangeY()),
              5, 0, 2 * Math.PI)
      ctx.closePath()
    }
    ctx.fill()
    ctx.stroke()
  }

  public draw () {
    this.drawTool()
    if (!this.isFinished()) {
      this.drawVertex()
    }
    this._isValid = true
  }
}

export default BaseToolRenderer
