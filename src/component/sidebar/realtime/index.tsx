import './index.less'
import * as React from 'react'
import BidList from './bidlist'
import StockDetail from './stockdetail'
import TickList from './ticklist'
import CapitalFlow from './capitalflow'
import { StockInfo, CapitalFlowInfo } from '../pollmanager'

type Prop = {
  width: number
  height: number
  stockInfo: StockInfo
  capitalFlowInfo: CapitalFlowInfo
}

type State = {
  tabIndex: number
}

const TAB_HEIGHT = 35

export default class Realtime extends React.Component<Prop, State> {

  constructor () {
    super()
    this.state = {
      tabIndex: 0,
    }
  }

  public shouldComponentUpdate (nextProps: Prop, nextState: State) {
    const curProp = this.props
    const curState = this.state
    return curProp.stockInfo !== nextProps.stockInfo ||
      curProp.capitalFlowInfo !== nextProps.capitalFlowInfo ||
      curProp.width !== nextProps.width ||
      curProp.height !== nextProps.height ||
      curState.tabIndex !== nextState.tabIndex
  }

  public render () {
    const height = this.props.height
    const stockInfo = this.props.stockInfo
    const capitalFlowInfo = this.props.capitalFlowInfo
    const showBidList = stockInfo && stockInfo.selling && stockInfo.buying
    const showTab =  stockInfo && stockInfo.ticks.length

    let bidListHeightRatio = 0
    let stockDetailHeightRatio = 0
    let tabHeightRatio = 0

    if (showBidList) {
      if (showTab) {
        bidListHeightRatio = 0.3
        stockDetailHeightRatio = 0.25
        tabHeightRatio = 0.45
      } else {
        bidListHeightRatio = 0.5
        stockDetailHeightRatio = 0.5
      }
    } else {
      if (showTab) {
        stockDetailHeightRatio = 0.5
        tabHeightRatio = 0.5
      } else {
        stockDetailHeightRatio = 1
      }
    }

    return <div className='realtime-info'>
      {
        showBidList ?
        <BidList stockInfo={stockInfo} height={height * bidListHeightRatio} /> : null
      }

      <StockDetail stockInfo={stockInfo} height={height * stockDetailHeightRatio} /> : null

      {
        showTab ?
        <div className='tab-wrapper' style={ { height: height * tabHeightRatio + 'px' } }>
          <ul className='tab-btn-group'
            onClick={this.switchTabPage.bind(this)}
            onTouchStart={this.switchTabPage.bind(this)}>
            <li
              className={this.state.tabIndex === 0 ? 'on' : ''}
              data-index='0'>明细</li>
            <li
              className={this.state.tabIndex === 1 ? 'on' : ''}
              data-index='1'>资金</li>
          </ul>
          <div className='tab-container'>
          {
            this.state.tabIndex === 0 ?
            <TickList
              stockInfo={stockInfo}
              height={height * tabHeightRatio - TAB_HEIGHT} /> : null
          }
          {
            this.state.tabIndex === 1 ?
            <CapitalFlow
              capitalFlowInfo={capitalFlowInfo}
              height={height * tabHeightRatio - TAB_HEIGHT} /> : null
          }
          </div>
        </div> : null
      }
    </div>
  }

  private switchTabPage (ev) {
    const index = +ev.target.dataset.index
    this.setState({ tabIndex: index })
  }
}
