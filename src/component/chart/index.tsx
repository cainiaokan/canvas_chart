import * as React from 'react'

import {
  AXIS_Y_WIDTH,
} from '../../constant'
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
  hover?: boolean,
  cursor?: 'pointer' | 'crosshair' | 'default'
}

export default class Chart extends React.Component<Prop, State> {

  public refs: {
    canvas: HTMLCanvasElement
    topCanvas: HTMLCanvasElement
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

  private canvasOffset = null

  constructor () {
    super()
    this.state = {
      hover: false,
    }
    this.dragMoveHandler = this.dragMoveHandler.bind(this)
    this.gestureMoveHandler = this.gestureMoveHandler.bind(this)
    this.downHandler = this.downHandler.bind(this)
    this.moveHandler = this.moveHandler.bind(this)
    this.upHandler = this.upHandler.bind(this)
    this.mouseOver = this.mouseOver.bind(this)
    this.mouseOut = this.mouseOut.bind(this)
    this.hitHandler = this.hitHandler.bind(this)
    this.defaultCursorChangeHandler = this.defaultCursorChangeHandler.bind(this)
  }

  public shouldComponentUpdate (nextProp: Prop, nextState: State) {
    const curProp = this.props
    const curState = this.state
    return nextProp.chart !== curProp.chart ||
           nextProp.width !== curProp.width ||
           nextProp.height !== curProp.height ||
           nextState.hover !== curState.hover ||
           nextState.cursor !== curState.cursor
  }

  public componentDidMount () {
    const chartLayout = this.props.chartLayout
    const chart = this.props.chart
    const width = ~~this.props.width - AXIS_Y_WIDTH
    const height = ~~this.props.height

    chart.width = width
    chart.height = height

    chart.ctx = this.refs.canvas.getContext('2d')
    chart.topCtx = this.refs.topCanvas.getContext('2d')

    this.canvasOffset = clientOffset(chart.ctx.canvas)

    chartLayout.addListener('graph_hover', this.hitHandler)
    chartLayout.addListener('cursor_change', this.defaultCursorChangeHandler)
    document.addEventListener('mousemove', this.dragMoveHandler)
    document.addEventListener('touchmove', this.dragMoveHandler)
    document.addEventListener('touchmove', this.gestureMoveHandler)
    document.addEventListener('mouseup', this.upHandler)
    document.addEventListener('touchend', this.upHandler)
  }

  public componentWillUnmount () {
    this.props.chartLayout.removeListener('graph_hover', this.hitHandler)
    this.props.chartLayout.removeListener('cursor_change', this.defaultCursorChangeHandler)
    document.removeEventListener('mousemove', this.dragMoveHandler)
    document.removeEventListener('touchmove', this.dragMoveHandler)
    document.removeEventListener('touchmove', this.gestureMoveHandler)
    document.removeEventListener('mouseup', this.upHandler)
    document.removeEventListener('touchend', this.upHandler)
  }

  public componentDidUpdate (prevProps: Prop) {
    // 因为使用了HDPI Canvas，因此当canvas的尺寸发生变化的时候，需要重新调用getContext。目的是
    // 自动适应高清屏
    const curProps = this.props
    const chart = this.props.chart
    const canvas = this.refs.canvas
    const topCanvas = this.refs.topCanvas
    if (curProps.width !== prevProps.width ||
        curProps.height !== prevProps.height) {
      const width = ~~this.props.width - AXIS_Y_WIDTH
      const height = ~~this.props.height
      canvas.width = width
      canvas.height = height
      topCanvas.width = width
      topCanvas.height = height
      canvas.getContext('2d')
      topCanvas.getContext('2d')
      chart.width = width
      chart.height = height
      this.canvasOffset = clientOffset(chart.ctx.canvas)
    }
  }

  public render () {
    const chartLayout = this.props.chartLayout
    const chart = this.props.chart
    const width = ~~this.props.width - AXIS_Y_WIDTH
    const height = ~~this.props.height

    return <div className='chart-line'>
      <div className='chart-plot'
        style={
          {
            height: height + 'px',
            width: width + 'px',
            cursor: this.state.cursor,
          }
        }>
        <Legend chartLayout={chartLayout} chartModel={chart} />
        <canvas ref='canvas' width={width} height={height}></canvas>
        <canvas
          ref='topCanvas'
          width={width}
          height={height}
          onMouseDown={this.downHandler}
          onTouchStart={this.downHandler}
          onMouseMove={this.moveHandler}
          onTouchMove={this.moveHandler}
          onMouseUp={this.upHandler}
          onTouchEnd={this.upHandler}
          onMouseOver={this.mouseOver}
          onMouseOut={this.mouseOut}>
        </canvas>
        {
          chart.isMain ? <Indicator chart={chart} /> : null
        }
      </div>
      <AxisY axis={chart.axisY} height={height} width={AXIS_Y_WIDTH} />
    </div>
  }

  private momentumMove (v: number) {
    const axisX = this.props.chartLayout.axisx
    this._momentumTimer = setTimeout(() => {
      if (Math.abs(v) > 10) {
        axisX.offset += v * 30 / 1000
        v -= v * 0.3
        this.momentumMove(v)
      }
    }, 30)
  }

  private stopMomentum () {
    clearTimeout(this._momentumTimer)
  }

  private hitHandler (hover: boolean) {
    if (this.props.chartLayout.hoverChart === this.props.chart) {
      this.setState({ cursor: hover ? 'pointer' : this.props.chartLayout.defaultCursor })
    }
  }

  private defaultCursorChangeHandler (cursor: 'crosshair' | 'default') {
    this.setState({ cursor: this.state.hover ? 'pointer' : this.props.chartLayout.defaultCursor })
  }

  private mouseOver () {
    this.props.chart.hover = true
  }

  private mouseOut () {
    this.props.chart.hover = false
    this.props.chartLayout.setCursorPoint(null)
  }

  private downHandler (ev: any) {
    const isTouchEvent = !!ev.touches
    const isSingleTouch = isTouchEvent && ev.touches.length === 1
    const isDoubleTouch = isTouchEvent && ev.touches.length === 2
    const chartLayout = this.props.chartLayout
    const chart = this.props.chart
    const offset = this.canvasOffset
    const curPoint = isTouchEvent ? {
      x: ev.touches[0].pageX - offset.offsetLeft,
      y: ev.touches[0].pageY - offset.offsetTop,
    } : {
      x: ev.pageX - offset.offsetLeft,
      y: ev.pageY - offset.offsetTop,
    }

    if (chartLayout.mainDatasource.loaded() === 0) {
      return
    }

    // 取消其他chart中的所有选中态
    chartLayout.charts.forEach(ch => {
      ch.graphs.forEach(graph => graph.selected = false)
      ch.tools.forEach(tool => tool.selected = false)
    })

    if (isSingleTouch) {
      // 取消所有graph和tools的选中态
      chartLayout.charts.forEach(ch => {
        // 触屏设备需要手动设置取消chart hover
        ch.hover = false
        ch.graphs.forEach(graph => graph.hover = false)
        // 手动取消画图工具的hover
        ch.tools.forEach(tool => tool.hover = false)
      })
      // 设置当前chart为hover态
      chart.hover = true
      // 触屏设备需要点击时手动设置指针位置
      chartLayout.setCursorPoint(curPoint)
    }

    // 如果还没有设置过鼠标点，则先设置，比如页面刚进入时，鼠标还没有移动，此时point是空
    if (!chart.crosshair.point) {
      chartLayout.setCursorPoint(curPoint)
    }

    // 多指手势时不能绘制画图工具
    if (!isTouchEvent || isSingleTouch) {
      /* start 创建tool图形 */
      if (chartLayout.selectedDrawingTool) {
        chartLayout.drawingToolBegin(chart)
        chartLayout.drawingToolSetVertex(curPoint)
        if (chartLayout.creatingDrawingTool.isFinished()) {
          chart.addDrawingTool(chartLayout.creatingDrawingTool)
          chartLayout.drawingToolEnd(chart)
        }
        return
      } else if (chartLayout.creatingDrawingTool && chartLayout.creatingDrawingTool.chart === chart) {
        chartLayout.drawingToolSetVertex(curPoint)
        if (chartLayout.creatingDrawingTool.isFinished()) {
          chart.addDrawingTool(chartLayout.creatingDrawingTool)
          chartLayout.drawingToolEnd(chart)
        }
        return
      }
      /* end 创建tool图形 */
    }

    // 触屏设备
    if (isTouchEvent) {
      // 触摸事件时组织产生鼠标事件
      ev.preventDefault()
      // 手势拖拽
      if (isSingleTouch) {
        // do nothing
      } else if (isDoubleTouch) {
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
        return
      // 忽略三指及以上的手势
      } else {
        return
      }
    }

    // 点击检测
    chart.hitTest(true)

    // 正在编辑中的画图工具
    if (chartLayout.editingDrawingTool) {
      if (chartLayout.willEraseDrawingTool) {
        chartLayout.removeDrawingTools(chartLayout.editingDrawingTool)
        chartLayout.editingDrawingTool = null
      } else {
        chartLayout.editingDrawingTool.isEditing = true
        this._dragDrawingToolStart = true
        this._dragPosX = curPoint.x
        this._dragPosY = curPoint.y
      }
    } else {
      this._dragOffsetStart = true
      this._dragPosX = curPoint.x
      if (isSingleTouch) {
        this._lastMovePosition = curPoint.x
        this._lastMoveTime = ev.timeStamp
        this.stopMomentum()
      }
    }
  }

  private upHandler (ev: any) {
    const isTouchEvent = !!ev.touches
    const chartLayout = this.props.chartLayout

    if (isTouchEvent) {
      if (this._dragOffsetStart &&
         (ev.timeStamp - this._lastMoveTime < 60 && Math.abs(this._v) > 100)) {
        this.momentumMove(this._v)
      }
    }

    if (this._dragDrawingToolStart) {
      chartLayout.editingDrawingTool.isEditing = false
      chartLayout.editingDrawingTool = null
      this._dragDrawingToolStart = false
    }

    this._dragOffsetStart = false
    this._pinchHorzStart = false
    this._pinchVertStart = false
    this._pinchOffset = 0
    this._v = 0
  }

  private moveHandler (ev: any) {
    const chartLayout = this.props.chartLayout
    const chart = this.props.chart
    const offset = this.canvasOffset
    const point = ev.touches ? {
      x: ev.touches[0].pageX - offset.offsetLeft,
      y: ev.touches[0].pageY - offset.offsetTop,
    } :
    {
      x: ev.pageX - offset.offsetLeft,
      y: ev.pageY - offset.offsetTop,
    }

    if (this._pinchHorzStart || this._pinchVertStart) {
      chartLayout.setCursorPoint(null)
      return
    }

    chartLayout.setCursorPoint(point)

    if (this._dragOffsetStart ||
        this._dragDrawingToolStart ||
        chartLayout.creatingDrawingTool ||
        chartLayout.editingDrawingTool) {
      return
    }

    chart.hitTest()
  }

  private dragMoveHandler (ev) {
    if (this._dragDrawingToolStart ||
        this._dragOffsetStart) {

      const isTouchEvent = !!ev.touches
      const chartLayout = this.props.chartLayout
      const chart = this.props.chart
      const axisX = chart.axisX
      const axisY = chart.axisY
      const offset = this.canvasOffset
      const point = isTouchEvent ? {
          x: ev.touches[0].pageX - offset.offsetLeft,
          y: ev.touches[0].pageY - offset.offsetTop,
        } :
        {
          x: ev.pageX - offset.offsetLeft,
          y: ev.pageY - offset.offsetTop,
        }

      // 编辑画图工具
      if (this._dragDrawingToolStart) {
        const tool = chartLayout.editingDrawingTool
        const curBarX = axisX.findTimeBarByX(point.x).x
        const oldBarX = axisX.findTimeBarByX(this._dragPosX).x
        const offsetIndex = curBarX >= oldBarX ?
                            ~~((curBarX - oldBarX) / axisX.barWidth + 0.5) :
                            ~~((curBarX - oldBarX) / axisX.barWidth - 0.5)
        const offsetValue = axisY.getValueByY(point.y - offset.offsetTop) -
                            axisY.getValueByY(this._dragPosY - offset.offsetTop)

        tool.moveBy(offsetIndex, offsetValue)

        this._dragPosX = point.x
        this._dragPosY = point.y
      // 拖动背景
      } else if (this._dragOffsetStart) {
        // 当移动距离过小时，无需拖动，避免频繁重绘
        if (point.x - this._dragPosX === 0) {
          return
        }
        const curOffset = axisX.offset
        const newOffset = curOffset + point.x - this._dragPosX
        const timeStamp = ev.timeStamp
        axisX.offset = newOffset
        this._dragPosX = point.x
        if (isTouchEvent) {
          this._v = (point.x - this._lastMovePosition) / (timeStamp - this._lastMoveTime) * 1000
          this._lastMovePosition = point.x
          this._lastMoveTime = timeStamp
        }
      }
    }
  }

  private gestureMoveHandler (ev) {
    if (this._pinchHorzStart || this._pinchVertStart) {
      const chart = this.props.chart
      const axisX = chart.axisX
      const axisY = chart.axisY
      // 双指水平缩放
      if (this._pinchHorzStart) {
        const newOffset = Math.abs(ev.touches[1].pageX - ev.touches[0].pageX)
        const curBarWidth = axisX.barWidth
        const newBarWidth = curBarWidth + (newOffset - this._pinchOffset) / 100
        this._pinchOffset = newOffset
        axisX.barWidth = newBarWidth
        axisX.offset *= axisX.barWidth / curBarWidth
      // 双指垂直缩放
      } else if (this._pinchVertStart) {
        const newOffset = Math.abs(ev.touches[1].pageY - ev.touches[0].pageY)
        const newMargin = axisY.margin + (this._pinchOffset - newOffset)
        this._pinchOffset = newOffset
        axisY.margin = newMargin
      }
    }
  }
}
