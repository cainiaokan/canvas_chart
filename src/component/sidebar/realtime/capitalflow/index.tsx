import './index.less'
import * as React from 'react'
import * as _ from 'underscore'
import IScroll = require('iscroll')
import CapitalDonutChart from './donut'
import CapitalBarChart from './bar'
import { CapitalFlowInfo } from '../../pollmanager'
import { clientOffset } from '../../../../util'

type Prop = {
  maxHeight: number
  capitalFlowInfo: CapitalFlowInfo
}

type State = {
  showToolTip?: boolean
  label?: string
  color?: string
  value?: number
  left?: number
  top?: number
}

export default class CapitalFlow extends React.Component<Prop, State> {
  public refs: {
    container: HTMLDivElement
  }

  private _capitalFlowScroll

  constructor () {
    super()
    this.state = {
      showToolTip: false,
      label: '',
      color: '#fff',
      value: 0,
      left: 0,
      top: 0,
    }
    this.sectorMouseMoveHandler = this.sectorMouseMoveHandler.bind(this)
    this.sectorMouseLeaveHandler = this.sectorMouseLeaveHandler.bind(this)
  }

  public shouldComponentUpdate (nextProps: Prop, nextState: State) {
    return !_.isEqual(this.props, nextProps) ||
           !_.isEqual(this.state, nextState)
  }

  public componentDidMount () {
    this._capitalFlowScroll = new IScroll(this.refs.container, {
      mouseWheel: true,
      scrollbars: true,
      fadeScrollbars: true,
    })
  }

  public componentDidUpdate () {
    this._capitalFlowScroll.refresh()
  }

  public componentWillUnmount () {
    this._capitalFlowScroll.destroy()
    this._capitalFlowScroll = null
  }

  public render () {
    const capitalFlowInfo = this.props.capitalFlowInfo
    const donutChartData = capitalFlowInfo.donutChartData
    const barChartData = capitalFlowInfo.barChartData

    return (
      <div className='chart-capital-flow'
           ref='container'
           style={ {maxHeight: `${this.props.maxHeight}px`} }>
        <div>
          <CapitalDonutChart
            data={donutChartData}
            width={248}
            height={128}
            onSectorMouseMove={this.sectorMouseMoveHandler}
            onSectorMouseLeave={this.sectorMouseLeaveHandler} />
          <CapitalBarChart data={barChartData} width={248} height={128} />
        </div>
        <div className='tool-tip' style={ {
          display: this.state.showToolTip ? 'block' : 'none',
          left: this.state.left,
          top: this.state.top,
        } }>
          {this.state.label}:
          <span style={{color: this.state.color}}>{this.state.value}</span>
        </div>
      </div>
    )
  }

  private sectorMouseMoveHandler (data) {
    const offset = clientOffset(this.refs.container)
    this.setState({
      showToolTip: true,
      label: data.label,
      value: data.value,
      color: data.color,
      left: data.pageX - offset.left,
      top: data.pageY - offset.top,
    })
  }

  private sectorMouseLeaveHandler () {
    this.setState({ showToolTip: false })
  }
}
