import * as React from 'react'

import { AXIS_Y_WIDTH } from '../../constant'
import Legend from './../legend'
import ChartLayout from '../../model/chartlayout'
import ChartModel from '../../model/chart'
import Indicator from './indicator'
import AxisY from './../axisY'
import { clientOffset } from '../../util'
import { MAX_BAR_WIDTH, MIN_BAR_WIDTH } from '../../model/axisx'

type Prop = {
  chart: ChartModel
  chartLayout: ChartLayout
  width: number
  height: number
}

type State = {
  hover: boolean
}

export default class Chart extends React.Component<Prop, State> {
  public refs: {
    [propName: string]: any
    plot: HTMLDivElement
  }
  private _isSupportTouch = 'ontouchend' in document ? true : false
  private _chart: ChartModel
  private _chartLayout: ChartLayout
  private _dragOffsetStart: boolean
  private _pinchHorzStart: boolean
  private _pinchVertStart: boolean
  private _pinchOffset: number
  private _dragPosX: number

  constructor () {
    super()
    this.state = {
      hover: false,
    }
    this.dragMoveHandler = this.dragMoveHandler.bind(this)
    this.mouseUpHandler = this.mouseUpHandler.bind(this)
  }

  public componentWillMount() {
    this._chart = this.props.chart
    this._chartLayout = this.props.chartLayout
    this._chart.size = {
      height: this.props.height,
      width: this.props.width,
    }
  }

  public componentWillReceiveProps(nextProps: Prop) {
    this._chart = nextProps.chart
    this._chartLayout = nextProps.chartLayout
    this._chart.size = {
      height: nextProps.height,
      width: nextProps.width,
    }
  }

  public componentDidMount () {
    this._chartLayout.addListener('hit', hover => {
      if (this._chartLayout.hoverChart === this._chart) {
        this.refs.plot.style.cursor = hover ? 'pointer' : 'crosshair'
      }
    })
    if (this._isSupportTouch) {
      document.addEventListener('touchmove', this.dragMoveHandler)
    } else {
      document.addEventListener('mousemove', this.dragMoveHandler)
    }
    document.addEventListener('mouseup', this.mouseUpHandler)
  }

  public componentWillUnmount () {
    if (this._isSupportTouch) {
      document.removeEventListener('touchmove', this.dragMoveHandler)
    } else {
      document.removeEventListener('mousemove', this.dragMoveHandler)
    }
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
        <Legend chartModel={this._chart} />
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
          onMouseMove={this._isSupportTouch ? null : this.mouseMoveHandler.bind(this)}
          onMouseDown={this._isSupportTouch ? null : this.mouseDownHandler.bind(this)}
          onMouseEnter={this._isSupportTouch ? null : this.mouseEnterHandler.bind(this)}
          onMouseLeave={this._isSupportTouch ? null : this.mouseLeaveHandler.bind(this)}
          onTouchStart={this._isSupportTouch ? this.mouseDownHandler.bind(this) : null}
          onTouchEnd={this._isSupportTouch ? this.mouseUpHandler.bind(this) : null}
          onTouchMove={this._isSupportTouch ? this.mouseMoveHandler.bind(this) : null}
          >
        </canvas>
        {
          this._chart.isMain ? <Indicator chart={this._chart} /> : null
        }
      </div>
      <AxisY axis={this._chart.axisY} chartLayout={this._chartLayout} height={height} width={AXIS_Y_WIDTH} />
    </div>
  }

  private mouseEnterHandler () {
    this._chart.hover = true
  }

  private mouseLeaveHandler () {
    this._chart.hover = false
    this._chart.graphs.forEach(graph => graph.hover = false)
    this._chartLayout.setCursorPoint(null)
  }

  private mouseDownHandler (ev: any) {
    this._chartLayout.charts
      .forEach(chart =>
        chart.graphs.filter(graph => graph.selected)
          .forEach(graph => graph.selected = false)
      )
    if (this._isSupportTouch) {
      if (ev.touches.length === 1) {
        this._dragOffsetStart = true
        const offset = clientOffset(ev.target as HTMLElement)
        this._chartLayout.charts.forEach(chart => chart.hover = false)
        this._chartLayout.charts.forEach(chart => chart.graphs.forEach(graph => graph.hover = false))
        this._chart.hover = true
        this._dragPosX = ev.touches[0].pageX
        this._chartLayout.setCursorPoint({
          x: ev.touches[0].clientX - offset.offsetLeft,
          y: ev.touches[0].clientY - offset.offsetTop,
        })
      } else if (ev.touches.length === 2) {
        const offsetHorz = Math.abs(ev.touches[0].clientX - ev.touches[1].clientX)
        const offsetVert = Math.abs(ev.touches[0].clientY - ev.touches[1].clientY)
        this._dragOffsetStart = false
        this._chartLayout.setCursorPoint(null)
        if (offsetHorz >= offsetVert) {
          this._pinchHorzStart = true
          this._pinchOffset = offsetHorz
        } else {
          this._pinchVertStart = true
          this._pinchOffset = offsetVert
        }
      } else {
        this._dragOffsetStart = false
      }
    } else {
      this._dragOffsetStart = true
      this._dragPosX = ev.pageX
    }
    this._chart.hitTest(true)
  }

  private mouseUpHandler () {
    this._dragOffsetStart = false
    this._pinchHorzStart = false
    this._pinchVertStart = false
    this._pinchOffset = 0
  }

  private mouseMoveHandler (ev: any) {
    if (this._pinchHorzStart || this._pinchVertStart) {
      return this._chartLayout.setCursorPoint(null)
    }
    const offset = clientOffset(ev.target as HTMLElement)
    const point = this._isSupportTouch ? {
        x: ev.touches[0].clientX - offset.offsetLeft,
        y: ev.touches[0].clientY - offset.offsetTop,
      } :
      {
        x: ev.clientX - offset.offsetLeft,
        y: ev.clientY - offset.offsetTop,
      }
    this._chartLayout.setCursorPoint(point)
    this._chart.hitTest()
  }

  private dragMoveHandler (ev: any) {
    ev.preventDefault()
    ev.stopPropagation()
    if (this._dragOffsetStart) {
      const pageX = this._isSupportTouch ? ev.touches[0].pageX : ev.pageX
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
    } else if (this._pinchHorzStart) {
      const axisX = this._chartLayout.axisx
      const newOffset = Math.abs(ev.touches[1].pageX - ev.touches[0].pageX)
      const curBarWidth = axisX.barWidth
      const newBarWidth = curBarWidth + (newOffset - this._pinchOffset) / 100
      this._pinchOffset = newOffset
      if (newBarWidth < MIN_BAR_WIDTH) {
        axisX.barWidth = MIN_BAR_WIDTH
      } else if (newBarWidth > MAX_BAR_WIDTH) {
        axisX.barWidth = MAX_BAR_WIDTH
      } else {
        axisX.barWidth = newBarWidth
      }
      axisX.offset *= axisX.barWidth / curBarWidth
    } else if (this._pinchVertStart) {
      const axisY = this._chartLayout.hoverChart.axisY
      const newOffset = Math.abs(ev.touches[1].pageY - ev.touches[0].pageY)
      const newMargin = axisY.margin + (this._pinchOffset - newOffset)
      this._pinchOffset = newOffset
      axisY.margin = newMargin
    }
  }
}
