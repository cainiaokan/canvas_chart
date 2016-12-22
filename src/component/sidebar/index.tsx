import './index.less'
import * as React from 'react'
import ChartLayoutModel from '../../model/chartlayout'
import PollManager, { PollData } from './pollmanager'
import Realtime from './realtime'
import Indexes from './indexes'
import Financing from './financing'
import Plates from './plates'
import NonRealtime from './nonrealtime'

const STOCK_PANEL_HEIGHT = 76

type Prop = {
  chartLayout: ChartLayoutModel
  folded: boolean
  height: number
  width: number
}

type State = {
  tabIndex?: number
}

export default class Sidebar extends React.Component<Prop, State> {
  private _pollManager: PollManager
  private _data: PollData = {}

  constructor () {
    super()
    this.state = {
      tabIndex: 0,
    }
    this.symbolChangeHandler = this.symbolChangeHandler.bind(this)
  }

  public shouldComponentUpdate (nextProps: Prop, nextState: State) {
    const curProps = this.props
    return curProps.folded !== nextProps.folded ||
           curProps.height !== nextProps.height ||
           curProps.width !== nextProps.width ||
           this.state.tabIndex !== nextState.tabIndex
  }

  public componentDidMount () {
    const chartLayout = this.props.chartLayout
    const symbolInfo = chartLayout.mainDatasource.symbolInfo

    this._pollManager = new PollManager(symbolInfo)
    this._pollManager.on('data', data => {
      this._data = data
      this.forceUpdate()
    })
    this._pollManager.start()
    chartLayout.addListener('symbol_change', this.symbolChangeHandler)
  }

  public componentWillUnmount () {
    const chartLayout = this.props.chartLayout
    chartLayout.removeListener('symbol_change', this.symbolChangeHandler)
  }

  public render () {
    const tabsConfig = [
      ['realtime', '实时看盘'],
      ['index', '指数概况'],
      ['financing', '财务信息'],
      ['sector', '所属板块'],
      ['tools', '更多工具'],
    ]
    const chartLayout = this.props.chartLayout
    const symbolInfo = chartLayout.mainDatasource.symbolInfo

    const stockInfo = this._data.stockInfo
    const height = this.props.height - STOCK_PANEL_HEIGHT
    const width = this.props.width - 2

    let tabPage = null
    switch (this.state.tabIndex) {
      case 0:
        tabPage = <Realtime stockInfo={this._data.stockInfo}
                            capitalFlowInfo={this._data.capitalFlowInfo}
                            width={width}
                            height={height} />
        break
      case 1:
        tabPage = <Indexes chartLayout={chartLayout}
                           width={width}
                           height={height}
                           realtimeTools={this._data.realtimeTools}
                           indexesInfo={this._data.indexesInfo} />
        break
      case 2:
        tabPage = <Financing width={width}
                             height={height}
                             financingInfo={this._data.financingInfo} />
        break
      case 3:
        tabPage = <Plates width={width}
                          height={height}
                          plates={this._data.plates} />
        break
      case 4:
        tabPage = <NonRealtime width={width}
                               height={height}
                               nonRealtimeTools={this._data.nonRealtimeTools} />
        break
      default:
    }

    return <div className={`chart-sidebar ${this.props.folded ? 'folded' : ''}`} style={ {
      height: this.props.height,
      width: this.props.width,
    } }>
      {
        !this.props.folded && stockInfo ?
        <div className='stock-panel'>
          {
            +stockInfo.price !== 0 ?
            <div className={
              stockInfo.changePrice > 0 ? 'stock-data positive' :
                stockInfo.changePrice < 0 ? 'stock-data negtive' : 'stock-data'}>
              <span className='price'>{stockInfo.price}</span>
              <span>{stockInfo.changePrice > 0 ? '+' + stockInfo.changePrice : stockInfo.changePrice}</span>
              <span>
                {stockInfo.changeRate > 0 ?
                  '+' + (stockInfo.changeRate * 100).toFixed(2) + '%'
                  : (stockInfo.changeRate * 100).toFixed(2) + '%'}
              </span>
            </div> : <div className='stock-data'>
              <span>停牌</span>
            </div>
          }
          <div className='pressure-support'>
            <span className='pressure'>
              <label>今日压力</label>&nbsp;
              <b>{stockInfo.pressure.toFixed(2)}</b>
            </span>
            <span className='support'>
              <label>今日支撑</label>&nbsp;
              <b>{stockInfo.support.toFixed(2)}</b>
            </span>
          </div>
        </div> :
        <div className='stock-title'>
          {!!symbolInfo ? symbolInfo.description : '加载中'}
        </div>
      }
      <div className='data-window-tabs'>
        <ul className='tab-list' onClick={this.switchTabPage.bind(this)}>
          {
            tabsConfig.map((tab, i) =>
              <li className={!this.props.folded && this.state.tabIndex === i ? `${tab[0]} active` : tab[0]}
                title={tab[1]}
                data-index={i}></li>
            )
          }
        </ul>
        <div className='data-page-list'>
          { tabPage }
        </div>
      </div>
      <a href='javascript:;' className={`sidebar-folding-btn ${this.props.folded ? 'folded' : ''}`}
        onClick={this.foldingBtnClickHandler.bind(this)}></a>
    </div>
  }

  private foldingBtnClickHandler () {
    this.props.chartLayout.emit('sidebar_toggle', !this.props.folded)
  }

  private switchTabPage (ev) {
    if (ev.target.tagName.toUpperCase() !== 'LI') {
      return
    }
    // 如果侧边栏已经收起状态，则先展开侧边栏
    if (this.props.folded) {
      this.foldingBtnClickHandler()
    }

    // 如果已经激活的tab再次点击，则收起侧边栏
    if (ev.target.classList.contains('active')) {
      this.foldingBtnClickHandler()
      return
    }

    const index = +ev.target.dataset.index
    this._pollManager.tabIndex = index
    this.setState({
      tabIndex: index,
    })
  }

  private symbolChangeHandler (symbolInfo) {
    this._pollManager.symbolInfo = symbolInfo
    this._pollManager.restart()
  }
}
