import * as React from 'react'
import ChartLayoutModel from '../model/chartlayout'
import AxisXModel, { MAX_BAR_WIDTH, MIN_BAR_WIDTH } from '../model/axisx'

type Prop = {
  height: number
  width: number
}

export default class AxisX extends React.Component<Prop, any> {
  public static contextTypes = {
    chartLayout: React.PropTypes.instanceOf(ChartLayoutModel),
  }

  public context: { chartLayout: ChartLayoutModel }

  public refs: {
    canvas: HTMLCanvasElement
  }

  private _axisX: AxisXModel
  private _dragBarWidthStart: boolean
  private _dragPosX: number

  constructor (props: Prop, context: { chartLayout: ChartLayoutModel }) {
    super(props, context)
    this._axisX = context.chartLayout.axisx
    this.moveHandler = this.moveHandler.bind(this)
    this.startHandler = this.startHandler.bind(this)
    this.endHandler = this.endHandler.bind(this)
  }

  public componentDidMount () {
    const axisX = this._axisX
    axisX.ctx = this.refs.canvas.getContext('2d')
    axisX.width = this.props.width
    axisX.height = this.props.height
    document.addEventListener('mousemove', this.moveHandler)
    document.addEventListener('touchmove', this.moveHandler)
    document.addEventListener('mouseup', this.endHandler)
    document.addEventListener('touchend', this.endHandler)
  }

  public componentWillUnmount () {
    document.removeEventListener('mousemove', this.moveHandler)
    document.removeEventListener('touchmove', this.moveHandler)
    document.removeEventListener('mouseup', this.endHandler)
    document.removeEventListener('touchend', this.endHandler)
  }

  public componentDidUpdate () {
    const axisX = this._axisX
    const canvas = this.refs.canvas
    const width = this.props.width
    const height = this.props.height
    axisX.width = width
    axisX.height = height
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d')
  }

  public shouldComponentUpdate (nextProps: Prop) {
    const curProps = this.props
    return curProps.width !== nextProps.width ||
           curProps.height !== nextProps.height
  }

  public render () {
    const width = this.props.width
    const height = this.props.height

    return (
      <div className='chart-line'>
        <div className='chart-axisx'
          style={ {height: height, width: width} }>
          <canvas
            ref='canvas'
            width={width}
            height={height}
            onMouseDown={this.startHandler}
            onTouchStart={this.startHandler}>
          </canvas>
        </div>
      </div>
    )
  }

  private moveHandler (ev) {
    if (this._dragBarWidthStart) {
      const axisX = this._axisX
      const width = axisX.width
      const pageX = ev.changedTouches ? ev.changedTouches[0].pageX : ev.pageX
      const curBarWidth = axisX.barWidth

      let scale = (width - pageX) / (width - this._dragPosX)

      axisX.barWidth = curBarWidth * scale
      scale = axisX.barWidth / curBarWidth
      axisX.offset *= scale
      this._dragPosX = pageX
    }
  }

  private startHandler (ev) {
    if (!!ev.touches) {
      ev.preventDefault()
      if (ev.touches.length === 1) {
        this._dragPosX = ev.touches[0].pageX
        this._dragBarWidthStart = true
      }
    } else {
      this._dragPosX = ev.pageX
      this._dragBarWidthStart = true
    }
  }

  private endHandler () {
    this._dragBarWidthStart = false
  }
}
