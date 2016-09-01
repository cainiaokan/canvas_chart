import * as React from 'react'
import AxisYModel from '../model/axisy'

type Prop = {
  axis: AxisYModel
  width: number
  height: number
}

export default class AxisY extends React.Component<Prop, any> {
  private _canvas: HTMLCanvasElement
  private _ctx: CanvasRenderingContext2D
  private _axis: AxisYModel

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
    const width = this.props.width
    const height = this.props.height
    return (
      <div className='chart-axisy' style={ {height: height + 'px', width: width + 'px'} }>
        <canvas ref={el => {
          if (el) {
            this._canvas = el
            this._canvas.height = this.props.height
            this._canvas.width = this.props.width
            this._ctx = el.getContext('2d')
            this._axis.graphic.ctx = this._ctx
          }
        }} width={width} height={height}></canvas>
      </div>
    )
  }
}
