import './index.less'
import * as React from 'react'
import ChartLayoutModel from '../../model/chartlayout'
import { StockDatasource } from '../../datasource'
import PollManager, { PollData } from './pollmanager'
import Realtime from './realtime'
import Indexes from './indexes'

type Prop = {
  chartLayout: ChartLayoutModel
  height: number
  width: number
}

type State = {
  sidebarFolded: boolean
  tabIndex: number
}

export default class Sidebar extends React.Component<Prop, State> {
  public refs: {
    [propName: string]: any
    dataPageList: HTMLElement
    container: HTMLElement
    foldingBtn: HTMLElement
  }

  private _pollManager: PollManager
  private _data: PollData = {}

  constructor () {
    super()
    this.state = {
      sidebarFolded: false,
      tabIndex: 0,
    }
  }

  public componentDidMount () {
    const datasource = this.props.chartLayout.mainDatasource as StockDatasource
    this._pollManager = new PollManager(datasource.symbolInfo.symbol, 0)
    this._pollManager.start()
    this._pollManager.on('data', data => {
      this._data = data
      this.setState(this.state)
    })
    this.props.chartLayout.on('symbolchange', () => {
      this._pollManager.restart()
    })
  }

  public render () {
    const tabsConfig = [
      ['realtime', '实时看盘'],
      ['index', '指数概况'],
      ['financing', '财务信息'],
      ['sector', '所属板块'],
      ['tools', '更多工具'],
    ]
    const stockInfo = this._data.stockInfo
    const chartLayout = this.props.chartLayout

    let tabPage = null
    switch (this.state.tabIndex) {
      case 0:
        tabPage =
          this._data.stockInfo ?
          <Realtime
            chartLayout={this.props.chartLayout}
            stockInfo={this._data.stockInfo}
            capitalFlowInfo={this._data.capitalFlowInfo} /> : null
        break
      case 1:
        tabPage = <Indexes realtimeTools={this._data.realtimeTools} indexesInfo={this._data.indexesInfo}/>
        break
      // case 2:
      //   tabPage = <Realtime chartLayout={this.props.chartLayout} stockInfo={this._data.stockInfo} />
      //   break
      // case 3:
      //   tabPage = <Realtime chartLayout={this.props.chartLayout} stockInfo={this._data.stockInfo} />
      //   break
      // case 4:
      //   tabPage = <Realtime chartLayout={this.props.chartLayout} stockInfo={this._data.stockInfo} />
      //   break
      default:
    }

    return <div className='chart-sidebar' ref='container' style={ {
      height: this.props.height,
      width: this.props.width,
    } }>
      {
        !this.state.sidebarFolded && stockInfo ?
        <div className='stock-panel'>
          <div className='stock-data'>
            <span className={stockInfo.changePrice > 0 ? 'price positive' : 'price negtive'}>
              {stockInfo.price}
            </span>
            <span className={stockInfo.changePrice > 0 ? 'positive' : 'negtive'}>
              {stockInfo.changePrice > 0 ? '+' + stockInfo.changePrice : stockInfo.changePrice}
            </span>
            <span className={stockInfo.changeRate > 0 ? 'positive' : 'negtive'}>
              {stockInfo.changeRate > 0 ?
                '+' + (stockInfo.changeRate * 100).toFixed(2) + '%'
                : (stockInfo.changeRate * 100).toFixed(2) + '%'}
            </span>
          </div>
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
        <div className='stock-title'>{(chartLayout.mainDatasource as StockDatasource).symbolInfo.description}</div>
      }
      <div className='data-window-tabs'>
        <ul className='tab-list' onClick={this.switchTabPage.bind(this)}>
          {
            tabsConfig.map((tab, i) =>
              <li
                className={!this.state.sidebarFolded && this.state.tabIndex === i ? `${tab[0]} active` : tab[0]}
                title={tab[1]}></li>
            )
          }
        </ul>
        <div className='data-page-list' ref='dataPageList'>
          { tabPage }
        </div>
      </div>
      <a href='javascript:;' ref='foldingBtn' className='sidebar-folding-btn'
        onClick={this.foldingBtnClickHandler.bind(this)}></a>
    </div>
  }

  private foldingBtnClickHandler () {
    if (this.refs.foldingBtn.classList.contains('folded')) {
      this.refs.foldingBtn.classList.remove('folded')
      this.props.chartLayout.emit('sidebarchange', 'unfold')
      this.refs.container.classList.remove('folded')
      this.state.sidebarFolded = false
      this.setState(this.state)
    } else {
      this.refs.foldingBtn.classList.add('folded')
      this.props.chartLayout.emit('sidebarchange', 'fold')
      this.refs.container.classList.add('folded')
      this.state.sidebarFolded = true
      this.setState(this.state)
    }
  }

  private switchTabPage (ev) {
    // 如果侧边栏已经收起状态，则先展开侧边栏
    if (this.refs.container.classList.contains('folded')) {
      this.foldingBtnClickHandler()
    }

    // 如果已经激活的tab再次点击，则收起侧边栏
    if (ev.target.classList.contains('active')) {
      this.foldingBtnClickHandler()
      return
    }

    const index = Array.prototype.slice.call(ev.currentTarget.children).indexOf(ev.target)
    this.state.tabIndex = index
    this.setState(this.state)
    this._pollManager.tabIndex = index
  }
}
