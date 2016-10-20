import * as _ from 'underscore'
import { ShapeType } from '../constant'
import { Datasource, SymbolInfo, IStockBar } from '../datasource'
import { ChartStyle } from '../graphic/basechart'
import ChartModel from './chart'
import PlotModel from './plot'
import GraphModel from './graph'

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
  private _symbolInfo: SymbolInfo = null
  constructor (
    datasource: Datasource,
    chart: ChartModel,
    shape: ShapeType,
    style?: ChartStyle) {
    super(datasource, chart, true,
      adaptorFuncs[shape],
      bar => [bar])

    this._plots.push(
      new PlotModel(
        this,
        0,
        shape,
        _.extend({}, style ? style : {})
      )
    )
  }

  public setShape (shape: ShapeType) {
    this._adapter = adaptorFuncs[shape]
  }

  public resolveSymbol (): Promise<SymbolInfo> {
    return this._datasource
      .resolveSymbol()
      .then(symbolInfo => this._symbolInfo = symbolInfo)
  }

  get symbolInfo (): SymbolInfo {
    return this._symbolInfo
  }

  set symbolInfo (symbolInfo: SymbolInfo) {
    this._symbolInfo = symbolInfo
  }
}
