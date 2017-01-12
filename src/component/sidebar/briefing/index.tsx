import './index.less'
import * as React from 'react'
import { SymbolInfo } from '../../../datasource'
import { StockInfo } from '../pollmanager'

type Prop = {
  stockInfo: StockInfo
  symbolInfo: SymbolInfo
}

export default class Briefing extends React.Component<Prop, any> {

  public shouldComponentUpdate (nextProps: Prop, nextState: any) {
    const curProp = this.props
    return curProp.stockInfo !== nextProps.stockInfo
  }

  public render () {
    const stockInfo = this.props.stockInfo
    const price = +stockInfo.price
    const changePrice = +stockInfo.changePrice
    const changeRate = +stockInfo.changeRate

    return <div className='chart-sidebar-briefing'>
      {
        price !== 0 ?
        <div className={
          changePrice > 0 ? 'stock-data positive' :
            changePrice < 0 ? 'stock-data negtive' : 'stock-data'}>
          <span className='price'>
            {price.toFixed(2)}
            {
              changePrice !== 0 ?
              <svg viewBox='0 0 10 12'>
              <g>
                <path d='M9.6,4.4c0.3,0.3,0.3,0.8,0,1.1C9.5,5.7,9.3,5.7,9.1,5.7S8.7,5.7,8.5,5.5L5.7,2.7v8.5c0,0.4-0.4,0.8-0.8,0.8c-0.4,0-0.8-0.4-0.8-0.8V2.7L1.4,5.5c-0.3,0.3-0.8,0.3-1.1,0s-0.3-0.8,0-1.1l4.1-4.1C4.5,0.1,4.7,0,4.9,0c0.2,0,0.4,0.1,0.6,0.2L9.6,4.4z'/>
              </g>
              </svg> : null
            }
          </span>
          &nbsp;&nbsp;{changePrice > 0 ? '+' + changePrice.toFixed(2) : changePrice.toFixed(2)}
          &nbsp;&nbsp;({changeRate > 0 ? '+' + (changeRate * 100).toFixed(2) + '%'
            : (changeRate * 100).toFixed(2) + '%'})
        </div> : <div className='stock-data'>
          <span className='price'>停牌</span>
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
    </div>
  }
}
