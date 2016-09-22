import * as React from 'react'
import ChartLayout from '../model/chartlayout'
import AxisYModel from '../model/axisy'

type Prop = {
  chartLayout: ChartLayout
  axis: AxisYModel
  width: number
  height: number
}

export default class AxisY extends React.Component<Prop, any> {
  private _chartLayout: ChartLayout
  private _axis: AxisYModel
  private _dragMarginStart: boolean
  private _dragPosY: number

  constructor () {
    super()
    this._dragMarginStart = false
    this.onMouseMoveHandler = this.onMouseMoveHandler.bind(this)
    this.onMouseUpHandler = this.onMouseUpHandler.bind(this)
  }

  public componentWillMount () {
    this._axis = this.props.axis
    this._chartLayout = this.props.chartLayout
    this._axis.size = {
      height: this.props.height,
      width: this.props.width,
    }
  }

  public componentWillReceiveProps (nextProps: Prop) {
    this._axis = nextProps.axis
    this._chartLayout = nextProps.chartLayout
    this._axis.size = {
      height: nextProps.height,
      width: nextProps.width,
    }
  }

  public componentDidMount () {
    document.addEventListener('mousemove', this.onMouseMoveHandler)
    document.addEventListener('mouseup', this.onMouseUpHandler)
  }

  public componentDidUpdate () {
    this._axis.size = {
      height: this.props.height,
      width: this.props.width,
    }
  }

  public componentWillUnmount () {
    document.removeEventListener('mousemove', this.onMouseMoveHandler)
    document.removeEventListener('mouseup', this.onMouseUpHandler)
  }

  public render () {
    const width = this.props.width
    const height = this.props.height
    return (
      <div className='chart-axisy' style={ {height: height + 'px', width: width + 'px'} }>
        <canvas ref={el => {
          if (el) {
            el.height = this.props.height
            el.width = this.props.width
            this._axis.ctx = el.getContext('2d')
          }
        }} width={width} height={height}
        onMouseDown={this.onMouseDownHandler.bind(this)}></canvas>
      </div>
    )
  }

  private onMouseDownHandler (ev: MouseEvent) {
    this._dragMarginStart = true
    this._dragPosY = ev.pageY
  }

  private onMouseMoveHandler (ev: MouseEvent) {
    if (this._dragMarginStart) {
      const axisY = this._axis
      const pageY = ev.pageY
      const margin = axisY.margin
      const newMargin = margin -
        (pageY - this._dragPosY)
      axisY.margin = newMargin
      this._dragPosY = pageY
    }
  }

  private onMouseUpHandler () {
    this._dragMarginStart = false
  }
}
