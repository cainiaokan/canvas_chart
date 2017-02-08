import './index.less'
import * as React from 'react'
import IScroll = require('iscroll')
import { Plate } from '../pollmanager'
import { getStockListByPlate } from '../../../datasource'

type Prop = {
  plates: Plate[]
  height: number
}

type State = {
  activeIndex?: number
  stocks?: Array<{
    c: string
    n: string
    p_change: number
    price: number
  }>
}

export default class Plates extends React.Component<Prop, State> {

  public refs: {
    plates: HTMLDivElement
  }

  private _platesScroll
  private timer = null

  constructor () {
    super()
    this.state = {
      activeIndex: -1,
      stocks: null,
    }
    this.selectPlate = this.selectPlate.bind(this)
  }

  public componentDidMount () {
    this._platesScroll = new IScroll(this.refs.plates, {
      mouseWheel: true,
      scrollbars: true,
      fadeScrollbars: true,
      click: true,
    })
  }

  public componentWillUnmount () {
    this._platesScroll.destroy()
    this._platesScroll = null
    this.cancelStockListTimer()
  }

  public componentDidUpdate () {
    this._platesScroll.refresh()
  }

  public shouldComponentUpdate (nextProps: Prop, nextState: State) {
    const curProp = this.props
    const curState = this.state
    return curProp.plates !== nextProps.plates ||
      curProp.height !== nextProps.height ||
      curState.stocks !== nextState.stocks ||
      curState.activeIndex !== nextState.activeIndex
  }

  public render () {
    const plates = this.props.plates
    return plates ?
    <div className='plates' ref='plates' style={ {height: this.props.height + 'px'} }>
      <div>
      <h3>所属板块</h3>
        <ul className='plate-list'>
          {
            plates
              .map((plate, i) =>
              <li key={plate.n} className={this.state.activeIndex === i ? 'active' : ''}>
                <h4 data-index={i}
                    data-id={plate.bk_id}
                    onClick={this.selectPlate}>{plate.n}</h4>
                {
                  this.state.activeIndex === i ? <ul className='stocks-in-same-plate'>
                    {
                      this.state.stocks ? this.state.stocks.map(stockInfo => {
                        const clazzName = stockInfo.p_change > 0 ? 'positive' : stockInfo.p_change < 0 ? 'negtive' : ''
                        return <li key={stockInfo.c}>
                          <span className='stock-name'>
                            <b>{stockInfo.n}</b>
                            <i>{stockInfo.c}</i>
                          </span>
                          <span className={clazzName + ' price'}>{stockInfo.price}</span>
                          <span className={clazzName + ' change-rate'}>
                            {stockInfo.p_change > 0 ? '+' : ''}{(stockInfo.p_change * 100).toFixed(2)}%
                          </span>
                        </li>
                      }) : null
                    }
                  </ul> : null
                }
              </li>
            )
          }
        </ul>
      </div>
    </div> :
    <div className='plates' ref='plates' style={ {height: this.props.height + 'px'} }>
      <div className='no-plates'>无板块信息</div>
    </div>
  }

  private selectPlate (ev) {
    if (ev.touches) {
      ev.preventDefault()
    }
    const index = +ev.target.dataset.index
    const plateId = ev.target.dataset.id
    if (index === this.state.activeIndex) {
      this.cancelStockListTimer()
      this.setState({ activeIndex: -1 })
    } else {
      this.loadStockList(plateId)
      this.setState({
        activeIndex: index,
        stocks: null,
      })
    }
  }

  private loadStockList (plateId: string) {
    this.cancelStockListTimer()
    getStockListByPlate(plateId)
      .then(response =>
        response.json()
          .then(data => {
            this.setState({
              stocks: data.data.list,
            })
            this.timer = setTimeout(() => this.loadStockList(plateId), data.data.intver * 1000)
          })
      )
  }

  private cancelStockListTimer () {
    clearTimeout(this.timer)
  }
}
