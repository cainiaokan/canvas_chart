import * as React from 'react'

import { AXIS_Y_WIDTH } from '../../constant'
import Legend from './../legend'
import ChartModel from '../../model/chart'
import AxisY from './../axisY'

type Prop = {
  model: ChartModel
  width: number
  height: number
  onMouseMove?: (event: MouseEvent) => void
  onMouseDown?: (event: MouseEvent) => void
  onMouseLeave?: (event: MouseEvent) => void
  onMouseEnter?: (event: MouseEvent) => void
}

export default class Chart extends React.Component<Prop, any> {
  public refs: {
    [propName: string]: any
    plot: HTMLDivElement
  }
  private _chart: ChartModel

  constructor () {
    super()
    this.state = {
      hover: false,
    }
  }

  public componentWillMount () {
    this._chart = this.props.model
  }

  public componentDidMount () {
    this._chart.size = {
      height: this.props.height,
      width: this.props.width,
    }
    this._chart.addListener('hover', hover => {
      this.refs.plot.style.cursor = hover ? 'pointer' : 'default'
    })
  }

  public componentDidUpdate () {
    const size = this._chart.size
    const width = this.props.width
    const height = this.props.height
    if (size.width !== width || size.height !== height) {
      this._chart.size = {
        height: height,
        width: width,
      }
    }
  }

  public render () {
    const width = this.props.width - AXIS_Y_WIDTH
    const height = this.props.height
    return <div className='chart-line'
      onMouseEnter={this.mouseEnterHandler.bind(this)}
      onMouseLeave={this.mouseLeaveHandler.bind(this)}>
      <div className='chart-plot' ref='plot'
        style={
          {
            height: height + 'px',
            width: width + 'px',
          }
        }>
        <Legend chartModel={this._chart}/>
        <canvas ref={el => {
          if (el) {
            el.height = height
            el.width = width
            this._chart.ctx = el.getContext('2d')
          }
        }} width={width} height={height}></canvas>
        <canvas ref={
            el => {
              if (el) {
                el.height = height
                el.width = width
                this._chart.topCtx = el.getContext('2d')
              }
            }
          } width={width} height={height}
          onMouseMove={this.props.onMouseMove ? this.mouseMoveHandler.bind(this) : null}
          onMouseDown={this.props.onMouseDown ? this.mouseDownHandler.bind(this) : null}
          onMouseEnter={this.mouseEnterHandler.bind(this)}
          onMouseLeave={this.mouseLeaveHandler.bind(this)}>
        </canvas>
      </div>
      <AxisY axis={this._chart.axisY} height={height} width={AXIS_Y_WIDTH} />
    </div>
  }

  public mouseEnterHandler (ev: MouseEvent) {
    this._chart.hover = true
    if (this.props.onMouseEnter) {
      this.props.onMouseEnter(ev)
    }
  }

  public mouseLeaveHandler (ev: MouseEvent) {
    this._chart.hover = false
    if (this.props.onMouseLeave) {
      this.props.onMouseLeave(ev)
    }
  }

  private mouseDownHandler (ev: MouseEvent) {
    this.props.onMouseDown(ev)
  }

  private mouseMoveHandler (ev: MouseEvent) {
    this.props.onMouseMove(ev)
  }
}
