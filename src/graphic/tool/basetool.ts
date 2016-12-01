import ChartModel from '../../model/chart'
import { HIT_TEST_TOLERANCE } from '../../constant'

type Vertex = { time: number, value: number }

export abstract class BaseToolRenderer {
  protected _chart: ChartModel
  protected _isValid: boolean
  protected _isEditing: boolean
  protected _lastCursorPoint: { x: number, y: number }
  protected _vertexes: Vertex[]
  protected _hitVertexIndex: number = -1
  protected _hover: boolean
  protected _selected: boolean

  constructor () {
    this._vertexes = []
    this._isValid = false
    this._isEditing = false
    this._hover = false
    this._selected = false
  }

  get hover (): boolean {
    return this._hover
  }

  set hover (hover: boolean) {
    if (hover !== this._hover) {
      this._hover = hover
      this._isValid = false
    }
  }

  get selected (): boolean {
    return this._selected
  }

  set selected (selected: boolean) {
    if (selected !== this._selected) {
      this._selected = selected
      this._isValid = false
    }
  }

  get isValid (): boolean {
    return this._isValid
  }

  get isEditing (): boolean {
    return this._isEditing
  }

  set isEditing (isEditing: boolean) {
    if (isEditing !== this._isEditing) {
      this._isEditing = isEditing
      this._isValid = false
    }
  }

  get vertexes (): Vertex[] {
    return this._vertexes
  }

  get hitVertexIndex (): number {
    return this._hitVertexIndex
  }

  get chart () {
    return this._chart
  }

  set chart (chart: ChartModel) {
    this._chart = chart
  }

  public abstract isFinished (): boolean

  public isNowVisible () {
    const visibleRange = this._chart.axisX.getVisibleTimeBars()
    const firstBar = visibleRange[0]
    const lastBar = visibleRange[visibleRange.length - 1]
    return this._vertexes.some(vertex =>
      vertex.time >= firstBar.time &&
      vertex.time <= lastBar.time
    )
  }

  public getContext () {
    return !this._isEditing && this.isFinished() ? this._chart.ctx : this._chart.topCtx
  }

  /**
   * 获取当前的指针位置
   */
  public getCursor () {
    return this._lastCursorPoint = this._chart.hover ?
           this._chart.crosshair.point || this._lastCursorPoint :
           this._lastCursorPoint
  }

  public addVertex (vertex: Vertex) {
    this._vertexes.push(vertex)
  }

  public drawVertex () {
    const ctx = this.getContext()
    const chart = this._chart
    const axisX = chart.axisX
    const axisY = chart.axisY
    ctx.strokeStyle = 'rgba( 128, 128, 128, 1)'
    ctx.lineWidth = this._selected ? 4 : 2
    ctx.fillStyle = '#fff'
    for (let i = 0, len = this._vertexes.length; i < len; i++) {
      ctx.beginPath()
      ctx.arc(axisX.getXByTime(this._vertexes[i].time),
              axisY.getYByValue(this._vertexes[i].value),
              5, 0, 2 * Math.PI)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    }
  }

  public setVertex (index: number, time: number, value: number) {
    const vertex = this._vertexes[index]
    vertex.time = time
    vertex.value = value
  }

  public range (): {left: number, right: number} {
    let range = {
      left: Number.MAX_VALUE,
      right: -Number.MAX_VALUE,
    }
    this._vertexes.forEach(vertex => {
      if (vertex.time < range.left) {
        range.left = vertex.time
      }
      if (vertex.time > range.right) {
        range.right = vertex.time
      }
    })
    return range
  }

  public hitTest (select: boolean): boolean {
    let isHit = false
    let hitVertexIndex = -1
    const chart = this._chart
    const point = chart.crosshair.point
    this._hitVertexIndex = -1
    isHit = this._vertexes.some((vertex, idx) => {
      if (this.hitTestVertex(vertex, point)) {
        hitVertexIndex = idx
        return true
      } else {
        return false
      }
    })
    if (!isHit) {
      isHit = this.hitTestTool()
    } else {
      this._hitVertexIndex = hitVertexIndex
    }
    if (select) {
      if (isHit) {
        chart.chartLayout.editingDrawingTool = this
      }
      return this.selected = isHit
    } else {
      return this.hover = isHit
    }
  }

  public draw () {
    const ctx = this.getContext()
    ctx.save()
    this.drawTool(ctx)
    ctx.restore()
    if (this._selected || this._hover || !this.isFinished()) {
      ctx.save()
      this.drawVertex()
      ctx.restore()
    }
    this._isValid = true
  }

  public moveBy (offsetTime: number, offsetValue: number) {
    this.hitVertexIndex === -1 ?
      this.moveAsWhole(offsetTime, offsetValue) :
      this.moveVertex(offsetTime, offsetValue)
  }

  protected moveAsWhole (offsetIndex: number, offsetValue: number) {
    const datasource = this._chart.datasource
    const axisX = this._chart.axisX
    const resolution = datasource.resolution
    const firstBar = datasource.first()
    const lastBar = datasource.last()

    if (offsetIndex === 0 && offsetValue === 0) {
      return
    }

    this._vertexes.forEach((vertex, i) => {
      let offset = offsetIndex
      let time = vertex.time
      let barIndex = datasource.search(time)

      if (barIndex === -1) {
        if (offset < 0) {
          while (offset++) {
            if (time > lastBar.time) {
              time = axisX.getPrevTickTime(time, resolution)
              if (time < lastBar.time) {
                time = lastBar.time
              }
            } else {
              time = axisX.getPrevTickTime(time, resolution)
            }
          }
        } else {
          while (offset--) {
            if (time < firstBar.time) {
              time = axisX.getNextTickTime(time, resolution)
              if (time > firstBar.time) {
                time = firstBar.time
              }
            } else {
              time = axisX.getNextTickTime(time, resolution)
            }

          }
        }
      } else {
        if (barIndex + offset < 0) {
          time = datasource.first().time
          offset += barIndex
          while (offset++) {
            time = axisX.getPrevTickTime(time, resolution)
          }
        } else if (barIndex + offset > datasource.loaded() - 1) {
          time = datasource.last().time
          offset -= datasource.loaded() - 1 - barIndex
          while (offset--) {
            time = axisX.getNextTickTime(time, resolution)
          }
        } else {
          time = datasource.barAt(barIndex + offset).time
        }
      }
      this.setVertex(i, time, vertex.value + offsetValue)
    })
  }

  protected moveVertex (offsetIndex: number, offsetValue: number) {
    const datasource = this._chart.datasource
    const axisX = this._chart.axisX
    const resolution = datasource.resolution
    const vertex = this._vertexes[this._hitVertexIndex]

    if (offsetIndex === 0 && offsetValue === 0) {
      return
    }

    let offset = offsetIndex
    let time = vertex.time
    let barIndex = datasource.search(time)

    if (barIndex === -1) {
      if (offset < 0) {
        while (offset++) {
          time = axisX.getPrevTickTime(time, resolution)
        }
      } else {
        while (offset--) {
          time = axisX.getNextTickTime(time, resolution)
        }
      }
    } else {
      if (barIndex + offset < 0) {
        time = datasource.first().time
        offset += barIndex
        while (offset++) {
          time = axisX.getPrevTickTime(time, resolution)
        }
      } else if (barIndex + offset > datasource.loaded() - 1) {
        time = datasource.last().time
        offset -= datasource.loaded() - 1 - barIndex
        while (offset--) {
          time = axisX.getNextTickTime(time, resolution)
        }
      } else {
        time = datasource.barAt(barIndex + offset).time
      }
    }

    this.setVertex(this._hitVertexIndex, time, vertex.value + offsetValue)
  }

  protected abstract drawTool (ctx: CanvasRenderingContext2D): void

  protected abstract hitTestTool (): boolean

  private hitTestVertex (vertex: Vertex, point: {x: number, y: number}): boolean {
    const chart = this._chart
    const axisX = chart.axisX
    const axisY = chart.axisY
    const x = axisX.getXByTime(vertex.time)
    const y = axisY.getYByValue(vertex.value, axisY.range)
    if (
        Math.sqrt(
          Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2)
        ) < HIT_TEST_TOLERANCE) {
      return true
    } else {
      return false
    }
  }
}
