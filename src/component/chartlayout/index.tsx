import './index.less'
import Spinner = require('spin.js')
import * as React from 'react'
import * as _ from 'underscore'
import Chart from '../chart'
import AxisX from '../axisX'
import Navbar from '../navbar'
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
  showfooterbar?: boolean
}

type State = {
  update: boolean
}

export default class ChartLayout extends React.Component<Prop, State> {

  public static propTypes = {
    axis: React.PropTypes.oneOf(['left', 'right', 'both']),
    datasources: React.PropTypes.array.isRequired,
    resolution: React.PropTypes.oneOf(['1', '5', '15', '30', '60', 'D', 'W', 'M']),
    scalable: React.PropTypes.bool,
    scrollable: React.PropTypes.bool,
    shape: React.PropTypes.oneOf(['histogram', 'mountain', 'line', 'bar', 'candle']),
    showfooterbar: React.PropTypes.bool,
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
    type: 'realtime',
  }

  public refs: {
    [propName: string]: Element
    root: HTMLDivElement
  }

  private _chartLayoutModel: ChartLayoutModel
  /**
   * 用于标记chart正在加载中，避免重复加载
   * @type {[type]}
   */
  private _loading: boolean = false
  private _lastAnimationFrame: number
  private _timeDiff: number

  constructor () {
    super()
    this.state = {
      update: false,
    }
  }

  public componentWillMount () {
    if (this.props.type === 'snapshot') {
      this.props.scrollable = false
      this.props.scalable = false
    }
  }

  public prepareMainChart () {
    const mainDatasource = new StockDatasource(this.props.symbol, this.props.resolution, this._timeDiff)
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
    // 首先获取服务器的时间
    this.getServerTime()
      .then(() => {
        this._chartLayoutModel = new ChartLayoutModel()
        this.prepareMainChart()
        this.state.update = true
        this.setState(this.state)
        // 开始显示加载中菊花转
        const spinner = new Spinner().spin(this.refs.root)
        // 加载首屏数据
        this.loadHistory()
          .then(() => setTimeout(() => {
              this.initEvents()
              this.pulseUpdate()
              spinner.stop()
            }, 300)
          )
      })
  }

  public initEvents () {
    this._chartLayoutModel.axisx.addListener('resize', () => this.fullUpdate())
    this._chartLayoutModel.axisx.addListener('offsetchange', () => this.fullUpdate())
    this._chartLayoutModel.axisx.addListener('barwidthchange', () => this.fullUpdate())
    this._chartLayoutModel.addListener('resolutionchange', resolution => {
      // 股票类型时，分时图显示线形图，其他显示蜡烛图
      if (resolution === '1' && this._chartLayoutModel.mainDatasource instanceof StockDatasource) {
        this._chartLayoutModel.mainChart.graphs
          .filter(graph => graph instanceof StockModel)
          .forEach(graph => graph.plots[0].shape = 'line')
      } else {
        this._chartLayoutModel.mainChart.graphs
          .filter(graph => graph instanceof StockModel)
          .forEach(graph => graph.plots[0].shape = 'candle')
      }
      this.fullUpdate()
    })
    this._chartLayoutModel.addListener('symbolchange', () => this.fullUpdate())
    this._chartLayoutModel.addListener('hit', () => this.lightUpdate())
    this._chartLayoutModel.addListener('cursormove', () => this.lightUpdate())
    this._chartLayoutModel.addListener('marginchange', () => this.lightUpdate())
    this._chartLayoutModel.addListener('studychange', () => {
      this.state.update = true
      this.setState(this.state)
      this.fullUpdate()
    })
  }

  /**
   * 重新绘制chart
   */
  public fullUpdate () {
    const axisX = this._chartLayoutModel.axisx
    const totalWidth = this._chartLayoutModel.mainDatasource.loaded() * axisX.barWidth
    const visibleWidth = axisX.size.width
    // 当预加载的数据只剩余不足半屏时，执行预加载加载更多的数据以备展示
    if (totalWidth - visibleWidth - axisX.offset < visibleWidth / 2) {
      this.loadHistory()
    }

    // 取消上一帧动画的调度，避免卡顿
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

  public lightUpdate () {
    // 取消上一帧动画的调度，避免重复计算
    if (this._lastAnimationFrame) {
      cancelAnimationFrame(this._lastAnimationFrame)
    }

    this._lastAnimationFrame = requestAnimationFrame(() => {
      this._chartLayoutModel.axisx.draw()
      this._chartLayoutModel.charts.forEach(chart => {
        if (!chart.axisY.range) {
          chart.axisY.range = chart.getRangeY()
        }
        if (!chart.isValid) {
          chart.draw()
        }
        chart.crosshair.draw()
        chart.axisY.draw()
      })
      this._lastAnimationFrame = null
    })
  }

  public getServerTime (): Promise<any> {
    return new Promise((resolve, reject) => getServerTime().then(response => 
      response.text()
        .then(timeStr => {
          this._timeDiff = ~~(Date.now() / 1000) - +timeStr
          resolve()
        })
    ))
  }

  /**
   * 加载更多数据
   */
  public loadHistory (): Promise<any> {
    const mainDatasource = this._chartLayoutModel.mainDatasource
    // 主数据源若没有更多的话，停止加载更多
    if (!mainDatasource.hasMore || this._loading) {
      return
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
          .catch(reject)
      )
      .catch(reject)
    })
  }

  public pulseUpdate () {
    const mainDatasource = this._chartLayoutModel.mainDatasource
    const datasources = []
    const reqs = []

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
      if (mainDatasource.pulseInterval) {
        setTimeout(
          () => this.pulseUpdate(),
          (mainDatasource.pulseInterval < 10 ? 10 : mainDatasource.pulseInterval) * 1000
        )
      }
    })
  }

  public render () {
    if (!this.state.update) {
      return null
    }

    const chartLayoutModel = this._chartLayoutModel
    let availWidth = this.props.width - 2
    let availHeight = this.props.height - AXIS_X_HEIGHT - 2

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
      <div className='chart-layout' ref='root'>
        {
          this.props.shownavbar ?
            <Navbar resolution={this.props.resolution} chartLayout={this._chartLayoutModel} /> : null
        }
        <div className='chart-body'>
          {chartLines}
          <AxisX chartLayout={this._chartLayoutModel}
            axis={this._chartLayoutModel.axisx}
            height={AXIS_X_HEIGHT}
            width={availWidth - AXIS_Y_WIDTH} />
        </div>
        {
          this.props.showfooterbar ?
            <FooterBar chartLayout={this._chartLayoutModel} /> : null
        }
      </div>
    )
  }
}
