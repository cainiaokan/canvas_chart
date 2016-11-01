import './index.less'
import Spinner = require('spin.js')
import * as React from 'react'
import * as _ from 'underscore'
import Chart from '../chart'
import AxisX from '../axisX'
import Navbar from '../navbar'
import Sidebar from '../sidebar'
import FooterBar from '../footerbar'
import ChartModel from '../../model/chart'
import CrosshairModel from '../../model/crosshair'
import { StockDatasource, getServerTime } from '../../datasource'
import {
  ShapeType,
  ResolutionType,
  StudyType,
  AXIS_Y_WIDTH,
  AXIS_X_HEIGHT,
  NAVBAR_HEIGHT,
  FOOTERBAR_HEIGHT,
  SIDEBAR_WIDTH,
  SIDEBAR_FOLD_WIDTH,
} from '../../constant'
import AxisXModel from '../../model/axisx'
import AxisYModel from '../../model/axisy'
import StockModel from '../../model/stock'
import StudyModel from '../../model/study'
import ChartLayoutModel from '../../model/chartlayout'

type AxisType = 'left' | 'right' | 'both'
type ChartType = 'snapshot' | 'realtime'

type Prop  = {
  symbol: string
  resolution: ResolutionType
  height: number
  width: number
  axis?: AxisType
  shape?: ShapeType
  study?: StudyType
  type?: ChartType
  scrollable?: boolean
  scalable?: boolean
  shownavbar?: boolean
  showsidebar?: boolean
  showfooterbar?: boolean
}

type State = {
  loaded?: boolean,
  sidebar?: 'fold' | 'unfold',
  resolution?: ResolutionType,
  study?: StudyType
}

export default class ChartLayout extends React.Component<Prop, State> {

  public static propTypes = {
    axis: React.PropTypes.oneOf(['left', 'right', 'both']),
    datasources: React.PropTypes.array.isRequired,
    resolution: React.PropTypes.oneOf(['1', '5', '15', '30', '60', 'D', 'W', 'M']),
    scalable: React.PropTypes.bool,
    scrollable: React.PropTypes.bool,
    shape: React.PropTypes.oneOf(['mountain', 'line', 'column', 'candle']),
    showfooterbar: React.PropTypes.bool,
    showsidebar: React.PropTypes.bool,
    shownavbar: React.PropTypes.bool,
    study: React.PropTypes.oneOf(['MA', 'MACD', 'BOLL', 'KDJ', 'VOLUME']),
    to: React.PropTypes.number,
    type: React.PropTypes.oneOf(['snapshot', 'realtime']),
    width: React.PropTypes.number.isRequired,
  }

  public static defaultProps = {
    axis: 'right',
    resolution: '1',
    scalable: true,
    scrollable: true,
    shape: 'line',
    showfooterbar: true,
    shownavbar: true,
    showsidebar: true,
    type: 'realtime',
  }

  public refs: {
    [propName: string]: Element
    root: HTMLDivElement
  }

  private _chartLayoutModel: ChartLayoutModel
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
    this.state = {
      sidebar: 'unfold',
      loaded: false,
    }
    this.pulseUpdate = this.pulseUpdate.bind(this)
  }

  public componentWillMount () {
    if (this.props.type === 'snapshot') {
      this.props.scrollable = false
      this.props.scalable = false
    }
    this._chartLayoutModel = new ChartLayoutModel()
    this.prepareMainChart()
  }

  public prepareMainChart () {
    const mainDatasource = new StockDatasource(this.props.symbol, this.props.resolution)
    const crosshair = new CrosshairModel(this._chartLayoutModel)
    const axisX = new AxisXModel(mainDatasource, crosshair)
    const axisY = new AxisYModel(mainDatasource, crosshair)
    const chart = new ChartModel(
      this._chartLayoutModel,
      mainDatasource,
      axisX, axisY,
      crosshair,
      true,
      true
    )

    axisY.chart = chart
    crosshair.chart = chart

    this._chartLayoutModel.axisx = axisX
    this._chartLayoutModel.mainDatasource = mainDatasource

    chart.graphs = [
      new StudyModel(
        mainDatasource,
        chart,
        'MA',
        [5],
        [{
          color: 'red',
          lineWidth: 1,
        }]
      ),
      new StudyModel(
        mainDatasource,
        chart,
        'MA',
        [10],
        [{
          color: 'blue',
          lineWidth: 1,
        }]
      ),
      new StudyModel(
        mainDatasource,
        chart,
        'MA',
        [20],
        [{
          color: 'purple',
          lineWidth: 1,
        }]
      ),
      new StudyModel(
        mainDatasource,
        chart,
        'MA',
        [30],
        [{
          color: 'green',
          lineWidth: 1,
        }]
      ),
      new StudyModel(
        mainDatasource,
        chart,
        'VOLUME'
      ),
      new StockModel(
        mainDatasource,
        chart,
        this.props.resolution === '1' && this.props.shape === 'candle' ? 'line' : this.props.shape,
        { lineWidth: 2 }
      ),
    ]
    this._chartLayoutModel.charts.push(chart)
  }

  public componentDidMount () {
    const spinner = new Spinner().spin(this.refs.root)
    Promise.all([
      this.getServerTime(),
      this._chartLayoutModel.mainDatasource.resolveSymbol(),
      this.loadHistory(),
    ])
    .then(() => {
      this.initEvents()
      this.pulseUpdate()
      spinner.stop()
      this.setState({ loaded: true })
    })
  }

  public initEvents () {
    this._chartLayoutModel.axisx.addListener('resize', () => this.fullUpdate())
    this._chartLayoutModel.axisx.addListener('offsetchange', () => this.fullUpdate())
    this._chartLayoutModel.axisx.addListener('barwidthchange', () => this.fullUpdate())
    this._chartLayoutModel.addListener('resolutionchange', resolution => {
      // 股票类型时，分时图显示线形图，其他显示蜡烛图
      if (this._chartLayoutModel.mainDatasource instanceof StockDatasource && this.props.shape === 'candle') {
        if (resolution === '1') {
          this._chartLayoutModel.mainChart.graphs
            .filter(graph => graph instanceof StockModel)
            .forEach(graph => {
              (graph as StockModel).setShape('line')
              graph.plots[0].shape = 'line'
            })
        } else {
          this._chartLayoutModel.mainChart.graphs
            .filter(graph => graph instanceof StockModel)
            .forEach(graph => {
              (graph as StockModel).setShape(this.props.shape)
              graph.plots[0].shape = this.props.shape
            })
        }
      }
      this.resetChart()
      this.setState({ resolution })
    })
    this._chartLayoutModel.addListener('symbolchange', () => {
      this.resetChart()
    })
    this._chartLayoutModel.addListener('hit', () => this.lightUpdate())
    this._chartLayoutModel.addListener('cursormove', () => this.lightUpdate())
    this._chartLayoutModel.addListener('marginchange', () => this.lightUpdate())
    this._chartLayoutModel.addListener('studychange', study => {
      this.setState({ study })
      this.fullUpdate()
    })
    this._chartLayoutModel.addListener('sidebarchange', folded => {
      this.setState({ sidebar: folded })
    })
  }

  /**
   * 全刷新
   */
  public fullUpdate () {
    const axisX = this._chartLayoutModel.axisx
    const totalWidth = this._chartLayoutModel.mainDatasource.loaded() * axisX.barWidth
    const visibleWidth = axisX.size.width
    // 当预加载的数据只剩余不足半屏时，执行预加载加载更多的数据以备展示
    if (totalWidth - visibleWidth - axisX.offset < visibleWidth / 2) {
      this.loadHistory()
    }

    // 取消上一未调度的帧动画，避免卡顿
    if (this._lastAnimationFrame) {
      cancelAnimationFrame(this._lastAnimationFrame)
    }

    this._lastAnimationFrame = requestAnimationFrame(() => {
      axisX.draw()
      this._chartLayoutModel.charts.forEach(chart => {
        chart.axisY.range = chart.getRangeY()
        chart.axisY.draw()
        chart.draw()
      })
      this._lastAnimationFrame = null
    })
  }

  /**
   * 轻量级刷新
   */
  public lightUpdate () {
    // 取消上一帧动画的调度，避免重复计算
    if (this._lastAnimationFrame) {
      cancelAnimationFrame(this._lastAnimationFrame)
    }

    this._lastAnimationFrame = requestAnimationFrame(() => {
      this._chartLayoutModel.axisx.draw(false)
      this._chartLayoutModel.charts.forEach(chart => {
        if (!chart.axisY.range) {
          chart.axisY.range = chart.getRangeY()
        }
        if (!chart.isValid) {
          chart.draw()
        }
        chart.crosshair.draw()
        chart.axisY.draw(false)
      })
      this._lastAnimationFrame = null
    })
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
            this._chartLayoutModel.charts.forEach(chart => {
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
    const mainDatasource = this._chartLayoutModel.mainDatasource
    // 主数据源若没有更多的话，停止加载更多
    if (!mainDatasource.hasMore || this._loading) {
      return Promise.resolve()
    }

    this._loading = true
    const axisX = this._chartLayoutModel.axisx
    const datasources = []
    const reqs = []
    const required = ~~((axisX.size.width * 2 + axisX.offset) / axisX.barWidth)

    this._chartLayoutModel.charts.forEach(chart => {
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
              }, reqs)
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
    const mainDatasource = this._chartLayoutModel.mainDatasource
    const datasources = []
    const reqs = []

    if (!mainDatasource.loaded()) {
      return
    }

    this._chartLayoutModel.charts.forEach(chart => {
      chart.graphs.forEach(graph => {
        datasources.push(graph.datasource)
      })
    })
    Promise.all(
      _.chain(datasources)
        .unique()
        .reduce((promises, datasource) => {
          promises.push(
            datasource.loadTimeRange(
              mainDatasource.last().time,
              mainDatasource.now()
            )
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

  public render () {
    const chartLayoutModel = this._chartLayoutModel
    // 12 是padding 10 和 border 2
    let availWidth = this.props.width - 12
    let availHeight = this.props.height - AXIS_X_HEIGHT - 12

    if (this.props.showsidebar) {
      availWidth -= this.state.sidebar === 'unfold' ? SIDEBAR_WIDTH : SIDEBAR_FOLD_WIDTH
    }
    if (this.props.shownavbar) {
      availHeight -= NAVBAR_HEIGHT
    }
    if (this.props.showfooterbar) {
      availHeight -= FOOTERBAR_HEIGHT
    }
    if (chartLayoutModel.charts.length > 1) {
      availHeight -= chartLayoutModel.charts.length - 1
    }

    const additionalChartCount = chartLayoutModel.charts.length - 1
    const mainChartHeight = ~~((1 - additionalChartCount * .3 > .3 ? 1 - additionalChartCount * .3 : .3) * availHeight)
    const addtionalChartHeight = ~~((availHeight - mainChartHeight) / additionalChartCount)
    const chartLines = []

    for (let i = 0, len = chartLayoutModel.charts.length, chart; i < len; i++) {
      chart = chartLayoutModel.charts[i]
      chartLines.push(
        <Chart chart={chart} chartLayout={this._chartLayoutModel}
          height={chart.isMain ? mainChartHeight : addtionalChartHeight}
          width={availWidth} />
      )
      if (i < len - 1) {
        chartLines.push(<div className='chart-separator'></div>)
      }
    }

    return (
      <div className='chart-layout' ref='root'
        style={ {height: this.props.height + 'px',width: this.props.width + 'px'} }>
        {
          this.props.shownavbar ?
            <Navbar resolution={this.props.resolution} chartLayout={this._chartLayoutModel} /> : null
        }
        <div className='chart-body' style={ {width: availWidth + 2 + 'px'} }>
          {chartLines}
          <AxisX chartLayout={this._chartLayoutModel}
            axis={this._chartLayoutModel.axisx}
            height={AXIS_X_HEIGHT}
            width={availWidth - AXIS_Y_WIDTH} />
        </div>
        {
          this.props.showsidebar ?
          <Sidebar chartLayout={this._chartLayoutModel}
            width={this.state.sidebar === 'unfold' ? SIDEBAR_WIDTH : SIDEBAR_FOLD_WIDTH}
            height={this.props.height} /> : null
          }
        }
        {
          this.props.showfooterbar ?
            <FooterBar chartLayout={this._chartLayoutModel} width={availWidth + 2} height={FOOTERBAR_HEIGHT} /> : null
        }
      </div>
    )
  }
}
