import './index.less'
import * as React from 'react'
import IScroll = require('iscroll')
import { StockInfo } from '../../pollmanager'

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
              <th width='67'>昨收</th>
              <td width='52'>{stockInfo ? stockInfo.preClose : '--'}</td>
              <th width='67'>成交量</th>
              <td width='81'>
                {stockInfo ? (stockInfo.volume >= 10000 ? ~~stockInfo.volume / 10000 : ~~stockInfo.volume) : '--'}
                {stockInfo ? (stockInfo.volume >= 10000 ? '亿手' : '万手') : '--'}
              </td>
            </tr>
            <tr>
              <th>今开</th>
              <td className={stockInfo ? (stockInfo.open > stockInfo.preClose ? 'positive' : 'negtive') : ''}>
                {stockInfo ? stockInfo.open : '--'}
              </td>
              <th>成交额</th>
              <td>
                {
                  stockInfo ?
                    (stockInfo.amount >= 10000 ?
                      (stockInfo.amount / 10000).toFixed(2)
                      : stockInfo.amount.toFixed(2))
                  :'--'
                }
                {stockInfo ? (stockInfo.amount >= 10000 ? '万亿' : '亿') : '--'}
              </td>
            </tr>
            <tr>
              <th>最高</th>
              <td className={stockInfo ? (stockInfo.high > stockInfo.preClose ? 'positive' : 'negtive') : ''}>
                {stockInfo ? stockInfo.high : '--'}
              </td>
              <th>振幅</th><td>{stockInfo ? stockInfo.amplitude : '--'}%</td>
            </tr>
            <tr>
              <th>最低</th>
              <td className={stockInfo ? (stockInfo.low > stockInfo.preClose ? 'positive' : 'negtive') : ''}>
                {stockInfo ? stockInfo.low : '--'}
              </td>
              <th>换手率</th>
              <td>{stockInfo && stockInfo.turnover ? stockInfo.turnover + '%' : '--'}</td>
            </tr>
            <tr>
              <th>涨停</th><td className='positive'>{stockInfo ? (stockInfo.preClose * 1.1).toFixed(2) : '--'}</td>
              <th>内盘</th><td className='positive'>{stockInfo && stockInfo.inVol ? stockInfo.inVol : '--'}</td>
            </tr>
            <tr>
              <th>跌停</th><td className='negtive'>{stockInfo ? (stockInfo.preClose * 0.9).toFixed(2) : '--'}</td>
              <th>外盘</th><td className='negtive'>{stockInfo && stockInfo.outVol ? stockInfo.outVol : '--'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}
