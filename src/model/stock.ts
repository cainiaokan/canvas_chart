import * as _ from 'underscore'
import { ShapeType } from '../constant'
import { Datasource, IStockBar, DataConverter, SymbolInfo } from '../datasource'
import { ChartStyle } from '../graphic/basechart'
import ChartModel from './chart'
import PlotModel from './plot'
import GraphModel from './graph'

export default class StockModel extends GraphModel {
  private _symbolInfo: SymbolInfo = null
  constructor (
    datasource: Datasource,
    chart: ChartModel,
    converter: DataConverter,
    shape: ShapeType,
    style?: ChartStyle[]) {

    super(datasource, chart, true, bar => {
      const b = bar as IStockBar
      return [0, b.time, b.open, b.close, b.high, b.low, b.volume, b.amount, b.changerate, b.turnover]
    }, converter)

    this._plots.push(
      new PlotModel(
        this,
        0,
        shape,
        _.extend({}, style && style[0] ? style[0] : {})
      )
    )
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
