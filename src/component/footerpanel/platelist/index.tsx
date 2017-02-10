import './index.less'
import '../../../style/table.less'

import * as React from 'react'
import IScroll = require('iscroll')
import ChartLayoutModel from '../../../model/chartlayout'
import { formatNumber } from '../../../util'
import { getAllPlates, getStockListByPlateId } from '../../../datasource'

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
  stocks?: {
    n: string
    c: string
    price: number
    p_change: number
  }[]
  activePlateId?: string
  total?: number
  sortKey?: SortKey
  order?: Order
  startIndex?: number
}

const LOAD_SIZE = 9
const RETRY_DELAY = 10000

export default class PlateList extends React.Component<Prop, State> {
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

  private _pollPlateListTimer: number
  private _pollStockListTimer: number

  constructor (props: Prop, context: { chartLayout: ChartLayoutModel }) {
    super(props, context)
    this.state = {
      sortKey: 'zdf',
      order: 'desc',
      startIndex: 0,
    }
    this._chartLayout = context.chartLayout
    this.onScrollEnd = this.onScrollEnd.bind(this)
    this.sortHandler = this.sortHandler.bind(this)
    this.selectHandler = this.selectHandler.bind(this)
    this.setSymbolHandler = this.setSymbolHandler.bind(this)
    this.loadPlates = this.loadPlates.bind(this)
    this.loadStocks = this.loadStocks.bind(this)
  }

  public shouldComponentUpdate (nextProps: Prop, nextState: State) {
    const curState = this.state
    return curState.plates !== nextState.plates ||
           curState.stocks !== nextState.stocks ||
           curState.activePlateId !== nextState.activePlateId ||
           curState.sortKey !== nextState.sortKey ||
           curState.order !== nextState.order
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
      fadeScrollbars: true,
    })
    this._platelistScroller = new IScroll(this.refs.plateListBody, {
      mouseWheel: true,
      scrollbars: true,
      fadeScrollbars: true,
      click: true,
    })
    this._stockListScroller = new IScroll(this.refs.stockListBody, {
      mouseWheel: true,
      scrollbars: true,
      fadeScrollbars: true,
      click: true,
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
    clearTimeout(this._pollPlateListTimer)
    clearTimeout(this._pollStockListTimer)
  }

  public render () {
    // const topPaddingRows = []
    // const bottomPaddingRows = []
    const total = this.state.total
    const startIndex = this.state.startIndex
    const plates = this.state.plates
    const paddingTop = 30 * startIndex
    const paddingBottom = 30 * (total - startIndex - LOAD_SIZE - 1)

    // for (let i = 0, len = startIndex; i < len; i++) {
    //   topPaddingRows.push(
    //     <tr key={i}>
    //       <td width='18%'>--</td>
    //       <td width='16%'>--</td>
    //       <td width='18%'>--</td>
    //       <td width='18%'>--</td>
    //       <td width='12%'>--</td>
    //       <td width='12%'>--</td>
    //       <td width='6%'></td>
    //     </tr>
    //   )
    // }

    // for (let i = startIndex + LOAD_SIZE, len = total; i < len; i++) {
    //   bottomPaddingRows.push(
    //     <tr key={i}>
    //       <td width='18%'>--</td>
    //       <td width='16%'>--</td>
    //       <td width='18%'>--</td>
    //       <td width='18%'>--</td>
    //       <td width='12%'>--</td>
    //       <td width='12%'>--</td>
    //       <td width='6%'></td>
    //     </tr>
    //   )
    // }

    return (
      <div className='chart-plate' ref='wrapper'>
        <div className='wrapper'>
          <div className='plate-list'>
            <table className='header s-table top-header'>
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
                  <th width='12%'>上涨数</th>
                  <th width='12%'>下跌数</th>
                  <th width='6%'></th>
                </tr>
              </thead>
            </table>
            <div className='body' ref='plateListBody'>
              <table className='s-table stripe top-header'>
                <tbody>
                  { /*topPaddingRows*/ }
                  { <tr key='paddingTop'><td style={ { height: paddingTop + 'px' } }></td></tr> }
                  {
                    plates && plates.map((plate, i) =>
                      <tr key={i}
                          className={plate.bk_id === this.state.activePlateId ? 'selected' : ''}
                          data-id={plate.bk_id}
                          onClick={this.selectHandler}>
                        <td width='18%'>{plate.name}</td>
                        <td width='16%'>{(plate.zdf * 100).toFixed(2)}%</td>
                        <td width='18%'>{(plate.big_rate * 100).toFixed(2)}%</td>
                        <td width='18%'>{formatNumber(+plate.big_amount, 2)}</td>
                        <td width='12%'>{plate.z_num}</td>
                        <td width='12%'>{plate.d_num}</td>
                        <td width='6%'></td>
                      </tr>
                    )
                  }
                  { <tr key='paddingBottom'><td style={ { height: paddingBottom + 'px' } }></td></tr> }
                  { /*bottomPaddingRows*/ }
                </tbody>
              </table>
            </div>
          </div>
          <div className='separator'></div>
          <div className='stock-list'>
            <table className='header s-table top-header'>
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
                    this.state.stocks && this.state.stocks.map((stock, i) =>
                      <tr key={i}
                          data-symbol={stock.c}
                          onClick={this.setSymbolHandler}>
                        <td width='40%'>{stock.n}</td>
                        <td width='30%'>{(+stock.price).toFixed(2)}</td>
                        <td width='30%'>{(stock.p_change * 100).toFixed(2)}%</td>
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

  private selectHandler (ev) {
    const plateId = ev.currentTarget.dataset.id
    this.loadStocks(plateId)
  }

  private setSymbolHandler (ev) {
    this.context.chartLayout.setSymbol(ev.currentTarget.dataset.symbol)
  }

  private loadPlates (sortKey: SortKey, order: Order, startIndex: number) {
    clearTimeout(this._pollPlateListTimer)
    getAllPlates(sortKey, order, startIndex, LOAD_SIZE)
      .then(response =>
        response.json()
          .then(data => {
            const reflushinter = data.data.intver * 1000
            this.setState({
              sortKey,
              order,
              startIndex,
              plates: data.data.list,
              total: data.data.total_count,
            })
            this._pollPlateListTimer = reflushinter ? setTimeout(() => this.loadPlates(sortKey, order, startIndex), reflushinter) : -1
          })
      )
      .catch(ex => this._pollPlateListTimer = setTimeout(() => this.loadPlates(sortKey, order, startIndex), RETRY_DELAY))
  }

  private loadStocks (plateId: string) {
    clearTimeout(this._pollStockListTimer)
    getStockListByPlateId(plateId)
      .then(response =>
        response.json()
          .then(data => {
            const reflushinter = data.data.intver * 1000
            this.setState({
              activePlateId: plateId,
              stocks: data.data.list,
            })
            this._pollStockListTimer = reflushinter ? setTimeout(() => this.loadStocks(plateId), reflushinter) : -1
          })
      )
      .catch(ex => this._pollStockListTimer = setTimeout(() => this.loadStocks(plateId), RETRY_DELAY))
  }
}
