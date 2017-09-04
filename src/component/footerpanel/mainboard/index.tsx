import './index.less'

import * as React from 'react'
import IScroll = require('iscroll')
import ChartLayoutModel from '../../../model/chartlayout'
import { getIndexesInfo, getStockListByIndexId } from '../../../datasource'

type IndexInfo = {
  p_change: number
  price: number
  price_change: number
}

type StockInfo = [string, string, number, number]

type Prop = {
  width: number
}

type State = {
  indexes?: {
    index_id: string
    name: string
    code: string
    price: number
    p_change: number
    price_change: number
  }[]
  activeIndexId?: string
  rising_rank?: StockInfo[]
  declining_rank?: StockInfo[]
}

const RETRY_DELAY = 10000

export default class MainBoard extends React.Component<Prop, State> {
  public static contextTypes = {
    chartLayout: React.PropTypes.instanceOf(ChartLayoutModel),
  }

  public context: { chartLayout: ChartLayoutModel }

  public refs: {
    wrapper: HTMLDivElement
    indexesList: HTMLDivElement
    descList: HTMLDivElement
    ascList: HTMLDivElement
  }

  private _isMounted: boolean

  private _chartLayout: ChartLayoutModel

  private _wrapperScroller: IScroll
  private _indexesListScroller: IScroll
  private _descListScroller: IScroll
  private _ascListScroller: IScroll

  private _pollIndexListTimer: number
  private _pollRankListTimer: number

  constructor (props: any, context: { chartLayout: ChartLayoutModel }) {
    super(props, context)
    this.state = {}
    this._chartLayout = context.chartLayout
    this.selectHandler = this.selectHandler.bind(this)
    this.setSymbolHandler = this.setSymbolHandler.bind(this)
    this.loadRankList = this.loadRankList.bind(this)
    this.loadIndexList = this.loadIndexList.bind(this)
  }

  public shouldComponentUpdate (nextProp: Prop, nextState: State) {
    const curState = this.state
    return curState.indexes !== nextState.indexes ||
           curState.rising_rank !== nextState.rising_rank ||
           curState.declining_rank !== nextState.declining_rank
  }

  public componentWillReceiveProps (nextProps: Prop) {
    if (nextProps.width !== this.props.width) {
      this._wrapperScroller.refresh()
      this._indexesListScroller.refresh()
      this._descListScroller.refresh()
      this._ascListScroller.refresh()
    }
  }

  public componentDidMount () {
    this._isMounted = true

    this._wrapperScroller = new IScroll(this.refs.wrapper, {
      scrollbars: true,
      hScrollbar: true,
      scrollX: true,
      scrollY: false,
      eventPassthrough: true,
      fadeScrollbars: true,
    })

    this._indexesListScroller = new IScroll(this.refs.indexesList, {
      mouseWheel: true,
      scrollbars: true,
      fadeScrollbars: true,
      click: true,
    })

    this._descListScroller = new IScroll(this.refs.descList, {
      mouseWheel: true,
      scrollbars: true,
      fadeScrollbars: true,
      click: true,
    })

    this._ascListScroller = new IScroll(this.refs.ascList, {
      mouseWheel: true,
      scrollbars: true,
      fadeScrollbars: true,
      click: true,
    })

    this.loadIndexList()
      .then(() => this.state.indexes ? this.loadRankList(this.state.indexes[0].index_id) : null)
  }

  public componentDidUpdate () {
    this._wrapperScroller.refresh()
    this._indexesListScroller.refresh()
    this._descListScroller.refresh()
    this._ascListScroller.refresh()
  }

  public componentWillUnmount () {
    this._isMounted = false
    this._wrapperScroller.destroy()
    this._indexesListScroller.destroy()
    this._descListScroller.destroy()
    this._ascListScroller.destroy()
    clearTimeout(this._pollIndexListTimer)
    clearTimeout(this._pollRankListTimer)
  }

  public render () {
    const indexes = this.state.indexes
    const risingRank = this.state.rising_rank
    const decliningRank = this.state.declining_rank
    return (
      <div ref='wrapper' className='chart-main-board'>
        <div className='wrapper'>
          <div className='indexes-list'>
            <table className='header s-table top-header'>
              <thead>
                <tr>
                  <th style={ {width: '38%'} }>指数名称</th>
                  <th style={ {width: '31%'} }>涨跌幅</th>
                  <th style={ {width: '31%'} }>涨跌点数</th>
                </tr>
              </thead>
            </table>
            <div className='body' ref='indexesList'>
              <table className='s-table top-header'>
                <tbody>
                  {
                    indexes && indexes.map((index, i) =>
                      <tr key={i}
                          className={this.state.activeIndexId === index.index_id ? 'active' : ''}
                          data-id={index.index_id}
                          onClick={this.selectHandler}>
                        <td style={ {width: '38%'} }>{index.name}</td>
                        <td style={ {width: '31%'} }>
                        {(index.p_change * 100).toFixed(2)}%
                        </td>
                        <td style={ {width: '31%'} }>
                        {(+index.price_change).toFixed(2)}
                        </td>
                      </tr>
                    )
                  }
                </tbody>
              </table>
            </div>
          </div>
          <div className='separator'></div>
          <div className='desc-list'>
            <table className='header s-table top-header'>
              <thead>
                <tr>
                  <th style={ {width: '38%'} }>股票名称</th>
                  <th style={ {width: '31%'} }>最新价</th>
                  <th style={ {width: '31%'} }>涨跌幅</th>
                </tr>
              </thead>
            </table>
            <div className='body' ref='descList'>
              <table className='s-table stripe even top-header'>
                <tbody>
                  {
                    risingRank && risingRank.map((stock, i) =>
                      <tr key={i}
                          data-symbol={stock[0]}
                          onClick={this.setSymbolHandler}>
                        <td style={ {width: '38%'} }>{stock[1]}</td>
                        <td style={ {width: '31%'} }>{(+stock[3]).toFixed(2)}</td>
                        <td style={ {width: '31%'} }>{(stock[2] * 100).toFixed(2)}%</td>
                      </tr>
                    )
                  }
                </tbody>
              </table>
            </div>
          </div>
          <div className='separator'></div>
          <div className='asc-list'>
            <table className='header s-table top-header'>
              <thead>
                <tr>
                  <th style={ {width: '38%'} }>股票名称</th>
                  <th style={ {width: '31%'} }>最新价</th>
                  <th style={ {width: '31%'} }>涨跌幅</th>
                </tr>
              </thead>
            </table>
            <div className='body' ref='ascList' >
              <table className='s-table stripe even top-header'>
                <tbody>
                  {
                    decliningRank && decliningRank.map((stock, i) =>
                      <tr key={i}
                          data-symbol={stock[0]}
                          onClick={this.setSymbolHandler}>
                        <td style={ {width: '38%'} }>{stock[1]}</td>
                        <td style={ {width: '31%'} }>{(+stock[3]).toFixed(2)}</td>
                        <td style={ {width: '31%'} }>{(stock[2] * 100).toFixed(2)}%</td>
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

  private selectHandler (ev) {
    const indexId = ev.currentTarget.dataset.id
    this.loadRankList(indexId)
  }

  private setSymbolHandler (ev) {
    this.context.chartLayout.setSymbol(ev.currentTarget.dataset.symbol)
  }

  private loadIndexList (): Promise<any> {
    return getIndexesInfo()
      .then(data => {
          if (this._isMounted) {
            const reflushinter = data.data.intver * 1000
            this.setState({ indexes: data.data.list })
            this._pollIndexListTimer = reflushinter ? setTimeout(this.loadIndexList, reflushinter) : -1
          }
      })
      .catch(ex => this._pollIndexListTimer = setTimeout(this.loadIndexList, RETRY_DELAY))
  }

  private loadRankList (indexId: string) {
    clearTimeout(this._pollRankListTimer)
    getStockListByIndexId(indexId)
      .then(data => {
        if (this._isMounted) {
          const reflushinter = data.data.intver * 1000
          this.setState({
            activeIndexId: indexId,
            rising_rank: data.data.up,
            declining_rank: data.data.down,
          })
          this._pollRankListTimer = reflushinter ? setTimeout(() => this.loadRankList(indexId), reflushinter) : -1
        }
      })
      .catch(ex => this._pollRankListTimer = setTimeout(() => this.loadRankList(indexId), RETRY_DELAY))
  }
}
