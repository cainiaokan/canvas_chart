import { IBar } from '../datasource'
import { ShapeType } from '../constant'
import LineChartRenderer from '../graphic/linechart'
import MountainChartRenderer from '../graphic/mountainchart'
import ColumnChartRenderer from '../graphic/columnchart'
import BaseChartRenderer, { IChartStyle } from '../graphic/basechart'
import GraphModel from '../model/graph'

export default class PlotModel {
  private _graph: GraphModel
  private _index: number
  private _shape: ShapeType
  private _graphic: BaseChartRenderer
  private _isPrice: boolean

  constructor (
    graph: GraphModel,
    index: number,
    isPrice: boolean,
    shape: ShapeType,
    style: IChartStyle) {
    this._graph = graph
    this._index = index
    this._isPrice = isPrice
    this._shape = shape
    switch (shape) {
      case 'line':
        this._graphic = new LineChartRenderer(this, style)
        break
      case 'mountain':
        this._graphic = new MountainChartRenderer(this, style)
        break
      case 'column':
        this._graphic = new ColumnChartRenderer(this, style)
      default:
        // code...
        break
    }
  }

  get isPrice (): boolean {
    return this._isPrice
  }

  get graphic (): BaseChartRenderer {
    return this._graphic
  }

  get graph (): GraphModel {
    return this._graph
  }

  public draw (): void {
    this._graphic.draw()
  }

  public getVisibleBars (): Array<IBar> {
    const visibleBars = this._graph.getVisibleBars()
    const results = []
    for (let i = 0, len = visibleBars.length, index = this._index; i < len; i++) {
      results.push(visibleBars[i][index])
    }
    return results
  }

}
