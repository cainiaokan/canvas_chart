import * as React from 'react'
import AxisXModel from '../model/axisx'

interface IProp {
  axis: AxisXModel
  width: number
  height: number
}

export default class AxisX extends React.Component<IProp, any> {
  private _canvas: HTMLCanvasElement
  private _ctx: CanvasRenderingContext2D
  private _axis: AxisXModel

  public componentWillMount () {
    this._axis = this.props.axis
  }

  public componentDidMount () {
    this._axis.size = {
      height: this.props.height,
      width: this.props.width,
    }
  }

  public componentDidUpdate () {
    this._axis.size = {
      height: this.props.height,
      width: this.props.width,
    }
  }

  public render () {
    return (
      <canvas ref={el => {
        if (el) {
          this._canvas = el
          this._canvas.height = this.props.height
          this._canvas.width = this.props.width
          this._ctx = el.getContext('2d')
          this._axis.graphic.ctx = this._ctx
        }
      }} width={this.props.width} height={this.props.height}></canvas>
    )
  }
}
