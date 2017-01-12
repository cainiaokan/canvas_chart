import './index.less'
import * as React from 'react'
import IScroll = require('iscroll')
import { PlateList } from '../pollmanager'
import { getStockListByPlate } from '../../../datasource'

type Prop = {
  plates: PlateList
  height: number
}

type State = {
  activeIndex?: number
  stocks?: StockInfo[]
}

type StockInfo = {
  code: string
  name: string
  p_change: number
  pre_close: number
  price: number
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
            plates.industry
              .map(name => ({name, type: 'industry'}))
              .concat(plates.concept.map(name => { return {name, type: 'concept'} }))
              .map((stock, i) =>
              <li key={stock.name} className={this.state.activeIndex === i ? 'active' : ''}>
                <h4 data-index={i}
                    data-type={stock.type}
                    onClick={this.selectPlate}
                    onTouchEnd={this.selectPlate}>{stock.name}</h4>
                {
                  this.state.activeIndex === i ? <ul className='stocks-in-same-plate'>
                    {
                      this.state.stocks ? this.state.stocks.map(stockInfo => {
                        const clazzName = stockInfo.p_change > 0 ? 'positive' : stockInfo.p_change < 0 ? 'negtive' : ''
                        return <li key={stockInfo.code}>
                          <span className='stock-name'>
                            <b>{stockInfo.name}</b>
                            <i>{stockInfo.code}</i>
                          </span>
                          <span className={clazzName + ' price'}>{stockInfo.price}</span>
                          <span className={clazzName + ' change-rate'}>
                            {stockInfo.p_change > 0 ? '+' + stockInfo.p_change : stockInfo.p_change}%
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
    const index = +ev.target.dataset.index
    if (index === this.state.activeIndex) {
      this.cancelStockListTimer()
      this.setState({ activeIndex: -1 })
    } else {
      this.loadStockList(ev.target.innerHTML, ev.target.dataset.type)
      this.setState({
        activeIndex: index,
        stocks: null,
      })
    }
  }

  private loadStockList (name: string, type: string) {
    this.cancelStockListTimer()
    getStockListByPlate(name, type)
      .then(response =>
        response.json()
          .then(data => {
            data = data.data
            this.setState({
              stocks: data.stock_list,
            })
            this.timer = setTimeout(() => this.loadStockList(name, type), data.reflush_time * 1000)
          })
      )
  }

  private cancelStockListTimer () {
    clearTimeout(this.timer)
  }
}
