import * as React from 'react'

import {
  AXIS_Y_WIDTH,
} from '../../constant'
import Legend from './legend'
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
  private _cancelClick: boolean
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
    this.upCanvasHandler = this.upCanvasHandler.bind(this)
    this.upPageHandler = this.upPageHandler.bind(this)
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
    document.addEventListener('mouseup', this.upPageHandler)
    document.addEventListener('touchend', this.upPageHandler)
  }

  public componentWillUnmount () {
    const chartLayout = this.props.chartLayout

    chartLayout.removeListener('graph_hover', this.hitHandler)
    chartLayout.removeListener('cursor_change', this.defaultCursorChangeHandler)
    document.removeEventListener('mousemove', this.dragMoveHandler)
    document.removeEventListener('touchmove', this.dragMoveHandler)
    document.removeEventListener('touchmove', this.gestureMoveHandler)
    document.removeEventListener('mouseup', this.upPageHandler)
    document.removeEventListener('touchend', this.upPageHandler)
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
          onMouseUp={this.upCanvasHandler}
          onTouchEnd={this.upCanvasHandler}
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

    this._cancelClick = false

    // 取消其他chart中的所有选中态
    chartLayout.charts.forEach(ch => {
      ch.graphs.forEach(graph => graph.selected = false)
      ch.tools.forEach(tool => tool.selected = false)
    })

    // 触摸事件时取消所有graph和tools的选中态
    if (isSingleTouch) {
      // 设置当前chart为hover态
      chartLayout.setHoverChart(chart)
      // 触屏设备需要点击时手动设置指针位置
      if (!chartLayout.isEditMode) {
        chartLayout.setCursorPoint(curPoint)
      }
    }

    // 如果还没有设置过坐标点，则设置坐标，比如页面刚进入时，鼠标还没有移动，此时坐标是空
    if (!chart.crosshair.point) {
      chartLayout.setCursorPoint(curPoint)
    }

    // 停止动量滚动
    this.stopMomentum()

    // 非触屏编辑模式下，创建画图工具
    if (!chartLayout.isEditMode && (!isTouchEvent || isSingleTouch)) {
      if (chartLayout.selectedDrawingTool) {
        chart.drawingToolBegin()
        chart.drawingToolSetVertex(curPoint)
        if (chart.creatingDrawingTool.isFinished()) {
          chart.drawingToolEnd()
        }
        return
      }

      // 继续创建画图工具
      if (chart.creatingDrawingTool) {
        chart.drawingToolSetVertex(curPoint)
        if (chart.creatingDrawingTool.isFinished()) {
          chart.drawingToolEnd()
        }
        return
      }
    }

    // 触屏设备
    if (isTouchEvent) {
      // 触摸事件时阻止鼠标事件
      ev.preventDefault()
      // 手势拖拽
      if (isSingleTouch) {
        this._lastMovePosition = curPoint.x
        this._lastMoveTime = ev.timeStamp
      } else if (isDoubleTouch) {
        const offsetHorz = Math.abs(ev.touches[0].clientX - ev.touches[1].clientX)
        const offsetVert = Math.abs(ev.touches[0].clientY - ev.touches[1].clientY)
        this._dragOffsetStart = false
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
    if (chart.editingDrawingTool) {
      if (chartLayout.willEraseDrawingTool) {
        chart.removeDrawingTool(chart.editingDrawingTool)
      } else {
        chart.editingDrawingTool.isEditing = true
        this._dragDrawingToolStart = true
        this._dragPosX = curPoint.x
        this._dragPosY = curPoint.y
      }
    } else {
      chart.editingDrawingTool = null
      this._dragOffsetStart = true
      this._dragPosX = curPoint.x
      this._dragPosY = curPoint.y
    }
  }

  private upCanvasHandler (ev: any) {
    if (ev.touches) {
      ev.preventDefault()
    }
    const chartLayout = this.props.chartLayout
    if (chartLayout.isEditMode && !this._cancelClick) {
      const isTouchEvent = !!ev.changedTouches
      const isSingleTouch = isTouchEvent && ev.changedTouches.length === 1
      const chart = this.props.chart
      const cursorPoint = chart.crosshair.point

      // 非触屏编辑模式下，创建画图工具
      if (!isTouchEvent || isSingleTouch) {
        if (chartLayout.selectedDrawingTool) {
          chart.drawingToolBegin()
          chart.drawingToolSetVertex({
            x: cursorPoint.x,
            y: cursorPoint.y,
          })
          if (chart.creatingDrawingTool.isFinished()) {
            chart.drawingToolEnd()
          }
          return
        }

        // 继续创建画图工具
        if (chart.creatingDrawingTool) {
          chart.drawingToolSetVertex({
            x: cursorPoint.x,
            y: cursorPoint.y,
          })
          if (chart.creatingDrawingTool.isFinished()) {
            chart.drawingToolEnd()
          }
          return
        }
      }
    }
  }

  private upPageHandler (ev: any) {
    const chart = this.props.chart

    if (this._dragOffsetStart &&
       (ev.timeStamp - this._lastMoveTime < 60 && Math.abs(this._v) > 100)) {
      this.momentumMove(this._v)
    }

    if (this._dragDrawingToolStart) {
      chart.editingDrawingTool.isEditing = false
      chart.editingDrawingTool = null
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

    this._cancelClick = true

    if (this._pinchHorzStart || this._pinchVertStart) {
      return
    }

    if (!chartLayout.isEditMode) {
      chartLayout.setCursorPoint(point)
    }

    if (this._dragOffsetStart ||
      chart.creatingDrawingTool ||
      chart.editingDrawingTool) {
      return
    }

    chart.hitTest()
  }

  private dragMoveHandler (ev) {
    if (this._dragDrawingToolStart ||
        this._dragOffsetStart) {

      const isTouchEvent = !!ev.touches
      const chart = this.props.chart
      const chartLayout = this.props.chartLayout
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
        const curBarX = axisX.findTimeBarByX(point.x).x
        const oldBarX = axisX.findTimeBarByX(this._dragPosX).x
        const offsetIndex = curBarX >= oldBarX ?
                            ~~((curBarX - oldBarX) / axisX.barWidth + 0.5) :
                            ~~((curBarX - oldBarX) / axisX.barWidth - 0.5)
        const offsetValue = axisY.getValueByY(point.y - offset.offsetTop) -
                            axisY.getValueByY(this._dragPosY - offset.offsetTop)

        chart.editingDrawingTool.moveBy(offsetIndex, offsetValue)

        this._dragPosX = point.x
        this._dragPosY = point.y
      // 拖动背景
      } else if (this._dragOffsetStart) {
        if (chartLayout.isEditMode) {
          const cursorPoint = chart.crosshair.point
          chartLayout.setCursorPoint({
            x: cursorPoint.x + point.x - this._dragPosX,
            y: cursorPoint.y + point.y - this._dragPosY,
          })
          this._dragPosX = point.x
          this._dragPosY = point.y
        } else {
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
