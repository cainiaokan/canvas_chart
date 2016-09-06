import * as EventEmitter from 'eventemitter3'
import { Datasource } from '../datasource'
import AxisXModel from './axisx'
import AxisYModel, { IYRange } from './axisy'
import CrosshairModel from './crosshair'
import GraphModel from './graph'
import GridRenderer from '../graphic/grid'

interface ISize {
  width: number,
  height: number
}

export default class ChartModel extends EventEmitter {
  private _graphs: Array<GraphModel>

  private _datasource: Datasource
  private _axisX: AxisXModel
  private _axisY: AxisYModel
  private _crosshair: CrosshairModel
  private _size: ISize
  private _grid: GridRenderer
  private _isPrice: boolean

  constructor (
    datasource: Datasource,
    axisX: AxisXModel, axisY: AxisYModel,
    crosshair: CrosshairModel,
    graphs: Array<GraphModel>,
    isPrice: boolean) {
    super()
    this._datasource = datasource
    this._axisX = axisX
    this._axisY = axisY
    this._crosshair = crosshair
    this._graphs = graphs
    this._isPrice = isPrice
    this._grid = new GridRenderer(this)
  }

  get graphs (): Array<GraphModel> {
    return this._graphs
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

  public draw (): void {
    const ctx = this._graphs[0].ctx
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, this.size.width, this.size.height)
    this._grid.draw()
    this._graphs.forEach(graph => graph.draw())
    this._crosshair.draw()
  }
}
