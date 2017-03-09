import './index.less'
import '../../../style/table.less'

import * as React from 'react'
import * as _ from 'underscore'
import IScroll = require('iscroll')

import ChartLayoutModel from '../../../model/chartlayout'
import {
  IndexesInfo,
  RealtimeTools,
  NonRealtimeTools,
} from '../pollmanager'

type State = {
  highlightFinished?: boolean
}

type Prop = {
  indexesInfo: IndexesInfo
  realtimeTools: RealtimeTools
  nonRealtimeTools: NonRealtimeTools
  height: number
}

export default class Indexes extends React.Component<Prop, State> {
  public static contextTypes = {
    chartLayout: React.PropTypes.instanceOf(ChartLayoutModel),
  }

  public refs: {
    scrollWrapper: HTMLDivElement
  }

  public context: { chartLayout: ChartLayoutModel }

  private _chartLayout: ChartLayoutModel
  private _oldIndexesInfo
  private _highLightTimeout
  private _scroller: IScroll

  constructor (props: Prop, context: { chartLayout: ChartLayoutModel }) {
    super(props, context)
    this._chartLayout = context.chartLayout
    this.state = {
      highlightFinished: true,
    }
    this.selectIndex = this.selectIndex.bind(this)
  }

  public componentDidMount () {
    this._scroller = new IScroll(this.refs.scrollWrapper, {
      mouseWheel: true,
      scrollbars: true,
      fadeScrollbars: true,
    })
  }

  public componentWillUnmount () {
    clearTimeout(this._highLightTimeout)
    this._scroller.destroy()
  }

  public componentDidUpdate () {
    this._scroller.refresh()
  }

  public componentWillReceiveProps (nextProps: Prop) {
    if (!_.isEqual(nextProps.indexesInfo, this.props.indexesInfo)) {
      this.state.highlightFinished = false
      this._highLightTimeout = setTimeout(() => this.setState({ highlightFinished: true}), 500)
    }
  }

  public shouldComponentUpdate (nextProps: Prop, nextState: State) {
    return !_.isEqual(this.props, nextProps) ||
           !_.isEqual(this.state, nextState)
  }

  public render () {
    const indexesInfo = this.props.indexesInfo
    const oldIndexesInfo = this._oldIndexesInfo
    const realtimeTools = this.props.realtimeTools
    const nonRealtimeTools = this.props.nonRealtimeTools
    const mutations: any = {}
    const classList: any = {}

    if (oldIndexesInfo) {
      indexesInfo.forEach((index, i) =>
        mutations[index.code] = oldIndexesInfo[i].price !== index.price ? 'mutation' : ''
      )
    }

    this._oldIndexesInfo = indexesInfo

    if (indexesInfo) {
      indexesInfo.forEach(index =>
          classList[index.code] =
            +index.price_change > 0 ? 'positive' :
              +index.price_change < 0 ? 'negtive' : ''
      )
    }

    if (realtimeTools) {
      Object.keys(realtimeTools)
        .forEach(key =>
          classList[key] =
            realtimeTools[key][1] === 'red' ? 'positive' :
              realtimeTools[key][1] === 'green' ? 'negtive' : ''
        )
    }

    return <div className='chart-market' ref='scrollWrapper' style={ {height: this.props.height + 'px'} }>
      <div>
        {
          indexesInfo ?
          <div>
            <h3>股指</h3>
            <table className='index-table s-table stripe even left-header'>
              <tbody>
                {
                  indexesInfo.map(index =>
                    <tr key={index.code}
                        data-symbol={index.code}
                        onClick={this.selectIndex}>
                      <th width='70'>{index.name}</th>
                      <td width='70' className={`${classList[index.code]} ${mutations[index.code] || ''}`}>
                        <span>{index.price}</span>
                      </td>
                      <td width='127' className={classList[index.code]}>
                        {(index.price_change > 0 ? '+' : '') + (+index.price_change).toFixed(2)}
                        ({(index.p_change > 0 ? '+' : '') + (index.p_change * 100).toFixed(2)}%)
                      </td>
                    </tr>
                  )
                }
              </tbody>
            </table>
          </div> : null
        }
        {
          realtimeTools ?
          <div>
            <h3>实时数据</h3>
            <table className='s-table stripe even left-header'>
              <tbody>
                <tr>
                  <th width='157'>沪股通资金流入</th>
                  <td width='110' className={classList.hugutong}>
                    {realtimeTools.hugutong[0]}
                  </td>
                </tr>
                <tr>
                  <th>涨跌幅超过5%个股数</th>
                  <td>
                    <span className='positive'>
                      {realtimeTools.goUpStaying[0]}
                    </span>/
                    <span className='negtive'>
                      {realtimeTools.fallStaying[0]}
                    </span>
                  </td>
                </tr>
                <tr>
                  <th>急涨急跌股数</th>
                  <td className={classList.shortTermMove}>
                    {realtimeTools.shortTermMove[0]}
                  </td>
                </tr>
              </tbody>
            </table>
          </div> : null
        }
        {
          nonRealtimeTools ?
          <div>
            <h3>资金和人气</h3>
            <table className='s-table stripe even left-header nonrealtime-tabe'>
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
          </div> : null
        }
      </div>
    </div>
  }

  private selectIndex (ev) {
    this._chartLayout.setSymbol(ev.currentTarget.dataset.symbol)
  }
}
