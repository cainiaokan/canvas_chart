import * as EventEmitter from 'eventemitter3'
import * as _ from 'underscore'
import ChartModel from './chart'
import AxisXModel from './axisx'
import StudyModel from './study'
import CrosshairModel from './crosshair'
import AxisYModel from './axisy'
import { BaseToolRenderer } from '../graphic/tool'
import { Datasource, StockDatasource, resolveSymbol, SymbolInfo, studyConfig } from '../datasource'
import { Point } from '../model/crosshair'
import { ResolutionType, StudyType } from '../constant'

export default class ChartLayoutModel extends EventEmitter {
  public selectedDrawingTool: BaseToolRenderer
  public creatingDrawingTool: BaseToolRenderer
  public editingDrawingTool: BaseToolRenderer
  public willEraseDrawingTool: boolean = false

  private _defaultCursor: 'crosshair' | 'default'
  private _charts: ChartModel[]
  private _axisx: AxisXModel
  private _mainDatasource: Datasource

  constructor () {
    super()
    this._charts = []
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

  get defaultCursor (): 'crosshair' | 'default' {
    return this._defaultCursor
  }

  /**
   * 设置解析度
   * @param {ResolutionType} resolution
   */
  public setResolution (resolution: ResolutionType) {
    this.clearCharts()
    // 批量设置数据源的解析度
    _.unique(
      this._charts.reduce((datasources, chart) =>
        datasources.concat(chart.graphs.map(graph => graph.datasource)
      ), [])
    ).forEach(datasource => datasource.resolution = resolution)
    this._axisx.resetOffset()
    this.emit('resolutionchange', resolution)
  }

  /**
   * 设置股票标示
   * @param {string} symbol [description]
   */
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
            this.clearCharts()
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

  /**
   * 设置除权、复权
   * @param {number} right 0: 除权 1: 前复权
   */
  public setRight (right: number) {
    const datasources: Datasource[] = []
    this.clearCharts()
    // 批量设置数据源的解析度
    _.unique(datasources).forEach(datasource => {
      if (datasource instanceof StockDatasource) {
        datasource.right = right
      }
    })
    this._axisx.resetOffset()
    this.emit('rightchange', right)
  }

  /**
   * 设置指针位置
   * @param {Point} point
   */
  public setCursorPoint (point: Point) {
    const oldPoint = this.mainChart.crosshair.point
    if (oldPoint && point && oldPoint.x === point.x && oldPoint.y === point.y) {
      return
    }
    this.charts.forEach(ch => ch.crosshair.point = point)
    this.emit('cursormove')
  }

  /**
   * 设置默认的指针样式
   * @param {'default' | 'crosshair'} cursor 指针样式
   */
  public setDefaultCursor (cursor: 'default' | 'crosshair') {
    this._defaultCursor = cursor
    this.emit('defaultcursorchange', cursor)
  }

  /**
   * 增加指标
   * @param {StudyType} study
   */
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

      chart.graphs.push(studyModel)
      this.charts.push(chart)
    }

    this.emit('studychange')
  }

  /**
   * 移除指标
   * @param {StudyType} study
   */
  public removeStudy (study: StudyType) {
    this.charts
      .some((chart, i) => {
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
          return true
        } else {
          return false
        }
      })
  }

  public drawingToolBegin (chart: ChartModel) {
    this.creatingDrawingTool = this.selectedDrawingTool
    this.selectedDrawingTool = null
    this.creatingDrawingTool.chart = chart
    this.emit('drawingtoolbegin')
  }

  public drawingToolSetVertex (point: {x: number, y: number}) {
    const chart = this.creatingDrawingTool.chart
    const curBar = chart.axisX.findTimeBarByX(point.x)

    const time = curBar.time
    const value = chart.axisY.getValueByY(point.y)

    this.creatingDrawingTool.addVertex({ time, value })
    this.emit('drawingtoolsetvertex')
  }

  public drawingToolEnd (chart: ChartModel) {
    this.creatingDrawingTool = null
    this.emit('drawingtoolend')
  }

  public removeDrawingTools (tool: BaseToolRenderer) {
    this.hoverChart.removeDrawingTool(tool)
    this.emit('removedrawingtool')
  }

  private clearCharts () {
    this._charts.forEach(chart => {
      chart.tools.length = 0
      chart.graphs.forEach(graph => {
        graph.clearCache()
        graph.datasource.clearCache()
      })
    })
  }
}
