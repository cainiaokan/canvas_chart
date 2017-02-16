import './index.less'

import * as React from 'react'
import * as _ from 'underscore'
import {
  AXIS_Y_WIDTH,
} from '../../constant'
import Legend from './legend'
import ChartLayoutModel from '../../model/chartlayout'
import ChartModel from '../../model/chart'
import Indicator from './indicator'
import AxisY from './../axisY'

type Prop = {
  chart: ChartModel
  width: number
  height: number
}

type State = {
  hover?: boolean,
  cursor?: 'pointer' | 'crosshair' | 'default'
  showEditModeToolTip?: boolean
  toolTipX?: number
  toolTipY?: number
}

export default class Chart extends React.Component<Prop, State> {
  public static contextTypes = {
    chartLayout: React.PropTypes.instanceOf(ChartLayoutModel),
  }

  public context: { chartLayout: ChartLayoutModel }

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

  constructor () {
    super()
    this.state = {
      hover: false,
      cursor: 'crosshair',
      showEditModeToolTip: false,
      toolTipX: 0,
      toolTipY: 0,
    }
    this.dragMoveHandler = this.dragMoveHandler.bind(this)
    this.gestureMoveHandler = this.gestureMoveHandler.bind(this)
    this.mouseDownHandler = this.mouseDownHandler.bind(this)
    this.touchStartHandler = this.touchStartHandler.bind(this)
    this.mouseMoveHandler = this.mouseMoveHandler.bind(this)
    this.touchMoveHandler = this.touchMoveHandler.bind(this)
    this.touchEndHandler = this.touchEndHandler.bind(this)
    this.mouseUpPageHanlder = this.mouseUpPageHanlder.bind(this)
    this.touchEndPageHandler = this.touchEndPageHandler.bind(this)

    this.mouseOver = this.mouseOver.bind(this)
    this.mouseOut = this.mouseOut.bind(this)

    this.toolTipHandler = this.toolTipHandler.bind(this)
    this.hitHandler = this.hitHandler.bind(this)
    this.defaultCursorChangeHandler = this.defaultCursorChangeHandler.bind(this)
  }

  public shouldComponentUpdate (nextProp: Prop, nextState: State) {
    const curProp = this.props
    return nextProp.chart !== curProp.chart ||
           nextProp.width !== curProp.width ||
           nextProp.height !== curProp.height ||
           !_.isEqual(this.state, nextState)
  }

  public componentDidMount () {
    const chartLayout = this.context.chartLayout
    const chart = this.props.chart
    const width = ~~this.props.width - AXIS_Y_WIDTH
    const height = ~~this.props.height
    const canvas = this.refs.canvas
    const topCanvas = this.refs.topCanvas

    chart.width = width
    chart.height = height

    chart.ctx = canvas.getContext('2d')
    chart.topCtx = topCanvas.getContext('2d')

    chartLayout.addListener('graph_hover', this.hitHandler)
    chartLayout.addListener('cursor_change', this.defaultCursorChangeHandler)
    chartLayout.addListener('cursor_move', this.toolTipHandler)
    chartLayout.addListener('drawingtool_end', this.toolTipHandler)
    chartLayout.addListener('editmode_change', this.toolTipHandler)

    document.addEventListener('mousemove', this.dragMoveHandler)
    document.addEventListener('touchmove', this.dragMoveHandler)
    document.addEventListener('touchmove', this.gestureMoveHandler)
    document.addEventListener('mouseup', this.mouseUpPageHanlder)
    document.addEventListener('touchend', this.touchEndPageHandler)
  }

  public componentWillUnmount () {
    const chartLayout = this.context.chartLayout

    chartLayout.removeListener('graph_hover', this.hitHandler)
    chartLayout.removeListener('cursor_change', this.defaultCursorChangeHandler)
    chartLayout.removeListener('cursor_move', this.toolTipHandler)
    chartLayout.removeListener('drawingtool_end', this.toolTipHandler)
    chartLayout.removeListener('editmode_change', this.toolTipHandler)

    document.removeEventListener('mousemove', this.dragMoveHandler)
    document.removeEventListener('touchmove', this.dragMoveHandler)
    document.removeEventListener('touchmove', this.gestureMoveHandler)
    document.removeEventListener('mouseup', this.mouseUpPageHanlder)
    document.removeEventListener('touchend', this.touchEndPageHandler)
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
    }
  }

  public render () {
    const chart = this.props.chart
    const width = ~~this.props.width - AXIS_Y_WIDTH
    const height = ~~this.props.height

    return <div className={`chart-line ${chart.isMain ? 'main' : ''}`}>
      <div className='chart-plot'
        style={
          {
            height: height + 'px',
            width: width + 'px',
            cursor: this.state.cursor,
          }
        }>
        <Legend chart={chart} />
        <canvas
          ref='canvas'
          width={width}
          height={height}></canvas>
        <canvas
          ref='topCanvas'
          width={width}
          height={height}
          onMouseDown={this.mouseDownHandler}
          onTouchStart={this.touchStartHandler}
          onMouseMove={this.mouseMoveHandler}
          onTouchMove={this.touchMoveHandler}
          onTouchEnd={this.touchEndHandler}
          onMouseOver={this.mouseOver}
          onMouseOut={this.mouseOut}>
        </canvas>
        {
          this.state.showEditModeToolTip ?
          <div className='edit-mode-tooltip'
               style={ {
                 right: this.state.toolTipX + 'px',
                 bottom: this.state.toolTipY + 'px',
               } }>
            1.拖动十字线定义第一点.<br/>
            2.点击任意位置确定第一个停止位置
          </div> : null
        }
        {
          chart.isMain ? <Indicator chart={chart} /> : null
        }
      </div>
      <AxisY axis={chart.axisY} height={height} width={AXIS_Y_WIDTH} />
    </div>
  }

  private momentumMove (v: number) {
    const axisX = this.context.chartLayout.axisx
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

  private toolTipHandler () {
    const chartLayout = this.context.chartLayout
    const chart = this.props.chart
    const point = chart.crosshair.point
    if (chart.hover && chartLayout.isEditMode) {
      const width = ~~this.props.width - AXIS_Y_WIDTH
      const height = ~~this.props.height
      this.setState({
        showEditModeToolTip: true,
        toolTipX: width - point.x + 8,
        toolTipY: height - point.y + 8,
      })
    } else {
      this.setState({ showEditModeToolTip: false })
    }
  }

  private hitHandler (hover: boolean) {
    if (this.context.chartLayout.hoverChart === this.props.chart) {
      this.setState({ cursor: hover ? 'pointer' : this.context.chartLayout.defaultCursor })
    }
  }

  private defaultCursorChangeHandler (cursor: 'crosshair' | 'default') {
    this.setState({ cursor: this.state.hover ? 'pointer' : this.context.chartLayout.defaultCursor })
  }

  private mouseOver () {
    this.props.chart.hover = true
  }

  private mouseOut () {
    this.props.chart.hover = false
    this.context.chartLayout.setCursorPoint(null)
  }

  private mouseDownHandler (ev: any) {
    const chartLayout = this.context.chartLayout
    const chart = this.props.chart
    const offset = chart.offset
    const curPoint = {
      x: ev.pageX - offset.left,
      y: ev.pageY - offset.top,
    }

    if (chartLayout.mainDatasource.loaded() === 0) {
      return
    }

    // 取消其他chart中图形的选中态
    chartLayout.cancelSelectedGraph()

    // 如果还没有设置过坐标点，则设置坐标，比如页面刚进入时，鼠标还没有移动，此时坐标是空
    if (!chart.crosshair.point) {
      chartLayout.setCursorPoint(curPoint)
    }

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
      this._dragOffsetStart = true
      this._dragPosX = curPoint.x
      this._dragPosY = curPoint.y
    }
  }

  private touchStartHandler (ev: any) {
    const isSingleTouch = ev.touches.length === 1
    const isDoubleTouch = ev.touches.length === 2
    const chartLayout = this.context.chartLayout
    const chart = this.props.chart

    // 触摸事件时阻止鼠标事件
    ev.preventDefault()

    if (chartLayout.mainDatasource.loaded() === 0) {
      return
    }

    this._cancelClick = false

    // 取消其他chart中图形的选中态
    chartLayout.cancelSelectedGraph()

    // 设置hover chart
    if (!chart.hover) {
      chartLayout.setHoverChart(chart)
    }

    // 停止动量滚动
    this.stopMomentum()

    const offset = chart.offset
    const curPoint = {
      x: ev.touches[0].pageX - offset.left,
      y: ev.touches[0].pageY - offset.top,
    }

    // 单指非编辑模式下
    if (isSingleTouch) {
      if (!chartLayout.isEditMode) {
        chartLayout.setCursorPoint(curPoint)
        if (chartLayout.selectedDrawingTool) {
          chart.drawingToolBegin()
          chart.drawingToolSetVertex(curPoint)
          if (chart.creatingDrawingTool.isFinished()) {
            chart.drawingToolEnd()
          }
          return
        } else if (chart.creatingDrawingTool) {
          // 继续创建画图工具
          chart.drawingToolSetVertex(curPoint)
          if (chart.creatingDrawingTool.isFinished()) {
            chart.drawingToolEnd()
          }
          return
        }
      }
    } else if (isDoubleTouch) {// 双指缩放
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
    } else {// 忽略三指及以上的手势
      return
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
      // 动量滚动
      this._lastMovePosition = curPoint.x
      this._lastMoveTime = ev.timeStamp
      // 拖拽滚动
      this._dragOffsetStart = true
      this._dragPosX = curPoint.x
      this._dragPosY = curPoint.y
    }
  }

  private touchEndHandler (ev: any) {
    const isSingleTouch = ev.changedTouches.length === 1
    const chartLayout = this.context.chartLayout
    const chart = this.props.chart
    const cursorPoint = chart.crosshair.point

    ev.preventDefault()

    if (chartLayout.isEditMode && isSingleTouch && !this._cancelClick) {
      if (chartLayout.selectedDrawingTool) {
        // 创建画图工具
        chart.drawingToolBegin()
        chart.drawingToolSetVertex({
          x: cursorPoint.x,
          y: cursorPoint.y,
        })
        if (chart.creatingDrawingTool.isFinished()) {
          chart.drawingToolEnd()
        }
      } else if (chart.creatingDrawingTool) {
         // 继续创建画图工具
        chart.drawingToolSetVertex({
          x: cursorPoint.x,
          y: cursorPoint.y,
        })
        if (chart.creatingDrawingTool.isFinished()) {
          chart.drawingToolEnd()
        }
      }
    }
  }

  private mouseUpPageHanlder (ev: any) {
    const chart = this.props.chart

    if (this._dragDrawingToolStart) {
      chart.editingDrawingTool.isEditing = false
      chart.editingDrawingTool = null
      this._dragDrawingToolStart = false
    }

    this._dragOffsetStart = false
  }

  private touchEndPageHandler (ev: any) {
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

  private mouseMoveHandler (ev: any) {
    const chartLayout = this.context.chartLayout
    const chart = this.props.chart
    const offset = chart.offset
    const point = {
      x: ev.pageX - offset.left,
      y: ev.pageY - offset.top,
    }

    chartLayout.setCursorPoint(point)

    if (!this._dragOffsetStart &&
      !this._dragDrawingToolStart &&
      !chart.creatingDrawingTool &&
      !chart.editingDrawingTool) {
      chart.hitTest()
    }
  }

  private touchMoveHandler (ev: any) {
    const chartLayout = this.context.chartLayout
    const chart = this.props.chart
    const offset = chart.offset
    const point = {
      x: ev.touches[0].pageX - offset.left,
      y: ev.touches[0].pageY - offset.top,
    }

    if (this._pinchHorzStart || this._pinchVertStart) {
      return
    }

    this._cancelClick = true

    if (!chartLayout.isEditMode) {
      chartLayout.setCursorPoint(point)
    }

    if (!this._dragOffsetStart &&
      !this._dragDrawingToolStart &&
      !chart.creatingDrawingTool &&
      !chart.editingDrawingTool) {
      chart.hitTest()
    }
  }

  private dragMoveHandler (ev) {
    if (this._dragDrawingToolStart ||
        this._dragOffsetStart) {

      const isTouchEvent = !!ev.touches
      const chart = this.props.chart
      const chartLayout = this.context.chartLayout
      const axisX = chart.axisX
      const axisY = chart.axisY
      const offset = chart.offset
      const point = isTouchEvent ? {
          x: ev.touches[0].pageX - offset.left,
          y: ev.touches[0].pageY - offset.top,
        } :
        {
          x: ev.pageX - offset.left,
          y: ev.pageY - offset.top,
        }

      // 编辑画图工具
      if (this._dragDrawingToolStart) {
        const curBarX = axisX.findTimeBarByX(point.x).x
        const oldBarX = axisX.findTimeBarByX(this._dragPosX).x
        const offsetIndex = curBarX >= oldBarX ?
                            ~~((curBarX - oldBarX) / axisX.barWidth + 0.5) :
                            ~~((curBarX - oldBarX) / axisX.barWidth - 0.5)
        const offsetValue = axisY.getValueByY(point.y - offset.top) -
                            axisY.getValueByY(this._dragPosY - offset.top)

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
