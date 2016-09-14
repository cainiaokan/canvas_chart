import * as EventEmitter from 'eventemitter3'
import * as _ from 'underscore'
import ChartModel from './chart'
import AxisXModel from './axisx'
import { Datasource, StockDatasource, SymbolInfo } from '../datasource'
import { Point } from '../model/crosshair'
import StockModel from '../model/stock'
import { ResolutionType } from '../constant'

export default class ChartLayoutModel extends EventEmitter {
  private _charts: ChartModel[]
  private _axisx: AxisXModel
  private _mainDatasource: Datasource

  constructor () {
    super()
    this._charts = []
  }

  public setResolution (resolution: ResolutionType) {
    const datasources: Datasource[] = []
    this._charts.forEach(chart => {
      chart.graphs.forEach(graph => {
        graph.clearCache()
        graph.datasource.clearCache()
        datasources.push(graph.datasource)
      })
    })
    // 批量设置数据源的解析度
    _.unique(datasources).forEach(datasource => datasource.resolution = resolution)
    this._axisx.resetOffset()
    this.emit('resolutionchange', resolution)
  }

  public setSymbol (symbolInfo: SymbolInfo) {
    const mainDatasource = this._mainDatasource
    const mainGraphModel = this.mainChart.graphs.filter(graph => graph instanceof StockModel)[0]
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
    this.emit('symbolchange', symbolInfo)
  }

  public setCursorPoint (point: Point) {
    this.charts.forEach(ch => ch.crosshair.point = point)
    this.emit('cursormove')
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

  get mainChart (): ChartModel {
    return this._charts.filter(chart => chart.isMain)[0] || null
  }

  set mainDatasource (datasource: Datasource) {
    this._mainDatasource = datasource
  }

  get mainDatasource (): Datasource {
    return this._mainDatasource
  }

  get hoverChart () {
    return this._charts.filter(chart => chart.hover)[0] || null
  }
}
