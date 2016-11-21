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
  private _dragDrawingToolStart: boolean
  private _pinchHorzStart: boolean
  private _pinchVertStart: boolean
  private _pinchOffset: number
  private _dragPosX: number
  private _dragPosY: number

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
    const offset = clientOffset(ev.target)
    const curPoint = ev.touches ? {
      x: ev.touches[0].pageX - offset.offsetLeft,
      y: ev.touches[0].pageY - offset.offsetTop,
    } : chart.crosshair.point

    if (chartLayout.selectedDrawingTool) {
      chartLayout.drawingToolBegin(chart)
      chartLayout.drawingToolSetVertex(curPoint)
      if (chartLayout.creatingDrawingTool.isFinished()) {
        chartLayout.drawingToolEnd(chart)
      }
      return
    } else if (chartLayout.creatingDrawingTool) {
      chartLayout.drawingToolSetVertex(curPoint)
      if (chartLayout.creatingDrawingTool.isFinished()) {
        chart.tools.push(chartLayout.creatingDrawingTool)
        chartLayout.drawingToolEnd(chart)
      }
      return
    }

    // 取消所有graph和tools的选中态
    chartLayout.charts.forEach(
      ch => {
        chart.graphs.forEach(graph => graph.selected = false)
        chart.tools.forEach(tool => tool.selected = false)
    })

    if (ev.touches) {
      // 手势拖拽
      if (ev.touches.length === 1) {
        // 触屏设备需要点击时手段设置指针位置
        chartLayout.setCursorPoint(curPoint)
        // 触屏设备需要手动设置chart hover
        chartLayout.charts.forEach(ch => ch.hover = false)
        chartLayout.charts.forEach(ch => ch.graphs.forEach(graph => graph.hover = false))
        chartLayout.charts.forEach(ch => ch.tools.forEach(tool => tool.hover = false))
        chart.hover = true

        chart.hitTest(true)

        if (chartLayout.editingDrawingTool) {
          chartLayout.drawingToolEditBegin()
          this._dragDrawingToolStart = true
          this._dragPosX = curPoint.x
          this._dragPosY = curPoint.y
        } else {
          this._dragOffsetStart = true
          this._dragPosX = curPoint.x
          this._lastMovePosition = curPoint.x
          this._lastMoveTime = Date.now()
          this.stopMomentum()
        }
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
      chart.hitTest(true)
      if (chartLayout.editingDrawingTool) {
        chartLayout.drawingToolEditBegin()
        this._dragDrawingToolStart = true
        this._dragPosX = curPoint.x
        this._dragPosY = curPoint.y
      } else {
        this._dragOffsetStart = true
        this._dragPosX = curPoint.x
      }
    }
  }

  private mouseUpHandler (ev) {
    if (this._dragOffsetStart) {
      if (ev.touches) {
        if (Date.now() - this._lastMoveTime < 250 && Math.abs(this._v) > .1) {
          this.momentumMove(this._v)
        }
      }
    }

    if (this._dragDrawingToolStart) {
      this.props.chartLayout.drawingToolEditEnd()
      this._dragDrawingToolStart = false
    }

    this._dragOffsetStart = false
    this._pinchHorzStart = false
    this._pinchVertStart = false
    this._pinchOffset = 0
    this._v = 0
  }

  private mouseMoveHandler (ev: any) {
    const offset = clientOffset(ev.target)
    const point = ev.touches ? {
        x: ev.touches[0].pageX - offset.offsetLeft,
        y: ev.touches[0].pageY - offset.offsetTop,
      } :
      {
        x: ev.pageX - offset.offsetLeft,
        y: ev.pageY - offset.offsetTop,
      }

    if (this._pinchHorzStart || this._pinchVertStart) {
      this.props.chartLayout.setCursorPoint(null)
      return
    }

    this.props.chartLayout.setCursorPoint(point)

    if (this._dragOffsetStart || this._dragDrawingToolStart) {
      return
    }

    if (!this.props.chartLayout.creatingDrawingTool) {
      this.props.chart.hitTest()
    }
  }

  private dragMoveHandler (ev: any): void {
    const chartLayout = this.props.chartLayout
    const chart = this.props.chart
    const datasource = chart.datasource
    const axisX = chart.axisX
    const axisY = chart.axisY
    const offset = clientOffset(chart.topCtx.canvas)
    const point = ev.touches ? {
        x: ev.touches[0].pageX - offset.offsetLeft,
        y: ev.touches[0].pageY - offset.offsetTop,
      } :
      {
        x: ev.pageX - offset.offsetLeft,
        y: ev.pageY - offset.offsetTop,
      }

    if (this._dragDrawingToolStart) {
      const range = chart.axisY.range
      const tool = chartLayout.editingDrawingTool
      const curBar = axisX.findTimeBarByX(point.x - offset.offsetLeft)
      const oldBar = axisX.findTimeBarByX(this._dragPosX - offset.offsetLeft)
      if (curBar && oldBar) {
        const offsetIndex = datasource.search(curBar.time) - datasource.search(oldBar.time)
        const offsetValue = axisY.getValueByY(point.y - offset.offsetTop, range) -
                            axisY.getValueByY(this._dragPosY - offset.offsetTop, range)
        tool.moveAsWhole(offsetIndex, offsetValue)
        this._dragPosX = point.x
        this._dragPosY = point.y
      }
    } else if (this._dragOffsetStart) {
      const curOffset = axisX.offset
      const newOffset = curOffset + point.x - this._dragPosX
      axisX.offset = newOffset
      this._dragPosX = point.x
      if (ev.touches) {
        this._v = (point.x - this._lastMovePosition) / (Date.now() - this._lastMoveTime)
        this._lastMovePosition = point.x
        this._lastMoveTime = Date.now()
      }
    } else if (this._pinchHorzStart) {
      const newOffset = Math.abs(ev.touches[1].pageX - ev.touches[0].pageX)
      const curBarWidth = axisX.barWidth
      const newBarWidth = curBarWidth + (newOffset - this._pinchOffset) / 100
      this._pinchOffset = newOffset
      axisX.barWidth = newBarWidth
      axisX.offset *= axisX.barWidth / curBarWidth
    } else if (this._pinchVertStart) {
      const newOffset = Math.abs(ev.touches[1].pageY - ev.touches[0].pageY)
      const newMargin = axisY.margin + (this._pinchOffset - newOffset)
      this._pinchOffset = newOffset
      axisY.margin = newMargin
    }
  }
}
