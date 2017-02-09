import './index.less'
import '../../../style/table.less'

import * as React from 'react'
import * as _ from 'underscore'
import ChartLayoutModel from '../../../model/chartlayout'
import { IndexesInfo, RealtimeTools } from '../pollmanager'

type State = {
  highlightFinished?: boolean
}

type Prop = {
  indexesInfo: IndexesInfo
  realtimeTools: RealtimeTools
  height: number
}

export default class Indexes extends React.Component<Prop, State> {
  public static contextTypes = {
    chartLayout: React.PropTypes.instanceOf(ChartLayoutModel),
  }

  public context: { chartLayout: ChartLayoutModel }

  public refs: {
    indexes: HTMLDivElement
  }

  private _chartLayout: ChartLayoutModel
  private _oldIndexesInfo
  private _highLightTimeout

  constructor (props: Prop, context: { chartLayout: ChartLayoutModel }) {
    super(props, context)
    this._chartLayout = context.chartLayout
    this.state = {
      highlightFinished: true,
    }
    this.selectIndex = this.selectIndex.bind(this)
  }

  public componentWillUnmount () {
    clearTimeout(this._highLightTimeout)
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
            index.price > 0 ? 'positive' :
              index.price < 0 ? 'negtive' : ''
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

    return <div className='chart-indexes' style={ {height: this.props.height + 'px'} } ref='indexes'>
      <div>
        {
          indexesInfo ?
          <div>
            <h3>股指</h3>
            <table className='index-table s-table stripe left-header'>
              <tbody>
                {
                  indexesInfo.map(index =>
                    <tr key={index.code}
                        data-symbol={index.code}
                        onClick={this.selectIndex}>
                      <th width='70'>{index.name}</th>
                      <td width='70' className={`${classList[index.code]} ${mutations[index.code]}`}>
                        <span>{index.price}</span>
                      </td>
                      <td width='127' className={classList.sh000001}>
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
            <h3>实用工具</h3>
            <table className='s-table stripe left-header'>
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
      </div>
    </div>
  }

  private selectIndex (ev) {
    this._chartLayout.setSymbol(ev.currentTarget.dataset.symbol)
  }
}
