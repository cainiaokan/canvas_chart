import * as EventEmitter from 'eventemitter3'
import { Datasource } from '../datasource'
import ChartLayout from './chartlayout'
import AxisXModel from './axisx'
import StudyModel from './study'
import AxisYModel, { YRange } from './axisy'
import CrosshairModel from './crosshair'
import GraphModel from './graph'
import StockModel from './stock'
import { BaseToolRenderer } from '../graphic/tool'
import Pattern from './pattern'
import GridRenderer from '../graphic/grid'
import { clientOffset } from '../util'

let sequence = 1

export default class ChartModel extends EventEmitter {
  public width: number
  public height: number
  public ctx: CanvasRenderingContext2D
  public topCtx: CanvasRenderingContext2D
  // 创建中的画图工具
  public creatingDrawingTool: BaseToolRenderer
  // 编辑中的画图工具
  public editingDrawingTool: BaseToolRenderer

  private _chartLayout: ChartLayout
  private _graphs: GraphModel[]
  private _tools: BaseToolRenderer[]
  private _patterns: Pattern[]
  private _datasource: Datasource
  private _axisX: AxisXModel
  private _axisY: AxisYModel
  private _crosshair: CrosshairModel
  private _grid: GridRenderer
  private _isPrice: boolean
  private _isMain: boolean
  private _isValid = false
  private _hover: boolean = false
  private _isHit = false
  private _id = 0
  // chart canvas 距离页面左上角的偏移量（方便计算curosr位置使用）
  private _offset: {top: number, left: number}

  constructor (
    chartLayout: ChartLayout,
    datasource: Datasource,
    axisX: AxisXModel, axisY: AxisYModel,
    crosshair: CrosshairModel,
    isPrice: boolean,
    isMain: boolean = false) {
    super()
    this._id = sequence++
    this._chartLayout = chartLayout
    this._datasource = datasource
    this._axisX = axisX
    this._axisY = axisY
    this._crosshair = crosshair
    this._isPrice = isPrice
    this._isMain = isMain
    this._grid = new GridRenderer(this)
    this._graphs = []
    this._patterns = []
    this._tools = []
  }

  get id (): number {
    return this._id
  }

  get chartLayout (): ChartLayout {
    return this._chartLayout
  }

  get graphs (): GraphModel[] {
    return this._graphs.slice(0)
  }

  get visibleGraphs (): GraphModel[] {
    return this._graphs.filter(graph => graph.isVisible).sort((a, b) => b.priority - a.priority)
  }

  get studies (): StudyModel[] {
    return this.graphs.filter(graph => graph instanceof StudyModel).sort((a, b) => b.priority - a.priority) as StudyModel[]
  }

  get compares (): GraphModel[] {
    return this.graphs.filter(graph => graph.isComparison)
  }

  get mainGraph (): StockModel {
    return this.graphs.filter(graph => graph.isMain)[0] as StockModel
  }

  get tools (): BaseToolRenderer[] {
    return this._tools.slice(0)
  }

  get visibleTools (): BaseToolRenderer[] {
    return this._tools.filter(tool => tool.isNowVisible() && !tool.isEditing)
  }

  get patterns (): Pattern[] {
    return this._patterns.slice(0)
  }

  get visiblePatterns (): Pattern[] {
    return this._patterns.filter(pattern => pattern.isVisible && pattern.isNowVisible())
  }

  get datasource (): Datasource {
    return this._datasource
  }

  get crosshair (): CrosshairModel {
    return this._crosshair
  }

  get axisX (): AxisXModel {
    return this._axisX
  }

  get axisY (): AxisYModel {
    return this._axisY
  }

  get grid (): GridRenderer {
    return this._grid
  }

  get isPrice (): boolean {
    return this._isPrice
  }

  get isMain (): boolean {
    return this._isMain
  }

  get isHit (): boolean {
    return this._isHit
  }

  get hover (): boolean {
    return this._hover
  }

  set hover (hover: boolean) {
    this._hover = hover
    if (this.ctx) {
      this._offset = clientOffset(this.ctx.canvas)
    }
  }

  get offset (): {left: number, top: number} {
    return this._offset
  }

  get isValid (): boolean {
    return this._isValid &&
           this.graphs.every(graph => graph.isValid) &&
           this.tools.every(tool => tool.isValid) &&
           this.patterns.every(pattern => pattern.isValid) &&
           this.axisY.isValid
  }

  public addGraph (graph: GraphModel) {
    this._graphs.push(graph)
    this._isValid = false
  }

  public removeGraph (graph: GraphModel) {
    this._graphs.splice(this._graphs.indexOf(graph), 1)
    this._isValid = false
  }

  public addDrawingTool (tool: BaseToolRenderer) {
    this._tools.push(tool)
    this._isValid = false
  }

  public setPatternVisibility (isWave: boolean, visible: boolean) {
    this._patterns
      .filter(pattern => isWave ? pattern.type === 'wave' : pattern.type !== 'wave')
      .forEach(pattern => pattern.isVisible = visible)
    this._isValid = false
  }

  /**
   * 删除画图工具
   * @param {BaseToolRenderer} tool 将要删除的画图工具对象
   */
  public removeDrawingTool (tool: BaseToolRenderer) {
    this.editingDrawingTool = null
    this._tools.splice(this._tools.indexOf(tool), 1)
    this._isValid = false
    this._chartLayout.emit('drawingtool_remove')
  }

  public removeAllTools () {
    this._tools.length = 0
  }

  public drawingToolBegin () {
    const chartLayout = this._chartLayout
    this.creatingDrawingTool = chartLayout.selectedDrawingTool
    this.creatingDrawingTool.chart = this
    chartLayout.selectedDrawingTool = null
    this._chartLayout.emit('drawingtool_begin')
  }

  public drawingToolEnd () {
    this.addDrawingTool(this.creatingDrawingTool)
    this.creatingDrawingTool = null
    this._chartLayout.isEditMode = false
    this._chartLayout.emit('drawingtool_end')
  }

  /**
   * 画图工具设置端点
   * @param {{x: number, y: number}} point 点坐标
   */
  public drawingToolSetVertex (point: {x: number, y: number}) {
    const curBar = this.axisX.findTimeBarByX(point.x)
    const time = curBar.time
    const value = this.axisY.getValueByY(point.y)

    this.creatingDrawingTool.addVertex({ time, value })
    this._chartLayout.emit('drawingtool_setvertex')
  }

  public addPattern (pattern: Pattern) {
    this._patterns.push(pattern)
    this._isValid = false
  }

  public removeAllPatterns () {
    this._patterns.length = 0
    this._isValid = false
  }

  public calcRangeY () {
    const rangeY = this._graphs
      .reduce((range: YRange, graph: GraphModel) => {
        // 如果chart是价格相关的，但是某个子图是价格无关的，则忽略它
        if (this.isPrice && !graph.isPrice) {
          return range
        }
        const r = graph.getRangeY()
        if (!r) {
          return range
        }
        if (!range) {
          return {
            max: r.max,
            min: r.min,
          }
        }
        if (r.max > range.max) {
          range.max = r.max
        }
        if (r.min < range.min) {
          range.min = r.min
        }
        return range
      }, null)

    // 修整rangeY，如果max等于min在将rangeY上下各增加0.01个单位
    if (rangeY && rangeY.max === rangeY.min) {
      rangeY.max += 0.01
      rangeY.min -= 0.01
    }

    this._axisY.range = rangeY
  }

  public hitTest (select = false): boolean  {
    let hit = false

    this.visibleTools.reverse().forEach(tool => {
      if (hit) {
        tool.hover = false
      } else if (tool.hitTest(select)) {
        hit = true
      }
    })

    this.visibleGraphs.reverse().forEach(graph => {
      if (hit) {
        graph.hover = false
      } else if (graph.hitTest(select)) {
        hit = true
      }
    })

    if (hit !== this._isHit) {
      this._isHit = hit
      this._chartLayout.emit('graph_hover', hit)
    }

    if (select) {
      this._chartLayout.emit('graph_select', hit)
    }

    return hit
  }

  public draw () {
    const visibleGraphs = this.visibleGraphs
    const ctx = this.ctx

    if (!this.datasource.loaded()) {
      return
    }

    // 首先绘制背景色
    this.drawBg(ctx)
    // 绘制网格
    this._grid.draw(ctx)
    // 先绘制没有hover的图形
    visibleGraphs.filter(graph => !graph.hover).forEach(graph => graph.draw(ctx))
    // 后绘制hover的图形，这样hover的图形就不会被其他图形遮挡
    visibleGraphs.filter(graph => graph.hover).forEach(graph => graph.draw(ctx))
    // 绘制当前可见的画图工具
    this.visibleTools.forEach(tool => tool.draw())
    // 绘制当前可见的形态图形
    this.visiblePatterns.forEach(pattern => pattern.draw(ctx))

    this._isValid = true
  }

  public clearTopCanvas () {
    const ctx = this.topCtx
    const width = this.width
    const height = this.height

    ctx.clearRect(0, 0, width, height)
  }

  public clearCache () {
    this.graphs.forEach(graph => graph.clearCache())
  }

  public clearVisibleBarCache () {
    this.graphs.forEach(graph => graph.clearVisibleBarCache())
  }

  private drawBg (ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.width, this.height)
  }
}
