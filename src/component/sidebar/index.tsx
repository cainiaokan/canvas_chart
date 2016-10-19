import './index.less'
import * as _ from 'underscore'
import * as React from 'react'
import ChartLayoutModel from '../../model/chartlayout'
import Realtime from './realtime'
import { StockDatasource, getStockInfo } from '../../datasource'
import StockInfo from './stockinfo'

type Prop = {
  chartLayout: ChartLayoutModel
  height: number
  width: number
}

type State = {
  sidebarFolded: boolean
  tabIndex: number
  stockInfo: StockInfo
}

export default class Sidebar extends React.Component<Prop, State> {
  public refs: {
    [propName: string]: any
    dataPageList: HTMLElement
    container: HTMLElement
    foldingBtn: HTMLElement
  }

  constructor () {
    super()
    this.pollStockInfo = this.pollStockInfo.bind(this)
    this.state = {
      sidebarFolded: false,
      stockInfo: new StockInfo(),
      tabIndex: 0,
    }
  }

  public componentDidMount () {
    this.pollStockInfo()
  }

  public render () {
    const tabsConfig = [
      ['realtime', '实时看盘'],
      ['index', '指数概况'],
      ['financing', '财务信息'],
      ['sector', '所属板块'],
      ['tools', '更多工具'],
    ]
    let tabPage = null
    switch (this.state.tabIndex) {
      case 0:
        tabPage = <Realtime stockInfo={this.state.stockInfo} />
        break
      case 1:
        tabPage = <Realtime stockInfo={this.state.stockInfo} />
        break
      case 2:
        tabPage = <Realtime stockInfo={this.state.stockInfo} />
        break
      case 3:
        tabPage = <Realtime stockInfo={this.state.stockInfo} />
        break
      case 4:
        tabPage = <Realtime stockInfo={this.state.stockInfo} />
        break
      default:
    }
    const stockInfo = this.state.stockInfo
    return <div className='chart-sidebar' ref='container' style={ {
      height: this.props.height,
      width: this.props.width,
    } }>
      {
        !this.state.sidebarFolded ?
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
              <b>16.74</b>
            </span>
            <span className='support'>
              <label>今日支撑</label>&nbsp;
              <b>15.54</b>
            </span>
          </div>
        </div> : <div className='stock-title'>上证指数</div>
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

  private pollStockInfo () {
    getStockInfo((this.props.chartLayout.mainDatasource as StockDatasource).symbol)
      .then(response =>
        response.json()
          .then(data => {
            const ds = data.data.stock_info
            const dp = data.data.pressure
            const stockInfo = this.state.stockInfo

            stockInfo.open = ds.open
            stockInfo.high = ds.high
            stockInfo.low = ds.low
            stockInfo.preClose = ds.preclose
            stockInfo.price = ds.price
            stockInfo.changeRate = ds.p_change
            stockInfo.changePrice = ds.price_change
            stockInfo.amount = ds.amount
            stockInfo.volume = ds.volume
            stockInfo.turnover = ds.turnover
            stockInfo.amplitude = ds.zf
            stockInfo.inVol = ds.invol
            stockInfo.outVol = ds.outvol
            stockInfo.selling = [
              [ds.a1_p, ds.a1_v],
              [ds.a2_p, ds.a2_v],
              [ds.a3_p, ds.a3_v],
              [ds.a4_p, ds.a4_v],
              [ds.a5_p, ds.a5_v],
            ]
            stockInfo.buying = [
              [ds.b1_p, ds.b1_v],
              [ds.b2_p, ds.b2_v],
              [ds.b3_p, ds.b3_v],
              [ds.b4_p, ds.b4_v],
              [ds.b5_p, ds.b5_v],
            ]
            stockInfo.pressure = +dp.upper_price
            stockInfo.support = +dp.lower_price

            this.setState(this.state)
            setTimeout(this.pollStockInfo, data.data.reflush_time * 1000)
          })
      )
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
  }
}
