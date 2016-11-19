import * as EventEmitter from 'eventemitter3'
import { Datasource } from '../datasource'
import ChartLayout from './chartlayout'
import AxisXModel from './axisx'
import AxisYModel, { YRange } from './axisy'
import CrosshairModel from './crosshair'
import GraphModel from './graph'
import BaseToolRenderer from '../graphic/basetool'
import GridRenderer from '../graphic/grid'
import WaterMarkRenerer from '../graphic/watermark'

type Size = {
  width: number,
  height: number
}

export default class ChartModel extends EventEmitter {
  public hover: boolean

  private _chartLayout: ChartLayout
  private _graphs: GraphModel[]
  private _tools: BaseToolRenderer[]
  private _datasource: Datasource
  private _axisX: AxisXModel
  private _axisY: AxisYModel
  private _crosshair: CrosshairModel
  private _size: Size
  private _ctx: CanvasRenderingContext2D
  private _topCtx: CanvasRenderingContext2D
  private _grid: GridRenderer
  private _watermark: WaterMarkRenerer
  private _isPrice: boolean
  private _isMain: boolean

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
    return this._graphs
  }

  get tools (): BaseToolRenderer[] {
    return this._tools
  }

  get size (): Size {
    return this._size
  }

  set size (size: Size) {
    this._size = size
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

  get ctx (): CanvasRenderingContext2D {
    return this._ctx
  }

  set ctx (ctx: CanvasRenderingContext2D) {
    this._ctx = ctx
  }

  get topCtx (): CanvasRenderingContext2D {
    return this._topCtx
  }

  set topCtx (ctx: CanvasRenderingContext2D) {
    this._topCtx = ctx
  }

  public getRangeY (): YRange {
    return this._graphs
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
    for (let i = this._graphs.length - 1; i >= 0; i--) {
      if (hit) {
        this._graphs[i].hover = false
      } else if (this._graphs[i].hitTest(select)) {
        hit = true
      }
    }
    this._chartLayout.emit('hit', hit)
    return hit
  }

  get isValid (): boolean {
    return this._graphs.every(graph => graph.isValid) &&
           this.axisY.isValid
  }

  public draw () {
    // 首先绘制背景色
    this.drawBg()
    // 如果是主chart就绘制趣炒股水印
    if (this._isMain) {
      this._watermark.draw()
    }
    // 绘制网格
    this._grid.draw()
    // 先绘制没有hover的图形
    this._graphs.filter(graph => !graph.hover).forEach(graph => graph.draw())
    // 后绘制hover的图形，这样hover的图形就不会被其他图形遮挡
    this._graphs.filter(graph => graph.hover).forEach(graph => graph.draw())
    // 绘制画图工具
    this._tools.forEach(tool => tool.draw())
    // 绘制游标
    // this._crosshair.draw()
  }

  private drawBg () {
    const ctx = this._ctx
    const canvas = ctx.canvas
    ctx.save()
    ctx.fillStyle = '#ffffff'
    canvas.width = canvas.width
    ctx.restore()
  }
}
