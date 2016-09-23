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
    document.addEventListener('mousemove', this.mouseMoveHandler)
    document.addEventListener('mouseup', this.mouseUpHandler)
  }

  public componentWillUnmount () {
    document.removeEventListener('mousemove', this.mouseMoveHandler)
    document.removeEventListener('mouseup', this.mouseUpHandler)
  }

  public render () {
    const width = this.props.width
    const height = this.props.height
    return (
      <div className='chart-line'>
        <div className='chart-axisx'
          onMouseDown={this.mouseDownHandler.bind(this)}
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

  private mouseMoveHandler (ev: MouseEvent) {
    if (this._dragBarWidthStart) {
      const axisX = this._axis
      const pageX = ev.pageX
      const curBarWidth = axisX.barWidth
      const newBarWidth = curBarWidth - (ev.pageX - this._dragPosX) / 50
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

  private mouseDownHandler (ev: MouseEvent) {
    this._dragPosX = ev.pageX
    this._dragBarWidthStart = true
  }

  private mouseUpHandler (ev: MouseEvent) {
    this._dragBarWidthStart = false
  }
}
