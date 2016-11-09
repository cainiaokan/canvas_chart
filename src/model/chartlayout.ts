import * as EventEmitter from 'eventemitter3'
import * as _ from 'underscore'
import ChartModel from './chart'
import AxisXModel from './axisx'
import StudyModel from './study'
import CrosshairModel from './crosshair'
import AxisYModel from './axisy'
import { Datasource, StockDatasource, resolveSymbol, SymbolInfo, studyConfig } from '../datasource'
import { Point } from '../model/crosshair'
import { ResolutionType, StudyType } from '../constant'

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

  public setSymbol (symbol: string) {
    resolveSymbol(symbol)
      .then(response =>
        response.json()
          .then(data => {
            const symbolInfo: SymbolInfo = {
              symbol,
              type: data.type,
              description: data.description,
              exchange: data.exchange,
            }
            const mainDatasource = this._mainDatasource
            this._charts.forEach(chart => {
              chart.graphs.forEach(graph => {
                graph.clearCache()
                graph.datasource.clearCache()
              })
            })
            if (mainDatasource instanceof StockDatasource) {
              mainDatasource.symbolInfo = symbolInfo
            } else {
              throw 'mainDatasource required to be an instance of StockDatasource.'
            }
            this._axisx.resetOffset()
            this.emit('symbolchange', symbolInfo)
          })
      )
  }

  public setCursorPoint (point: Point) {
    this.charts.forEach(ch => ch.crosshair.point = point)
    this.emit('cursormove')
  }

  public addStudy (study: StudyType) {
    const config = studyConfig[study]
    if (config.isPrice) {
      const studyModel = new StudyModel(
        this.mainDatasource,
        this.mainChart,
        study
      )
      this.mainChart.graphs.push(studyModel)
    } else {
      const mainDatasource = this.mainDatasource
      const crosshair = new CrosshairModel(this)
      const axisX = this.axisx
      const axisY = new AxisYModel(mainDatasource, crosshair)
      const chart = new ChartModel(
        this,
        mainDatasource,
        axisX, axisY,
        crosshair,
        config.isPrice
      )
      const studyModel = new StudyModel(
        this.mainDatasource,
        chart,
        study
      )

      axisY.chart = chart
      crosshair.chart = chart

      chart.graphs = [studyModel]
      this.charts.push(chart)
    }

    this.emit('studychange')
  }

  public removeStudy (study: StudyType) {
    this.charts
      .forEach((chart, i) => {
        if (chart.graphs.some((graph, j) => {
          if (graph instanceof StudyModel && graph.studyType === study) {
            chart.graphs.splice(j, 1)
            return true
          } else {
            return false
          }
        })) {
          if (!chart.graphs.length) {
            this.charts.splice(i, 1)
          }
          this.emit('studychange')
        }
      })
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
