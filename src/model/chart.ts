import * as EventEmitter from 'eventemitter3'
import { Datasource } from '../datasource'
import AxisXModel from './axisx'
import AxisYModel, { IYRange } from './axisy'
import CrosshairModel from './crosshair'
import GraphModel from './graph'
import GridRenderer from '../graphic/grid'
import WaterMarkRenerer from '../graphic/watermark'

interface ISize {
  width: number,
  height: number
}

export default class ChartModel extends EventEmitter {
  private _graphs: GraphModel[]

  private _datasource: Datasource
  private _axisX: AxisXModel
  private _axisY: AxisYModel
  private _crosshair: CrosshairModel
  private _size: ISize
  private _ctx: CanvasRenderingContext2D
  private _topCtx: CanvasRenderingContext2D
  private _grid: GridRenderer
  private _watermark: WaterMarkRenerer
  private _isPrice: boolean
  private _isMain: boolean

  constructor (
    datasource: Datasource,
    axisX: AxisXModel, axisY: AxisYModel,
    crosshair: CrosshairModel,
    isPrice: boolean,
    isMain: boolean = false) {
    super()
    this._datasource = datasource
    this._axisX = axisX
    this._axisY = axisY
    this._crosshair = crosshair
    // this._graphs = graphs
    this._isPrice = isPrice
    this._isMain = isMain
    this._grid = new GridRenderer(this)
    this._watermark = new WaterMarkRenerer(this)
  }

  get graphs (): GraphModel[] {
    return this._graphs
  }

  set graphs (graphs: GraphModel[]) {
    this._graphs = graphs
  }

  get size (): ISize {
    return this._size
  }

  set size (size: ISize) {
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

  public getRangeY (): IYRange {
    return this._graphs
      .reduce((range: IYRange, graph) => {
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

  public draw () {
    // 首先绘制背景色
    const ctx = this._ctx
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, this.size.width, this.size.height)
    if (this._isMain) {
      this._watermark.draw()
    }
    this._grid.draw()
    this._graphs.forEach(graph => graph.draw())
    this._crosshair.draw()
  }
}
