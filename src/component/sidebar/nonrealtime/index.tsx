import './index.less'
import * as React from 'react'
import { NonRealtimeTools } from '../pollmanager'

type Prop = {
  nonRealtimeTools: NonRealtimeTools
}

export default class NonRealtime extends React.Component<Prop, any> {
  public render () {
    const nonRealtimeTools = this.props.nonRealtimeTools
    return <div className='non-realtime'>
      <h3>非实时工具</h3>
      {
        nonRealtimeTools ? <table>
          <tbody>
            <tr>
              <td width='130'>上证压力支撑</td>
              <td width='137'>
                <span className='positive'>{nonRealtimeTools.pressure}</span>/
                <span className='negtive'>{nonRealtimeTools.support}</span></td>
            </tr>
            <tr>
              <td>央行资金</td>
              <td className={nonRealtimeTools.bankCapital[1] === 'red' ? 'positive' : 'negtive'}>
                {nonRealtimeTools.bankCapital[0]}
              </td>
            </tr>
            <tr>
              <td>解禁市值</td>
              <td className='negtive'>{nonRealtimeTools.liftBanCapitalisation}</td>
            </tr>
            <tr>
              <td>融资余额</td>
              <td className='financing-balance'>
                {nonRealtimeTools.financingBalance}&nbsp;
                <span className={nonRealtimeTools.financingBalanceChange[1] === 'red' ? 'positive' : 'negtive'}>
                  {nonRealtimeTools.financingBalanceChange[0]}
                </span>
              </td>
            </tr>
            <tr>
              <td>机构资金</td>
              <td className={nonRealtimeTools.institutionCapital[1] === 'red' ? 'positive' : 'negtive'}>
                {nonRealtimeTools.institutionCapital[0]}
              </td>
            </tr>
            <tr>
              <td>投资者资金</td>
              <td className={nonRealtimeTools.investerCapital[1] === 'red' ? 'positive' : 'negtive'}>
                {nonRealtimeTools.investerCapital[0]}
              </td>
            </tr>
            <tr>
              <td>新增投资者</td>
              <td className='positive'>{nonRealtimeTools.newInvester}</td>
            </tr>
            <tr>
              <td>交易投资者</td>
              <td className='positive'>{nonRealtimeTools.tradingInvester}</td>
            </tr>
            <tr>
              <td>搜索人气</td>
              <td className='positive'>{nonRealtimeTools.searchSentiment}</td>
            </tr>
            <tr>
              <td>股吧人气</td>
              <td className='positive'>{nonRealtimeTools.stockForumSentiment}</td>
            </tr>
          </tbody>
        </table> : null
      }
    </div>
  }
}
