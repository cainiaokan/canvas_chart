import './index.less'
import '../../../style/table.less'

import * as React from 'react'
import IScroll = require('iscroll')
import ChartLayoutModel from '../../../model/chartlayout'
import { formatNumber } from '../../../util'
import { getAllPlates } from '../../../datasource'

const STOCKS = [
  ['中国银行', 33.27, 2.43],
  ['中国中车', 12.78, 1.65],
  ['上海电力', 6.90, 1.98],
  ['苏宁云商', 65.98, 8.54],
  ['中铁二局', 18.43, 7.66],
  ['中国银行', 33.27, 2.43],
  ['中国中车', 12.78, 1.65],
  ['上海电力', 6.90, 1.98],
  ['苏宁云商', 65.98, 8.54],
  ['中铁二局', 18.43, 7.66],
  ['中国银行', 33.27, 2.43],
  ['中国中车', 12.78, 1.65],
  ['上海电力', 6.90, 1.98],
  ['苏宁云商', 65.98, 8.54],
  ['中铁二局', 18.43, 7.66],
  ['中国银行', 33.27, 2.43],
  ['中国中车', 12.78, 1.65],
  ['上海电力', 6.90, 1.98],
  ['苏宁云商', 65.98, 8.54],
  ['中铁二局', 18.43, 7.66],

]

type SortKey = 'zdf' | 'big_amount' | 'big_rate'

type Order = 'desc' | 'asc'

type Prop = {
  width: number
}

type State = {
  plates?: {
    bk_id: string
    name: string
    zdf: number
    big_rate: number
    big_amount: number
    z_num: number
    d_num: number
  }[]
  total?: number
  sortKey?: SortKey
  order?: Order
  startIndex?: number
}

const LOAD_SIZE = 9

export default class MainBoard extends React.Component<Prop, State> {
  public static contextTypes = {
    chartLayout: React.PropTypes.instanceOf(ChartLayoutModel),
  }

  public context: { chartLayout: ChartLayoutModel }

  public refs: {
    wrapper: HTMLDivElement
    plateListBody: HTMLDivElement
    stockListBody: HTMLDivElement
  }

  private _chartLayout: ChartLayoutModel

  private _wrapperScroller: IScroll
  private _platelistScroller: IScroll
  private _stockListScroller: IScroll

  constructor (props: Prop, context: { chartLayout: ChartLayoutModel }) {
    super(props, context)
    this.state = {
      sortKey: 'zdf',
      order: 'desc',
      startIndex: 0,
    }
    this._chartLayout = context.chartLayout
    this.clickHandler = this.clickHandler.bind(this)
    this.onScrollEnd = this.onScrollEnd.bind(this)
    this.sortHandler = this.sortHandler.bind(this)
  }

  public shouldComponentUpdate (nextProps: Prop, nextState: State) {
    return this.state.plates !== nextState.plates
  }

  public componentWillReceiveProps (nextProps: Prop) {
    if (nextProps.width !== this.props.width) {
      this._platelistScroller.refresh()
      this._stockListScroller.refresh()
      this._wrapperScroller.refresh()
    }
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
    this._platelistScroller = new IScroll(this.refs.plateListBody, {
      mouseWheel: true,
      scrollbars: true,
      fadeScrollbars: true,
    })
    this._stockListScroller = new IScroll(this.refs.stockListBody, {
      mouseWheel: true,
      scrollbars: true,
      fadeScrollbars: true,
    })
    this._platelistScroller.on('scrollEnd', this.onScrollEnd)
    this.loadPlates(this.state.sortKey, this.state.order, this.state.startIndex)
  }

  public componentDidUpdate () {
    this._platelistScroller.refresh()
    this._stockListScroller.refresh()
    this._wrapperScroller.refresh()
  }

  public componentWillUnmount () {
    this._platelistScroller.destroy()
    this._stockListScroller.destroy()
    this._wrapperScroller.destroy()
  }

  public render () {
    const topPaddingRows = []
    const bottomPaddingRows = []

    for (let i = 0, len = this.state.startIndex; i < len; i++) {
      topPaddingRows.push(<tr key={i}>
        <td width='18%'>--</td>
        <td width='16%'>--</td>
        <td width='18%'>--</td>
        <td width='18%'>--</td>
        <td width='14%'>--</td>
        <td width='14%'>--</td>
        <td width='2%'></td>
      </tr>)
    }

    for (let i = this.state.startIndex + LOAD_SIZE, len = this.state.total; i < len; i++) {
      bottomPaddingRows.push(<tr key={i}>
        <td width='18%'>--</td>
        <td width='16%'>--</td>
        <td width='18%'>--</td>
        <td width='18%'>--</td>
        <td width='14%'>--</td>
        <td width='14%'>--</td>
        <td width='2%'></td>
      </tr>)
    }

    return (
      <div className='chart-plate' ref='wrapper'>
        <div className='wrapper'>
          <div className='plate-list'>
            <table className='header s-table stripe top-header'>
              <thead>
                <tr>
                  <th width='18%'>板块名称</th>
                  <th width='16%' data-key='zdf' onClick={this.sortHandler}>
                    涨跌幅
                    {
                      this.state.sortKey === 'zdf' ?
                        this.state.order === 'desc' ? '↑' : '↓'
                        : ''
                    }
                  </th>
                  <th width='18%' data-key='big_rate' onClick={this.sortHandler}>
                    大单净比
                    {
                      this.state.sortKey === 'big_rate' ?
                        this.state.order === 'desc' ? '↑' : '↓'
                        : ''
                    }
                  </th>
                  <th width='18%' data-key='big_amount' onClick={this.sortHandler}>
                    主力资金
                    {
                      this.state.sortKey === 'big_amount' ?
                        this.state.order === 'desc' ? '↑' : '↓'
                        : ''
                    }
                  </th>
                  <th width='14%'>上涨数</th>
                  <th width='14%'>下跌数</th>
                  <th width='2%'></th>
                </tr>
              </thead>
            </table>
            <div className='body' ref='plateListBody'>
              <table className='s-table stripe top-header'>
                <tbody>
                  { topPaddingRows }
                  {
                    this.state.plates && this.state.plates.map((plate, i) =>
                      <tr key={i}>
                        <td width='18%'>{plate.name}</td>
                        <td width='16%'>{(plate.zdf * 100).toFixed(2)}%</td>
                        <td width='18%'>{(plate.big_rate * 100).toFixed(2)}%</td>
                        <td width='18%'>{formatNumber(+plate.big_amount, 2)}</td>
                        <td width='14%'>{plate.z_num}</td>
                        <td width='14%'>{plate.d_num}</td>
                        <td width='2%'></td>
                      </tr>
                    )
                  }
                  { bottomPaddingRows }
                </tbody>
              </table>
            </div>
          </div>
          <div className='separator'></div>
          <div className='stock-list'>
            <table className='header s-table stripe top-header'>
              <thead>
                <tr>
                  <th width='40%'>股票名称</th>
                  <th width='30%'>最新价</th>
                  <th width='30%'>涨跌幅</th>
                </tr>
              </thead>
            </table>
            <div className='body' ref='stockListBody'>
              <table className='s-table stripe top-header'>
                <tbody>
                  {
                    STOCKS.map((stock, i) =>
                      <tr key={i}>
                        <td width='40%'>{stock[0]}</td>
                        <td width='30%'>{(+stock[1]).toFixed(2)}</td>
                        <td width='30%'>{stock[2]}%</td>
                      </tr>
                    )
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }

  private onScrollEnd () {
    const startIndex = ~~(-this._platelistScroller.y / 30)
    this.loadPlates(this.state.sortKey, this.state.order, startIndex)
  }

  private sortHandler (ev) {
    const sortKey: SortKey = ev.target.dataset.key
    let order: Order = 'desc'

    if (sortKey === this.state.sortKey) {
      order = this.state.order === 'desc' ? 'asc' : 'desc'
    }

    this.loadPlates(sortKey, order, this.state.startIndex)
  }

  private loadPlates (sortKey: SortKey, order: Order, startIndex: number) {
    getAllPlates(sortKey, order, startIndex, LOAD_SIZE)
      .then(response =>
        response.json()
          .then(data => {
            this.setState({
              sortKey,
              order,
              startIndex,
              plates: data.data.list,
              total: data.data.total_count,
            })
          })
      )
  }

  private clickHandler (ev) {
  }
}
