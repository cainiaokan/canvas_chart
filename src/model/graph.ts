import { Datasource } from '../datasource'
import PlotModel from './plot'

export default class Graph {
  protected _plots: Array<PlotModel>
  protected _ctx: CanvasRenderingContext2D
  protected _datasource: Datasource

  constructor (datasource: Datasource) {
    this._datasource = datasource
    this._plots = []
  }

  public draw () {
    this._plots.forEach(plot => plot.draw())
  }

  public setCanvasContext (ctx: CanvasRenderingContext2D) {
    this._ctx = ctx
    this._plots.forEach(plot => plot.graphic.ctx = ctx)
  }

  get plots (): Array<PlotModel> {
    return this._plots
  }

  get ctx (): CanvasRenderingContext2D {
    return this._ctx
  }

  get datasource (): Datasource {
    return this._datasource
  }

}
