import './index.less'
import * as React from 'react'
import * as _ from 'underscore'
import ChartModel from '../../../model/chart'
import { OPEN_DAYS, OPEN_TIME_RANGE } from '../../../constant'

type Prop = {
  chart: ChartModel
}

type State = {
  isOpen: boolean
}

export default class Indicator extends React.Component<Prop, State> {
  private _chart: ChartModel
  private _intervalCheckStatus: number

  constructor () {
    super()
    this.state = {
      isOpen: false,
    }
  }

  public shouldComponentUpdate (nextProps: Prop, nextState: State) {
    return !_.isEqual(this.state, nextState)
  }

  public componentWillMount() {
    this._chart = this.props.chart
  }

  public componentDidMount () {
    this._intervalCheckStatus = setInterval(() => {
      const open = this.isOpen()
      if (this.state.isOpen !== open) {
        this.setState({ isOpen: open })
      }
    }, 10000)
  }

  public componentWillUnmount () {
    clearInterval(this._intervalCheckStatus)
  }

  public render () {
    const isOpen = this.isOpen()
    return <div className={isOpen ? 'chart-indicator open' : 'chart-indicator'}>
      {
        isOpen ? '实时' : '收盘'
      }
    </div>
  }

  private isOpen (): boolean {
    const now = this._chart.datasource.now() * 1000
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
