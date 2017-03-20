import * as _ from 'underscore'
import { ShapeType } from '../constant'
import { Datasource, IStockBar } from '../datasource'
import { ChartStyle } from '../graphic/diagram'
import ChartModel from './chart'
import PlotModel from './plot'
import GraphModel from './graph'
import GapRenderer from '../graphic/gap'

const adaptorFuncs = {
  line(bar) {
    const b = bar as IStockBar
    return [0, b.time, b.close]
  },
  candle(bar) {
    const b = bar as IStockBar
    return [0, b.time, b.open, b.close, b.high, b.low]
  },
  mountain(bar) {
    const b = bar as IStockBar
    return [0, b.time, b.close]
  },
  column(bar) {
    const b = bar as IStockBar
    return [0, b.time, b.close, b.open > b.close]
  },
}

export default class StockModel extends GraphModel {
  private _gapRenderer: GapRenderer
  private _showGap: boolean
  constructor (
    datasource: Datasource,
    chart: ChartModel,
    isPrice: boolean,
    isMain: boolean,
    isComparison: boolean,
    shape: ShapeType,
    styles?: ChartStyle) {
    super(datasource, chart, isMain ? 99999 : 1, isPrice, isComparison ? true : false, isMain, isComparison, true, !!styles ? [styles] : null, adaptorFuncs[shape], bar => [bar])
    this._plots.push(
      new PlotModel(
        this,
        0,
        shape,
        _.extend({}, styles ? styles : {})
      )
    )
    if (isMain) {
      this._showGap = !!chart.chartLayout.readFromLS('chart.showGap')
      this._gapRenderer = new GapRenderer(this)
    }
  }

  get showGap (): boolean {
    return this._showGap
  }

  set showGap (show: boolean) {
    if (this._showGap !== show) {
      this._showGap = show
      this._isValid = false
    }
  }

  public setShape (shape: ShapeType) {
    this._adapter = adaptorFuncs[shape]
  }

  public draw () {
    const ctx = this._chart.ctx
    super.draw(ctx)
    if (this._isMain && this._showGap && this._datasource.resolution > '1') {
      this._gapRenderer.draw(ctx)
    }
  }

  public clearCache () {
    super.clearCache()
    if (this._isMain) {
      this._gapRenderer.clearCache()
    }
  }
}
