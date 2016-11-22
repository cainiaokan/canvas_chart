import * as React from 'react'
import { SUPPORT_TOUCH, MOVE_EVENT, END_EVENT } from '../constant'
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
    this.mouseDownHandler = this.mouseDownHandler.bind(this)
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
    document.addEventListener(MOVE_EVENT, this.mouseMoveHandler)
    document.addEventListener(END_EVENT, this.mouseUpHandler)
  }

  public componentWillUnmount () {
    document.removeEventListener(MOVE_EVENT, this.mouseMoveHandler)
    document.removeEventListener(END_EVENT, this.mouseUpHandler)
  }

  public render () {
    const width = this.props.width
    const height = this.props.height

    let eventHandlers

    if (SUPPORT_TOUCH) {
      eventHandlers = {
        onTouchStart: this.mouseDownHandler,
      }
    } else {
      eventHandlers = {
        onMouseDown: this.mouseDownHandler,
      }
    }

    return (
      <div className='chart-line'>
        <div className='chart-axisx'
          style={ {height: height, width: width} }>
          <canvas ref={el => {
            if (el) {
              el.height = height
              el.width = width
              this._axis.ctx = el.getContext('2d')
            }
          }} width={width} height={height} {...eventHandlers}></canvas>
        </div>
      </div>
    )
  }

  private mouseMoveHandler (ev: any) {
    if (this._dragBarWidthStart) {
      const axisX = this._axis
      const pageX = ev.touches ? ev.touches[0].pageX : ev.pageX
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
    if (ev.touches) {
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
