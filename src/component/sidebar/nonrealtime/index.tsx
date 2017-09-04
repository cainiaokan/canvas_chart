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
          <table className='s-table stripe even left-header'>
            <tbody>
              <tr>
                <th style={ {width: '130px'} }>上证压力支撑</th>
                <td style={ {width: '137px'} }>
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
                    <svg viewBox='0 0 10 12'>
                      <g><path d='M9.6,4.4c0.3,0.3,0.3,0.8,0,1.1C9.5,5.7,9.3,5.7,9.1,5.7S8.7,5.7,8.5,5.5L5.7,2.7v8.5c0,0.4-0.4,0.8-0.8,0.8c-0.4,0-0.8-0.4-0.8-0.8V2.7L1.4,5.5c-0.3,0.3-0.8,0.3-1.1,0s-0.3-0.8,0-1.1l4.1-4.1C4.5,0.1,4.7,0,4.9,0c0.2,0,0.4,0.1,0.6,0.2L9.6,4.4z'></path></g>
                    </svg>
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
