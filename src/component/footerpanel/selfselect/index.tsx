import './index.less'
import '../../../style/table.less'

import * as React from 'react'
import * as _ from 'underscore'
import IScroll = require('iscroll')
import { formatNumber } from '../../../util'
import ChartLayoutModel from '../../../model/chartlayout'
import { getStockListByCodes } from '../../../datasource'

type SortKey = 'zdf' | 'price' | 'sz' | 'lt_sz' | 'hy'

type Order = 'desc' | 'asc'

type Prop = {
  width: number
}

type State = {
  sortKey?: SortKey
  order?: Order
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

export default class SelfSelectStock extends React.Component<Prop, State> {
  public static contextTypes = {
    chartLayout: React.PropTypes.instanceOf(ChartLayoutModel),
  }

  public context: { chartLayout: ChartLayoutModel }

  public refs: {
    body: HTMLDivElement
    wrapper: HTMLDivElement
  }

  private _chartLayout: ChartLayoutModel

  private _wrapperScroller: IScroll
  private _scroller: IScroll

  private _pollStocksTimer: number

  constructor (props: any, context: { chartLayout: ChartLayoutModel }) {
    super(props, context)
    this.state = {
      sortKey: 'zdf',
      order: 'desc',
    }
    this._chartLayout = context.chartLayout
    this.loadStocks = this.loadStocks.bind(this)
    this.sortHandler = this.sortHandler.bind(this)
    this.setSymbolHandler = this.setSymbolHandler.bind(this)
  }

  public shouldComponentUpdate (nextProps: any, nextState: State) {
    return !_.isEqual(this.state, nextState)
  }

  public componentDidMount () {
    this._wrapperScroller = new IScroll(this.refs.wrapper, {
      scrollbars: true,
      hScrollbar: true,
      scrollX: true,
      scrollY: false,
      eventPassthrough: true,
      fadeScrollbars: true,
    })
    this._scroller = new IScroll(this.refs.body, {
      mouseWheel: true,
      scrollbars: true,
      fadeScrollbars: true,
      click: true,
    })
    this._chartLayout.addListener('self_select_add', this.loadStocks)
    this._chartLayout.addListener('self_select_delete', this.loadStocks)
    this.loadStocks(this.state.sortKey, this.state.order)
  }

  public componentWillReceiveProps (nextProps: Prop) {
    if (nextProps.width !== this.props.width) {
      this._wrapperScroller.refresh()
      this._scroller.refresh()
    }
  }

  public componentDidUpdate () {
    this._scroller.refresh()
  }

  public componentWillUnmount () {
    this._wrapperScroller.destroy()
    this._scroller.destroy()
    this._chartLayout.removeListener('self_select_add', this.loadStocks)
    this._chartLayout.removeListener('self_select_delete', this.loadStocks)
    clearTimeout(this._pollStocksTimer)
  }

  public render () {
    const stocks = this.state.stocks

    return (
      <div className='chart-self-select' ref='wrapper'>
        <div className='wrapper'>
          <table className='header s-table top-header'>
            <thead>
              <tr>
                <th width='18%'>股票</th>
                <th width='14%' data-key='price' onClick={this.sortHandler}>
                  最新价
                  {
                    this.state.sortKey === 'price' ?
                    this.state.order === 'desc' ? '↑' : '↓'
                      : ''
                  }
                </th>
                <th width='14%' data-key='zdf' onClick={this.sortHandler}>
                  涨跌幅
                  {
                    this.state.sortKey === 'zdf' ?
                    this.state.order === 'desc' ? '↑' : '↓'
                      : ''
                  }
                </th>
                <th width='16%' data-key='sz' onClick={this.sortHandler}>
                  总市值
                  {
                    this.state.sortKey === 'sz' ?
                    this.state.order === 'desc' ? '↑' : '↓'
                      : ''
                  }
                </th>
                <th width='20%' data-key='lt_sz' onClick={this.sortHandler}>
                  实际流通市值
                  {
                    this.state.sortKey === 'lt_sz' ?
                    this.state.order === 'desc' ? '↑' : '↓'
                      : ''
                  }
                </th>
                <th width='18%' data-key='hy' onClick={this.sortHandler}>
                  所属行业
                  {
                    this.state.sortKey === 'hy' ?
                    this.state.order === 'desc' ? '↑' : '↓'
                      : ''
                  }
                </th>
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
                      <td width='16%'>{formatNumber(+stock.sz, 2)}</td>
                      <td width='20%'>{formatNumber(+stock.lt_sz, 2)}</td>
                      <td width='18%'>{stock.hy}</td>
                    </tr>
                  )
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  private loadStocks (sortKey: SortKey, order: Order) {
    const codes = _.pluck(this._chartLayout.readFromLS('qchart.selfselectlist') || [], 'symbol')
    getStockListByCodes(codes, sortKey, order)
      .then(response =>
        response.json()
          .then(data => {
            const reflushinter = data.data.intver * 1000
            this.setState({
              sortKey,
              order,
              stocks: data.data.list,
            })
            this._pollStocksTimer = reflushinter ? setTimeout(() => this.loadStocks, reflushinter) : -1
          })
      )
      .catch(ex => this._pollStocksTimer = setTimeout(() => this.loadStocks, RETRY_DELAY))
  }

  private sortHandler (ev) {
    const sortKey: SortKey = ev.target.dataset.key
    let order: Order = 'desc'

    if (sortKey === this.state.sortKey) {
      order = this.state.order === 'desc' ? 'asc' : 'desc'
    }

    this.loadStocks(sortKey, order)
  }

  private setSymbolHandler (ev) {
    this.context.chartLayout.setSymbol(ev.currentTarget.dataset.symbol)
  }
}
