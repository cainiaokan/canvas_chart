import { IBar } from '../datasource'
import { ShapeType } from '../constant'
import LineChartRenderer from '../graphic/linechart'
import MountainChartRenderer from '../graphic/mountainchart'
import ColumnChartRenderer from '../graphic/columnchart'
import CandleChartRenderer from '../graphic/candle'
import HistogramChartRenderer from '../graphic/histogram'
import BaseChartRenderer, { ChartStyle } from '../graphic/basechart'
import GraphModel from '../model/graph'

export default class PlotModel {
  private _graph: GraphModel
  private _index: number
  private _shape: ShapeType
  private _graphic: BaseChartRenderer

  constructor (
    graph: GraphModel,
    index: number,
    shape: ShapeType,
    style: ChartStyle) {
    this._graph = graph
    this._index = index
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
        break
      case 'candle':
        this._graphic = new CandleChartRenderer(this, style)
        break
      case 'histogram':
        this._graphic = new HistogramChartRenderer(this, style)
      default:
        // code...
        break
    }
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

  public hitTest (): boolean {
    return this._graphic.hitTest()
  }

  public getVisibleBars (): IBar[] {
    const visibleBars = this._graph.getVisibleBars()
    const results = []
    for (let i = 0, len = visibleBars.length, index = this._index; i < len; i++) {
      results.push(visibleBars[i][index])
    }
    return results
  }

  public getPrevBar (): any[] {
    const bar = this._graph.getPrevBar()
    if (!bar) {
      return null
    }
    return bar[this._index]
  }

  public getCurBar (): any[] {
    const bar = this._graph.getCurBar()
    if (!bar) {
      return null
    }
    return bar[this._index]
  }

  public getNextBar (): any[] {
    const bar = this._graph.getNextBar()
    if (!bar) {
      return null
    }
    return bar[this._index]
  }

}
