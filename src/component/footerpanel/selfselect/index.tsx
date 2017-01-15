import './index.less'
import '../../../style/table.less'

import * as React from 'react'
import IScroll = require('iscroll')
import { formatNumber } from '../../../util'
import ChartLayoutModel from '../../../model/chartlayout'

type Prop = {
  chartLayout: ChartLayoutModel
}

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

export default class SelfSelectStock extends React.Component<Prop, any> {
  public refs: {
    body: HTMLDivElement
  }

  private _scroller: IScroll

  constructor () {
    super()
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
        <table className='header s-table'>
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
          <table className='s-table stripe'>
            <tbody>
              {
                STOCKS.map((stock, i) =>
                  <tr key={i}>
                    <td width='18%'>{stock[0]}</td>
                    <td width='14%'>{formatNumber(+stock[1], 2)}</td>
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
