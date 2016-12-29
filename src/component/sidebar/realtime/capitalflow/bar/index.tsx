import './index.less'

import * as React from 'react'
import * as _ from 'underscore'

type Prop = {
  width: number
  height: number
  data: number[]
}

export default class CapitalBarChart extends React.Component<Prop, any> {

  public shouldComponentUpdate (nextProps: Prop) {
    return !_.isEqual(this.props, nextProps)
  }

  public render () {
    const data = this.props.data
    const width = this.props.width
    const height = this.props.height
    const barWidth = width / 5
    const rectWidth = barWidth * 0.4
    const max = Math.max.apply(Math, data)
    const min = Math.min.apply(Math, data)
    const diff = max - min

    const tickmarks = [
      barWidth / 2,
      barWidth / 2 * 3,
      barWidth / 2 * 5,
      barWidth / 2 * 7,
      barWidth / 2 * 9,
    ]

    return (
      <div className='chart-capital-flow-bar-chart'>
        <h3>最近5日主力流入</h3>
        <svg width={width} height={height}>
          <g transform={`translate(0, ${(height * max / diff).toFixed(2)})`}>
            <line x1={0} y1={0} x2={width} y2={0} stroke='#999' />
            {
              tickmarks.map((x, i) =>
                <rect
                  key={i}
                  x={x - rectWidth / 2}
                  y={data[i] > 0 ? -height * data[i] / diff : 0}
                  width={rectWidth}
                  height={Math.abs(height * data[i] / diff)}
                  fill={data[i] > 0 ? '#ff524f' : '#15af3d'}
                />
              )
            }
            {
              tickmarks.map((x, i) =>
                <text
                  key={i}
                  x={x}
                  y={data[i] > 0 ? 16 : -8}
                  fill={data[i] > 0 ? '#ff524f' : '#15af3d'}
                  textAnchor='middle'
                >{~~(data[i] + 0.5)}</text>
              )
            }
          </g>
        </svg>
      </div>
    )
  }
}
