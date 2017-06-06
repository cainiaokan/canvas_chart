import * as React from 'react'
import AxisYModel from '../model/axisy'

type Prop = {
  axis: AxisYModel
  scalable: boolean
  width: number
  height: number
}

export default class AxisY extends React.Component<Prop, any> {

  public refs: {
    canvas: HTMLCanvasElement
  }

  private _dragMarginStart: boolean
  private _dragPosY: number

  constructor () {
    super()
    this._dragMarginStart = false
    this.downHandler = this.downHandler.bind(this)
    this.mouseMoveHandler = this.mouseMoveHandler.bind(this)
    this.mouseUpHandler = this.mouseUpHandler.bind(this)
  }

  public componentDidMount () {
    const axisY = this.props.axis
    axisY.ctx = this.refs.canvas.getContext('2d')
    axisY.width = this.props.width
    axisY.height = this.props.height
    document.addEventListener('mousemove', this.mouseMoveHandler)
    document.addEventListener('touchmove', this.mouseMoveHandler)
    document.addEventListener('mouseup', this.mouseUpHandler)
    document.addEventListener('touchend', this.mouseUpHandler)
  }

  public componentWillUnmount () {
    document.removeEventListener('mousemove', this.mouseMoveHandler)
    document.removeEventListener('touchmove', this.mouseMoveHandler)
    document.removeEventListener('mouseup', this.mouseUpHandler)
    document.removeEventListener('touchend', this.mouseUpHandler)
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
    canvas.getContext('2d')
  }

  public shouldComponentUpdate (nextProps: Prop) {
    const curProps = this.props
    return curProps.width !== nextProps.width ||
           curProps.height !== nextProps.height ||
           curProps.scalable !== nextProps.scalable
  }

  public render () {
    const width = this.props.width
    const height = this.props.height

    return (
      <div className='chart-axisy' style={ {height: height + 'px', width: width + 'px'} }>
        <canvas
          ref='canvas'
          width={width}
          height={height}
          onMouseDown={this.downHandler}
          onTouchStart={this.downHandler}></canvas>
      </div>
    )
  }

  private downHandler (ev) {
    if (!!ev.touches) {
      ev.preventDefault()
      if (ev.touches.length === 1) {
        this._dragPosY = ev.touches[0].pageY
        this._dragMarginStart = true
      }
    } else {
      this._dragPosY = ev.pageY
      this._dragMarginStart = true
    }
  }

  private mouseMoveHandler (ev) {
    if (this._dragMarginStart && this.props.scalable) {
      const pageY = ev.changedTouches ? ev.changedTouches[0].pageY : ev.pageY
      const offset = pageY - this._dragPosY
      const axisY = this.props.axis
      const margin = axisY.margin
      const height = axisY.height
      const graphHeight = height - 2 * margin
      const scale = 2 * offset / height
      axisY.margin = (height - graphHeight * (1 + scale)) / 2
      this._dragPosY = pageY
    }
  }

  private mouseUpHandler () {
    this._dragMarginStart = false
  }
}
