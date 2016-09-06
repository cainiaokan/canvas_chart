import './index.less'
import * as React from 'react'
import * as _ from 'underscore'
import Chart from './../chart'
import AxisX from './../axisX'
import Navbar from './../navbar'
import ChartModel from '../../model/chart'
import CrosshairModel from '../../model/crosshair'
import { StockDatasource, IStockBar } from '../../datasource'
import { ShapeType, ResolutionType, StudyType, AXIS_Y_WIDTH, AXIS_X_HEIGHT, NAVBAR_HEIGHT } from '../../constant'
import AxisXModel, { MAX_BAR_WIDTH, MIN_BAR_WIDTH } from '../../model/axisx'
import AxisYModel from '../../model/axisy'
import StockModel from '../../model/stock'
import StudyModel from '../../model/study'
import ChartLayoutModel from '../../model/chartlayout'
import { clientOffset } from '../../util'

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
}

type State = {
  chartLayoutModel: ChartLayoutModel
}

export default class ChartLayout extends React.Component<Prop, State> {

  public static propTypes = {
    axis: React.PropTypes.oneOf(['left', 'right', 'both']),
    datasources: React.PropTypes.array.isRequired,
    resolution: React.PropTypes.oneOf(['1', '5', '15', '30', '60', 'D', 'W', 'M']),
    scalable: React.PropTypes.bool,
    scrollable: React.PropTypes.bool,
    shape: React.PropTypes.oneOf(['histogram', 'mountain', 'line', 'bar', 'candle']),
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
    type: 'realtime',
  }

  private _chartLayoutModel: ChartLayoutModel
  /**
   * 用于标记chart正在加载中，避免重复加载
   * @type {[type]}
   */
  private _loading: boolean = false
  private _dragOffsetStart: boolean
  private _dragBarWidthStart: boolean
  private _dragPosX: number
  private _lastAnimationFrame: number

  constructor () {
    super()
    this.state = {
      chartLayoutModel: null,
    }
  }

  public componentWillMount () {
    if (this.props.type === 'snapshot') {
      this.props.scrollable = false
      this.props.scalable = false
    }

    this._chartLayoutModel = new ChartLayoutModel()

    this.prepareMainChart()
    this.prepareMinorChart()
    this.prepareKDJ()
    this.prepareMACD()

    this.setState({
      chartLayoutModel: this._chartLayoutModel,
    })
  }

  public prepareMainChart (): void {
    const mainDatasource = new StockDatasource(this.props.symbol, this.props.resolution)
    const crosshair = new CrosshairModel()
    const axisX = new AxisXModel(mainDatasource, crosshair)
    const axisY = new AxisYModel(mainDatasource, crosshair)
    const chart = new ChartModel(
      mainDatasource,
      axisX, axisY,
      crosshair,
      true,
      true
    )

    crosshair.chart = chart

    this._chartLayoutModel.axisx = axisX
    this._chartLayoutModel.mainDatasource = mainDatasource

    chart.graphs = [
      new StockModel(
        mainDatasource,
        chart,
        function (array: any): any[] {
          return [array.slice(0, 6)]
        },
        this.props.shape,
        [{
          color: '#ff524f',
          colorDown: '#2bbe65',
        }]
      ),
      new StudyModel(
        mainDatasource,
        chart,
        'VOLUME',
        function (bar: IStockBar) {
          return [0, bar.time, bar.volume, bar.close < bar.open]
        }
      ),
      new StudyModel(
        mainDatasource,
        chart,
        'MA',
        function (bar: IStockBar) {
          return [0, bar.time, bar.close]
        },
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
        function (bar: IStockBar) {
          return [0, bar.time, bar.close]
        },
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
        function (bar: IStockBar) {
          return [0, bar.time, bar.close]
        },
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
        function (bar: IStockBar) {
          return [0, bar.time, bar.close]
        },
        [30],
        [{
          color: 'green',
          lineWidth: 1,
        }]
      ),
    ]
    this._chartLayoutModel.charts.push(chart)
  }

  public prepareMinorChart (): void {
    const datasource = new StockDatasource('SZ399001', this.props.resolution)
    const crosshair = new CrosshairModel()
    const axisX = this._chartLayoutModel.axisx
    const axisY = new AxisYModel(datasource, crosshair)
    const chart = new ChartModel(datasource, axisX, axisY, crosshair, true)
    crosshair.chart = chart

    chart.graphs = [
      new StockModel(
        datasource,
        chart,
        function (array: any): any[] {
          return [
            [array[0], array[1], array[3]],
          ]
        },
        'mountain',
        [{
          color: 'rgba( 60, 120, 240, 1)',
          fillColor: 'rgba( 60, 120, 216, 1)',
          lineWidth: 2,
        }]
      ),
      new StudyModel(
        datasource,
        chart,
        'VOLUME',
        function (bar: IStockBar) {
          return [0, bar.time, bar.volume, bar.close < bar.open]
        }
      ),
      new StudyModel(
        datasource,
        chart,
        'MA',
        function (bar: IStockBar) {
          return [0, bar.time, bar.close]
        },
        [5],
        [{
          color: 'red',
          lineWidth: 1,
        }]
      ),
      new StudyModel(
        datasource,
        chart,
        'MA',
        function (bar: IStockBar) {
          return [0, bar.time, bar.close]
        },
        [10],
        [{
          color: 'blue',
          lineWidth: 1,
        }]
      ),
      new StudyModel(
        datasource,
        chart,
        'MA',
        function (bar: IStockBar) {
          return [0, bar.time, bar.close]
        },
        [20],
        [{
          color: 'purple',
          lineWidth: 1,
        }]
      ),
      new StudyModel(
        datasource,
        chart,
        'MA',
        function (bar: IStockBar) {
          return [0, bar.time, bar.close]
        },
        [30],
        [{
          color: 'green',
          lineWidth: 1,
        }]
      ),
    ]

    this._chartLayoutModel.charts.push(chart)
  }

  public prepareMACD (): void {
    const datasource = this._chartLayoutModel.mainDatasource
    const crosshair = new CrosshairModel()
    const axisX = this._chartLayoutModel.axisx
    const axisY = new AxisYModel(datasource, crosshair)
    const chart = new ChartModel(datasource, axisX, axisY, crosshair, false)
    crosshair.chart = chart
    chart.graphs = [
      new StudyModel(
        datasource,
        chart,
        'MACD',
        function (bar: IStockBar) {
          return [0, bar.time, bar.close]
        },
        [12, 26, 9]
      ),
    ]
    this._chartLayoutModel.charts.push(chart)
  }

  public prepareKDJ (): void {
    const datasource = this._chartLayoutModel.mainDatasource
    const crosshair = new CrosshairModel()
    const axisX = this._chartLayoutModel.axisx
    const axisY = new AxisYModel(datasource, crosshair)
    const chart = new ChartModel(datasource, axisX, axisY, crosshair, false)
    crosshair.chart = chart
    chart.graphs = [
      new StudyModel(
        datasource,
        chart,
        'KDJ',
        function (bar: IStockBar) {
          return [0, bar.time, bar.close, bar.high, bar.low]
        },
        [9, 3, 3]
      ),
    ]
    this._chartLayoutModel.charts.push(chart)
  }

  public componentDidMount () {
    this.loadMore().then(() => {
      setTimeout(() => {
        this.initEvents()
      }, 200)
    })
  }

  public initEvents () {
    this._chartLayoutModel.axisx.addListener('resize', () => this.redraw())

    this._chartLayoutModel.axisx.addListener('offsetchange', () => this.redraw())

    this._chartLayoutModel.axisx.addListener('barwidthchange', () => this.redraw())
  }

  public dragOffsetMouseDownHandler (ev): void {
    this._dragOffsetStart = true
    this._dragPosX = ev.pageX
  }

  public dragBarWidthMouseDown (ev: MouseEvent) {
    ev.stopPropagation()
    this._dragPosX = ev.pageX
    this._dragBarWidthStart = true
  }

  public mouseMoveHandler (ev: MouseEvent) {
    // TODO not best approach, but do work at the moment
    const offset = clientOffset((ev.target as HTMLElement).parentElement.parentElement)
    const point = {
      x: ev.clientX - offset.offsetLeft,
      y: ev.clientY - offset.offsetTop,
    }
    this._chartLayoutModel.charts.forEach(ch => ch.crosshair.point = point)
    if (this._dragOffsetStart) {
      const axisX = this._chartLayoutModel.axisx
      const curOffset = axisX.offset
      const pageX = ev.pageX
      const newOffset = curOffset + pageX - this._dragPosX
      if (newOffset < axisX.minOffset) {
        axisX.offset = axisX.minOffset
      } else if (newOffset > axisX.maxOffset) {
        axisX.offset = axisX.maxOffset
      } else {
        axisX.offset = newOffset
      }
      this._dragPosX = pageX
    } else if (this._dragBarWidthStart) {
      const axisX = this._chartLayoutModel.axisx
      const pageX = ev.pageX
      const curBarWidth = axisX.barWidth
      const newBarWidth = curBarWidth - (ev.pageX - this._dragPosX) / 50
      if (newBarWidth < MIN_BAR_WIDTH) {
        axisX.barWidth = MIN_BAR_WIDTH
      } else if (newBarWidth > MAX_BAR_WIDTH) {
        axisX.barWidth = MAX_BAR_WIDTH
      } else {
        axisX.barWidth = newBarWidth
      }
      axisX.offset *= axisX.barWidth / curBarWidth
      this._dragPosX = pageX
    } else {
      this.redrawCursorMoveOnly()
    }
  }

  public mouseUpHandler (ev: MouseEvent) {
    this._dragOffsetStart = false
    this._dragBarWidthStart = false
  }

  public mouseLeaveHandler (ev) {
    this._chartLayoutModel.charts.forEach(chart => chart.crosshair.point = null)
    this.redrawCursorMoveOnly()
  }

  /**
   * 重新绘制chart
   */
  public redraw () {
    const axisX = this._chartLayoutModel.axisx
    const totalWidth = this._chartLayoutModel.mainDatasource.loaded() * axisX.barWidth
    const visibleWidth = axisX.size.width
    // 当预加载的数据只剩余不足半屏时，执行预加载加载更多的数据以备展示
    if (totalWidth - visibleWidth - axisX.offset < visibleWidth / 2) {
      this.loadMore()
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

  public redrawCursorMoveOnly () {
    // 取消上一帧动画的调度，避免重复计算
    if (this._lastAnimationFrame) {
      cancelAnimationFrame(this._lastAnimationFrame)
    }

    this._lastAnimationFrame = requestAnimationFrame(() => {
      this._chartLayoutModel.axisx.draw()
      this._chartLayoutModel.charts.forEach(chart => {
        chart.crosshair.draw()
        chart.axisY.draw()
      })
      this._lastAnimationFrame = null
    })
  }

  /**
   * 加载更多数据
   */
  public loadMore (): Promise<any> {
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
        .loadMore(required)
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
            this.redraw()
            this._loading = false
            resolve()
          })
          .catch(reject)
      )
      .catch(reject)
    })
  }

  public render () {
    const availWidth = this.props.width - 2 - 10
    const availHeight = this.props.height - NAVBAR_HEIGHT - AXIS_X_HEIGHT - 5 - 2
    const chartLayoutModel = this.state.chartLayoutModel
    const additionalChartCount = chartLayoutModel.charts.length - 1
    const mainChartHeight = ~~((1 - additionalChartCount * .3 > .3 ? 1 - additionalChartCount * .3 : .3) * availHeight)
    const addtionalChartHeight = ~~((availHeight - mainChartHeight) / additionalChartCount)
    return (
      <div className='chart-layout'>
        <Navbar resolution={this.props.resolution} chartLayout={this._chartLayoutModel} />
        <div className='chart-body'
            onMouseDown={this.dragOffsetMouseDownHandler.bind(this)}
            onMouseMove={this.mouseMoveHandler.bind(this)}
            onMouseUp={this.mouseUpHandler.bind(this)}
            onMouseLeave={this.mouseLeaveHandler.bind(this)}>
          <Chart model={chartLayoutModel.charts[0]}
                height={mainChartHeight}
                width={availWidth} />
          {
            chartLayoutModel.charts.slice(1).map(
              chart => <Chart model={chart}
                height={addtionalChartHeight}
                width={availWidth} />
            )
          }
          <AxisX
            axis={this._chartLayoutModel.axisx}
            height={AXIS_X_HEIGHT}
            width={availWidth - AXIS_Y_WIDTH}
            onMouseDown={this.dragBarWidthMouseDown.bind(this)}/>
        </div>
      </div>
    )
  }
}
