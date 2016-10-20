import './index.less'
import * as React from 'react'
import * as d3 from 'd3'
import StockInfo from '../stockinfo'
import ChartLayout from '../../../model/chartlayout'
import { getCapitalFlow } from '../../../datasource'

type Prop = {
  chartLayout: ChartLayout
  stockInfo: StockInfo
}

type State = {
  tabIndex: number
}

export default class Realtime extends React.Component<Prop, State> {

  constructor () {
    super()
    this.state = {
      tabIndex: 0,
    }
  }

  public render () {
    const stockInfo = this.props.stockInfo
    return <div>
      {
        stockInfo.selling && stockInfo.buying ?
        <div className='bid-list'>
          <div className='caption'>
            <b className='sold'>卖<br/><br/>盘</b>
            <b className='buy'>买<br/><br/>盘</b>
          </div>
          <div className='bid'>
            <table>
              <tbody>
                {
                  stockInfo.selling.map((item, i) =>
                    <tr>
                      <td width='33.33%'>{5 - i}</td>
                      <td width='33.33%' className={item[0] > stockInfo.preClose ? 'positive' : 'negtive'}>
                        {item[0]}
                      </td>
                      <td width='33.33%'>{item[1]}</td>
                    </tr>
                  )
                }
              </tbody>
            </table>
            <hr/>
            <table>
              <tbody>
                {
                  stockInfo.buying.map((item, i) =>
                    <tr>
                      <td width='33.33%'>{i + 1}</td>
                      <td width='33.33%' className={item[0] > stockInfo.preClose ? 'positive' : 'negtive'}>
                        {item[0]}
                      </td>
                      <td width='33.33%'>{item[1]}</td>
                    </tr>
                  )
                }
              </tbody>
            </table>
          </div>
        </div> : null
      }
      <div className='stock-info'>
        <table>
          <tr>
            <th width='67'>昨收</th>
            <td width='52'>{stockInfo.preClose}</td>
            <th width='67'>成交量</th>
            <td width='81'>
              {stockInfo.volume >= 10000 ? ~~stockInfo.volume / 10000 : ~~stockInfo.volume}
              {stockInfo.volume >= 10000 ? '亿手' : '万手'}
            </td>
          </tr>
          <tr>
            <th>今开</th>
            <td className={stockInfo.open > stockInfo.preClose ? 'positive' : 'negtive'}>
              {stockInfo.open}
            </td>
            <th>成交额</th>
            <td>
              {stockInfo.amount >= 10000 ? (stockInfo.amount / 10000).toFixed(2) : stockInfo.amount.toFixed(2)}
              {stockInfo.amount >= 10000 ? '万亿' : '亿'}
            </td>
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
            <th>换手率</th><td>{stockInfo.turnover ? stockInfo.turnover : '--'}%</td>
          </tr>
          <tr style={ {display: stockInfo.outVol && stockInfo.inVol ? '' : 'none'} }>
            <th>涨停</th><td className='positive'>{(stockInfo.preClose * 1.1).toFixed(2)}</td>
            <th>内盘</th><td>{stockInfo.inVol}</td>
          </tr>
          <tr>
            <th>跌停</th><td className='negtive'>{(stockInfo.preClose * 0.9).toFixed(2)}</td>
            <th>外盘</th><td>{stockInfo.outVol}</td>
          </tr>
        </table>
      </div>
      {
        stockInfo.ticks.length ?
        <div className='detailed-info'>
          <ul className='tab-btn-group' onClick={this.switchTabPage.bind(this)}>
            <li className={this.state.tabIndex === 0 ? 'on' : ''}>明细</li>
            <li className={this.state.tabIndex === 1 ? 'on' : ''}>资金</li>
          </ul>
          <ul className='tab-container'>
            <li className={this.state.tabIndex === 0 ? 'trans-entry on' : 'trans-entry'}>
              <table>
                <tbody>
                  {
                    stockInfo.ticks.map(tick =>
                      <tr>
                        <td width='34%'>
                          {tick.time.substring(0, 2)}:{tick.time.substring(2, 4)}:{tick.time.substring(4, 6)}
                        </td>
                        <td width='33%'>{tick.price}</td>
                        <td width='33%' className={tick.type === '1' ? 'positive' : tick.type === '2' ? 'negtive' : ''}>
                          {+tick.volume / 100}
                        </td>
                      </tr>
                    )
                  }
                </tbody>
              </table>
            </li>
            <li className={this.state.tabIndex === 1 ? 'in-out-chart on' : 'in-out-chart'}>
              <p>单位：万元</p>
              <div className='in-out-legend clearfix'>
                  <div className='color-desc-1'>
                      <div className='color-block'></div>
                      <p>散户流入</p>
                  </div>
                  <div className='color-desc-2'>
                      <div className='color-block'></div>
                      <p>主力流入</p>
                  </div>
                  <div className='color-desc-4'>
                      <div className='color-block'></div>
                      <p>散户流出</p>
                  </div>
                  <div className='color-desc-3'>
                      <div className='color-block'></div>
                      <p>主力流出</p>
                  </div>
              </div>
              <canvas ref='in_out_donut' width='248' height='128'></canvas>
              <div className='clearfix'>
                  <p className='capital-in'>流入<i className='capital-in-num'>1451</i></p>
                  <p className='capital-out'>流出<i className='capital-out-num'>1709</i></p>
              </div>
              <h3>最近5日主力流入</h3>
              <canvas ref='in_out_bar' width='248' height='128'></canvas>
            </li>
          </ul>
        </div> : null
      }
    </div>
  }

  private switchTabPage (ev) {
    const index = Array.prototype.slice.call(ev.currentTarget.children).indexOf(ev.target)
    this.state.tabIndex = index
    this.setState(this.state)
  }
}
