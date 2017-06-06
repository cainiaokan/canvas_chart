import './index.less'

import * as React from 'react'
import * as _ from 'underscore'

import About from '../about'
import GoToDateDialog from '../gotodate'
import ContextMenu, { ContextMenuConfig } from '../contextmenu'
import Chart from '../chart'
import AxisX from '../axisX'
import ToolBox from '../toolbox'
import Navbar from '../navbar'
import Sidebar from '../sidebar'
import ControlBar from '../controlbar'
import FooterPanel from '../footerpanel'
import StudyModel from '../../model/study'
import { ChartStyle } from '../../graphic/diagram'
import {
  ShapeType,
  ResolutionType,
  StudyType,
  RightType,
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
import {
  requestFullscreen,
  exitFullscreen,
  getFullScreenElement,
} from '../../util'
import ChartLayoutModel from '../../model/chartlayout'

type AxisType = 'left' | 'right' | 'both'

type Prop  = {
  symbol?: string
  resolution?: ResolutionType
  height: number
  width: number
  axis?: AxisType
  shape?: ShapeType
  scrollable?: boolean
  scalable?: boolean
  shownavbar?: boolean
  showtoolbox?: boolean
  showsidebar?: boolean
  showcontrolbar?: boolean
  showfooterpanel?: boolean
  enablecontextmenu?: boolean
  enablepulseupdate?: boolean // 更新数据
  right?: RightType // 复权设置
  closetime?: number // 最右侧数据bar对应的基准时间
}

type State = {
  showAbout?: boolean
  showGoToDate?: boolean
  contextMenuConfig?: ContextMenuConfig
  sidebarFolded?: boolean
  sidebarActiveIndex?: number
  footerPanelFolded?: boolean
  footerPanelActiveIndex?: number
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
    enablecontextmenu: React.PropTypes.bool,
    enablepulseupdate: React.PropTypes.bool,
    closetime: React.PropTypes.number,
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
    enablecontextmenu: true,
    enablepulseupdate: true,
    right: 1,
  }

  public static contextTypes = {
    chartLayout: React.PropTypes.instanceOf(ChartLayoutModel),
  }

  public context: { chartLayout: ChartLayoutModel }

  public refs: { root: HTMLDivElement }

  private _chartLayout: ChartLayoutModel

  constructor (props: Prop, context: { chartLayout: ChartLayoutModel }) {
    super(props, context)
    this._chartLayout = this.context.chartLayout

    const chartLayout = this._chartLayout
    const { closetime, enablepulseupdate, scrollable } = this.props

    chartLayout.component = this

    // 使用使用了closetime，那么就不应该把数据bar的更新功能禁用，否则一旦加载新的数据，就会超过closetime，从而产生冲突
    chartLayout.update = closetime ? false : enablepulseupdate

    this.state = {
      sidebarFolded: chartLayout.readFromLS('qchart.sidebar.folded'),
      sidebarActiveIndex: chartLayout.readFromLS('qchart.sidebar.activeIndex') || 0,
      footerPanelFolded: true,
      footerPanelActiveIndex: 0,
      showAbout: !this._chartLayout.readFromLS('chart.welcome'),
      showGoToDate: false,
    }
    this.updateView = this.updateView.bind(this)
    this.onSymbolChange = this.onSymbolChange.bind(this)
    this.onResolutionChange = this.onResolutionChange.bind(this)
    this.onRightChange = this.onRightChange.bind(this)
    this.onAddComparison = this.onAddComparison.bind(this)
    this.onRemoveComparison = this.onRemoveComparison.bind(this)
    this.onAddStudy = this.onAddStudy.bind(this)
    this.onStudyModified = this.onStudyModified.bind(this)
    this.onFullScreen = this.onFullScreen.bind(this)
    this.sidebarChangeHandler = this.sidebarChangeHandler.bind(this)
    this.footerPanelChangeHandler = this.footerPanelChangeHandler.bind(this)
    this.wheelHandler = scrollable ? this.wheelHandler.bind(this) : null
  }

  public shouldComponentUpdate (nextProp: Prop, nextState: State) {
    return !_.isEqual(this.state, nextState) || !_.isEqual(this.props, nextProp)
  }

  public componentDidMount () {
    // 将欢迎标记存入本地存储
    this._chartLayout.saveToLS('chart.welcome', true)
    this.initEvents()
    this.forceUpdate()
  }

  public componentWillUnmount () {
    const chartLayout = this._chartLayout
    chartLayout.removeAllListeners()
    chartLayout.axisx.removeAllListeners()
  }

  public componentDidUpdate () {
    this._chartLayout.fullUpdate()
  }

  public initEvents () {
    const chartLayout = this._chartLayout
    chartLayout.axisx.addListener('offset_change', chartLayout.fullUpdate)
    chartLayout.axisx.addListener('barwidth_change', chartLayout.fullUpdate)
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
    chartLayout.addListener('patterns_add', chartLayout.lightUpdate)
    chartLayout.addListener('patterns_remove', chartLayout.lightUpdate)
    chartLayout.addListener('pattern_modify', chartLayout.lightUpdate)
    chartLayout.addListener('gap_visibility_change', chartLayout.lightUpdate)
  }

  public render () {
    const width = this.props.width
    const height = this.props.height
    const {
      shownavbar,
      showcontrolbar,
      enablecontextmenu,
      scrollable,
      scalable,
    } = this.props
    const {
      footerPanelFolded,
      footerPanelActiveIndex,
      showAbout,
      showGoToDate,
      contextMenuConfig,
      sidebarFolded,
      sidebarActiveIndex,
    } = this.state

    const chartLayoutModel = this._chartLayout
    // 根据屏幕尺寸重置选项
    const greaterThanMinSize = width > 768 && height > 450
    const showSideBar = greaterThanMinSize ? this.props.showsidebar : false
    const showToolBox = greaterThanMinSize ? this.props.showtoolbox : false
    const showFooterPanel = greaterThanMinSize ? this.props.showfooterpanel : false

    // 12 是chart-body的margin 10 和 border 2
    let availWidth = width - 12

    if (showToolBox) {
      availWidth -= TOOLBOX_WIDTH
    }

    if (showSideBar) {
      availWidth -= !sidebarFolded ? SIDEBAR_WIDTH : SIDEBAR_FOLD_WIDTH
    }

    let availHeight = height - AXIS_X_HEIGHT - 12

    if (shownavbar) {
      availHeight -= NAVBAR_HEIGHT
    }

    if (showcontrolbar) {
      availHeight -= CONTROL_BAR_HEIGHT
    }

    if (showFooterPanel) {
      availHeight -= footerPanelFolded ? FOOTER_PANEL_HEIGHT : FOOTER_PANEL_UNFOLD_HEIGHT
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
          scrollable={scrollable}
          scalable={scalable}
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
          <ToolBox /> : null
        }
        {
          showAbout ?
          <About /> : null
        }
        {
          showGoToDate ?
          <GoToDateDialog /> : null
        }
        {
          contextMenuConfig && enablecontextmenu ?
          <ContextMenu {...contextMenuConfig} /> : null
        }
        {
          showSideBar ?
          <Sidebar
            folded={sidebarFolded}
            activeIndex={sidebarActiveIndex}
            onChange={this.sidebarChangeHandler}
            width={!sidebarFolded ? SIDEBAR_WIDTH : SIDEBAR_FOLD_WIDTH}
            height={this.props.height} /> : null
        }
        {
          shownavbar ?
          <Navbar
            width={availWidth}
            onSymbolChange={this.onSymbolChange}
            onResolutionChange={this.onResolutionChange}
            onAddComparison={this.onAddComparison}
            onRemoveComparison={this.onRemoveComparison}
            onAddStudy={this.onAddStudy}
            onStudyModified={this.onStudyModified}
            onFullScreen={this.onFullScreen}
            onRightChange={this.onRightChange} /> : null
        }
        <div
          className='chart-body'
          style={ {width: availWidth + 2 + 'px'} }
          onWheel={this.wheelHandler}>
          {chartLines}
          <AxisX scalable={scalable} height={AXIS_X_HEIGHT} width={availWidth - AXIS_Y_WIDTH} />
        </div>
        {
          showcontrolbar ?
          <ControlBar width={availWidth + 2} /> : null
        }
        {
          showFooterPanel ?
          <FooterPanel
            folded={footerPanelFolded}
            activeIndex={footerPanelActiveIndex}
            onChange={this.footerPanelChangeHandler}
            width={availWidth + 2} /> : null
        }
      </div>
    )
  }

  private onSymbolChange (symbol: string) {
    this._chartLayout.setSymbol(symbol)
  }

  private onResolutionChange (resolution: ResolutionType) {
    this._chartLayout.saveToLS('qchart.resolution', resolution)
    this._chartLayout.setResolution(resolution)
  }

  private onRightChange (right: RightType) {
    this._chartLayout.setRight(right)
  }

  private onAddComparison (symbol: string): number {
    return this._chartLayout.addComparison(symbol)
  }

  private onRemoveComparison (graphId: number) {
    this._chartLayout.removeComparison(graphId)
  }

  private onAddStudy (study: StudyType) {
    this._chartLayout.addStudy(study)
  }

  private onStudyModified (study: StudyModel, properties: {input?: any[], isVisible?: boolean, styles?: ChartStyle[]}) {
    this._chartLayout.modifyGraph(study, properties)
  }

  private onFullScreen () {
    const root = this.refs.root
    if (getFullScreenElement() === root) {
      exitFullscreen()
    } else {
      requestFullscreen(root)
    }
  }

  private sidebarChangeHandler (folded: boolean, index: number) {
    this.setState({
      sidebarFolded: folded,
      sidebarActiveIndex: index,
    })
  }

  private footerPanelChangeHandler (folded: boolean, index: number) {
    this.setState({
      footerPanelFolded: folded,
      footerPanelActiveIndex: index,
    })
  }

  private wheelHandler (ev) {
    ev.preventDefault()
    if (this._chartLayout.mainDatasource.loaded() !== 0) {
      const axisX = this._chartLayout.axisx
      axisX.offset -= ev.deltaX
    }
  }

  private updateView () {
    this.forceUpdate()
  }
}
