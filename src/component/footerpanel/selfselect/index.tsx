import './index.less'
import '../../../style/table.less'

import * as React from 'react'
import IScroll = require('iscroll')
import { formatNumber } from '../../../util'
import ChartLayoutModel from '../../../model/chartlayout'

const STOCKS = [
  ['中国动力', 33.27, 2.32, 57900000000, 32100000000, '交通运输'],
  ['中国动力', 33.27, 2.32, 57900000000, 32100000000, '交通运输'],
  ['中国动力', 33.27, 2.32, 57900000000, 32100000000, '交通运输'],
  ['中国动力', 33.27, 2.32, 57900000000, 32100000000, '交通运输'],
  ['中国动力', 33.27, 2.32, 57900000000, 32100000000, '交通运输'],
  ['中国动力', 33.27, 2.32, 57900000000, 32100000000, '交通运输'],
  ['中国动力', 33.27, 2.32, 57900000000, 32100000000, '交通运输'],
  ['中国动力', 33.27, 2.32, 57900000000, 32100000000, '交通运输'],
  ['中国动力', 33.27, 2.32, 57900000000, 32100000000, '交通运输'],
  ['中国动力', 33.27, 2.32, 57900000000, 32100000000, '交通运输'],
  ['中国动力', 33.27, 2.32, 57900000000, 32100000000, '交通运输'],
  ['中国动力', 33.27, 2.32, 57900000000, 32100000000, '交通运输'],
  ['中国动力', 33.27, 2.32, 57900000000, 32100000000, '交通运输'],
  ['中国动力', 33.27, 2.32, 57900000000, 32100000000, '交通运输'],
  ['中国动力', 33.27, 2.32, 57900000000, 32100000000, '交通运输'],
]

export default class SelfSelectStock extends React.Component<any, any> {
  public static contextTypes = {
    chartLayout: React.PropTypes.instanceOf(ChartLayoutModel),
  }

  public context: { chartLayout: ChartLayoutModel }

  public refs: {
    body: HTMLDivElement
  }

  private _chartLayout: ChartLayoutModel

  private _scroller: IScroll

  constructor (props: any, context: { chartLayout: ChartLayoutModel }) {
    super(props, context)
    this._chartLayout = context.chartLayout
    this.clickHandler = this.clickHandler.bind(this)
  }

  public shouldComponentUpdate () {
    return false
  }

  public componentDidMount () {
    this._scroller = new IScroll(this.refs.body, {
      mouseWheel: true,
      scrollbars: true,
      fadeScrollbars: true,
    })
  }

  public componentWillUnmount () {
    this._scroller.destroy()
  }

  public render () {
    return (
      <div className='chart-self-select'>
        <table className='header s-table top-header'>
          <thead>
            <tr>
              <th width='18%'>股票</th>
              <th width='14%'>最新价</th>
              <th width='14%'>涨跌幅</th>
              <th width='16%'>总市值</th>
              <th width='20%'>实际流通市值</th>
              <th width='18%'>所属行业</th>
            </tr>
          </thead>
        </table>
        <div ref='body' className='body'>
          <table className='s-table stripe top-header'>
            <tbody>
              {
                STOCKS.map((stock, i) =>
                  <tr key={i}>
                    <td width='18%'>{stock[0]}</td>
                    <td width='14%'>{(+stock[1]).toFixed(2)}</td>
                    <td width='14%'>{stock[2]}%</td>
                    <td width='16%'>{formatNumber(+stock[3])}</td>
                    <td width='20%'>{formatNumber(+stock[4])}</td>
                    <td width='18%'>{stock[5]}</td>
                  </tr>
                )
              }
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  private clickHandler (ev) {
  }
}
