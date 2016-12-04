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
    this._isValid = true
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
      this.moveVertex(this._hitVertexIndex, offsetTime, offsetValue)
  }

  protected moveAsWhole (offsetIndex: number, offsetValue: number) {
    this._vertexes.forEach((vertex, i) => {
      this.moveVertex(i, offsetIndex, offsetValue)
    })
  }

  /**
   * 移动画图工具的定点。。。这个方法略复杂呢。。。😭移动经过左右端点的时候都需要做特殊处理
   * 所谓端点，值得是datasource.first() 以及 datasource.last()所分别对应chart中的
   * 左端点和右端点
   * @param {[type]} index       订单的索引号
   * @param {number} offsetIndex 时间轴偏移量，单位为resolution
   * @param {number} offsetValue 价格轴偏移量
   */
  protected moveVertex (index, offsetIndex: number, offsetValue: number) {
    const datasource = this._chart.datasource
    const axisX = this._chart.axisX
    const resolution = datasource.resolution
    const firstBar = datasource.first()
    const lastBar = datasource.last()
    const total = datasource.loaded()
    const vertex = this._vertexes[index]

    if (offsetIndex === 0 && offsetValue === 0) {
      return
    }

    let offset = offsetIndex
    let time = vertex.time
    let barIndex = datasource.search(time)
    let guard

    if (barIndex === -1) {
      if (time < firstBar.time) {
        if (offset > 0) {
          guard = axisX.getPrevTickTime(firstBar.time, resolution)
          while (offset--) {
            // 判断是否到达左端点。特殊处理。因为断点上的值可能不恰好匹配getNextTickTime计算得到的刻度
            // 例如2000-1-7，当resolution为w时，右移1w的值是2000-1-14，但如果右移1w恰好抵达左端点，
            // 则日期值跟服务器获得的值有关，比如可能是2000-1-12，跟getNextTickTime计算所得不匹配。
            // 因此这里针对左端点做特殊处理
            if (guard === time) {
              time = firstBar.time
            } else {
              time = axisX.getNextTickTime(time, resolution)
              if (time > firstBar.time) {
                // 如果移动到的坐标在datasource的数据范围内，则使用datasource中的数据，因为datasource中的数据
                // 不一定匹配getNextTickTime计算所得
                if (offset < total) {
                  time = datasource.barAt(offset + 1).time
                  offset = 0
                } else {
                  time = lastBar.time
                  offset -= total
                }
              }
            }
          }
        } else {
          while (offset++) {
            time = axisX.getPrevTickTime(time, resolution)
          }
        }
      } else {
        if (offset > 0) {
          while (offset--) {
            time = axisX.getNextTickTime(time, resolution)
          }
        } else {
          guard = axisX.getNextTickTime(lastBar.time, resolution)
          while (offset++) {
            // 判断是否到达右端点。特殊处理。因为断点上的值可能不恰好匹配getPrevTickTime计算得到的刻度
            // 例如2000-1-7，当resolution为w时，左移1w的值是1999-12-31，但如果左移1w恰好抵达右端点，
            // 则日期值跟服务器获得的值有关，比如可能是1999-12-30，跟getPrevTickTime计算所得不匹配。
            // 因此这里针对右端点做特殊处理
            if (guard === time) {
              time = lastBar.time
            } else {
              time = axisX.getPrevTickTime(time, resolution)
              if (time < lastBar.time) {
                // 如果移动到的坐标在datasource的数据范围内，则使用datasource中的数据，因为datasource中的数据
                // 不一定匹配getPrevTickTime计算所得
                if (offset > -total) {
                  time = datasource.barAt(total - 2 + offset).time
                  offset = 0
                } else {
                  time = firstBar.time
                  offset += total
                }
              }
            }
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

    this.setVertex(index, time, vertex.value + offsetValue)
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
