import * as React from 'react'
import ChartLayout from '../model/chartlayout'
import AxisXModel, { MAX_BAR_WIDTH, MIN_BAR_WIDTH } from '../model/axisx'

type Prop = {
  axis: AxisXModel
  chartLayout: ChartLayout
  height: number
  width: number
}

export default class AxisX extends React.Component<Prop, any> {
  private _chartLayout: ChartLayout
  private _axis: AxisXModel
  private _dragBarWidthStart: boolean
  private _dragPosX: number
  private _isSupportTouch = 'ontouchend' in document ? true : false

  constructor () {
    super()
    this.mouseMoveHandler = this.mouseMoveHandler.bind(this)
    this.mouseUpHandler = this.mouseUpHandler.bind(this)
  }

  public componentWillMount () {
    this._chartLayout = this.props.chartLayout
    this._axis = this.props.axis
    this._axis.size = {
      height: this.props.height,
      width: this.props.width,
    }
  }

  public componentWillReceiveProps (nextProps: Prop) {
    this._chartLayout = nextProps.chartLayout
    this._axis = nextProps.axis
    this._axis.size = {
      height: nextProps.height,
      width: nextProps.width,
    }
  }

  public componentDidMount () {
    if (this._isSupportTouch) {
      document.addEventListener('touchmove', this.mouseMoveHandler)
      document.addEventListener('touchend', this.mouseUpHandler)
    } else {
      document.addEventListener('mousemove', this.mouseMoveHandler)
      document.addEventListener('mouseup', this.mouseUpHandler)
    }
  }

  public componentWillUnmount () {
    if (this._isSupportTouch) {
      document.removeEventListener('touchmove', this.mouseMoveHandler)
      document.removeEventListener('touchend', this.mouseUpHandler)
    } else {
      document.removeEventListener('mousemove', this.mouseMoveHandler)
      document.removeEventListener('mouseup', this.mouseUpHandler)
    }
  }

  public render () {
    const width = this.props.width
    const height = this.props.height
    return (
      <div className='chart-line'>
        <div className='chart-axisx'
          onMouseDown={!this._isSupportTouch ? this.mouseDownHandler.bind(this) : null}
          onTouchStart={this._isSupportTouch ? this.mouseDownHandler.bind(this) : null}
          style={ {height: height, width: width} }>
          <canvas ref={el => {
            if (el) {
              el.height = height
              el.width = width
              this._axis.ctx = el.getContext('2d')
            }
          }} width={width} height={height}></canvas>
        </div>
      </div>
    )
  }

  private mouseMoveHandler (ev: any) {
    if (this._dragBarWidthStart) {
      const axisX = this._axis
      const pageX = this._isSupportTouch ? ev.touches[0].pageX : ev.pageX
      const curBarWidth = axisX.barWidth
      const newBarWidth = curBarWidth - (pageX - this._dragPosX) / 100
      if (newBarWidth < MIN_BAR_WIDTH) {
        axisX.barWidth = MIN_BAR_WIDTH
      } else if (newBarWidth > MAX_BAR_WIDTH) {
        axisX.barWidth = MAX_BAR_WIDTH
      } else {
        axisX.barWidth = newBarWidth
      }
      axisX.offset *= axisX.barWidth / curBarWidth
      this._dragPosX = pageX
    }
  }

  private mouseDownHandler (ev: any) {
    if (this._isSupportTouch) {
      this._dragPosX = ev.touches[0].pageX
    } else {
      this._dragPosX = ev.pageX
    }
    this._dragBarWidthStart = true
  }

  private mouseUpHandler (ev: MouseEvent) {
    this._dragBarWidthStart = false
  }
}
