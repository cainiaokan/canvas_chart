import './index.less'
import * as React from 'react'
import { max as d3_max } from 'd3-array'
import { scaleBand, scaleLinear } from 'd3-scale'
import { arc as d3_arc, pie as d3_pie } from 'd3-shape'
import { StockInfo, CapitalFlowInfo } from '../pollmanager'
import * as iScroll from '../../../vendor/iscroll'

type Prop = {
  width: number
  height: number
  stockInfo: StockInfo
  capitalFlowInfo: CapitalFlowInfo
}

type State = {
  tabIndex: number
}

export default class Realtime extends React.Component<Prop, State> {

  public refs: {
    inOutDonut: HTMLCanvasElement
    inOutBar: HTMLCanvasElement
    capitalInNum: HTMLElement
    capitalOutNum: HTMLElement
    bidList: HTMLDivElement
    stockInfo: HTMLDivElement
    detailedInfo: HTMLDivElement
  }

  private _bidListScroll
  private _stockInfoScroll
  private _detailedInfoScroll

  private _capitalFlowInfo: CapitalFlowInfo

  constructor () {
    super()
    this.state = {
      tabIndex: 0,
    }
    this.drawChart = this.drawChart.bind(this)
  }

  public shouldComponentUpdate (nextProps: Prop, nextState: State) {
    const curProp = this.props
    const curState = this.state
    return curProp.stockInfo !== nextProps.stockInfo ||
      curProp.capitalFlowInfo !== nextProps.capitalFlowInfo ||
      curProp.width !== nextProps.width ||
      curProp.height !== nextProps.height ||
      curState.tabIndex !== nextState.tabIndex
  }

  public componentDidUpdate () {
    if (this._bidListScroll) {
      this._bidListScroll.refresh()
    }
    this._stockInfoScroll.refresh()
    if (this._detailedInfoScroll) {
      this._detailedInfoScroll.refresh()
    }
  }

  public componentDidMount () {
    if (this.props.capitalFlowInfo) {
      this._capitalFlowInfo = this.props.capitalFlowInfo
      this.drawChart(this.props.capitalFlowInfo)
    }
    this._bidListScroll = new iScroll(this.refs.bidList, {
      mouseWheel: true,
      scrollbars: true,
      fadeScrollbars: true,
    })
    this._stockInfoScroll = new iScroll(this.refs.stockInfo, {
      mouseWheel: true,
      scrollbars: true,
      fadeScrollbars: true,
    })
    this._detailedInfoScroll = new iScroll(this.refs.detailedInfo, {
      mouseWheel: true,
      scrollbars: true,
      fadeScrollbars: true,
    })
  }

  public componentWillReceiveProps (nextProps) {
    if (nextProps.capitalFlowInfo && this._capitalFlowInfo !== nextProps.capitalFlowInfo) {
      this._capitalFlowInfo = nextProps.capitalFlowInfo
      this.drawChart(nextProps.capitalFlowInfo)
    }
  }

  public render () {
    const stockInfo = this.props.stockInfo

    const showBidList = stockInfo && stockInfo.selling && stockInfo.buying
    const showDetailedInfo =  stockInfo && stockInfo.ticks.length

    let bidListHeightRatio = 0
    let stockInfoHeightRatio = 0
    let detailedInfoHeightRatio = 0

    if (showBidList) {
      if (showDetailedInfo) {
        bidListHeightRatio = 0.3
        stockInfoHeightRatio = 0.3
        detailedInfoHeightRatio = 0.4
      } else {
        bidListHeightRatio = 0.5
        stockInfoHeightRatio = 0.5
      }
    } else {
      if (showDetailedInfo) {
        stockInfoHeightRatio = 0.5
        detailedInfoHeightRatio = 0.5
      } else {
        stockInfoHeightRatio = 1
      }
    }

    return <div className='realtime-info'>
      <div className='bid-list' ref='bidList' style={{
        maxHeight: this.props.height * bidListHeightRatio + 'px',
        display: showBidList ? 'block' : 'none',
      } }>
        <div>
          <div className='caption'>
            <b className='sold'>卖<br/><br/>盘</b>
            <b className='buy'>买<br/><br/>盘</b>
          </div>
          <div className='bid'>
            <table>
              <tbody>
                {
                  stockInfo && stockInfo.selling && stockInfo.selling.map((item, i) =>
                    <tr>
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
                  stockInfo && stockInfo.buying && stockInfo.buying.map((item, i) =>
                    <tr>
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

      <div className='stock-info'
           ref='stockInfo'
           style={ { maxHeight: this.props.height * stockInfoHeightRatio + 'px' } }>
        <table>
          <tbody>
            <tr>
              <th width='67'>昨收</th>
              <td width='52'>{stockInfo ? stockInfo.preClose : '--'}</td>
              <th width='67'>成交量</th>
              <td width='81'>
                {stockInfo ? (stockInfo.volume >= 10000 ? ~~stockInfo.volume / 10000 : ~~stockInfo.volume) : '--'}
                {stockInfo ? (stockInfo.volume >= 10000 ? '亿手' : '万手') : '--'}
              </td>
            </tr>
            <tr>
              <th>今开</th>
              <td className={stockInfo ? (stockInfo.open > stockInfo.preClose ? 'positive' : 'negtive') : ''}>
                {stockInfo ? stockInfo.open : '--'}
              </td>
              <th>成交额</th>
              <td>
                {
                  stockInfo ?
                    (stockInfo.amount >= 10000 ?
                      (stockInfo.amount / 10000).toFixed(2)
                      : stockInfo.amount.toFixed(2))
                  :'--'
                }
                {stockInfo ? (stockInfo.amount >= 10000 ? '万亿' : '亿') : '--'}
              </td>
            </tr>
            <tr>
              <th>最高</th>
              <td className={stockInfo ? (stockInfo.high > stockInfo.preClose ? 'positive' : 'negtive') : ''}>
                {stockInfo ? stockInfo.high : '--'}
              </td>
              <th>振幅</th><td>{stockInfo ? stockInfo.amplitude : '--'}%</td>
            </tr>
            <tr>
              <th>最低</th>
              <td className={stockInfo ? (stockInfo.low > stockInfo.preClose ? 'positive' : 'negtive') : ''}>
                {stockInfo ? stockInfo.low : '--'}
              </td>
              <th>换手率</th>
              <td>{stockInfo && stockInfo.turnover ? stockInfo.turnover + '%' : '--'}</td>
            </tr>
            <tr>
              <th>涨停</th><td className='positive'>{stockInfo ? (stockInfo.preClose * 1.1).toFixed(2) : '--'}</td>
              <th>内盘</th><td className='positive'>{stockInfo && stockInfo.inVol ? stockInfo.inVol : '--'}</td>
            </tr>
            <tr>
              <th>跌停</th><td className='negtive'>{stockInfo ? (stockInfo.preClose * 0.9).toFixed(2) : '--'}</td>
              <th>外盘</th><td className='negtive'>{stockInfo && stockInfo.outVol ? stockInfo.outVol : '--'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className='detailed-info' ref='detailedInfo' style={ {
        maxHeight: this.props.height * detailedInfoHeightRatio + 'px',
        display: showDetailedInfo ? 'block' : 'none',
      } }>
        <div>
          <ul className='tab-btn-group'
            onClick={this.switchTabPage.bind(this)}
            onTouchStart={this.switchTabPage.bind(this)}>
            <li className={this.state.tabIndex === 0 ? 'on' : ''} data-index='0'>明细</li>
            <li className={this.state.tabIndex === 1 ? 'on' : ''} data-index='1'>资金</li>
          </ul>
          <ul className='tab-container'>
            <li className={this.state.tabIndex === 0 ? 'trans-entry on' : 'trans-entry'}>
              <table>
                <tbody>
                  {
                    stockInfo && stockInfo.ticks && stockInfo.ticks.map(tick =>
                      <tr>
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
            </li>
            <li className={this.state.tabIndex === 1 ? 'in-out-chart on' : 'in-out-chart'}>
              <p>单位：万元</p>
              <div className='in-out-legend clearfix'>
                  <div className='color-desc-1'>
                      <div className='color-block'></div>
                      <p>散户流入</p>
                  </div>
                  <div className='color-desc-2'>
                      <div className='color-block'></div>
                      <p>主力流入</p>
                  </div>
                  <div className='color-desc-4'>
                      <div className='color-block'></div>
                      <p>散户流出</p>
                  </div>
                  <div className='color-desc-3'>
                      <div className='color-block'></div>
                      <p>主力流出</p>
                  </div>
              </div>
              <canvas ref='inOutDonut' width='248' height='128'></canvas>
              <div className='clearfix'>
                  <p className='capital-in'>流入<i ref='capitalInNum' className='capital-in-num'>1451</i></p>
                  <p className='capital-out'>流出<i ref='capitalOutNum' className='capital-out-num'>1709</i></p>
              </div>
              <h3>最近5日主力流入</h3>
              <canvas ref='inOutBar' width='248' height='128'></canvas>
            </li>
          </ul>
        </div>
      </div>
    </div>
  }

  private switchTabPage (ev) {
    const index = +ev.target.dataset.index
    this.setState({ tabIndex: index })
    if (index === 1) {
      this.drawChart(this.props.capitalFlowInfo)
    }
  }

  private drawChart (data: CapitalFlowInfo) {
    this.drawCapitalInOutDonutChart(data.donutChartData)
    this.drawfiveDaysCapitalInOutBarChart(data.barChartData)
  }

  private drawfiveDaysCapitalInOutBarChart (data) {
    const width = 248
    const height = 128
    const canvas = this.refs.inOutBar
    const context = canvas.getContext('2d')

    const x = scaleBand()
        .rangeRound([0, width])
        .padding(0.4)

    const y = scaleLinear()
        .rangeRound([height, 0])

    // data = [1234.56, -1234.56, 234.56, -1234.56, 589.56]
    x.domain(data.map((d, i) => i))

    y.domain([0, d3_max(data, d => Math.abs(d as number))])

    context.clearRect(0, 0, width, height)
    context.save()
    context.translate(0, height / 2)
    context.beginPath()
    context.moveTo(0, 0)
    context.lineTo(width, 0)
    context.strokeStyle = '#999'
    context.stroke()

    context.textAlign = 'center'
    context.textBaseline = 'middle'
    data.forEach(function(d, i) {
      if (d > 0) {
        context.fillStyle = '#ff524f'
        context.fillRect(x(i), (y(d) - height) / 2, x.bandwidth(), (height - y(d)) / 2)
        context.fillText(~~(d + 0.5) + '', x(i) + x.bandwidth() / 2, 12)

      } else {
        context.fillStyle = '#15af3d'
        context.fillRect(x(i), 0, x.bandwidth(), (height - y(Math.abs(d))) / 2)
        context.fillText(~~(d + 0.5) + '', x(i) + x.bandwidth() / 2, -12)
      }
    })
    context.restore()
  }

  private drawCapitalInOutDonutChart (data) {
    const canvas = this.refs.inOutDonut
    const context = canvas.getContext('2d')

    const width = 248
    const height = 128
    const radius = width / 2

    const colors = ['#ff524f', '#ff7d42', '#68ce3c', '#15af3d']

    const arc = d3_arc()
      .context(context)

    // 绘制扇形白边
    const bgArc = d3_arc()
      .context(context)

    const labelArc = d3_arc()
      .context(context)

    const pie = d3_pie()
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2)
      .padAngle(0)
      .sort(null)

    const arcs = pie(data)

    context.clearRect(0, 0, width, height)
    context.save()
    context.translate(width / 2, height)

    // 绘制灰边
    bgArc({
      outerRadius: radius - 5,
      innerRadius: radius - 65,
      startAngle: -Math.PI / 2,
      endAngle: Math.PI / 2,
      padAngle: 0,
    })

    context.fillStyle = '#f1f3f6'
    context.fill()

    arcs.forEach((d, i) => {
      context.beginPath()
      arc({
        outerRadius: radius - 10,
        innerRadius: radius - 60,
        startAngle: d.startAngle,
        endAngle: d.endAngle,
        padAngle: d.padAngle,
      })
      context.closePath()
      context.fillStyle = colors[i]
      context.fill()
    })

    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillStyle = '#fff'

    const total = data.reduce((prev, cur) => prev + cur, 0)

    arcs.forEach(function(d) {
      if (d.value / total * 100 < 3) {
        return
      }
      const c = labelArc.centroid({
        outerRadius: radius - 35,
        innerRadius: radius - 35,
        startAngle: d.startAngle,
        endAngle: d.endAngle,
        padAngle: d.padAngle,
      })
      context.fillText(~~(d.value / total * 100 + 0.5) + '%', c[0], c[1])
    })

    context.font = '26px Arial'

    const addup = data[0] + data[1] - data[2] - data[3]

    if (addup > 0) {
      context.fillStyle = '#ff524f'
      context.fillText('+' + ~~(addup + 0.5), 0, -12)
    } else {
      context.fillStyle = '#15af3d'
      context.fillText(~~(addup + 0.5) + '', 0, -12)
    }

    context.font = '14px Arial'
    context.fillStyle = '#999999'
    context.fillText('今日资金', 0, - 36)
    context.restore()

    this.refs.capitalInNum.innerHTML = ~~(data[0] + data[1] + 0.5) + ''
    this.refs.capitalOutNum.innerHTML = ~~(data[2] + data[3] + 0.5) + ''
  }
}
