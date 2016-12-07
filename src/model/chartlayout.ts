import * as EventEmitter from 'eventemitter3'
import * as _ from 'underscore'
import ChartModel from './chart'
import AxisXModel from './axisx'
import StudyModel from './study'
import CrosshairModel from './crosshair'
import AxisYModel from './axisy'
import { BaseToolRenderer } from '../graphic/tool'
import {
  Datasource,
  StockDatasource,
  resolveSymbol,
  SymbolInfo,
  studyConfig,
  getServerTime,
} from '../datasource'
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

  /**
   * 用于标记chart正在加载中，避免重复加载
   * @type {boolean}
   */
  private _loading: boolean = false
  /**
   * 上一帧动画调度回调
   * @type {number}
   */
  private _lastAnimationFrame: number
  /**
   * 搏动更新定时器
   * @type {number}
   */
  private _pulseUpdateTimer: number

  constructor () {
    super()
    this._charts = []
    this.pulseUpdate = this.pulseUpdate.bind(this)
    this.fullUpdate = this.fullUpdate.bind(this)
    this.lightUpdate = this.lightUpdate.bind(this)
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
   * 全刷新
   */
  public fullUpdate () {
    const axisX = this.axisx

    if (this.needMoreData()) {
      this.loadHistory()
    }

    // 取消上一未调度的帧动画，避免卡顿
    if (this._lastAnimationFrame) {
      cancelAnimationFrame(this._lastAnimationFrame)
    }

    this._lastAnimationFrame = requestAnimationFrame(() => {
      axisX.draw()
      this.charts.forEach(chart => {
        chart.axisY.range = chart.getRangeY()
        chart.draw()
        chart.axisY.draw()
        chart.clearTopCanvas()
        chart.crosshair.draw()
      })
      this._lastAnimationFrame = null
    })
  }

  /**
   * 轻量级刷新
   */
  public lightUpdate () {
    if (!this._lastAnimationFrame) {
      this._lastAnimationFrame = requestAnimationFrame(() => {
        this.axisx.draw(this.axisx.isValid ? true : false)
        this.charts.forEach(chart => {
          if (!chart.axisY.range) {
            chart.axisY.range = chart.getRangeY()
          }
          if (!chart.isValid) {
            chart.draw()
          }
          chart.axisY.draw(chart.axisY.isValid ? true : false)

          // 清空画布
          chart.clearTopCanvas()
          // 绘制创建中的工具图形
          if (this.creatingDrawingTool &&
              this.creatingDrawingTool.chart === chart) {
            this.creatingDrawingTool.draw()
          }
          // 绘制编辑中的工具图形
          if (this.editingDrawingTool &&
              this.editingDrawingTool.chart === chart) {
            this.editingDrawingTool.draw()
          }
          chart.crosshair.draw()
        })
        this._lastAnimationFrame = null
      })
    }
  }

  /**
   * 获取服务器时间
   */
  public getServerTime (): Promise<any> {
    return getServerTime()
      .then(
        response => response.text()
          .then(timeStr => {
            const timeDiff = ~~(Date.now() / 1000) - (+timeStr)
            const datasources = []
            this.charts.forEach(chart => {
              chart.graphs.forEach(graph => {
                datasources.push(graph.datasource)
              })
            })
            datasources.forEach(dt => dt.timeDiff = timeDiff)
          })
      )
  }

  /**
   * 重置chart
   */
  public resetChart () {
    this._loading = false
    this.stopPulseUpdate()
    this.loadHistory()
      .then(this.pulseUpdate)
  }

  /**
   * 加载更多数据
   */
  public loadHistory (): Promise<any> {
    const mainDatasource = this.mainDatasource
    // 主数据源若没有更多的话，停止加载更多
    if (!mainDatasource.hasMoreHistory || this._loading) {
      return Promise.resolve()
    }

    this._loading = true
    const axisX = this.axisx
    const datasources = []
    const required = ~~((axisX.width * 2 + axisX.offset) / axisX.barWidth)

    this.charts.forEach(chart => {
      chart.graphs.forEach(graph => {
        datasources.push(graph.datasource)
      })
    })

    /*
     * 首先加载主数据源的数据，主数据源加载完成后，再加载其他数据源。因为其他数据源都要跟主数据源对齐
     * 例如：主数据源有停牌的情况发生
     */
    return new Promise((resolve, reject) => {
      mainDatasource
        .loadHistory(required)
        .then(() =>
          Promise.all(
            _.chain(datasources)
              .without(mainDatasource)
              .unique()
              .reduce((promises, datasource) => {
                promises.push(
                  datasource.loadTimeRange(
                    mainDatasource.first().time,
                    mainDatasource.last().time
                  )
                )
                return promises
              }, [])
              .value()
          )
          .then(() => {
            // 加载完成后立即重绘
            this.fullUpdate()
            this._loading = false
            resolve()
          })
          .catch(ex => {
            this._loading = false
          })
        )
        .catch(ex => {
          this._loading = false
        })
    })
  }

  /**
   * 搏动更新
   */
  public pulseUpdate () {
    const mainDatasource = this.mainDatasource
    // 使用最后一个bar的时间或者当前时间的前一分钟
    const from = mainDatasource.loaded() ? mainDatasource.last().time : mainDatasource.now() - 60
    // 未来一天，因为用户的PC可能进入休眠状态，待恢复时一次性要把休眠错过的数据全部请求过来。
    // 不过极端情况下一天未必会足够
    const to = from + 24 * 60 * 60
    const datasources = []
    const reqs = []

    this.charts.forEach(chart => {
      chart.graphs.forEach(graph => {
        datasources.push(graph.datasource)
      })
    })
    Promise.all(
      _.chain(datasources)
        .unique()
        .reduce((promises, datasource) => {
          promises.push(
            datasource.loadTimeRange(from , to)
          )
          return promises
        }, reqs)
        .value()
    )
    .then(() => {
      // 加载完成后立即重绘
      this.fullUpdate()
      const delay = mainDatasource.pulseInterval < 10 ? 10 : mainDatasource.pulseInterval
      if (mainDatasource.pulseInterval) {
        this._pulseUpdateTimer = setTimeout(this.pulseUpdate, delay * 1000)
      }
    })
    // 如果出错则30秒后再次刷新
    .catch(() => this._pulseUpdateTimer = setTimeout(this.pulseUpdate, 30000))
  }

  /**
   * 停止搏动更新
   */
  public stopPulseUpdate () {
    clearTimeout(this._pulseUpdateTimer)
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
    this.emit('cursormove', point)
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
        this._mainDatasource,
        this.mainChart,
        study
      )
      this.mainChart.graphs.push(studyModel)
    } else {
      const mainDatasource = this._mainDatasource
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

    this.emit('addstudy')
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
          this.emit('removestudy')
          return true
        } else {
          return false
        }
      })
  }

  public modifyStudy (study: StudyModel, newInput: any[]) {
    study.clearCache()
    study.input = newInput
    this.emit('modifystudy')
  }

  public drawingToolBegin (chart: ChartModel) {
    this.creatingDrawingTool = this.selectedDrawingTool
    this.selectedDrawingTool = null
    this.creatingDrawingTool.chart = chart
  }

  public drawingToolEnd (chart: ChartModel) {
    this.creatingDrawingTool = null
  }

  /**
   * 画图工具设置端点
   * @param {{x: number, y: number}} point 点坐标
   */
  public drawingToolSetVertex (point: {x: number, y: number}) {
    const chart = this.creatingDrawingTool.chart
    const curBar = chart.axisX.findTimeBarByX(point.x)
    const time = curBar.time
    const value = chart.axisY.getValueByY(point.y)

    this.creatingDrawingTool.addVertex({ time, value })
    this.emit('drawingtoolsetvertex')
  }

  /**
   * 删除画图工具
   * @param {BaseToolRenderer} tool 将要删除的画图工具对象
   */
  public removeDrawingTools (tool: BaseToolRenderer) {
    this.hoverChart.removeDrawingTool(tool)
    this.emit('removedrawingtool')
  }

  /**
   * 前往指定日期
   * @param {number} time 指定的日期时间
   */
  public goToDate (time: number) {
    const mainDatasource = this._mainDatasource
    const axisX = this._axisx
    const index = mainDatasource.search(time)
    if (index !== -1) {
      axisX.offset =  (mainDatasource.loaded() - 1.5 - index) * axisX.barWidth - axisX.width / 2
    } else {
      const datasources = []

      this.charts.forEach(chart => {
        chart.graphs.forEach(graph => {
          datasources.push(graph.datasource)
        })
      })

      Promise.all(
        _.chain(datasources)
          .unique()
          .reduce((promises, datasource) => {
            promises.push(
              datasource.loadTimeRange(time, mainDatasource.first().time)
            )
            return promises
          }, [])
          .value()
      )
      .then(() => this.goToDate(mainDatasource.first().time))
    }
  }

  /**
   * 清理chart的所有缓存
   */
  private clearCharts () {
    this._charts.forEach(chart => {
      chart.tools.length = 0
      chart.graphs.forEach(graph => {
        graph.clearCache()
        graph.datasource.clearCache()
      })
    })
  }

  /**
   * 是否需要加载更多数据来覆盖显示屏区域
   * @return {boolean} 是否需要更多数据
   */
  private needMoreData (): boolean {
    const axisX = this.axisx
    const totalWidth = this.mainDatasource.loaded() * axisX.barWidth
    const visibleWidth = axisX.width
    // 当预加载的数据只剩余不足一屏时，执行预加载加载更多的数据以备展示
    return totalWidth - visibleWidth - axisX.offset < visibleWidth
  }
}
