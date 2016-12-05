import * as React from 'react'
import {
  SUPPORT_TOUCH,
  MOVE_EVENT,
  DOWN_EVENT_REACT,
  UP_EVENT,
} from '../constant'
import AxisXModel, { MAX_BAR_WIDTH, MIN_BAR_WIDTH } from '../model/axisx'

type Prop = {
  axis: AxisXModel
  height: number
  width: number
}

export default class AxisX extends React.Component<Prop, any> {

  public refs: {
    canvas: HTMLCanvasElement
  }

  private _dragBarWidthStart: boolean
  private _dragPosX: number

  constructor () {
    super()
    this.moveHandler = this.moveHandler.bind(this)
    this.startHandler = this.startHandler.bind(this)
    this.endHandler = this.endHandler.bind(this)
  }

  public componentDidMount () {
    const axisX = this.props.axis
    axisX.ctx = this.refs.canvas.getContext('2d')
    axisX.width = this.props.width
    axisX.height = this.props.height
    document.addEventListener(MOVE_EVENT, this.moveHandler)
    document.addEventListener(UP_EVENT, this.endHandler)
  }

  public componentWillUnmount () {
    document.removeEventListener(MOVE_EVENT, this.moveHandler)
    document.removeEventListener(UP_EVENT, this.endHandler)
  }

  public componentDidUpdate () {
    const axisX = this.props.axis
    const canvas = this.refs.canvas
    const width = this.props.width
    const height = this.props.height
    axisX.width = width
    axisX.height = height
    canvas.width = width
    canvas.height = height
    axisX.ctx = canvas.getContext('2d')
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

    eventHandlers = {
      [DOWN_EVENT_REACT]: this.startHandler,
    }

    return (
      <div className='chart-line'>
        <div className='chart-axisx'
          style={ {height: height, width: width} }>
          <canvas ref='canvas' width={width} height={height} {...eventHandlers}></canvas>
        </div>
      </div>
    )
  }

  private moveHandler (ev) {
    if (this._dragBarWidthStart) {
      const axisX = this.props.axis
      const pageX = SUPPORT_TOUCH ? ev.touches[0].pageX : ev.pageX
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

  private startHandler (ev) {
    this._dragPosX = SUPPORT_TOUCH ? ev.touches[0].pageX : ev.pageX
    this._dragBarWidthStart = true
  }

  private endHandler () {
    this._dragBarWidthStart = false
  }
}
