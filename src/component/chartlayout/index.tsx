import './index.less'
import Spinner = require('spin')
import * as React from 'react'
import * as _ from 'underscore'
import Chart from '../chart'
import AxisX from '../axisX'
import ToolBox from '../toolbox'
import Navbar from '../navbar'
import Sidebar from '../sidebar'
import ControlBar from '../controlbar'
import FooterPanel from '../footerpanel'
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
  CONTROL_BAR_HEIGHT,
  FOOTER_PANEL_HEIGHT,
  FOOTER_PANEL_UNFOLD_HEIGHT,
  SIDEBAR_WIDTH,
  SIDEBAR_FOLD_WIDTH,
  TOOLBOX_WIDTH,
} from '../../constant'
import AxisXModel from '../../model/axisx'
import AxisYModel from '../../model/axisy'
import StockModel from '../../model/stock'
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
  showcontrolbar?: boolean
  showfooterpanel?: boolean
  right?: 0 | 1 | 2
}

type State = {
  loaded?: boolean
  sidebarFolded?: boolean
  footerPanelFolded?: boolean
  resolution?: ResolutionType
  right?: 0 | 1 | 2
  symbolType?: string
}

export default class ChartLayout extends React.Component<Prop, State> {

  public static propTypes = {
    axis: React.PropTypes.oneOf(['left', 'right', 'both']),
    resolution: React.PropTypes.oneOf(['1', '5', '15', '30', '60', 'D', 'W', 'M']),
    scalable: React.PropTypes.bool,
    scrollable: React.PropTypes.bool,
    shape: React.PropTypes.oneOf(['mountain', 'line', 'column', 'candle']),
    showtoolbox: React.PropTypes.bool,
    showcontrolbar: React.PropTypes.bool,
    showfooterpanel: React.PropTypes.bool,
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
    showcontrolbar: true,
    shownavbar: true,
    showsidebar: true,
    showfooterpanel: true,
    type: 'realtime',
    right: 1,
  }

  public refs: {
    root: HTMLDivElement
  }

  private _chartLayoutModel: ChartLayoutModel

  constructor () {
    super()
    const chartLayout = new ChartLayoutModel()
    this.state = {
      sidebarFolded: chartLayout.readFromLS('qchart.sidebar.folded'),
      footerPanelFolded: true,
      loaded: false,
      symbolType: '',
    }
    this.updateView = this.updateView.bind(this)
    this.wheelHandler = this.wheelHandler.bind(this)
    this._chartLayoutModel = chartLayout
  }

  public shouldComponentUpdate (nextProp: Prop, nextState: State) {
    return !_.isEqual(this.state, nextState) || !_.isEqual(this.props, nextProp)
  }

  public componentWillMount () {
    if (this.props.type === 'snapshot') {
      this.props.scrollable = false
      this.props.scalable = false
    }
    this.state.resolution =
      this._chartLayoutModel.readFromLS('qchart.resolution') ||
      this.props.resolution
    this.state.right = this.props.right
  }

  public componentDidMount () {
    const chartLayout = this._chartLayoutModel
    const spinner = new Spinner({}).spin(this.refs.root)

    this.prepareMainChart()

    Promise.all([
      chartLayout.getServerTime(),
      chartLayout.mainDatasource.resolveSymbol(),
      chartLayout.loadHistory(),
    ])
    .then(() => {
      this.setState({
        loaded: true,
      })
      spinner.stop()
      setTimeout(() => {
        this.initEvents()
        chartLayout.pulseUpdate()
      }, 100)
    })
  }

  public componentWillUnmount () {
    const chartLayout = this._chartLayoutModel
    chartLayout.removeAllListeners()
    chartLayout.axisx.removeAllListeners()
  }

  public componentDidUpdate () {
    if (this.state.loaded) {
      this._chartLayoutModel.fullUpdate()
    }
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

    chart.addGraph(
      new StockModel(
        mainDatasource,
        chart,
        true,
        true,
        false,
        this.state.resolution === '1' && this.props.shape === 'candle' ? 'line' : this.props.shape,
        { lineWidth: 2 }
      ))

    chartLayout.addChart(chart)
    chartLayout.resetStudies()
  }

  public initEvents () {
    const chartLayout = this._chartLayoutModel
    chartLayout.axisx.addListener('offset_change', chartLayout.fullUpdate)
    chartLayout.axisx.addListener('barwidth_change', chartLayout.fullUpdate)
    chartLayout.addListener('resolution_change', resolution => this.setState({ resolution }))
    chartLayout.addListener('symbol_change', symbolInfo => this.setState({ symbolType: symbolInfo.type }))
    chartLayout.addListener('right_change', right => this.setState({ right }))
    chartLayout.addListener('sidebar_toggle', folded => this.setState({ sidebarFolded: folded }))
    chartLayout.addListener('footer_panel_toggle', folded => this.setState({ footerPanelFolded: folded }))
    chartLayout.addListener('chart_add', this.updateView)
    chartLayout.addListener('chart_remove', this.updateView)
    chartLayout.addListener('graph_add', chartLayout.lightUpdate)
    chartLayout.addListener('graph_remove', chartLayout.lightUpdate)
    chartLayout.addListener('graph_modify', chartLayout.lightUpdate)
    chartLayout.addListener('graph_hover', chartLayout.lightUpdate)
    chartLayout.addListener('graph_select', chartLayout.lightUpdate)
    chartLayout.addListener('cursor_move', chartLayout.lightUpdate)
    chartLayout.addListener('barmargin_change', chartLayout.lightUpdate)
    chartLayout.addListener('drawingtool_begin', chartLayout.lightUpdate)
    chartLayout.addListener('drawingtool_end', chartLayout.lightUpdate)
    chartLayout.addListener('drawingtool_setvertex', chartLayout.lightUpdate)
    chartLayout.addListener('drawingtool_remove', chartLayout.lightUpdate)
    chartLayout.addListener('editmode_change', chartLayout.lightUpdate)
  }

  public render () {
    const width = this.props.width
    const height = this.props.height

    if (!this.state.loaded) {
      return <div className='chart-layout'
                  ref='root'
                  style={ {height: height + 'px',width: width + 'px'} }>
              </div>
    }

    const chartLayoutModel = this._chartLayoutModel
    // 根据屏幕尺寸重置选项
    const showSideBar = width > 768 && height > 450 ? this.props.showsidebar : false
    const showToolBox = width > 768 && height > 450 ? this.props.showtoolbox : false

    // 12 是chart-body的margin 10 和 border 2
    let availWidth = width - 12

    if (showToolBox) {
      availWidth -= TOOLBOX_WIDTH
    }

    if (showSideBar) {
      availWidth -= !this.state.sidebarFolded ? SIDEBAR_WIDTH : SIDEBAR_FOLD_WIDTH
    }

    // 根据屏幕尺寸重置选项
    const showNavBar = this.props.shownavbar
    const showControlBar = this.props.showcontrolbar
    const showFooterPanel = height > 450 ? this.props.showfooterpanel : false

    let availHeight = height - AXIS_X_HEIGHT - 12

    if (showNavBar) {
      availHeight -= NAVBAR_HEIGHT
    }

    if (showControlBar) {
      availHeight -= CONTROL_BAR_HEIGHT
    }

    if (showFooterPanel) {
      availHeight -= this.state.footerPanelFolded ? FOOTER_PANEL_HEIGHT : FOOTER_PANEL_UNFOLD_HEIGHT
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
        <Chart
          key={chart.id}
          chart={chart}
          chartLayout={chartLayoutModel}
          height={chart.isMain ? mainChartHeight : addtionalChartHeight}
          width={availWidth} />
      )
      if (i < len - 1) {
        chartLines.push(<div key={`${chart.id}_separator`} className='chart-separator'></div>)
      }
    }

    return (
      <div className='chart-layout' ref='root'
        style={ {height: height + 'px',width: width + 'px'} }>
        {
          showToolBox ?
          <ToolBox chartLayout={chartLayoutModel} /> : null
        }
        {
          showSideBar ?
          <Sidebar
            chartLayout={chartLayoutModel}
            folded={this.state.sidebarFolded}
            width={!this.state.sidebarFolded ? SIDEBAR_WIDTH : SIDEBAR_FOLD_WIDTH}
            height={this.props.height} /> : null
        }
        {
          showNavBar ?
          <Navbar
            resolution={this.state.resolution}
            chartLayout={chartLayoutModel}
            width={availWidth}
            right={this.state.right} /> : null
        }
        <div className='chart-body'
             style={ {width: availWidth + 2 + 'px'} }
             onWheel={this.wheelHandler}>
          {chartLines}
          <AxisX
            axis={chartLayoutModel.axisx}
            height={AXIS_X_HEIGHT}
            width={availWidth - AXIS_Y_WIDTH} />
        </div>
        {
          showControlBar ?
          <ControlBar
            chartLayout={chartLayoutModel}
            width={availWidth + 2} /> : null
        }
        {
          showFooterPanel ?
          <FooterPanel
            chartLayout={chartLayoutModel}
            width={availWidth + 2} /> : null
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
