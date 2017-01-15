import * as EventEmitter from 'eventemitter3'
import * as _ from 'underscore'
import * as moment from 'moment'
import randomColor = require('randomcolor')
import ChartModel from './chart'
import StockModel from './stock'
import AxisXModel, { INITIAL_OFFSET } from './axisx'
import StudyModel from './study'
import CrosshairModel from './crosshair'
import AxisYModel from './axisy'
import { ChartStyle } from '../graphic/diagram'
import { BaseToolRenderer } from '../graphic/tool'
import {
  Datasource,
  StockDatasource,
  studyConfig,
  getServerTime,
} from '../datasource'
import { Point } from '../model/crosshair'
import {
  ResolutionType,
  StudyType,
  OPEN_HOUR,
  OPEN_MINUTE,
  CLOSE_HOUR,
  CLOSE_MINUTE,
  OPEN_DAYS,
} from '../constant'

export const preferredTimeRange = ['1天', '5天', '1月', '1年', '全部']
const perferredResolution = ['1', '5', '30', 'D', 'M'] as ResolutionType[]

export type MA_PROP = {
  length: number
  color: string
  isVisible: boolean
}

export const DEFAULT_MA_PROPS: MA_PROP[] = [{
  length: 5,
  color: 'rgb(255,0,0)',
  isVisible: true,
}, {
  length: 10,
  color: 'rgb(0,0,255)',
  isVisible: false,
}, {
  length: 20,
  color: 'rgb(255,0,255)',
  isVisible: true,
}, {
  length: 30,
  color: 'rgb(0,255,0)',
  isVisible: false,
}, {
  length: 60,
  color: 'rgb(255,152,0)',
  isVisible: false,
}]

export default class ChartLayoutModel extends EventEmitter {
  public selectedDrawingTool: BaseToolRenderer
  public willEraseDrawingTool: boolean = false

  private _maStudies: StudyModel[]
  private _charts: ChartModel[]
  private _axisx: AxisXModel
  private _mainDatasource: StockDatasource
  private _mainChart: ChartModel
  private _defaultCursor: 'crosshair' | 'default'
  // 是否处于画图编辑模式（只有触屏下才会触发，因为触屏下画图编辑方式跟PC有区别）
  private _isEditMode = false

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
    // this._maProps = {}
    this._maStudies = []
    this._charts = []
    this.pulseUpdate = this.pulseUpdate.bind(this)
    this.fullUpdate = this.fullUpdate.bind(this)
    this.lightUpdate = this.lightUpdate.bind(this)
  }

  get charts (): ChartModel[] {
    return this._charts.slice(0)
  }

  set axisx (axisx: AxisXModel) {
    this._axisx = axisx
  }

  get axisx (): AxisXModel {
    return this._axisx
  }

  get mainChart (): ChartModel {
    return this._mainChart
  }

  set mainDatasource (datasource: StockDatasource) {
    this._mainDatasource = datasource
  }

  get mainDatasource (): StockDatasource {
    return this._mainDatasource
  }

  get hoverChart () {
    return this._charts.filter(chart => chart.hover)[0] || null
  }

  get defaultCursor (): 'crosshair' | 'default' {
    return this._defaultCursor
  }

  get maProps (): MA_PROP[] {
    return this.readFromLS(`qchart.studies.props.ma[${this.mainDatasource.resolution}]`)
  }

  set maProps (prop: MA_PROP[]) {
    this.saveToLS(`qchart.studies.props.ma[${this.mainDatasource.resolution}]`, prop)
  }

  get maStudies (): StudyModel[] {
    return this._maStudies
  }

  get isEditMode () {
    return this._isEditMode
  }

  set isEditMode (isEditMode: boolean) {
    const mainChart = this._mainChart
    this._isEditMode = isEditMode
    if (isEditMode) {
      this.setHoverChart(mainChart)
      this.setCursorPoint({
        x: ~~(mainChart.width / 2 + 0.5),
        y: ~~(mainChart.height / 2 + 0.5),
      })
    }
    this.emit('editmode_change', isEditMode)
  }

  public saveToLS (key: string, value: any) {
    if (value !== void 0) {
      localStorage[key] = JSON.stringify(value)
    }
  }

  public readFromLS (key: string): any {
    return localStorage.hasOwnProperty(key) ?
      JSON.parse(localStorage[key]) : null
  }

  public deleteFromLS (key: string) {
    delete localStorage[key]
  }

  public setHoverChart (hoverChart: ChartModel) {
    this.charts.forEach(chart => {
      // 触屏设备需要手动设置取消chart hover
      chart.hover = false
      chart.graphs.forEach(graph => graph.hover = false)
      // 手动取消画图工具的hover
      chart.tools.forEach(tool => tool.hover = false)
    })
    // 设置当前chart为hover态
    hoverChart.hover = true
  }

  public cancelSelectedGraph () {
    this.charts.forEach(ch => {
      ch.graphs.forEach(graph => graph.selected = false)
      ch.tools.forEach(tool => tool.selected = false)
    })
  }

  /**
   * 全量刷新
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
        // 全量刷新需要刷新chart中的缓存
        chart.clearCache()
        chart.calcRangeY()
        chart.draw()
        chart.axisY.draw()
        // 清空上层画布
        chart.clearTopCanvas()
        chart.crosshair.draw()
      })
      this._lastAnimationFrame = null
    })
  }

  /**
   * 轻量刷新
   */
  public lightUpdate () {
    if (!this._lastAnimationFrame) {
      this._lastAnimationFrame = requestAnimationFrame(() => {
        this.axisx.draw(this.axisx.isValid ? true : false)
        this.charts.forEach(chart => {
          if (!chart.axisY.range) {
            chart.calcRangeY()
          }
          if (!chart.isValid) {
            chart.draw()
          }
          chart.axisY.draw(chart.axisY.isValid ? true : false)

          // 清空上层画布
          chart.clearTopCanvas()
          // 绘制创建中的工具图形
          if (chart.creatingDrawingTool) {
            chart.creatingDrawingTool.draw()
          }
          // 绘制编辑中的工具图形
          if (chart.editingDrawingTool) {
            chart.editingDrawingTool.draw()
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
  public restartPulseUpdate () {
    this._loading = false
    clearTimeout(this._pulseUpdateTimer)
    this.pulseUpdate()
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
    const requiredNum = ~~(1.5 * axisX.width / axisX.barWidth)

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
        .loadHistory(requiredNum)
        .then(() =>
          Promise.all(
            _.chain(datasources)
              .without(mainDatasource)
              .unique()
              .reduce((promises, datasource) => {
                promises.push(
                  datasource.loadTimeRange(
                    mainDatasource.first().time,
                    mainDatasource.last().time + 24 * 3600
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
    const from = mainDatasource.loaded() ?
      mainDatasource.last().time : mainDatasource.now() - 60
    // 未来一天，因为用户的PC可能进入休眠状态，待恢复时一次性要把休眠错过的数据全部请求过来。
    // 不过极端情况下一天未必会足够
    const to = from + 24 * 3600
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
   * 设置解析度
   * @param {ResolutionType} resolution
   */
  public setResolution (resolution: ResolutionType) {
    const mainDatasource = this._mainDatasource
    const oldResolution = mainDatasource.resolution
    // 股票类型时，分时图显示线形图，其他显示蜡烛图
    if (mainDatasource instanceof StockDatasource) {
      const mainGraph = this.mainChart.mainGraph as StockModel
      if (resolution === '1') {
        mainGraph.setShape('line')
        mainGraph.plots[0].shape = 'line'
      } else {
        mainGraph.setShape('candle')
        mainGraph.plots[0].shape = 'candle'
      }
    }

    // 批量设置数据源的解析度
    _.unique(
      this._charts.reduce((datasources, chart) =>
        datasources.concat(chart.graphs.map(graph => graph.datasource)
      ), [])
    ).forEach(datasource => datasource.resolution = resolution)

    this.clearCache()
    this.switchStudies(oldResolution)
    this.removeAllTools()
    this.restartPulseUpdate()
    this._axisx.resetOffset()
    this.emit('resolution_change', resolution)
  }

  /**
   * 设置股票标示
   * @param {string} symbol [description]
   */
  public setSymbol (symbol: string) {
    const datasource = this._mainDatasource
    datasource.symbol = symbol
    datasource
      .resolveSymbol()
      .then(() => {
        this.clearCache()
        this.switchStudies()
        this.removeAllTools()
        this.restartPulseUpdate()
        this._axisx.resetOffset()
        this.emit('symbol_change', datasource.symbolInfo)
      })
  }

  /**
   * 设置除权、复权
   * @param {number} right 0: 除权 1: 前复权
   */
  public setRight (right: number) {
    const datasources: Datasource[] = []
    // 批量设置数据源的解析度
    _.unique(datasources).forEach(datasource => {
      if (datasource instanceof StockDatasource) {
        datasource.right = right
      }
    })

    this.clearCache()
    this.removeAllTools()
    this.restartPulseUpdate()
    this._axisx.resetOffset()
    this.emit('right_change', right)
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
    this.emit('cursor_move', point)
  }

  /**
   * 设置默认的指针样式
   * @param {'default' | 'crosshair'} cursor 指针样式
   */
  public setDefaultCursor (cursor: 'default' | 'crosshair') {
    this._defaultCursor = cursor
    this.emit('cursor_change', cursor)
  }

  public addChart (chart: ChartModel) {
    const point = this._mainChart ? this._mainChart.crosshair.point : {x: 0, y: 0}
    if (chart.isMain) {
      if (this._mainChart) {
        throw new Error('can only has one main chart')
      }
      this._mainChart = chart
    }
    chart.crosshair.point = point ? {
      x: point.x,
      y: point.y,
    } : null
    this._charts.push(chart)
    this.emit('chart_add', chart)
  }

  public removeChart (chart: ChartModel) {
    this._charts.splice(this._charts.indexOf(chart), 1)
    this.emit('chart_remove', chart)
  }

  public resetStudies () {
    const mainChart = this._mainChart
    const datasource = mainChart.datasource
    const maProps = this.maProps || DEFAULT_MA_PROPS

    if (datasource.resolution === '1') {
      if (datasource instanceof StockDatasource &&
          datasource.symbolInfo &&
          datasource.symbolInfo.type === 'stock') {
        this._maStudies.length = 0
        this._maStudies.push(
          new StudyModel(
            mainChart,
            '均价',
          )
        )
        mainChart.addGraph(this._maStudies[0])
      }
    } else {
      this._maStudies.length = 0
      maProps.forEach((defaultMAProps, i) => {
        const ma = new StudyModel(
          mainChart,
          'MA',
          defaultMAProps.isVisible,
          [defaultMAProps.length],
          [{
            color: defaultMAProps.color,
            lineWidth: 1,
          }]
        )
        this._maStudies.push(ma)
        mainChart.addGraph(ma)
      })
    }
    mainChart.addGraph(
      new StudyModel(
        mainChart,
        'VOLUME'
      ))
  }

  public switchStudies (fromResolution?: ResolutionType) {
    const mainChart = this._mainChart
    const datasource = this._mainDatasource
    const resolution = datasource.resolution
    const symbolInfo = datasource.symbolInfo
    const maStudies = this._maStudies
    const maProps = this.maProps || DEFAULT_MA_PROPS
    const reset = +(fromResolution === '1') ^ +(resolution === '1')

    // 分时和K线之间切换时，清空所有指标
    if (reset) {
      this.removeAllStudies()
    } else {
      this.removeAllMAStudies()
    }

    if (resolution === '1') {
      if (symbolInfo.type === 'stock') {
        maStudies.length = 0
        maStudies[0] = new StudyModel(
          mainChart,
          '均价',
        )
        mainChart.addGraph(maStudies[0])
      } else {
        // 指数类暂时不显示任何均线
      }
    } else {
      maStudies.length = 0
      maProps.forEach((defaultMAProps, i) => {
        const ma = new StudyModel(
          mainChart,
          'MA',
          defaultMAProps.isVisible,
          [defaultMAProps.length],
          [{
            color: defaultMAProps.color,
            lineWidth: 1,
          }]
        )
        maStudies.push(ma)
        mainChart.addGraph(ma)
      })
    }

    if (reset) {
      mainChart.addGraph(
        new StudyModel(
          mainChart,
          'VOLUME'
        ))
    }
  }

  /**
   * 增加指标
   * @param {StudyType} study
   */
  public addStudy (study: StudyType) {
    const config = studyConfig[study]
    if (config.isPrice) {
      const studyModel = new StudyModel(
        this._mainChart,
        study,
      )
      this._mainChart.addGraph(studyModel)
      this.emit('graph_add', studyModel)
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
        chart,
        study
      )

      axisY.chart = chart
      crosshair.chart = chart

      chart.addGraph(studyModel)
      this.addChart(chart)
    }
  }

  /**
   * 移除指标
   * @param {StudyType} study
   */
  public removeStudy (chart: ChartModel, studyId: number) {
    if (chart.graphs.some(graph => {
      if (graph instanceof StudyModel && graph.id === studyId) {
        chart.removeGraph(graph)
        this.emit('graph_remove', graph)
        return true
      } else {
        return false
      }
    })) {
      // 如果此时chart中已经没有其他图形了，则把整个chart都移除
      if (!chart.graphs.length) {
        this.removeChart(chart)
      }
    }
  }

  /**
   * 修改图形参数
   * @param {StudyModel} graph
   * @param {input?: any[], isVisible?: boolean, styles?: ChartStyle[]} config 参数
   */
  public modifyGraph (graph: StudyModel, config: {input?: any[], isVisible?: boolean, styles?: ChartStyle[]}) {
    graph.clearCache()
    Object.keys(config).forEach(key => graph[key] = config[key])
    this.emit('graph_modify')
  }

  /**
   * 增加对比股票图形
   * @param {string} symbol 对比股票的代码
   */
  public addComparison (symbol: string) {
    const mainDatasource = this.mainDatasource as StockDatasource
    const mainChart = this._mainChart
    const datasource = new StockDatasource(
      symbol,
      mainDatasource.resolution,
      mainDatasource.right,
      mainDatasource.timeDiff
    )
    const stockModel = new StockModel(
      datasource,
      mainChart,
      false,
      false,
      true,
      'line',
      {
        color: randomColor({
          luminosity: 'bright',
          hue: 'random',
        }),
        lineWidth: 1,
      }
    )
    datasource
      .resolveSymbol()
      .then(() => {
        datasource
          .loadTimeRange(mainDatasource.first().time, mainDatasource.last().time + 24 * 3600)
          .then(() => {
            mainChart.addGraph(stockModel)
            this.emit('graph_add', stockModel)
          })
      })

    return stockModel.id
  }

  public removeComparison (graphId: number) {
    this._mainChart.graphs.some(graph => {
      if (graph.isComparison && graph.id === graphId) {
        this._mainChart.removeGraph(graph)
        this.emit('graph_remove', graph)
        return true
      } else {
        return false
      }
    })
  }

  /**
   * 前往指定日期
   * @param {number} time 指定的日期时间
   */
  public goToDate (time: number) {
    const mainDatasource = this._mainDatasource
    const axisX = this._axisx

    if (mainDatasource.loaded() === 0) {
      return
    }

    let index = time < mainDatasource.last().time ?
          mainDatasource.search(time) : mainDatasource.loaded() - 1

    // 如果已经没有更多历史数据了，则将定位至最左端的数据bar
    if (index === - 1 && mainDatasource.hasMoreHistory) {
      index = 0
    }

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

  public setTimeRange (range: string) {
    const resolution = perferredResolution[preferredTimeRange.indexOf(range)]
    const mainDatasource = this.mainDatasource
    const axisX = this.axisx

    const thisMoment = moment(mainDatasource.now() * 1000)
    const openMoment = moment({ hour: OPEN_HOUR, minute: OPEN_MINUTE})
    const closeMoment = moment({ hour: CLOSE_HOUR, minute: CLOSE_MINUTE})

    const toTime = ~~(thisMoment.toDate().getTime() / 1000 + 24 * 3600)
    const fromTime = ~~(function (): number {
      switch (range) {
        case '1天':
          return thisMoment.isAfter(closeMoment) ?
            openMoment.toDate().getTime() :
            openMoment.subtract(1, 'days').toDate().getTime()
        case '5天':
          let retMoment = thisMoment.isAfter(closeMoment) ?
            openMoment :
            openMoment.subtract(1, 'days')
          let loop = 4
          while (loop--) {
            retMoment.subtract(1, 'days')
            if (OPEN_DAYS.indexOf(retMoment.day()) === -1) {
              loop++
            }
          }
          return retMoment.toDate().getTime()
        case '1月':
          return openMoment.subtract(1, 'months').toDate().getTime()
        case '1年':
          return openMoment.subtract(1, 'years').toDate().getTime()
        case '全部':
          return 0
        default:
          throw 'unsupport range type'
      }
    }() / 1000)

    if (resolution !== this.mainDatasource.resolution) {
      this.setResolution(resolution)
    }

    const fromIndex = mainDatasource.search(fromTime)

    if (fromIndex === -1) {
      mainDatasource.loadTimeRange(fromTime, toTime)
        .then(bars => {
          if (bars.length) {
            axisX.barWidth = (axisX.width - INITIAL_OFFSET) / bars.length
          } else {
            // 加载不到数据说明有停牌的可能因此之间返回
            return
          }
        })
    } else {
      axisX.barWidth = (axisX.width - INITIAL_OFFSET) / (mainDatasource.loaded() -  fromIndex)
    }

    axisX.resetOffset()
  }

  /**
   * 清理chart的所有缓存
   */
  private clearCache () {
    this._charts.forEach(chart => {
      chart.graphs.forEach(graph => {
        graph.clearCache()
        graph.datasource.clearCache()
      })
    })
  }

  /**
   * 移除所有指标
   */
  private removeAllStudies () {
    // 移除所有study
    this.charts.reverse().forEach(chart => {
      chart.graphs
        .filter(graph => graph instanceof StudyModel)
        .forEach(study => this.removeStudy(chart, study.id))
    })
  }

  /**
   * 移除均线类指标 MA以及均价指标
   */
  private removeAllMAStudies () {
    const mainChart = this._mainChart
    this._maStudies.forEach(ma => this.removeStudy(mainChart, ma.id))
  }

  /**
   * 移除所有画线工具
   */
  private removeAllTools () {
    this._charts.forEach(chart => {
      chart.removeAllTools()
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
