import './index.less'
import * as React from 'react'
import { IndexesInfo, RealtimeTools } from '../pollmanager'

type Prop = {
  indexesInfo: IndexesInfo
  realtimeTools: RealtimeTools
}

export default class Indexes extends React.Component<Prop, any> {
  public render () {
    const indexesInfo = this.props.indexesInfo
    const realtimeTools = this.props.realtimeTools
    return <div className='indexes'>
      {
        indexesInfo ? <div>
          <h3>股指</h3>
          <table className='indexes-display'>
            <tbody>
              <tr>
                <td width='54'>上证指数</td>
                <td width='62'>{indexesInfo.sh000001.price}</td>
                <td width='131' className={indexesInfo.sh000001.changeAmount > 0 ? 'positive' : 'negtive'}>
                  {(indexesInfo.sh000001.changeAmount > 0 ? '+' : '') + indexesInfo.sh000001.changeAmount}
                  ({(indexesInfo.sh000001.changeRate > 0 ? '+' : '') + indexesInfo.sh000001.changeRate}%)
                </td>
              </tr>
              <tr>
                <td>深证成指</td><td>{indexesInfo.sz399001.price}</td>
                <td className={indexesInfo.sz399001.changeAmount > 0 ? 'positive' : 'negtive'}>
                  {(indexesInfo.sz399001.changeAmount > 0 ? '+' : '') + indexesInfo.sz399001.changeAmount}
                  ({(indexesInfo.sz399001.changeRate > 0 ? '+' : '') + indexesInfo.sz399001.changeRate}%)
                </td>
              </tr>
              <tr>
                <td>沪深300</td><td>{indexesInfo.sz399300.price}</td>
                <td className={indexesInfo.sz399300.changeAmount > 0 ? 'positive' : 'negtive'}>
                  {(indexesInfo.sz399300.changeAmount > 0 ? '+' : '') + indexesInfo.sz399300.changeAmount}
                  ({(indexesInfo.sz399300.changeRate > 0 ? '+' : '') + indexesInfo.sz399300.changeRate}%)
                </td>
              </tr>
              <tr>
                <td>中小板指</td><td>{indexesInfo.sz399005.price}</td>
                <td className={indexesInfo.sz399005.changeAmount > 0 ? 'positive' : 'negtive'}>
                  {(indexesInfo.sz399005.changeAmount > 0 ? '+' : '') + indexesInfo.sz399005.changeAmount}
                  ({(indexesInfo.sz399005.changeRate > 0 ? '+' : '') + indexesInfo.sz399005.changeRate}%)
                </td>
              </tr>
              <tr>
                <td>创业板指</td><td>{indexesInfo.sz399006.price}</td>
                <td className={indexesInfo.sz399006.changeAmount > 0 ? 'positive' : 'negtive'}>
                  {(indexesInfo.sz399006.changeAmount > 0 ? '+' : '') + indexesInfo.sz399006.changeAmount}
                  ({(indexesInfo.sz399006.changeRate > 0 ? '+' : '') + indexesInfo.sz399006.changeRate}%)
                </td>
              </tr>
            </tbody>
          </table>
        </div> : null
      }
      {
        realtimeTools ? <div>
          <h3>实用工具</h3>
          <table className='realtime-tools'>
            <tr>
              <td width='147'>沪股通资金流入</td>
              <td width='100' className={realtimeTools.hugutong[1] === 'red' ? 'positive' : 'negtive'}>
                {realtimeTools.hugutong[0]}
              </td>
            </tr>
            <tr>
              <td>涨跌幅超过5%个股数</td>
              <td>
                <span className={'positive'}>
                  {realtimeTools.goUpStaying[0]}
                </span>/
                <span className='negtive'>
                  {realtimeTools.fallStaying[0]}
                </span>
              </td>
            </tr>
            <tr>
              <td>急涨急跌股数</td>
              <td className={realtimeTools.shortTermMove[1] === 'red' ? 'positive' : 'negtive'}>
                {realtimeTools.shortTermMove[0]}
              </td>
            </tr>
          </table>
        </div> : null
      }
    </div>
  }
}
