import { ShapeType } from '../constant'
import {
  BaseChartRenderer,
  ChartStyle,
  LineChartRenderer,
  MountainChartRenderer,
  ColumnChartRenderer,
  CandleChartRenderer,
  HistogramChartRenderer,
  BandRenderer,
  ArrowRenderer,
} from '../graphic/diagram'
import GraphModel from '../model/graph'

export type PriceLabel = {
  val: number
  color: string
}

export default class PlotModel {
  public priceLabels: PriceLabel[] = []

  private _graph: GraphModel
  private _index: number
  private _shape: ShapeType
  private _originalShape: ShapeType
  private _graphic: BaseChartRenderer
  private _style: ChartStyle

  constructor (
    graph: GraphModel,
    index: number,
    shape: ShapeType,
    style: ChartStyle) {
    this._graph = graph
    this._index = index
    this._style = style
    this._originalShape = shape
    this.shape = shape
  }

  get style (): ChartStyle {
    return this._style
  }

  set style (style: ChartStyle) {
    this._style = style
    this._graphic.style = style
  }

  set shape (shape: ShapeType) {
    const style = shape === this._originalShape ? this._style : {}
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
        break
      case 'band':
        this._graphic = new BandRenderer(this, style)
        break
      case 'arrow':
        this._graphic = new ArrowRenderer(this)
        break
      default:
        throw 'unsupported chart shape'
    }
  }

  get shape (): ShapeType {
    return this._shape
  }

  get graphic (): BaseChartRenderer {
    return this._graphic
  }

  get graph (): GraphModel {
    return this._graph
  }

  public draw (ctx: CanvasRenderingContext2D) {
    ctx.save()
    this._graphic.draw(ctx)
    ctx.restore()
    if (this._graph.selected) {
      this._graphic.drawSelection()
    }
  }

  public hitTest (): boolean {
    return this._graphic.hitTest()
  }

  public getVisibleBars (): any[] {
    const visibleBars = this._graph.isVisible ? this._graph.getVisibleBars() : []
    const results = []
    for (let i = 0, len = visibleBars.length, index = this._index, bar; i < len; i++) {
      bar = visibleBars[i][index]
      if (bar) {
        results.push(bar)
      }
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
