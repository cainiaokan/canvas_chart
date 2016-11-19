import * as React from 'react'

import { AXIS_Y_WIDTH } from '../../constant'
import Legend from './../legend'
import ChartLayout from '../../model/chartlayout'
import ChartModel from '../../model/chart'
import Indicator from './indicator'
import AxisY from './../axisY'
import { clientOffset } from '../../util'

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

  private _dragOffsetStart: boolean
  private _pinchHorzStart: boolean
  private _pinchVertStart: boolean
  private _pinchOffset: number
  private _dragPosX: number

  private _lastMovePosition: number
  private _lastMoveTime: number
  private _v: number = 0
  private _momentumTimer: number

  constructor () {
    super()
    this.state = {
      hover: false,
    }
    this.dragMoveHandler = this.dragMoveHandler.bind(this)
    this.mouseUpHandler = this.mouseUpHandler.bind(this)
    this.hitHandler = this.hitHandler.bind(this)
  }

  public componentDidMount () {
    this.props.chartLayout.addListener('hit', this.hitHandler)
    document.addEventListener('touchmove', this.dragMoveHandler)
    document.addEventListener('touchend', this.mouseUpHandler)
    document.addEventListener('mousemove', this.dragMoveHandler)
    document.addEventListener('mouseup', this.mouseUpHandler)
  }

  public componentWillUnmount () {
    this.props.chartLayout.removeListener('hit', this.hitHandler)
    document.removeEventListener('touchmove', this.dragMoveHandler)
    document.removeEventListener('touchend', this.mouseUpHandler)
    document.removeEventListener('mousemove', this.dragMoveHandler)
    document.removeEventListener('mouseup', this.mouseUpHandler)
  }

  public render () {
    const chartLayout = this.props.chartLayout
    const chart = this.props.chart
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
        <Legend chartModel={chart} />
        <canvas ref={el => {
          if (el) {
            el.height = height
            el.width = width
            chart.ctx = el.getContext('2d')
          }
        }} width={width} height={height}></canvas>
        <canvas ref={
            el => {
              if (el) {
                el.height = height
                el.width = width
                chart.topCtx = el.getContext('2d')
              }
            }
          } width={width} height={height}
          onMouseMove={this.mouseMoveHandler.bind(this)}
          onMouseDown={this.mouseDownHandler.bind(this)}
          onMouseEnter={this.mouseEnterHandler.bind(this)}
          onMouseLeave={this.mouseLeaveHandler.bind(this)}
          onTouchStart={this.mouseDownHandler.bind(this)}
          onTouchMove={this.mouseMoveHandler.bind(this)}
          >
        </canvas>
        {
          chart.isMain ? <Indicator chart={chart} /> : null
        }
      </div>
      <AxisY axis={chart.axisY} chartLayout={chartLayout} height={height} width={AXIS_Y_WIDTH} />
    </div>
  }

  private hitHandler (hover: boolean) {
    if (this.props.chartLayout.hoverChart === this.props.chart) {
      this.refs.plot.style.cursor = hover ? 'pointer' : 'crosshair'
    }
  }

  private mouseEnterHandler () {
    this.props.chart.hover = true
  }

  private mouseLeaveHandler () {
    this.props.chart.hover = false
    this.props.chart.graphs.forEach(graph => graph.hover = false)
    this.props.chartLayout.setCursorPoint(null)
  }

  private mouseDownHandler (ev: any) {
    const chartLayout = this.props.chartLayout
    const chart = this.props.chart
    const curPoint = chart.crosshair.point

    if (chartLayout.selectedDrawingTool) {
      chartLayout.drawingToolBegin(chart)
      chartLayout.drawingToolSetVertex(curPoint)
      if (chartLayout.editingDrawingTool.isFinished()) {
        chartLayout.drawingToolEnd(chart)
      }
      return
    } else if (chartLayout.editingDrawingTool) {
      chartLayout.drawingToolSetVertex(curPoint)
      if (chartLayout.editingDrawingTool.isFinished()) {
        chart.tools.push(chartLayout.editingDrawingTool)
        chartLayout.drawingToolEnd(chart)
      }
      return
    }

    // 取消所有graph的选中态
    chartLayout.charts.forEach(
      ch => chart.graphs
             .filter(graph => graph.selected)
             .forEach(graph => graph.selected = false)
    )

    if (ev.touches) {
      // 手势拖拽
      if (ev.touches.length === 1) {
        this._dragOffsetStart = true
        chartLayout.charts.forEach(ch => ch.hover = false)
        chartLayout.charts.forEach(ch => ch.graphs.forEach(graph => graph.hover = false))
        chart.hover = true
        this._dragPosX = curPoint.x
        this._lastMovePosition = curPoint.x
        this._lastMoveTime = Date.now()
        this.stopMomentum()
        chartLayout.setCursorPoint(curPoint)
      // 缩放
      } else if (ev.touches.length === 2) {
        const offsetHorz = Math.abs(ev.touches[0].clientX - ev.touches[1].clientX)
        const offsetVert = Math.abs(ev.touches[0].clientY - ev.touches[1].clientY)
        this._dragOffsetStart = false
        chartLayout.setCursorPoint(null)
        if (offsetHorz >= offsetVert) {
          this._pinchHorzStart = true
          this._pinchOffset = offsetHorz
        } else {
          this._pinchVertStart = true
          this._pinchOffset = offsetVert
        }
      // 鼠标拖拽
      }
    } else {
      this._dragOffsetStart = true
      this._dragPosX = ev.pageX
    }
    chart.hitTest(true)
  }

  private mouseUpHandler (ev) {
    if (this._dragOffsetStart) {
      if (ev.touches) {
        if (Date.now() - this._lastMoveTime < 250 && Math.abs(this._v) > .1) {
          this.momentumMove(this._v)
        }
      }
    }
    this._dragOffsetStart = false
    this._pinchHorzStart = false
    this._pinchVertStart = false
    this._pinchOffset = 0
    this._v = 0
  }

  private momentumMove (v: number): void {
    const axisX = this.props.chartLayout.axisx
    this._momentumTimer = setTimeout(() => {
      if (Math.abs(v) > .1) {
        axisX.offset += v * 60
        v -= v * 0.3
        this.momentumMove(v)
      }
    }, 60)
  }

  private stopMomentum (): void {
    clearTimeout(this._momentumTimer)
  }

  private mouseMoveHandler (ev: any): void {
    const offset = clientOffset(ev.target as HTMLElement)
    const point = ev.touches ? {
        x: ev.touches[0].clientX - offset.offsetLeft,
        y: ev.touches[0].clientY - offset.offsetTop,
      } :
      {
        x: ev.clientX - offset.offsetLeft,
        y: ev.clientY - offset.offsetTop,
      }

    if (this._pinchHorzStart || this._pinchVertStart) {
      this.props.chartLayout.setCursorPoint(null)
      return
    }

    this.props.chartLayout.setCursorPoint(point)

    if (!this.props.chartLayout.editingDrawingTool) {
      this.props.chart.hitTest()
    }
  }

  private dragMoveHandler (ev: any): void {
    if (this._dragOffsetStart) {
      const pageX = ev.touches ? ev.touches[0].pageX : ev.pageX
      const axisX = this.props.chartLayout.axisx
      const curOffset = axisX.offset
      const newOffset = curOffset + pageX - this._dragPosX
      axisX.offset = newOffset
      this._dragPosX = pageX
      if (ev.touches) {
        this._v = (pageX - this._lastMovePosition) / (Date.now() - this._lastMoveTime)
        this._lastMovePosition = pageX
        this._lastMoveTime = Date.now()
      }
    } else if (this._pinchHorzStart) {
      const axisX = this.props.chartLayout.axisx
      const newOffset = Math.abs(ev.touches[1].pageX - ev.touches[0].pageX)
      const curBarWidth = axisX.barWidth
      const newBarWidth = curBarWidth + (newOffset - this._pinchOffset) / 100
      this._pinchOffset = newOffset
      axisX.barWidth = newBarWidth
      axisX.offset *= axisX.barWidth / curBarWidth
    } else if (this._pinchVertStart) {
      const axisY = this.props.chartLayout.hoverChart.axisY
      const newOffset = Math.abs(ev.touches[1].pageY - ev.touches[0].pageY)
      const newMargin = axisY.margin + (this._pinchOffset - newOffset)
      this._pinchOffset = newOffset
      axisY.margin = newMargin
    }
  }
}
