import * as React from 'react'
import * as _ from 'underscore'
import Chart from './chart'
import AxisX from './axisX'
import ChartModel from '../model/chart'
import CrosshairModel from '../model/crosshair'
import { StockDatasource, IStockBar } from '../datasource'
import { ShapeType, ResolutionType, StudyType, AXIS_X_WIDTH, AXIS_Y_HEIGHT } from '../constant'
import AxisXModel from '../model/axisx'
import AxisYModel from '../model/axisy'
import GraphModel from '../model/graph'
import SeriesModel from '../model/series'
import StudyModel from '../model/study'

type AxisType = 'left' | 'right' | 'both'
type ChartType = 'snapshot' | 'realtime'

interface IProp {
  symbol: string
  resolution: ResolutionType
  height: number
  width: number
  axis?: AxisType
  // from?: number
  // to?: number
  shape?: ShapeType
  study?: StudyType
  type?: ChartType
  scrollable?: boolean
  scalable?: boolean
}

interface IState {
  charts: Array<ChartModel>
}

export default class ChartLayout extends React.Component<IProp, IState> {

  public static propTypes = {
    axis: React.PropTypes.oneOf(['left', 'right', 'both']),
    datasources: React.PropTypes.array.isRequired,
    // from: React.PropTypes.number,
    // height: React.PropTypes.number.isRequired,
    resolution: React.PropTypes.oneOf(['1', '5', '15', '30', '60', 'D', 'W', 'M']),
    scalable: React.PropTypes.bool,
    scrollable: React.PropTypes.bool,
    shape: React.PropTypes.oneOf(['histogram', 'mountain', 'line', 'bar', 'candle']),
    study: React.PropTypes.oneOf(['MA', 'MACD', 'BOLL', 'KDJ']),
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

  private _mainDatasource: StockDatasource
  private _axisX: AxisXModel
  private _axisY: AxisYModel
  private _crosshair: CrosshairModel
  private _charts: Array<ChartModel>
  /**
   * 用于标记chart正在加载中，避免重复加载
   * @type {[type]}
   */
  private _loading: boolean = false

  constructor () {
    super()
    this.state = {
      charts: null,
    }
  }

  public componentWillMount () {
    if (this.props.type === 'snapshot') {
      this.props.scrollable = false
      this.props.scalable = false
    }

    if (this.props.resolution === '1') {
      this.props.shape = 'line'
    }

    this._mainDatasource = new StockDatasource(this.props.symbol, this.props.resolution)
    this._crosshair = new CrosshairModel()
    this._axisX = new AxisXModel(this._mainDatasource, this._crosshair)
    this._axisY = new AxisYModel(this._mainDatasource, this._crosshair)
    this._crosshair.axisX = this._axisX
    this._crosshair.axisY = this._axisY
    this._charts = []

    const graphs: Array<GraphModel> = [
      new SeriesModel(
        this._mainDatasource,
        this._axisX, this._axisY,
        this._crosshair,
        function (bar: IStockBar): Array<any> {
          return [{
            time: bar.time,
            val: bar.close,
          }]
        },
        this.props.shape,
        [{
          fillColor: 'rgba( 60, 120, 216, 1)',
          lineColor: 'rgba( 60, 120, 240, 1)',
          lineWidth: 2,
        }]
      ),
      new StudyModel(
        this._mainDatasource,
        this._axisX, this._axisY,
        this._crosshair,
        'VOLUME',
        function (bar: IStockBar) {
          return [bar.time, bar.volume, bar.close > bar.open]
        }
      ),
      new StudyModel(
        this._mainDatasource,
        this._axisX, this._axisY,
        this._crosshair,
        'MA',
        function (bar: IStockBar) {
          return [bar.time, bar.close]
        },
        5,
        [{
          lineColor: 'red',
          lineWidth: 1,
        }]
      ),
      new StudyModel(
        this._mainDatasource,
        this._axisX, this._axisY,
        this._crosshair,
        'MA',
        function (bar: IStockBar) {
          return [bar.time, bar.close]
        },
        10,
        [{
          lineColor: 'blue',
          lineWidth: 1,
        }]
      ),
      new StudyModel(
        this._mainDatasource,
        this._axisX, this._axisY,
        this._crosshair,
        'MA',
        function (bar: IStockBar) {
          return [bar.time, bar.close]
        },
        20,
        [{
          lineColor: 'purple',
          lineWidth: 1,
        }]
      ),
      new StudyModel(
        this._mainDatasource,
        this._axisX, this._axisY,
        this._crosshair,
        'MA',
        function (bar: IStockBar) {
          return [bar.time, bar.close]
        },
        30,
        [{
          lineColor: 'green',
          lineWidth: 1,
        }]
      ),
    ]

    this._charts.push(
      new ChartModel(
        this._mainDatasource,
        this._axisX, this._axisY,
        this._crosshair,
        graphs
      )
    )

    this.setState({
      charts: this._charts,
    })
  }

  public componentDidMount () {
    this.initEvents()
    this.loadMore()
  }

  public initEvents () {

    this._axisX.addListener('resize', () => {
      this.redraw()
    })

    this._axisX.addListener('offsetchange', () => {
      this.redraw()
    })

    this._crosshair.addListener('cursormove', () => {
      this.redraw()
    })

  }

  /**
   * 重新绘制chart
   */
  public redraw () {
    const axis = this._axisX
    const totalWidth = this._mainDatasource.loaded() * axis.barWidth
    const visibleWidth = axis.size.width
    // 当预加载的数据只剩余不足半屏时，执行预加载加载更多的数据以备展示
    if (totalWidth - visibleWidth - axis.offset < visibleWidth / 2) {
      this.loadMore()
    }
    requestAnimationFrame(() => {
      this._axisX.draw()
      this._charts.forEach(chart => {
        this._axisY.range = chart.getRangeY()
        chart.axisY.draw()
        chart.draw()
      })
    })
  }

  /**
   * 加载更多数据
   */
  public loadMore (): void {
    // 主数据源若没有更多的话，停止加载更多
    if (!this._mainDatasource.hasMore || this._loading) {
      return
    }

    this._loading = true

    const reqs: Array<Promise<any>> = []
    const required = ~~((this._axisX.size.width * 2 + this._axisX.offset) / this._axisX.barWidth)

    // this._charts.forEach(chart => {
    //   chart.graphs.forEach(graph => {
    //     // 加载一定数量的数据，策略是，《至少》多加载一屏的数据
    //     reqs.push(graph.datasource.loadMore(required))
    //   })
    // })

    reqs.push(this._mainDatasource.loadMore(required))

    Promise.all(reqs).then(() => {
      // 加载完成后立即重绘
      this.redraw()
      this._loading = false
    })
  }

  public render () {
    return <div className='chart-layout' style={ {fontSize: 0} }>
      {
        this.state.charts.map(
          chart => <Chart model={chart} height={this.props.height - AXIS_Y_HEIGHT} width={this.props.width} />
        )
      }
      <AxisX axis={this._axisX} height={AXIS_Y_HEIGHT} width={this.props.width - AXIS_X_WIDTH} />
    </div>
  }

}
