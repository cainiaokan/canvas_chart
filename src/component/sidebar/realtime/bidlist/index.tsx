import './index.less'
import * as React from 'react'
import IScroll = require('iscroll')
import { StockInfo } from '../../pollmanager'

type Prop = {
  maxHeight: number
  stockInfo: StockInfo
}

export default class BidList extends React.Component<Prop, any> {

  public refs: {
    container: HTMLDivElement
  }

  private _bidListScroll

  public shouldComponentUpdate (nextProps: Prop) {
    const curProp = this.props
    return curProp.stockInfo !== nextProps.stockInfo ||
      curProp.maxHeight !== nextProps.maxHeight
  }

  public componentDidMount () {
    this._bidListScroll = new IScroll(this.refs.container, {
      mouseWheel: true,
      scrollbars: true,
      fadeScrollbars: true,
    })
  }

  public componentDidUpdate () {
    this._bidListScroll.refresh()
  }

  public componentWillUnmount () {
    this._bidListScroll.destroy()
    this._bidListScroll = null
  }

  public render () {
    const stockInfo = this.props.stockInfo

    return (
      <div className='chart-bid-list'
           ref='container'
           style={{ maxHeight: `${this.props.maxHeight}px` } }>
        <div>
          <div className='caption'>
            <b className='sold'>卖<br/><br/>盘</b>
            <b className='buy'>买<br/><br/>盘</b>
          </div>
          <div className='bid'>
            <table>
              <tbody>
                {
                  stockInfo.selling.map((item, i) =>
                    <tr key={i}>
                      <td width='33.33%'>{5 - i}</td>
                      <td width='33.33%' className={item[0] > stockInfo.preClose ? 'positive' : 'negtive'}>
                        {item[0]}
                      </td>
                      <td width='33.33%'>{item[1] / 100}</td>
                    </tr>
                  )
                }
              </tbody>
            </table>
            <hr/>
            <table>
              <tbody>
                {
                  stockInfo.buying.map((item, i) =>
                    <tr key={i}>
                      <td width='33.33%'>{i + 1}</td>
                      <td width='33.33%' className={item[0] > stockInfo.preClose ? 'positive' : 'negtive'}>
                        {item[0]}
                      </td>
                      <td width='33.33%'>{item[1] / 100}</td>
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
}
