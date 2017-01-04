import './index.less'
import * as React from 'react'
import * as iScroll from 'iscroll'
import { StockInfo } from '../../pollmanager'

type Prop = {
  height: number
  stockInfo: StockInfo
}

export default class StockDetail extends React.Component<Prop, any> {

  public refs: {
    container: HTMLLIElement
  }

  private _tickListScroll

  public shouldComponentUpdate (nextProps: Prop) {
    const curProp = this.props
    return curProp.stockInfo !== nextProps.stockInfo ||
      curProp.height !== nextProps.height
  }

  public componentDidUpdate () {
    this._tickListScroll.refresh()
  }

  public componentDidMount () {
    this._tickListScroll = new iScroll(this.refs.container, {
      mouseWheel: true,
      scrollbars: true,
      fadeScrollbars: true,
    })
  }

  public componentWillUnmount () {
    this._tickListScroll.destroy()
    this._tickListScroll = null
  }

  public render () {
    const stockInfo = this.props.stockInfo
    return (
      <div className='chart-tick-list'
           ref='container'
           style={ {height: `${this.props.height}px`} }>
        <div>
          <table>
            <tbody>
              {
                stockInfo.ticks.map((tick, i) =>
                  <tr key={i}>
                    <td width='34%'>
                      {tick.time.substring(0, 2)}:{tick.time.substring(2, 4)}:{tick.time.substring(4, 6)}
                    </td>
                    <td width='33%'>{tick.price}</td>
                    <td width='33%'
                      className={tick.type === '1' ? 'positive' :
                        tick.type === '2' ? 'negtive' : ''}>
                      {+tick.volume / 100}
                    </td>
                  </tr>
                )
              }
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}
