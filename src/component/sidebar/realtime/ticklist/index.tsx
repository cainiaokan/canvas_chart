import './index.less'
import * as React from 'react'
import IScroll = require('iscroll')
import { StockInfo } from '../../pollmanager'

type Prop = {
  maxHeight: number
  stockInfo: StockInfo
}

export default class StockDetail extends React.Component<Prop, any> {

  public refs: {
    container: HTMLDivElement
  }

  private _tickListScroll

  public shouldComponentUpdate (nextProps: Prop) {
    const curProp = this.props
    return curProp.stockInfo !== nextProps.stockInfo ||
      curProp.maxHeight !== nextProps.maxHeight
  }

  public componentDidMount () {
    this._tickListScroll = new IScroll(this.refs.container, {
      mouseWheel: true,
      scrollbars: true,
      fadeScrollbars: true,
    })
  }

  public componentDidUpdate () {
    this._tickListScroll.refresh()
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
           style={ {maxHeight: `${this.props.maxHeight}px`} }>
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
                      tick.type === '2' ? 'negative' : ''}>
                    {+tick.volume / 100}
                    <svg viewBox='0 0 10 12'>
                      <g><path d='M9.6,4.4c0.3,0.3,0.3,0.8,0,1.1C9.5,5.7,9.3,5.7,9.1,5.7S8.7,5.7,8.5,5.5L5.7,2.7v8.5c0,0.4-0.4,0.8-0.8,0.8c-0.4,0-0.8-0.4-0.8-0.8V2.7L1.4,5.5c-0.3,0.3-0.8,0.3-1.1,0s-0.3-0.8,0-1.1l4.1-4.1C4.5,0.1,4.7,0,4.9,0c0.2,0,0.4,0.1,0.6,0.2L9.6,4.4z'></path></g>
                    </svg>
                  </td>
                </tr>
              )
            }
          </tbody>
        </table>
      </div>
    )
  }
}
