import * as _ from 'underscore'
import { ShapeType } from '../constant'
import { Datasource, IStockBar } from '../datasource'
import { ChartStyle } from '../graphic/diagram'
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
  constructor (
    datasource: Datasource,
    chart: ChartModel,
    isPrice: boolean,
    isMain: boolean,
    isComparison: boolean,
    shape: ShapeType,
    style?: ChartStyle) {
    super(datasource, chart, isPrice, isMain, isComparison, adaptorFuncs[shape], bar => [bar])
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
}
