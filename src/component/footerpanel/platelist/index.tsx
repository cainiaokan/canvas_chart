import './index.less'
import '../../../style/table.less'

import * as React from 'react'
import IScroll = require('iscroll')
import ChartLayoutModel from '../../../model/chartlayout'
import { formatNumber } from '../../../util'

const PLATES = [
  ['核电核能', 5.43, 17.33, 76720000, 34, 56],
  ['军工', 5.78, 15.43, 74390000, 54, 81],
  ['地产', 4.21, 12.98, 52980000, 12, 23],
  ['电商股', 3.21, 9.36, 9760000, 8, 77],
  ['煤炭', 3.05, 9.92, 248000000, 43, 72],
  ['核电核能', 5.43, 17.33, 76720000, 34, 56],
  ['军工', 5.78, 15.43, 74390000, 54, 81],
  ['地产', 4.21, 12.98, 52980000, 12, 23],
  ['电商股', 3.21, 9.36, 9760000, 8, 77],
  ['煤炭', 3.05, 9.92, 248000000, 43, 72],
  ['核电核能', 5.43, 17.33, 76720000, 34, 56],
  ['军工', 5.78, 15.43, 74390000, 54, 81],
  ['地产', 4.21, 12.98, 52980000, 12, 23],
  ['电商股', 3.21, 9.36, 9760000, 8, 77],
  ['煤炭', 3.05, 9.92, 248000000, 43, 72],
]

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

type Prop = {
  width: number
}

export default class MainBoard extends React.Component<Prop, any> {
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
    this._chartLayout = context.chartLayout
    this.clickHandler = this.clickHandler.bind(this)
  }

  public shouldComponentUpdate (nextProps: Prop) {
    return false
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
    return (
      <div className='chart-plate' ref='wrapper'>
        <div className='wrapper'>
          <div className='plate-list'>
            <table className='header s-table stripe top-header'>
              <thead>
                <tr>
                  <th width='18%'>板块名称</th>
                  <th width='16%'>涨跌幅</th>
                  <th width='18%'>大单净比</th>
                  <th width='18%'>主力资金</th>
                  <th width='14%'>上涨数</th>
                  <th width='14%'>下跌数</th>
                  <th width='2%'></th>
                </tr>
              </thead>
            </table>
            <div className='body' ref='plateListBody'>
              <table className='s-table stripe top-header'>
                <tbody>
                  {
                    PLATES.map((plate, i) =>
                      <tr key={i}>
                        <td width='18%'>{plate[0]}</td>
                        <td width='16%'>{plate[1]}%</td>
                        <td width='18%'>{plate[2]}%</td>
                        <td width='18%'>{formatNumber(+plate[3])}</td>
                        <td width='14%'>{plate[4]}</td>
                        <td width='14%'>{plate[5]}</td>
                        <td width='2%'></td>
                      </tr>
                    )
                  }
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

  private clickHandler (ev) {
  }
}
