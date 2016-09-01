import * as React from 'react'
import AxisXModel from '../model/axisx'

type Prop = {
  axis: AxisXModel
  width: number
  height: number
  onMouseDown?: (ev: MouseEvent) => void
}

export default class AxisX extends React.Component<Prop, any> {
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

  public mouseenterhandler (ev) {
    ev.currentTarget.style.cursor = 'ew-resize'
  }

  public render () {
    const width = this.props.width
    const height = this.props.height
    return (
      <div className='chart-axisx'
        onMouseDown={this.props.onMouseDown}
        onMouseEnter={this.mouseenterhandler.bind(this)}
        style={ {height: this.props.height} }>
        <canvas ref={el => {
          if (el) {
            this._canvas = el
            this._canvas.height = height
            this._canvas.width = width
            this._ctx = el.getContext('2d')
            this._axis.graphic.ctx = this._ctx
          }
        }} width={width} height={height}></canvas>
      </div>
    )
  }
}
