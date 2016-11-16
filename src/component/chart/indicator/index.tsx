import './index.less'
import * as React from 'react'

import ChartModel from '../../../model/chart'

type Prop = {
  chart: ChartModel
}

type State = {
  isOpen: boolean
}

export default class Indicator extends React.Component<Prop, State> {
  private _chart: ChartModel
  private _isOpen: boolean
  private _intervalCheckStatus: number

  constructor () {
    super()
    this.state = {
      isOpen: false,
    }
  }

  public componentShouldUpdate (nextProps: Prop) {
    return false
  }

  public componentWillMount() {
    this._chart = this.props.chart
  }

  public componentWillReceiveProps(nextProps: Prop) {
    this._chart = nextProps.chart
  }

  public componentDidMount () {
    this._isOpen = this.isOpen()
    this._intervalCheckStatus = setInterval(() => {
      const open = this.isOpen()
      if (this._isOpen !== open) {
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
    const now = new Date(this._chart.datasource.now() * 1000)
    const openAM = new Date()
    openAM.setHours(9)
    openAM.setMinutes(30)
    openAM.setSeconds(0)
    openAM.setMilliseconds(0)
    const closeAM = new Date(now.getTime())
    closeAM.setHours(11)
    closeAM.setMinutes(30)
    closeAM.setSeconds(0)
    closeAM.setMilliseconds(0)
    const openPM = new Date(now.getTime())
    openPM.setHours(13)
    openPM.setMinutes(0)
    openPM.setSeconds(0)
    openPM.setMilliseconds(0)
    const closePM = new Date(now.getTime())
    closePM.setHours(15)
    closePM.setMinutes(0)
    closePM.setSeconds(0)
    closePM.setMilliseconds(0)

    return (now >= openAM && now <= closeAM) || (now >= openPM && now <= closePM)
  }
}
