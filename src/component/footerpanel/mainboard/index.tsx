import './index.less'

import * as React from 'react'
import IScroll = require('iscroll')
import ChartLayoutModel from '../../../model/chartlayout'

const INDEXES = [
  ['上证指数', 2.31, 2.35],
  ['堔成指数', -1.23, 1.34],
  ['中小板指', 2.31, 2.35],
  ['创业板指', -1.23, -12.66],
]

const DESC_STOCK_LIST = [
  [600482, '中国动力', 33.27, 44],
  [600482, '中国动力', 33.27, 10.01],
  [600482, '中国动力', 33.27, 9.99],
  [600482, '中国动力', 33.27, 44],
  [600482, '中国动力', 33.27, 44],
  [600482, '中国动力', 33.27, 44],
  [600482, '中国动力', 33.27, 44],
  [600482, '中国动力', 33.27, 44],
  [600482, '中国动力', 33.27, 44],
  [600482, '中国动力', 33.27, 44],
  [600482, '中国动力', 33.27, 44],
  [600482, '中国动力', 33.27, 44],
  [600482, '中国动力', 33.27, 44],
  [600482, '中国动力', 33.27, 44],
  [600482, '中国动力', 33.27, 44],
  [600482, '中国动力', 33.27, 44],
  [600482, '中国动力', 33.27, 44],
  [600482, '中国动力', 33.27, 44],
  [600482, '中国动力', 33.27, 44],
  [600482, '中国动力', 33.27, 44],
  [600482, '中国动力', 33.27, 44],
]

const ASC_STOCK_LIST = [
  [600482, '中国动力', 33.27, -10.01],
  [600482, '中国动力', 33.27, -10],
  [600482, '中国动力', 33.27, -9.84],
  [600482, '中国动力', 33.27, 44],
  [600482, '中国动力', 33.27, 44],
  [600482, '中国动力', 33.27, 44],
  [600482, '中国动力', 33.27, 44],
  [600482, '中国动力', 33.27, 44],
  [600482, '中国动力', 33.27, 44],
  [600482, '中国动力', 33.27, 44],
  [600482, '中国动力', 33.27, 44],
  [600482, '中国动力', 33.27, 44],
  [600482, '中国动力', 33.27, 44],
  [600482, '中国动力', 33.27, 44],
  [600482, '中国动力', 33.27, 44],
  [600482, '中国动力', 33.27, 44],
  [600482, '中国动力', 33.27, 44],
  [600482, '中国动力', 33.27, 44],
  [600482, '中国动力', 33.27, 44],
  [600482, '中国动力', 33.27, 44],
  [600482, '中国动力', 33.27, 44],
]

type Prop = {
  width: number
}

export default class PlateList extends React.Component<Prop, any> {
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

  private _chartLayout: ChartLayoutModel

  private _wrapperScroller: IScroll
  private _indexesListScroller: IScroll
  private _descListScroller: IScroll
  private _ascListScroller: IScroll

  constructor (props: any, context: { chartLayout: ChartLayoutModel }) {
    super(props, context)
    this._chartLayout = context.chartLayout
    this.clickHandler = this.clickHandler.bind(this)
  }

  public shouldComponentUpdate () {
    return false
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
    })
    this._descListScroller = new IScroll(this.refs.descList, {
      mouseWheel: true,
      scrollbars: true,
      fadeScrollbars: true,
    })
    this._ascListScroller = new IScroll(this.refs.ascList, {
      mouseWheel: true,
      scrollbars: true,
      fadeScrollbars: true,
    })
  }

  public componentDidUpdate () {
    this._wrapperScroller.refresh()
    this._indexesListScroller.refresh()
    this._descListScroller.refresh()
    this._ascListScroller.refresh()
  }

  public componentWillUnmount () {
    this._wrapperScroller.destroy()
    this._indexesListScroller.destroy()
    this._descListScroller.destroy()
    this._ascListScroller.destroy()
  }

  public render () {
    return (
      <div ref='wrapper' className='chart-main-board'>
        <div className='wrapper'>
          <div className='indexes-list'>
            <table className='header s-table stripe top-header'>
              <thead>
                <tr>
                  <th width='33%'>指数名称</th>
                  <th width='33%'>涨跌幅</th>
                  <th width='34%'>涨跌点数</th>
                </tr>
              </thead>
            </table>
            <div className='body' ref='indexesList'>
              <table className='s-table stripe top-header'>
                <tbody>
                  {
                    INDEXES.map((plate, i) =>
                      <tr key={i}>
                        <td width='33%'>{plate[0]}</td>
                        <td width='33%'>{(+plate[1]).toFixed(2)}%</td>
                        <td width='34%'>{(+plate[2]).toFixed(2)}</td>
                      </tr>
                    )
                  }
                </tbody>
              </table>
            </div>
          </div>
          <div className='separator'></div>
          <div className='desc-list'>
            <table className='header s-table stripe top-header'>
              <thead>
                <tr>
                  <th width='33%'>股票名称</th>
                  <th width='34%'>最新价</th>
                  <th width='34%'>涨跌幅</th>
                </tr>
              </thead>
            </table>
            <div className='body' ref='descList' >
              <table className='s-table stripe top-header'>
                <tbody>
                  {
                    DESC_STOCK_LIST.map((stock, i) =>
                      <tr key={i}>
                        <td width='33%'>{stock[1]}</td>
                        <td width='34%'>{(+stock[2]).toFixed(2)}</td>
                        <td width='34%'>{(+stock[3]).toFixed(2)}%</td>
                      </tr>
                    )
                  }
                </tbody>
              </table>
            </div>
          </div>
          <div className='separator'></div>
          <div className='asc-list'>
            <table className='header s-table stripe top-header'>
              <thead>
                <tr>
                  <th width='33%'>股票名称</th>
                  <th width='34%'>最新价</th>
                  <th width='34%'>涨跌幅</th>
                </tr>
              </thead>
            </table>
            <div className='body' ref='ascList' >
              <table className='s-table stripe top-header'>
                <tbody>
                  {
                    ASC_STOCK_LIST.map((stock, i) =>
                      <tr key={i}>
                        <td width='33%'>{stock[1]}</td>
                        <td width='34%'>{(+stock[2]).toFixed(2)}</td>
                        <td width='34%'>{(+stock[3]).toFixed(2)}%</td>
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

  private clickHandler (ev) {
  }
}
