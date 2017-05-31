import './index.less'
import '../../style/btn.less'
import '../../style/popup_menu.less'

import * as React from 'react'
import * as _ from 'underscore'
import ChartLayoutModel from '../../model/chartlayout'
import PollManager, { PollData } from './pollmanager'
import Realtime from './realtime'
import Market from './market'
import Financing from './financing'
import Plates from './plates'
import Briefing from './briefing'
import Analyze from './analyze'

const STOCK_PANEL_HEIGHT = 44

const tabsConfig = [
  '实时看盘',
  '大盘概况',
  '财务信息',
  '所属板块',
  '分析功能',
]

const tabsIcon = [
  <svg viewBox='0 0 20 20'>
    <g>
      <path d='M10,4c-6,0-9,6-9,6s3,6,9,6s9-6,9-6S16,4,10,4z M10,14.5c-2.5,0-4.5-2-4.5-4.5s2-4.5,4.5-4.5s4.5,2,4.5,4.5S12.5,14.5,10,14.5z'/>
      <path d='M12,9c-0.6,0-1-0.4-1-1c0-0.3,0.1-0.5,0.3-0.7C10.9,7.1,10.5,7,10,7c-1.7,0-3,1.3-3,3c0,0.3,0,0.6,0.1,0.9C7.4,10.4,7.9,10,8.5,10c0.8,0,1.5,0.7,1.5,1.5c0,0.6-0.4,1.1-0.9,1.4C9.4,13,9.7,13,10,13c1.7,0,3-1.3,3-3c0-0.5-0.1-0.9-0.3-1.3C12.5,8.9,12.3,9,12,9z'/>
    </g>
  </svg>,
  <svg viewBox='0 0 20 20'>
    <g>
      <path d='M16.7,2.7h1.8v14.1h-1.8V2.7z M13.1,3.2l-0.2,0.1c-0.3,0.1-0.7,0-0.8-0.3c-0.1-0.1-0.1-0.3,0-0.4c0.1-0.1,0.2-0.3,0.4-0.3l2.8-0.9l0.3,2.5c0,0.1,0,0.3-0.1,0.4c-0.1,0.1-0.3,0.2-0.5,0.2c0,0,0,0-0.1,0c-0.3,0-0.6-0.2-0.6-0.5l0-0.4c-3.2,4.4-10.6,9.2-10.9,9.4c-0.1,0.1-0.2,0.1-0.4,0.1c-0.2,0-0.4-0.1-0.5-0.2c-0.1-0.1-0.2-0.2-0.1-0.4c0-0.1,0.1-0.3,0.2-0.4C2.7,12.2,10,7.5,13.1,3.2z M15.2,5.9v11h-1.8v-11H15.2z M12.1,9.1v7.7h-1.8V9.1H12.1z M8.9,12.5v4.3H7.1v-4.3H8.9z M5.5,14.2v2.6H3.7v-2.6H5.5z M19,18.5H1v-1.3h18L19,18.5L19,18.5z'/>
    </g>
  </svg>,
  <svg viewBox='0 0 20 20'>
    <g>
      <path d='M14.3,5.9l3.8,1l1-3.8l-0.7-0.2l-0.6,2.4C16.1,2.7,13.2,1,10,1c-5,0-9,4-9,9s4,9,9,9c3.3,0,6.2-1.8,7.8-4.5l-0.7-0.4c-1.4,2.4-4.1,4.1-7.1,4.1c-4.6,0-8.3-3.7-8.3-8.3S5.4,1.7,10,1.7c3.1,0,5.7,1.7,7.2,4.1l-2.7-0.7L14.3,5.9z'/>
      <path d='M10.4,14v-0.7c0.7,0,1.1-0.2,1.5-0.6c0.4-0.3,0.6-0.8,0.6-1.3c0-0.6-0.2-1-0.5-1.3c-0.3-0.3-0.8-0.5-1.6-0.7h0V7.7c0.5,0.1,0.9,0.2,1.3,0.5l0.6-0.8c-0.6-0.4-1.3-0.7-2-0.7V6.2H9.8v0.5c-0.6,0-1.1,0.2-1.5,0.6C8,7.6,7.8,8.1,7.8,8.6c0,0.5,0.2,1,0.5,1.2c0.3,0.3,0.8,0.5,1.5,0.7v1.8c-0.5-0.1-1.1-0.3-1.6-0.8l-0.7,0.8c0.7,0.6,1.5,1,2.3,1V14L10.4,14L10.4,14zM10.4,10.7c0.4,0.1,0.6,0.2,0.8,0.3c0.1,0.2,0.2,0.3,0.2,0.5s-0.1,0.4-0.3,0.5c-0.2,0.2-0.4,0.2-0.7,0.3V10.7z M9.1,9C9,8.9,8.9,8.7,8.9,8.5C8.9,8.3,9,8.1,9.1,8c0.2-0.2,0.4-0.2,0.7-0.3v1.6C9.4,9.3,9.2,9.1,9.1,9z'/>
    </g>
  </svg>,
  <svg viewBox='0 0 20 20'>
    <g>
      <path d='M10.6,10.7H1c0,4.1,4.2,8.4,9,8.4c5,0,9-4,9-9c0-1.4-0.3-2.8-0.9-4L10.6,10.7z'/>
      <path d='M6.3,1.6c0.1,0.2,4.2,7.2,4.2,7.2l6.9-4C15,1.2,10.3-0.1,6.3,1.6z M15.3,4.5l-4.2,2.4c-0.9-1.5-1.9-3.3-2.6-4.5C9,2.3,9.5,2.3,10,2.3C12,2.3,13.9,3.1,15.3,4.5z'/>
      <path d='M5,2.4C2.6,4,1.2,6.6,1,9.3l8,0L5,2.4z M4.6,4.5l1.9,3.3l-3.9,0C3,6.6,3.7,5.5,4.6,4.5z'/>
    </g>
  </svg>,
  <svg viewBox='0 0 18 17.88'>
    <g>
    <path d='M15.74,10.51A7.12,7.12,0,0,1,2.46,12.2a2.74,2.74,0,0,1-.75.12A2.75,2.75,0,0,1,.39,12a8.93,8.93,0,0,0,17.22-1.63,2.61,2.61,0,0,1-1.87.17Z'/>
    <path d='M2,6.8A7.12,7.12,0,0,1,15,5.47a2.55,2.55,0,0,1,1.84-.36A8.93,8.93,0,0,0,0,7.37a2.75,2.75,0,0,1,1.71-.61Z'/>
    <path d='M1.71,11.11a1.56,1.56,0,0,0,1.3-.7H5.84L7,13.73a.91.91,0,0,0,.81.6h0a.9.9,0,0,0,.82-.53l2.87-6.24.45.72a.88.88,0,0,0,.78.42h2.3a1.57,1.57,0,1,0,.1-1.81H13.3L12.23,5.18a.91.91,0,0,0-1.59.1L8,11,7.33,9.19a.91.91,0,0,0-.85-.6H2.95a1.56,1.56,0,1,0-1.24,2.51Z'/>
    </g>
  </svg>,
  /*<svg viewBox='0 0 20 20'>
  <g>
    <g>
      <path d='M3.3,7.8C2,7.8,1,8.8,1,10s1,2.3,2.3,2.3s2.3-1,2.3-2.3S4.5,7.8,3.3,7.8z M16.8,7.8c-1.2,0-2.3,1-2.3,2.3s1,2.3,2.3,2.3s2.3-1,2.3-2.3S18,7.8,16.8,7.8z M10,7.8c-1.2,0-2.3,1-2.3,2.3s1,2.3,2.3,2.3s2.3-1,2.3-2.3S11.2,7.8,10,7.8z'/>
    </g>
  </g>
  </svg>,*/
]

type Prop = {
  folded: boolean
  activeIndex: number
  onChange: (folded: boolean, index: number) => void
  height: number
  width: number
}

type State = {
  popUpOprList?: boolean
  isSymbolAdded?: boolean
}

export default class Sidebar extends React.Component<Prop, State> {
  public static contextTypes = {
    chartLayout: React.PropTypes.instanceOf(ChartLayoutModel),
  }

  public context: { chartLayout: ChartLayoutModel }

  private _chartLayout: ChartLayoutModel
  private _pollManager: PollManager
  private _data: PollData = {}

  constructor (props: Prop, context: { chartLayout: ChartLayoutModel }) {
    super(props, context)
    this._chartLayout = context.chartLayout
    this.state = {
      popUpOprList: false,
    }
    this.onDataHandler = this.onDataHandler.bind(this)
    this.switchTabPage = this.switchTabPage.bind(this)
    this.symbolChangeHandler = this.symbolChangeHandler.bind(this)
    this.foldingBtnClickHandler = this.foldingBtnClickHandler.bind(this)
    this.showMoreOprHandler = this.showMoreOprHandler.bind(this)
    this.clickOprHandler = this.clickOprHandler.bind(this)
    this.hideOprListHandler = this.hideOprListHandler.bind(this)
  }

  public shouldComponentUpdate (nextProps: Prop, nextState: State) {
    return !_.isEqual(this.props, nextProps) ||
           !_.isEqual(this.state, nextState)
  }

  public componentDidMount () {
    const chartLayout = this._chartLayout
    const symbolInfo = chartLayout.mainDatasource.symbolInfo

    this._pollManager = new PollManager(symbolInfo, this.props.activeIndex)
    this._pollManager.addListener('data', this.onDataHandler)
    chartLayout.addListener('symbol_change', this.symbolChangeHandler)
    document.addEventListener('mousedown', this.hideOprListHandler)
    document.addEventListener('touchstart', this.hideOprListHandler)
    this._pollManager.start()
  }

  public componentWillUnmount () {
    const chartLayout = this._chartLayout
    this._pollManager.removeListener('data', this.onDataHandler)
    chartLayout.removeListener('symbol_change', this.symbolChangeHandler)
    document.removeEventListener('mousedown', this.hideOprListHandler)
    document.removeEventListener('touchstart', this.hideOprListHandler)
    this._pollManager.stop()
    this._pollManager = null
  }

  public componentWillReceiveProps (nextProps: Prop) {
    const newIndex = nextProps.activeIndex
    if (!nextProps.folded && this.props.activeIndex !== newIndex) {
      this._pollManager.tabIndex = newIndex
    }
  }

  public render () {
    const chartLayout = this._chartLayout
    const height = this.props.height - STOCK_PANEL_HEIGHT
    const {
      stockInfo,
      capitalFlowInfo,
      realtimeTools,
      indexesInfo,
      financingInfo,
      plates,
      nonRealtimeTools,
      analysisData,
    } = this._data

    let tabPage = null

    switch (this.props.activeIndex) {
      case 0:
        tabPage = stockInfo ?
                  <Realtime
                    stockInfo={stockInfo}
                    capitalFlowInfo={capitalFlowInfo}
                    height={height} /> : null
        break
      case 1:
        tabPage = realtimeTools && indexesInfo ?
                  <Market
                    height={height}
                    realtimeTools={realtimeTools}
                    indexesInfo={indexesInfo}
                    nonRealtimeTools={nonRealtimeTools} /> : null
        break
      case 2:
        tabPage = <Financing
                    height={height}
                    financingInfo={financingInfo} />
        break
      case 3:
        tabPage = <Plates
                    height={height}
                    plates={plates} />
        break
      case 4:
        tabPage = <Analyze
                    height={height}
                    stockInfo={stockInfo}
                    analysisData={analysisData} />
      default:
    }

    return <div className={`chart-sidebar ${this.props.folded ? 'folded' : ''}`} style={ {
      height: this.props.height,
      width: this.props.width,
    } }>
      {
        !this.props.folded && stockInfo ?
        <Briefing
          symbolInfo={chartLayout.mainDatasource.symbolInfo}
          stockInfo={stockInfo} /> : null
      }
      <div className='data-window-tabs'>
        <ul className='tab-list'>
          <a href='javascript:;'
             className='btn btn-more'
             onClick={this.showMoreOprHandler}>
            <i></i>
          </a>
          {
            this.state.popUpOprList ?
            <ul className='popup-menu'
                onMouseDown={this.clickOprHandler}
                onTouchStart={this.clickOprHandler}>
              {
                this.state.isSymbolAdded ?
                <li data-opr='delete-self-select'>删除自选股</li> :
                <li data-opr='add-self-select'>加入自选股</li>
              }
            </ul> : null
          }
          {
            tabsConfig.map((tab, i) =>
              <li key={i}
                  className={!this.props.folded && this.props.activeIndex === i ? `active` : ''}
                  title={tab}
                  data-index={i}
                  onClick={this.switchTabPage}>
                {tabsIcon[i]}
              </li>
            )
          }
        </ul>
        <div className='data-page-list'>
          { !this.props.folded && tabPage ? tabPage : null }
        </div>
      </div>
      <a href='javascript:;'
         className={`sidebar-folding-btn ${this.props.folded ? 'folded' : ''}`}
         onClick={this.foldingBtnClickHandler}>
        <span></span>
      </a>
    </div>
  }

  private onDataHandler (data) {
    this._data = data
    this.forceUpdate()
  }

  private foldingBtnClickHandler () {
    const chartLayout = this._chartLayout
    const folded = !this.props.folded
    chartLayout.saveToLS('qchart.sidebar.folded', folded)
    if (this.props.onChange) {
      this.props.onChange(folded, this.props.activeIndex)
    }
  }

  private showMoreOprHandler () {
    const chartLayout = this._chartLayout
    const symbolInfo = chartLayout.mainDatasource.symbolInfo
    const selfSelectList = chartLayout.readFromLS('qchart.selfselectlist') || []
    this.setState({ popUpOprList: true, isSymbolAdded: _.findIndex(selfSelectList, { symbol: symbolInfo.symbol }) !== -1 })
  }

  private hideOprListHandler (ev) {
    if (this.state.popUpOprList) {
      if (!!ev.touches) {
        ev.preventDefault()
      }
      this.setState({ popUpOprList: false })
    }
  }

  private clickOprHandler (ev) {
    const opr = ev.target.dataset.opr
    const chartLayout = this._chartLayout
    const symbolInfo = chartLayout.mainDatasource.symbolInfo

    if (opr === 'add-self-select') {
      chartLayout.addSelfSelect(symbolInfo)
    } else if (opr === 'delete-self-select') {
      chartLayout.deleteSelfSelect(symbolInfo)
    }
  }

  private switchTabPage (ev) {
    const newIndex = +ev.currentTarget.dataset.index
    const folded = this.props.folded

    // 如果已经激活的tab再次点击，则收起侧边栏
    if (!folded && this.props.activeIndex === newIndex) {
      this.foldingBtnClickHandler()
      return
    }

    if (this.props.onChange) {
      this.props.onChange(false, newIndex)
      this._chartLayout.saveToLS('qchart.sidebar.folded', false)
      this._chartLayout.saveToLS('qchart.sidebar.activeIndex', newIndex)}
  }

  private symbolChangeHandler (symbolInfo) {
    this._pollManager.symbolInfo = symbolInfo
    this._pollManager.restart()
  }
}
