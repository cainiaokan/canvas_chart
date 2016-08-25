import * as React from 'react'
import ChartModel from '../model/chart'
import AxisY from './axisY'
import { AXIS_X_WIDTH } from '../constant'

interface IProp {
  model: ChartModel
  width: number
  height: number
}

export default class Chart extends React.Component<IProp, any> {
  private _canvas: HTMLCanvasElement
  private _ctx: CanvasRenderingContext2D
  private _model: ChartModel

  constructor () {
    super()
  }

  public componentWillMount () {
    this._model = this.props.model
  }

  public componentDidMount () {
    let dragStart = false
    let dragPosX = 0
    this._model.size = {
      height: this.props.height,
      width: this.props.width,
    }
    this._canvas.onmousedown = e => {
      dragStart = true
      dragPosX = e.pageX
    }
    this._canvas.onmousemove = e => {
      if (dragStart) {
        const axisX = this._model.axisX
        const curOffset = axisX.offset
        const pageX = e.pageX
        const newOffset = curOffset + e.pageX - dragPosX
        if (newOffset < axisX.minOffset) {
          this._model.axisX.offset = axisX.minOffset
        } else if (newOffset > axisX.maxOffset) {
          this._model.axisX.offset = axisX.maxOffset
        } else {
          this._model.axisX.offset += pageX - dragPosX
        }
        dragPosX = pageX
        this._model.crosshair.point = null
      } else {
        const canvas = this._ctx.canvas
        this._model.crosshair.point = {
          x: e.clientX - canvas.clientLeft,
          y: e.clientY - canvas.clientTop,
        }
      }
    }
    this._canvas.onmouseup = () => {
      dragStart = false
    }
    this._canvas.onmouseleave = () => {
      this._model.crosshair.point = null
    }
  }

  public componentDidUpdate () {
    this._model.size = {
      height: this.props.height,
      width: this.props.width,
    }
  }

  public render () {
    return <div className='chart-plot' style={ {fontSize: 0, whiteSpace: 'nowrap'} }>
      <canvas ref={el => {
        if (el) {
          this._canvas = el
          this._canvas.height = this.props.height
          this._canvas.width = this.props.width - AXIS_X_WIDTH
          this._ctx = el.getContext('2d')
          this._model.graphs.forEach(graph => graph.setCanvasContext(this._ctx))
          this._model.crosshair.graphic.ctx = this._ctx
        }
      }} width={this.props.width - AXIS_X_WIDTH} height={this.props.height}></canvas>
      <AxisY axis={this._model.axisY} height={this.props.height} width={AXIS_X_WIDTH} />
    </div>
  }

}
