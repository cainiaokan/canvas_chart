import * as React from 'react'

import { AXIS_Y_WIDTH } from '../../constant'
import Legend from './../legend'
import ChartLayout from '../../model/chartlayout'
import ChartModel from '../../model/chart'
import AxisY from './../axisY'
import { clientOffset } from '../../util'

type Prop = {
  chart: ChartModel
  chartLayout: ChartLayout
  width: number
  height: number
}

export default class Chart extends React.Component<Prop, any> {
  public refs: {
    [propName: string]: any
    plot: HTMLDivElement
  }
  private _chart: ChartModel
  private _chartLayout: ChartLayout
  private _dragOffsetStart: boolean
  private _dragPosX: number

  constructor () {
    super()
    this.state = {
      hover: false,
    }
    this.dragMoveHandler = this.dragMoveHandler.bind(this)
    this.mouseUpHandler = this.mouseUpHandler.bind(this)
  }

  public componentWillMount () {
    this._chart = this.props.chart
    this._chartLayout = this.props.chartLayout
  }

  public componentDidMount () {
    this._chart.size = {
      height: this.props.height,
      width: this.props.width,
    }
    this._chartLayout.addListener('hit', hover => {
      if (this._chartLayout.hoverChart === this._chart) {
        this.refs.plot.style.cursor = hover ? 'pointer' : 'default'
      }
    })
    document.addEventListener('mousemove', this.dragMoveHandler)
    document.addEventListener('mouseup', this.mouseUpHandler)
  }

  public componentWillUnmount () {
    document.removeEventListener('mousemove', this.dragMoveHandler)
    document.removeEventListener('mouseup', this.mouseUpHandler)
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
    const width = ~~this.props.width - AXIS_Y_WIDTH
    const height = ~~this.props.height
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
          onMouseMove={this.mouseMoveHandler.bind(this)}
          onMouseDown={this.mouseDownHandler.bind(this)}
          onMouseEnter={this.mouseEnterHandler.bind(this)}
          onMouseLeave={this.mouseLeaveHandler.bind(this)}
          onClick={this.mouseClickHandler.bind(this)}>
        </canvas>
      </div>
      <AxisY axis={this._chart.axisY} chartLayout={this._chartLayout} height={height} width={AXIS_Y_WIDTH} />
    </div>
  }

  private mouseClickHandler (ev: MouseEvent) {
    this._chart.hitTest(true)
  }

  private mouseEnterHandler (ev: MouseEvent) {
    this._chart.hover = true
  }

  private mouseLeaveHandler (ev: MouseEvent) {
    this._chart.hover = false
    this._chart.graphs.forEach(graph => graph.hover = false)
    this._chartLayout.setCursorPoint(null)
  }

  private mouseDownHandler (ev: MouseEvent) {
    this._chartLayout.charts
      .forEach(chart =>
        chart.graphs.filter(graph => graph.selected)
          .forEach(graph => graph.selected = false)
      )
    this._dragOffsetStart = true
    this._dragPosX = ev.pageX
  }

  private mouseUpHandler (ev: MouseEvent) {
    this._dragOffsetStart = false
  }

  private mouseMoveHandler (ev: MouseEvent) {
    const offset = clientOffset(ev.target as HTMLElement)
    const point = {
      x: ev.clientX - offset.offsetLeft,
      y: ev.clientY - offset.offsetTop,
    }
    this._chartLayout.setCursorPoint(point)
    this._chart.hitTest()
  }

  private dragMoveHandler (ev: MouseEvent) {
    if (this._dragOffsetStart) {
      const pageX = ev.pageX
      const axisX = this._chartLayout.axisx
      const curOffset = axisX.offset
      const newOffset = curOffset + pageX - this._dragPosX
      if (newOffset < axisX.minOffset) {
        axisX.offset = axisX.minOffset
      } else if (newOffset > axisX.maxOffset) {
        axisX.offset = axisX.maxOffset
      } else {
        axisX.offset = newOffset
      }
      this._dragPosX = pageX
    }
  }
}
