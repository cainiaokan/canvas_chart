import * as EventEmitter from 'eventemitter3'
import { Datasource } from '../datasource'
import AxisXModel from './axisx'
import AxisYModel, { IYRange } from './axisy'
import CrosshairModel from './crosshair'
import GraphModel from './graph'

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

  constructor (
    datasource: Datasource,
    axisX: AxisXModel, axisY: AxisYModel,
    crosshair: CrosshairModel,
    graphs: Array<GraphModel>) {
    super()
    this._datasource = datasource
    this._axisX = axisX
    this._axisY = axisY
    this._crosshair = crosshair
    this._graphs = graphs
  }

  get graphs (): Array<GraphModel> {
    return this._graphs
  }

  get size (): ISize {
    return this._size
  }

  set size (size: ISize) {
    this._size = size
    this.emit('sizechange', size)
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

  public getRangeY (): IYRange {
    return this._graphs
      .reduce((prev, cur) => prev.concat(cur.plots), [])
      .reduce((range, plot) => {
        if (!plot.isPrice) {
          return range
        }
        const r = plot.graphic.getRangeY()
        if (!r) {
          return range
        }
        if (r.max > range.max) {
          range.max = r.max
        }
        if (r.min < range.min) {
          range.min = r.min
        }
        return range
      }, {
        max: -Number.MAX_VALUE,
        min: Number.MAX_VALUE,
      })
  }

  public draw (): void {
    const ctx = this._graphs[0].ctx
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, this.size.width, this.size.height)
    this._graphs.forEach(graph => graph.draw())
    this._crosshair.graphic.draw()
  }
}
