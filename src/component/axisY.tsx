import * as React from 'react'
import { SUPPORT_TOUCH, MOVE_EVENT, END_EVENT } from '../constant'
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
    this.mouseDownHandler = this.mouseDownHandler.bind(this)
    this.mouseMoveHandler = this.mouseMoveHandler.bind(this)
    this.mouseUpHandler = this.mouseUpHandler.bind(this)
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
      <div className='chart-axisy' style={ {height: height + 'px', width: width + 'px'} }>
        <canvas ref={el => {
          if (el) {
            el.height = this.props.height
            el.width = this.props.width
            this._axis.ctx = el.getContext('2d')
          }
        }} width={width} height={height} {...eventHandlers}></canvas>
      </div>
    )
  }

  private mouseDownHandler (ev: any) {
    this._dragMarginStart = true
    if (ev.touches) {
      this._dragPosY = ev.touches[0].pageY
    } else {
      this._dragPosY = ev.pageY
    }
  }

  private mouseMoveHandler (ev: any) {
    if (this._dragMarginStart) {
      const axisY = this._axis
      const pageY = ev.touches ? ev.touches[0].pageY : ev.pageY
      const margin = axisY.margin
      const newMargin = margin -
        (pageY - this._dragPosY)
      axisY.margin = newMargin
      this._dragPosY = pageY
    }
  }

  private mouseUpHandler () {
    this._dragMarginStart = false
  }
}
