import * as React from 'react'
import { SUPPORT_TOUCH, MOVE_EVENT, END_EVENT } from '../constant'
import AxisYModel from '../model/axisy'

type Prop = {
  axis: AxisYModel
  width: number
  height: number
}

export default class AxisY extends React.Component<Prop, any> {

  public refs: {
    [propName: string]: Element
    canvas: HTMLCanvasElement
  }

  private _dragMarginStart: boolean
  private _dragPosY: number

  constructor () {
    super()
    this._dragMarginStart = false
    this.mouseDownHandler = this.mouseDownHandler.bind(this)
    this.mouseMoveHandler = this.mouseMoveHandler.bind(this)
    this.mouseUpHandler = this.mouseUpHandler.bind(this)
  }

  public componentDidMount () {
    const axisY = this.props.axis
    axisY.ctx = this.refs.canvas.getContext('2d')
    axisY.width = this.props.width
    axisY.height = this.props.height
    document.addEventListener(MOVE_EVENT, this.mouseMoveHandler)
    document.addEventListener(END_EVENT, this.mouseUpHandler)
  }

  public componentWillUnmount () {
    document.removeEventListener(MOVE_EVENT, this.mouseMoveHandler)
    document.removeEventListener(END_EVENT, this.mouseUpHandler)
  }

  public componentDidUpdate () {
    const axisY = this.props.axis
    const width = this.props.width
    const height = this.props.height
    const canvas = this.refs.canvas
    axisY.width = width
    axisY.height = height
    canvas.width = width
    canvas.height = height
    axisY.ctx = canvas.getContext('2d')
  }

  public shouldComponentUpdate (nextProps: Prop) {
    const curProps = this.props
    return curProps.width !== nextProps.width ||
           curProps.height !== nextProps.height
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
        <canvas ref='canvas' width={width} height={height} {...eventHandlers}></canvas>
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
      const axisY = this.props.axis
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
