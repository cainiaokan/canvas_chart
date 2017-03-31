import './index.less'
import * as React from 'react'
import * as _ from 'underscore'
import ChartLayoutModel from '../../../model/chartlayout'
import ChartModel from '../../../model/chart'
import { OPEN_DAYS, OPEN_TIME_RANGE } from '../../../constant'

type Prop = {
  chart: ChartModel
}

type State = {
  isOpen?: boolean
  isLoading?: boolean
}

export default class Indicator extends React.Component<Prop, State> {
  public static contextTypes = {
    chartLayout: React.PropTypes.instanceOf(ChartLayoutModel),
  }
  public context: { chartLayout: ChartLayoutModel }

  private _chartLayout: ChartLayoutModel
  private _intervalCheckStatus: number

  constructor (props: Prop, context: { chartLayout: ChartLayoutModel }) {
    super(props)
    this._chartLayout = context.chartLayout
    this.state = {
      isOpen: false,
      isLoading: false,
    }
    this.loadingStartHandler = this.loadingStartHandler.bind(this)
    this.loadingEndHandler = this.loadingEndHandler.bind(this)
  }

  public shouldComponentUpdate (nextProps: Prop, nextState: State) {
    const curProps = this.props
    return curProps.chart !== nextProps.chart ||
           !_.isEqual(this.state, nextState)
  }

  public componentDidMount () {
    this._intervalCheckStatus = setInterval(() => {
      const open = this.isOpen()
      if (this.state.isOpen !== open) {
        this.setState({ isOpen: open })
      }
    }, 10000)
    this._chartLayout.addListener('loading_start', this.loadingStartHandler)
    this._chartLayout.addListener('loading_end', this.loadingEndHandler)
  }

  public componentWillUnmount () {
    clearInterval(this._intervalCheckStatus)
    this._chartLayout.removeListener('loading_start', this.loadingStartHandler)
    this._chartLayout.removeListener('loading_end', this.loadingEndHandler)
  }

  public render () {
    const { isOpen, isLoading } = this.state
    return <div className={`chart-indicator ${isLoading ? 'loading' : isOpen ? 'open' : ''}`}>
      {
        isLoading ? '加载中...' : isOpen ? '实时' : '收盘'
      }
    </div>
  }

  private loadingStartHandler () {
    this.setState({ isLoading: true })
  }

  private loadingEndHandler () {
    this.setState({ isLoading: false })
  }

  private isOpen (): boolean {
    const now = this.props.chart.datasource.now() * 1000
    const nowTime = new Date(now)

    if (OPEN_DAYS.indexOf(nowTime.getDay()) === -1) {
      return false
    }

    return OPEN_TIME_RANGE.some(timeInterval => {
      const openTime = new Date(now)
      openTime.setHours(timeInterval[0][0])
      openTime.setMinutes(timeInterval[0][1])
      openTime.setSeconds(0)
      openTime.setMilliseconds(0)

      const closeTime = new Date(now)
      closeTime.setHours(timeInterval[1][0])
      closeTime.setMinutes(timeInterval[1][1])
      closeTime.setSeconds(0)
      closeTime.setMilliseconds(0)

      return nowTime.getTime() >= openTime.getTime() && nowTime.getTime() <= closeTime.getTime()
    })
  }
}
