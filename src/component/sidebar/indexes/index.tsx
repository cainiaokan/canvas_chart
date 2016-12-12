import './index.less'
import '../../../style/table.less'

import * as React from 'react'
import * as iScroll from 'iscroll'
import { SUPPORT_TOUCH } from '../../../constant'
import ChartLayout from '../../../model/chartlayout'
import { IndexesInfo, RealtimeTools } from '../pollmanager'

type State = {
  highlightFinished?: boolean
}

type Prop = {
  indexesInfo: IndexesInfo
  realtimeTools: RealtimeTools
  chartLayout: ChartLayout
  width: number
  height: number
}

export default class Indexes extends React.Component<Prop, State> {

  public refs: {
    indexes: HTMLDivElement
  }

  private _indexesScroll
  private _indexesInfo: IndexesInfo
  private _realtimeTools: RealtimeTools

  constructor () {
    super()
    this.state = {
      highlightFinished: false,
    }
    this.selectIndex = this.selectIndex.bind(this)
  }

  public componentDidMount () {
    this._indexesScroll = new iScroll(this.refs.indexes, {
      mouseWheel: true,
      scrollbars: true,
      fadeScrollbars: true,
    })
  }

  public componentDidUpdate () {
    this._indexesScroll.refresh()
  }

  public shouldComponentUpdate (nextProps: Prop, nextState: State) {
    const curProp = this.props
    const curState = this.state
    return curProp.indexesInfo !== nextProps.indexesInfo ||
      curProp.realtimeTools !== nextProps.realtimeTools ||
      curProp.width !== nextProps.width ||
      curProp.height !== nextProps.height ||
      curState.highlightFinished !== nextState.highlightFinished
  }

  public render () {
    const indexesInfo = this.props.indexesInfo
    const realtimeTools = this.props.realtimeTools
    const mutations: any = {}
    const classList: any = {}

    if (this._indexesInfo) {
      Object.keys(indexesInfo)
        .forEach(code =>
          mutations[code] = indexesInfo[code].changeAmount !== this._indexesInfo[code].changeAmount ? 'mutation' : ''
        )
    }

    if (indexesInfo) {
      Object.keys(indexesInfo)
        .forEach(code =>
          classList[code] =
            indexesInfo[code].changeAmount > 0 ? 'positive' :
              indexesInfo[code].changeAmount < 0 ? 'negtive' : ''
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

    this._indexesInfo = indexesInfo
    this._realtimeTools = realtimeTools

    if (this.state.highlightFinished) {
      this.state.highlightFinished = false
    } else {
      setTimeout(() => this.setState({ highlightFinished: true}), 500)
    }

    let eventHandlers
    if (SUPPORT_TOUCH) {
      eventHandlers = {
        onTouchStart: this.selectIndex,
      }
    } else {
      eventHandlers = {
        onClick: this.selectIndex,
      }
    }

    return <div className='indexes' style={ {height: this.props.height + 'px'} } ref='indexes'>
      <div>
        {
          indexesInfo ?
          <div>
            <h3>股指</h3>
            <table className='index-table s-table stripe'>
              <tbody>
                <tr data-symbol={'sh000001'} {...eventHandlers}>
                  <td width='70'>上证指数</td>
                  <td width='70' className={`${classList.sh000001} ${mutations.sh000001}`}>
                    <span>{indexesInfo.sh000001.price}</span>
                  </td>
                  <td width='127' className={classList.sh000001}>
                    {(indexesInfo.sh000001.changeAmount > 0 ? '+' : '') + indexesInfo.sh000001.changeAmount.toFixed(2)}
                    ({(indexesInfo.sh000001.changeRate > 0 ? '+' : '') + indexesInfo.sh000001.changeRate.toFixed(2)}%)
                  </td>
                </tr>
                <tr data-symbol={'sz399001'} {...eventHandlers}>
                  <td>深证成指</td>
                  <td className={`${classList.sz399001} ${mutations.sz399001}`}>
                    <span>{indexesInfo.sz399001.price}</span>
                  </td>
                  <td className={classList.sz399001}>
                    {(indexesInfo.sz399001.changeAmount > 0 ? '+' : '') + indexesInfo.sz399001.changeAmount.toFixed(2)}
                    ({(indexesInfo.sz399001.changeRate > 0 ? '+' : '') + indexesInfo.sz399001.changeRate.toFixed(2)}%)
                  </td>
                </tr>
                <tr data-symbol={'sz399300'} {...eventHandlers}>
                  <td>沪深300</td>
                  <td className={`${classList.sz399300} ${mutations.sz399300}`}>
                    <span>{indexesInfo.sz399300.price}</span>
                  </td>
                  <td className={classList.sz399300}>
                    {(indexesInfo.sz399300.changeAmount > 0 ? '+' : '') + indexesInfo.sz399300.changeAmount.toFixed(2)}
                    ({(indexesInfo.sz399300.changeRate > 0 ? '+' : '') + indexesInfo.sz399300.changeRate.toFixed(2)}%)
                  </td>
                </tr>
                <tr data-symbol={'sz399005'} {...eventHandlers}>
                  <td>中小板指</td>
                  <td className={`${classList.sz399005} ${mutations.sz399005}`}>
                    <span>{indexesInfo.sz399005.price}</span>
                  </td>
                  <td className={classList.sz399005}>
                    {(indexesInfo.sz399005.changeAmount > 0 ? '+' : '') + indexesInfo.sz399005.changeAmount.toFixed(2)}
                    ({(indexesInfo.sz399005.changeRate > 0 ? '+' : '') + indexesInfo.sz399005.changeRate.toFixed(2)}%)
                  </td>
                </tr>
                <tr data-symbol={'sz399006'} {...eventHandlers}>
                  <td>创业板指</td>
                  <td className={`${classList.sz399006} ${mutations.sz399006}`}>
                    <span>{indexesInfo.sz399006.price}</span>
                  </td>
                  <td className={classList.sz399006}>
                    {(indexesInfo.sz399006.changeAmount > 0 ? '+' : '') + indexesInfo.sz399006.changeAmount.toFixed(2)}
                    ({(indexesInfo.sz399006.changeRate > 0 ? '+' : '') + indexesInfo.sz399006.changeRate.toFixed(2)}%)
                  </td>
                </tr>
              </tbody>
            </table>
          </div> : null
        }
        {
          realtimeTools ?
          <div>
            <h3>实用工具</h3>
            <table className='s-table stripe'>
              <tr>
                <td width='157'>沪股通资金流入</td>
                <td width='110' className={classList.hugutong}>
                  {realtimeTools.hugutong[0]}
                </td>
              </tr>
              <tr>
                <td>涨跌幅超过5%个股数</td>
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
                <td>急涨急跌股数</td>
                <td className={classList.shortTermMove}>
                  {realtimeTools.shortTermMove[0]}
                </td>
              </tr>
            </table>
          </div> : null
        }
      </div>
    </div>
  }

  private selectIndex (ev) {
    this.props.chartLayout.setSymbol(ev.currentTarget.dataset.symbol)
  }
}
