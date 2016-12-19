import * as EventEmitter from 'eventemitter3'
import { Datasource } from '../datasource'
import ChartLayout from './chartlayout'
import AxisXModel from './axisx'
import StudyModel from './study'
import AxisYModel, { YRange } from './axisy'
import CrosshairModel from './crosshair'
import GraphModel from './graph'
import { BaseToolRenderer } from '../graphic/tool'
import GridRenderer from '../graphic/grid'
import WaterMarkRenerer from '../graphic/watermark'

export default class ChartModel extends EventEmitter {
  public hover: boolean
  public width: number
  public height: number
  public ctx: CanvasRenderingContext2D
  public topCtx: CanvasRenderingContext2D

  private _chartLayout: ChartLayout
  private _graphs: GraphModel[]
  private _tools: BaseToolRenderer[]
  private _datasource: Datasource
  private _axisX: AxisXModel
  private _axisY: AxisYModel
  private _crosshair: CrosshairModel
  private _grid: GridRenderer
  private _watermark: WaterMarkRenerer
  private _isPrice: boolean
  private _isMain: boolean
  private _isValid = false
  private _isHit = false

  constructor (
    chartLayout: ChartLayout,
    datasource: Datasource,
    axisX: AxisXModel, axisY: AxisYModel,
    crosshair: CrosshairModel,
    isPrice: boolean,
    isMain: boolean = false) {
    super()
    this._chartLayout = chartLayout
    this._datasource = datasource
    this._axisX = axisX
    this._axisY = axisY
    this._crosshair = crosshair
    this._isPrice = isPrice
    this._isMain = isMain
    this._grid = new GridRenderer(this)
    this._graphs = []
    this._tools = []
    if (isMain) {
      this._watermark = new WaterMarkRenerer(this)
    }
  }

  get chartLayout (): ChartLayout {
    return this._chartLayout
  }

  get graphs (): GraphModel[] {
    return this._graphs.slice(0)
  }

  get visibleGraphs (): GraphModel[] {
    return this._graphs.filter(graph => graph.isVisible)
  }

  get studies (): StudyModel[] {
    return this.graphs.filter(graph => graph instanceof StudyModel) as StudyModel[]
  }

  get nonStudies (): GraphModel[] {
    return this.graphs.filter(graph => !(graph instanceof StudyModel)) as StudyModel[]
  }

  get mainGraph (): GraphModel {
    return this.graphs.filter(graph => graph.isMain)[0] || null
  }

  get tools (): BaseToolRenderer[] {
    return this._tools.slice(0)
  }

  get visibleTools (): BaseToolRenderer[] {
    return this._tools.filter(tool => tool.isNowVisible())
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

  get isValid (): boolean {
    return this._isValid &&
           this._graphs.every(graph => graph.isValid) &&
           this._tools.every(tool => tool.isValid) &&
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

  public removeDrawingTool (tool: BaseToolRenderer) {
    this._tools.splice(this._tools.indexOf(tool), 1)
    this._isValid = false
  }

  public calcRangeY () {
    this._axisY.range = this._graphs
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
    // 首先绘制背景色
    this.drawBg(ctx)
    // 如果是主chart就绘制趣炒股水印
    if (this._isMain) {
      this._watermark.draw(ctx)
    }
    // 绘制网格
    this._grid.draw(ctx)
    // 先绘制没有hover的图形
    visibleGraphs.filter(graph => !graph.hover).forEach(graph => graph.draw(ctx))
    // 后绘制hover的图形，这样hover的图形就不会被其他图形遮挡
    visibleGraphs.filter(graph => graph.hover).forEach(graph => graph.draw(ctx))
    // 绘制当前可见的画图工具
    this.visibleTools.forEach(tool => tool.draw())

    this._isValid = true
  }

  public clearTopCanvas () {
    const ctx = this.topCtx
    const width = this.width
    const height = this.height

    ctx.clearRect(0, 0, width, height)
  }

  public clearCache () {
    this.graphs.forEach(graph => graph.clearVisibleBarCache())
  }

  private drawBg (ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, this.width, this.height)
    ctx.restore()
  }
}
