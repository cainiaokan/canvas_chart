import ChartModel from './chart'
import AxisXModel from './axisx'
import { Datasource, StockDatasource, SymbolInfo } from '../datasource'
import StockModel from '../model/stock'
import { ResolutionType } from '../constant'

export default class ChartLayoutModel {
  private _charts: ChartModel[]
  private _axisx: AxisXModel
  private _mainDatasource: Datasource

  constructor () {
    this._charts = []
  }

  public setResolution (resolution: ResolutionType) {
    this._charts.forEach(chart => {
      chart.graphs.forEach(graph => {
        graph.clearCache()
        graph.datasource.clearCache()
        graph.datasource.resolution = resolution
      })
    })
    this._axisx.resetOffset()
  }

  public setSymbol (symbolInfo: SymbolInfo) {
    const mainDatasource = this._mainDatasource
    const mainGraphModel = this._charts[0].graphs[0]
    this._charts.forEach(chart => {
      chart.graphs.forEach(graph => {
        graph.datasource.clearCache()
        graph.clearCache()
      })
    })
    if (mainGraphModel instanceof StockModel) {
      mainGraphModel.symbolInfo = symbolInfo
    }
    if (mainDatasource instanceof StockDatasource) {
      mainDatasource.symbol = symbolInfo.symbol
    } else {
      throw 'mainDatasource required to be an instance of StockDatasource.'
    }
    this._axisx.resetOffset()
  }

  set charts (charts: ChartModel[]) {
    this._charts = charts
  }

  get charts (): ChartModel[] {
    return this._charts
  }

  set axisx (axisx: AxisXModel) {
    this._axisx = axisx
  }

  get axisx (): AxisXModel {
    return this._axisx
  }

  set mainDatasource (datasource: Datasource) {
    this._mainDatasource = datasource
  }

  get mainDatasource (): Datasource {
    return this._mainDatasource
  }
}
