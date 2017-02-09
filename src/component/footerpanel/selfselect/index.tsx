import './index.less'
import '../../../style/table.less'

import * as React from 'react'
import * as _ from 'underscore'
import IScroll = require('iscroll')
import { formatNumber } from '../../../util'
import ChartLayoutModel from '../../../model/chartlayout'
import { getStockListByCodes } from '../../../datasource'

type State = {
  sortKey?: 'zdf' | 'price' | 'sz' | 'it_sz' | 'hy'
  sortType?: 'asc' | 'desc'
  stocks?: {
    name: string
    code: string
    price: number
    zdf: number
    sz: number
    lt_sz: number
    hy: number
  }[]
}

const RETRY_DELAY = 10000

export default class SelfSelectStock extends React.Component<any, State> {
  public static contextTypes = {
    chartLayout: React.PropTypes.instanceOf(ChartLayoutModel),
  }

  public context: { chartLayout: ChartLayoutModel }

  public refs: {
    body: HTMLDivElement
  }

  private _chartLayout: ChartLayoutModel

  private _scroller: IScroll

  private _pollStocksTimer: number

  constructor (props: any, context: { chartLayout: ChartLayoutModel }) {
    super(props, context)
    this.state = {
      sortKey: 'zdf',
      sortType: 'desc',
    }
    this._chartLayout = context.chartLayout
    this.loadStocks = this.loadStocks.bind(this)
    this.setSymbolHandler = this.setSymbolHandler.bind(this)
  }

  public shouldComponentUpdate (nextProps: any, nextState: State) {
    return !_.isEqual(this.state, nextState)
  }

  public componentDidMount () {
    this._scroller = new IScroll(this.refs.body, {
      mouseWheel: true,
      scrollbars: true,
      fadeScrollbars: true,
      click: true,
    })
    this.loadStocks()
  }

  public componentWillUnmount () {
    this._scroller.destroy()
    clearTimeout(this._pollStocksTimer)
  }

  public render () {
    const stocks = this.state.stocks

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
                stocks && stocks.map((stock, i) =>
                  <tr key={i}
                      data-symbol={stock.code}
                      onClick={this.setSymbolHandler}>
                    <td width='18%'>{stock.name}</td>
                    <td width='14%'>{(+stock.price).toFixed(2)}</td>
                    <td width='14%'>{(stock.zdf * 100).toFixed(2)}%</td>
                    <td width='16%'>{formatNumber(+stock.sz)}</td>
                    <td width='20%'>{formatNumber(+stock.lt_sz)}</td>
                    <td width='18%'>{stock.hy}</td>
                  </tr>
                )
              }
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  private loadStocks () {
    const codes = _.pluck(this._chartLayout.readFromLS('qchart.selfselectlist') || [], 'symbol')
    getStockListByCodes(codes, this.state.sortKey, this.state.sortType)
      .then(response =>
        response.json()
          .then(data => {
            this.setState({ stocks: data.data.list })
            this._pollStocksTimer = data.data.intver ? setTimeout(() => this.loadStocks, data.data.intver) : -1
          })
      )
      .catch(ex => this._pollStocksTimer = setTimeout(() => this.loadStocks, RETRY_DELAY))
  }

  private setSymbolHandler (ev) {
    this.context.chartLayout.setSymbol(ev.currentTarget.dataset.symbol)
  }
}
