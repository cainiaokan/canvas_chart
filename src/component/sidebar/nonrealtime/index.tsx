import './index.less'
import '../../../style/table.less'
import * as React from 'react'
import IScroll = require('iscroll')
import { NonRealtimeTools } from '../pollmanager'

type Prop = {
  nonRealtimeTools: NonRealtimeTools
  height: number
}

export default class NonRealtime extends React.Component<Prop, any> {

  public refs: {
    nonrealtime: HTMLDivElement
  }

  private _nonrealtimeScroll

  public componentDidMount () {
    this._nonrealtimeScroll = new IScroll(this.refs.nonrealtime, {
      mouseWheel: true,
      scrollbars: true,
      fadeScrollbars: true,
    })
  }

  public componentWillUnmount () {
    this._nonrealtimeScroll.destroy()
    this._nonrealtimeScroll = null
  }

  public componentDidUpdate () {
    this._nonrealtimeScroll.refresh()
  }

  public shouldComponentUpdate (nextProps: Prop, nextState: any) {
    const curProp = this.props
    return curProp.nonRealtimeTools !== nextProps.nonRealtimeTools ||
      curProp.height !== nextProps.height
  }

  public render () {
    const nonRealtimeTools = this.props.nonRealtimeTools
    return <div className='chart-non-realtime-tool' ref='nonrealtime'  style={ {height: this.props.height + 'px'} }>
      <div>
        <h3>非实时工具</h3>
        {
          <table className='s-table stripe left-header'>
            <tbody>
              <tr>
                <th width='130'>上证压力支撑</th>
                <td width='137'>
                  <span className='positive'>{nonRealtimeTools.pressure}</span>/
                  <span className='negtive'>{nonRealtimeTools.support}</span></td>
              </tr>
              <tr>
                <th>央行资金</th>
                <td className={nonRealtimeTools.bankCapital[1] === 'red' ? 'positive' : 'negtive'}>
                  {nonRealtimeTools.bankCapital[0]}
                </td>
              </tr>
              <tr>
                <th>解禁市值</th>
                <td className='negtive'>{nonRealtimeTools.liftBanCapitalisation}</td>
              </tr>
              <tr>
                <th>融资余额</th>
                <td className='financing-balance'>
                  {nonRealtimeTools.financingBalance}&nbsp;
                  <span className={nonRealtimeTools.financingBalanceChange[1] === 'red' ? 'positive' : 'negtive'}>
                    {nonRealtimeTools.financingBalanceChange[0]}
                  </span>
                </td>
              </tr>
              <tr>
                <th>机构资金</th>
                <td className={nonRealtimeTools.institutionCapital[1] === 'red' ? 'positive' : 'negtive'}>
                  {nonRealtimeTools.institutionCapital[0]}
                </td>
              </tr>
              <tr>
                <th>投资者资金</th>
                <td className={nonRealtimeTools.investerCapital[1] === 'red' ? 'positive' : 'negtive'}>
                  {nonRealtimeTools.investerCapital[0]}
                </td>
              </tr>
              <tr>
                <th>新增投资者</th>
                <td className='positive'>{nonRealtimeTools.newInvester}</td>
              </tr>
              <tr>
                <th>交易投资者</th>
                <td className='positive'>{nonRealtimeTools.tradingInvester}</td>
              </tr>
              <tr>
                <th>搜索人气</th>
                <td className='positive'>{nonRealtimeTools.searchSentiment}</td>
              </tr>
              <tr>
                <th>股吧人气</th>
                <td className='positive'>{nonRealtimeTools.stockForumSentiment}</td>
              </tr>
            </tbody>
          </table>
      }
      </div>
    </div>
  }
}
