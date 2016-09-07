import * as React from 'react'
import AxisXModel from '../model/axisx'

type Prop = {
  axis: AxisXModel
  width: number
  height: number
  onMouseDown?: (ev: MouseEvent) => void
}

export default class AxisX extends React.Component<Prop, any> {
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
    const width = this.props.width
    const height = this.props.height
    return (
      <div className='chart-axisx'
        onMouseDown={this.props.onMouseDown ? this.props.onMouseDown : null}
        style={ {height: height, width: width} }>
        <canvas ref={el => {
          if (el) {
            el.height = height
            el.width = width
            this._axis.graphic.ctx = el.getContext('2d')
          }
        }} width={width} height={height}></canvas>
      </div>
    )
  }
}
