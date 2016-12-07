import './index.less'
import * as Spinner from '../../vendor/spin.js'
import * as React from 'react'
import * as _ from 'underscore'
import Chart from '../chart'
import AxisX from '../axisX'
import ToolBox from '../toolbox'
import Navbar from '../navbar'
import Sidebar from '../sidebar'
import FooterBar from '../footerbar'
import ChartModel from '../../model/chart'
import CrosshairModel from '../../model/crosshair'
import { StockDatasource } from '../../datasource'
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
  TOOLBOX_WIDTH,
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
  showtoolbox?: boolean
  showsidebar?: boolean
  showfooterbar?: boolean
  right?: 0 | 1 | 2
}

type State = {
  loaded?: boolean
  sidebarFolded?: boolean
  resolution?: ResolutionType
  right?: number
  symbolType?: string
}

export default class ChartLayout extends React.Component<Prop, State> {

  public static propTypes = {
    axis: React.PropTypes.oneOf(['left', 'right', 'both']),
    datasources: React.PropTypes.array.isRequired,
    resolution: React.PropTypes.oneOf(['1', '5', '15', '30', '60', 'D', 'W', 'M']),
    scalable: React.PropTypes.bool,
    scrollable: React.PropTypes.bool,
    shape: React.PropTypes.oneOf(['mountain', 'line', 'column', 'candle']),
    showtoolbox: React.PropTypes.bool,
    showfooterbar: React.PropTypes.bool,
    showsidebar: React.PropTypes.bool,
    shownavbar: React.PropTypes.bool,
    study: React.PropTypes.oneOf(['MA', 'MACD', 'BOLL', 'KDJ', 'VOLUME']),
    to: React.PropTypes.number,
    type: React.PropTypes.oneOf(['snapshot', 'realtime']),
    width: React.PropTypes.number.isRequired,
    right: React.PropTypes.oneOf([0, 1, 2]),
  }

  public static defaultProps = {
    axis: 'right',
    resolution: '1',
    scalable: true,
    scrollable: true,
    shape: 'line',
    showtoolbox: true,
    showfooterbar: true,
    shownavbar: true,
    showsidebar: true,
    type: 'realtime',
    right: 1,
  }

  public refs: {
    root: HTMLDivElement
  }

  private _chartLayoutModel: ChartLayoutModel

  constructor () {
    super()
    this.state = {
      sidebarFolded: false,
      loaded: false,
      symbolType: '',
    }
    this.updateView = this.updateView.bind(this)
  }

  public shouldComponentUpdate (nextProp: Prop, nextState: State) {
    return !_.isEqual(this.state, nextState) || !_.isEqual(this.props, nextProp)
  }

  public componentWillMount () {
    if (this.props.type === 'snapshot') {
      this.props.scrollable = false
      this.props.scalable = false
    }
    this.state.resolution = this.props.resolution
    this.state.right = this.props.right
    this._chartLayoutModel = new ChartLayoutModel()
    this.prepareMainChart()
  }

  public prepareMainChart () {
    const chartLayout = this._chartLayoutModel
    const mainDatasource = new StockDatasource(
      this.props.symbol,
      this.state.resolution,
      this.state.right
    )
    const crosshair = new CrosshairModel(chartLayout)
    const axisX = new AxisXModel(mainDatasource, crosshair)
    const axisY = new AxisYModel(mainDatasource, crosshair)
    const chart = new ChartModel(
      chartLayout,
      mainDatasource,
      axisX, axisY,
      crosshair,
      true,
      true
    )

    axisY.chart = chart
    crosshair.chart = chart

    chartLayout.axisx = axisX
    chartLayout.mainDatasource = mainDatasource

    chart.graphs.push(
      new StudyModel(
        mainDatasource,
        chart,
        'MA',
        [5],
        [{
          color: 'red',
          lineWidth: 1,
        }]
      ))

    chart.graphs.push(
      new StudyModel(
        mainDatasource,
        chart,
        'MA',
        [10],
        [{
          color: 'blue',
          lineWidth: 1,
        }]
      ))

    chart.graphs.push(
      new StudyModel(
        mainDatasource,
        chart,
        'MA',
        [20],
        [{
          color: 'purple',
          lineWidth: 1,
        }]
      ))

    chart.graphs.push(
      new StudyModel(
        mainDatasource,
        chart,
        'MA',
        [30],
        [{
          color: 'green',
          lineWidth: 1,
        }]
      ))

    chart.graphs.push(
      new StudyModel(
        mainDatasource,
        chart,
        'VOLUME'
      ))

    chart.graphs.push(
      new StockModel(
        mainDatasource,
        chart,
        this.state.resolution === '1' && this.props.shape === 'candle' ? 'line' : this.props.shape,
        { lineWidth: 2 }
      ))

    chartLayout.charts.push(chart)
  }

  public componentDidMount () {
    const chartLayout = this._chartLayoutModel
    const mainDatasource = chartLayout.mainDatasource
    const spinner = new Spinner({}).spin(this.refs.root)
    Promise.all([
      chartLayout.getServerTime(),
      mainDatasource.resolveSymbol(),
      chartLayout.loadHistory(),
    ])
    .then(() => {
      this.initEvents()
      chartLayout.pulseUpdate()
      spinner.stop()
      if (mainDatasource instanceof StockDatasource) {
        chartLayout.emit('symbolresolved', mainDatasource.symbolInfo)
        this.setState({
          loaded: true,
          symbolType: mainDatasource.symbolInfo.type,
        })
      } else {
        this.setState({ loaded: true })
      }
    })
  }

  public componentDidUpdate () {
    this._chartLayoutModel.fullUpdate()
  }

  public initEvents () {
    const chartLayout = this._chartLayoutModel
    chartLayout.axisx.addListener('offsetchange', chartLayout.fullUpdate)
    chartLayout.axisx.addListener('barwidthchange', chartLayout.fullUpdate)
    chartLayout.addListener('resolutionchange', resolution => {
      // 股票类型时，分时图显示线形图，其他显示蜡烛图
      if (chartLayout.mainDatasource instanceof StockDatasource && this.props.shape === 'candle') {
        if (resolution === '1') {
          chartLayout.mainChart.graphs
            .filter(graph => graph instanceof StockModel)
            .forEach(graph => {
              (graph as StockModel).setShape('line')
              graph.plots[0].shape = 'line'
            })
        } else {
          chartLayout.mainChart.graphs
            .filter(graph => graph instanceof StockModel)
            .forEach(graph => {
              (graph as StockModel).setShape(this.props.shape)
              graph.plots[0].shape = this.props.shape
            })
        }
      }
      chartLayout.resetChart()
      this.setState({ resolution })
    })
    chartLayout.addListener('symbolchange', symbolInfo => {
      chartLayout.resetChart()
      this.setState({ symbolType: symbolInfo.type })
    })
    chartLayout.addListener('rightchange', right => {
      chartLayout.resetChart()
      this.setState({ right })
    })
    chartLayout.addListener('hit', chartLayout.lightUpdate)
    chartLayout.addListener('select', chartLayout.lightUpdate)
    chartLayout.addListener('cursormove', chartLayout.lightUpdate)
    chartLayout.addListener('barmarginchange', chartLayout.lightUpdate)
    // study 添加或移除时，直接更新dom，不要刷新，因为size已经更新了。会自动刷新所有chart
    chartLayout.addListener('addstudy', this.updateView)
    chartLayout.addListener('removestudy', this.updateView)
    chartLayout.addListener('modifystudy', chartLayout.lightUpdate)
    chartLayout.addListener('sidebarfoldstatechange', folded => this.setState({ sidebarFolded: folded }))
    chartLayout.addListener('drawingtoolsetvertex', chartLayout.lightUpdate)
    chartLayout.addListener('removedrawingtool', chartLayout.lightUpdate)
  }

  public render () {
    const chartLayoutModel = this._chartLayoutModel
    // 12 是padding 10 和 border 2
    const width = this.props.width
    const height = this.props.height
    let availWidth = width - 12
    let availHeight = height - AXIS_X_HEIGHT - 14

    if (this.props.showtoolbox) {
      availWidth -= TOOLBOX_WIDTH
    }
    if (this.props.showsidebar) {
      availWidth -= !this.state.sidebarFolded ? SIDEBAR_WIDTH : SIDEBAR_FOLD_WIDTH
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
        style={ {height: height + 'px',width: width + 'px'} }>
        {
          this.props.showtoolbox ?
          <ToolBox chartLayout={this._chartLayoutModel} /> : null
        }
        {
          this.props.shownavbar ?
          <Navbar resolution={this.state.resolution}
                  chartLayout={this._chartLayoutModel}
                  symbolType={this.state.symbolType}
                  right={this.state.right} /> : null
        }
        <div className='chart-body' style={ {width: availWidth + 2 + 'px'} }
             onWheel={this.wheelHandler.bind(this)}>
          {chartLines}
          <AxisX axis={this._chartLayoutModel.axisx}
                 height={AXIS_X_HEIGHT}
                 width={availWidth - AXIS_Y_WIDTH} />
        </div>
        {
          this.props.showsidebar ?
          <Sidebar chartLayout={this._chartLayoutModel}
                   folded={this.state.sidebarFolded}
                   width={!this.state.sidebarFolded ? SIDEBAR_WIDTH : SIDEBAR_FOLD_WIDTH}
                   height={this.props.height} /> : null
        }
        {
          this.props.showfooterbar ?
          <FooterBar chartLayout={this._chartLayoutModel}
                     width={availWidth + 2}
                     height={FOOTERBAR_HEIGHT} /> : null
        }
      </div>
    )
  }

  private wheelHandler (ev) {
    ev.preventDefault()
    if (this._chartLayoutModel.mainDatasource.loaded() !== 0) {
      const axisX = this._chartLayoutModel.axisx
      axisX.offset -= ev.deltaX
    }
  }

  private updateView () {
    this.forceUpdate()
  }
}
