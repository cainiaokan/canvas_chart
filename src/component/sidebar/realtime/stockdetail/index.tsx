import './index.less'
import * as React from 'react'
import IScroll = require('iscroll')
import { StockInfo } from '../../pollmanager'
import { formatNumber } from '../../../../util'

type Prop = {
  maxHeight: number
  stockInfo: StockInfo
}

export default class StockDetail extends React.Component<Prop, any> {

  public refs: {
    container: HTMLDivElement
  }

  private _stockInfoScroll

  public shouldComponentUpdate (nextProps: Prop) {
    const curProp = this.props
    return curProp.stockInfo !== nextProps.stockInfo ||
      curProp.maxHeight !== nextProps.maxHeight
  }

  public componentDidMount () {
    this._stockInfoScroll = new IScroll(this.refs.container, {
      mouseWheel: true,
      scrollbars: true,
      fadeScrollbars: true,
    })
  }

  public componentDidUpdate () {
    this._stockInfoScroll.refresh()
  }

  public componentWillUnmount () {
    this._stockInfoScroll.destroy()
    this._stockInfoScroll = null
  }

  public render () {
    const stockInfo = this.props.stockInfo
    return (
      <div className='chart-stock-detail'
           ref='container'
           style={ { maxHeight: this.props.maxHeight + 'px' } }>
        <table>
          <tbody>
            <tr>
              <th style={ {width: '42px'} }>昨收</th>
              <td style={ {width: '76px'} }>{stockInfo.preClose}</td>
              <th style={ {width: '46px'} }>成交量</th>
              <td style={ {width: '74px'} }>{formatNumber(stockInfo.volume * 1e4, 2)}手</td>
            </tr>
            <tr>
              <th>今开</th>
              <td className={stockInfo.open > stockInfo.preClose ? 'positive' : 'negtive'}>
                {stockInfo.open}
              </td>
              <th>成交额</th>
              <td>{formatNumber(stockInfo.amount, 2)}</td>
            </tr>
            <tr>
              <th>最高</th>
              <td className={stockInfo.high > stockInfo.preClose ? 'positive' : 'negtive'}>
                {stockInfo.high}
              </td>
              <th>振幅</th><td>{stockInfo.amplitude}%</td>
            </tr>
            <tr>
              <th>最低</th>
              <td className={stockInfo.low > stockInfo.preClose ? 'positive' : 'negtive'}>
                {stockInfo.low}
              </td>
              <th>换手率</th>
              <td>{stockInfo.turnover ? stockInfo.turnover + '%' : '--'}</td>
            </tr>
            <tr>
              <th>涨停</th><td className='positive'>{(stockInfo.preClose * 1.1).toFixed(2)}</td>
              <th>内盘</th><td className='positive'>{stockInfo.inVol ? stockInfo.inVol : '--'}</td>
            </tr>
            <tr>
              <th>跌停</th><td className='negtive'>{(stockInfo.preClose * 0.9).toFixed(2)}</td>
              <th>外盘</th><td className='negtive'>{stockInfo.outVol ? stockInfo.outVol : '--'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}
