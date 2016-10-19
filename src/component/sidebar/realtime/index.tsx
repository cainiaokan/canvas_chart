import './index.less'
import * as React from 'react'
import StockInfo from '../stockinfo'

type Prop = {
  stockInfo: StockInfo
}

type State = {
  tabIndex: number
}

export default class Realtime extends React.Component<Prop, State> {

  public refs: {
    [propName: string]: any
  }

  constructor () {
    super()
    this.state = {
      tabIndex: 0,
    }
  }

  public render () {
    return <div>
      <div className='bid-list'>
        <div className='caption'>
          <b className='sold'>卖<br/><br/>盘</b>
          <b className='buy'>买<br/><br/>盘</b>
        </div>
        <div className='bid'>
          <table>
            <tr>
              <td width='33.33%'>5</td>
              <td width='33.33%'>11.73</td>
              <td width='33.33%'>145</td>
            </tr>
            <tr><td>5</td><td>11.73</td><td>145</td></tr>
            <tr><td>5</td><td>11.73</td><td>145</td></tr>
            <tr><td>5</td><td>11.73</td><td>145</td></tr>
            <tr><td>5</td><td>11.73</td><td>145</td></tr>
          </table>
          <hr/>
          <table>
          <tr>
              <td width='33.33%'>5</td>
              <td width='33.33%'>11.73</td>
              <td width='33.33%'>145</td>
            </tr>
            <tr><td>5</td><td>11.73</td><td>145</td></tr>
            <tr><td>5</td><td>11.73</td><td>145</td></tr>
            <tr><td>5</td><td>11.73</td><td>145</td></tr>
            <tr><td>5</td><td>11.73</td><td>145</td></tr>
          </table>
        </div>
      </div>
      <div className='stock-info'>
        <table>
          <tr><th width='67'>昨收</th><td width='52'>14.12</td><th width='67'>成交量</th><td width='81'>1万手</td></tr>
          <tr><th>今开</th><td>14.08</td><th>成交额</th><td>0.20亿</td></tr>
          <tr><th>最高</th><td>14.24</td><th>涨跌幅</th><td>2.55%</td></tr>
          <tr><th>最低</th><td>13.88</td><th>换手率</th><td>0.28%</td></tr>
          <tr><th>涨停</th><td>15.53</td><th>内盘</th><td>9175</td></tr>
          <tr><th>跌停</th><td>12.71</td><th>外盘</th><td>5506</td></tr>
        </table>
      </div>
      <div className='detailed-info'>
        <ul className='tab-btn-group' onClick={this.switchTabPage.bind(this)}>
          <li className={this.state.tabIndex === 0 ? 'on' : ''}>明细</li>
          <li className={this.state.tabIndex === 1 ? 'on' : ''}>资金</li>
        </ul>
        <ul className='tab-container'>
          <li className={this.state.tabIndex === 0 ? 'trans-entry on' : 'trans-entry'}>
            <table>
              <tr><td width='34%'>11:29:55</td><td width='33%'>16.73</td><td width='33%'>15</td></tr>
              <tr><td>11:29:55</td><td>16.73</td><td>15</td></tr>
              <tr><td>11:29:55</td><td>16.73</td><td>15</td></tr>
              <tr><td>11:29:55</td><td>16.73</td><td>15</td></tr>
              <tr><td>11:29:55</td><td>16.73</td><td>15</td></tr>
              <tr><td>11:29:55</td><td>16.73</td><td>15</td></tr>
              <tr><td>11:29:55</td><td>16.73</td><td>15</td></tr>
              <tr><td>11:29:55</td><td>16.73</td><td>15</td></tr>
              <tr><td>11:29:55</td><td>16.73</td><td>15</td></tr>
              <tr><td>11:29:55</td><td>16.73</td><td>15</td></tr>
              <tr><td>11:29:55</td><td>16.73</td><td>15</td></tr>
              <tr><td>11:29:55</td><td>16.73</td><td>15</td></tr>
              <tr><td>11:29:55</td><td>16.73</td><td>15</td></tr>
              <tr><td>11:29:55</td><td>16.73</td><td>15</td></tr>
              <tr><td>11:29:55</td><td>16.73</td><td>15</td></tr>
              <tr><td>11:29:55</td><td>16.73</td><td>15</td></tr>
              <tr><td>11:29:55</td><td>16.73</td><td>15</td></tr>
              <tr><td>11:29:55</td><td>16.73</td><td>15</td></tr>
              <tr><td>11:29:55</td><td>16.73</td><td>15</td></tr>
              <tr><td>11:29:55</td><td>16.73</td><td>15</td></tr>
            </table>
          </li>
          <li className={this.state.tabIndex === 1 ? 'in-out-chart on' : 'in-out-chart'}></li>
        </ul>
      </div>
    </div>
  }

  private switchTabPage (ev) {
    const index = Array.prototype.slice.call(ev.currentTarget.children).indexOf(ev.target)
    this.state.tabIndex = index
    this.setState(this.state)
  }
}
