import * as React from 'react'

import { AXIS_Y_WIDTH } from '../../constant'
import Legend from './../legend'
import ChartModel from '../../model/chart'
import AxisY from './../axisY'

type Prop = {
  model: ChartModel
  width: number
  height: number
}

type State = {
}

export default class Chart extends React.Component<Prop, State> {
  private _model: ChartModel

  constructor () {
    super()
  }

  public componentWillMount () {
    this._model = this.props.model
  }

  public componentDidMount () {
    this._model.size = {
      height: this.props.height,
      width: this.props.width,
    }
  }

  public componentDidUpdate () {
    this._model.size = {
      height: this.props.height,
      width: this.props.width,
    }
  }

  public mouseEnterHandler () {
    this._model.crosshair.hover = true
  }

  public mouseLeaveHandler () {
    this._model.crosshair.hover = false
  }

  public render () {
    const width = this.props.width - AXIS_Y_WIDTH
    const height = this.props.height
    return <div className='chart-line'
      onMouseEnter={this.mouseEnterHandler.bind(this)}
      onMouseLeave={this.mouseLeaveHandler.bind(this)}>
      <div className='chart-plot' style={ {height: height + 'px', width: width + 'px'} }>
        <Legend chartModel={this._model}/>
        <canvas ref={el => {
          if (el) {
            el.height = height
            el.width = width
            this._model.ctx = el.getContext('2d')
          }
        }} width={width} height={height}></canvas>
        <canvas ref={
          el => {
            if (el) {
              el.height = height
              el.width = width
              this._model.topCtx = el.getContext('2d')
            }
          }
        } width={width} height={height}></canvas>
      </div>
      <AxisY axis={this._model.axisY} height={height} width={AXIS_Y_WIDTH} />
    </div>
  }
}
