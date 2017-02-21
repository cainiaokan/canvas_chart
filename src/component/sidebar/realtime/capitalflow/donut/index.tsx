import './index.less'

import * as React from 'react'
import * as _ from 'underscore'

type Prop = {
  width: number
  height: number
  data: number[]
  onSectorMouseMove?: (data: {
    pageX: number
    pageY: number
    label: string
    color: string
    value: number
  }) => void
  onSectorMouseLeave?: () => void
}

const TOOL_TIPS = ['散户流入', '主力流入', '主力流出', '散户流出']
const COLORS = ['#ff524f', '#ff7d42', '#68ce3c', '#15af3d']

export default class CapitalDonutChart extends React.Component<Prop, any> {
  constructor () {
    super()
    this.mouseMoveHandler = this.mouseMoveHandler.bind(this)
    this.mouseLeaveHandler = this.mouseLeaveHandler.bind(this)
  }

  public shouldComponentUpdate (nextProps: Prop) {
    return _.isEqual(this.props, nextProps)
  }

  public render () {
    const data = this.props.data
    const { width, height } = this.props
    const radius = width / 2

    let r = radius - 5
    const bgSectorCommand = []

    // 灰色背景扇环 参数
    // 移动到中心
    bgSectorCommand.push(`M${-r},0`)
    bgSectorCommand.push(`A${r},${r},0,0,1,${r},0`)
    r = radius - 65
    bgSectorCommand.push(`L${r},0`)
    bgSectorCommand.push(`A${r},${r},0,0,0,${-r},0Z`)

    const sectors = this.getSectors(data, radius)
    const labels = this.getLabels(data, radius)

    const addup = ~~(data[1] - data[2] + 0.5)

    return (
      <div className='chart-capital-flow-donut'>
        <p>单位：万元</p>
        <div className='legend clearfix'>
            <div className='color-desc-1'>
                <div className='color-block'></div>
                <p>散户流入</p>
            </div>
            <div className='color-desc-2'>
                <div className='color-block'></div>
                <p>主力流入</p>
            </div>
            <div className='color-desc-4'>
                <div className='color-block'></div>
                <p>散户流出</p>
            </div>
            <div className='color-desc-3'>
                <div className='color-block'></div>
                <p>主力流出</p>
            </div>
        </div>
        <svg width={width} height={height}>
          <g transform={`translate(${radius},${height})`}>
            <path fill='#f1f3f6' d={bgSectorCommand.join('')} />
            {
              sectors.map((cmd, i) => {
                const label = labels[i]
                return <g key={i}
                          className='sector'
                          onMouseMove={this.mouseMoveHandler(i)}
                          onMouseLeave={this.mouseLeaveHandler}>
                  <path fill={COLORS[i]} d={cmd} />
                  {
                    parseInt(label.text) > 5 ?
                    <text x={label.x} y={label.y} fontSize={12} textAnchor='middle' fill='#fff'>{label.text}</text>
                    : null
                  }
                </g>

              })
            }
            <text x={0} y={-32} textAnchor='middle' fontSize={14} fill='#999999'>主力资金</text>
            <text x={0} y={-6} textAnchor='middle' fontSize={26} fill={addup > 0 ? '#ff524f' : '#15af3d'}>
              {addup > 0 ? '+' + addup : addup}
            </text>
          </g>
        </svg>
        <div className='clearfix'>
            <p className='capital-in'>
              流入
              <i className='capital-in-num'>
                {data ? ~~(data[1] + 0.5) : 'N/A'}
              </i>
            </p>
            <p className='capital-out'>
              流出
              <i className='capital-out-num'>
                {data ? ~~(data[2] + 0.5) : 'N/A'}
              </i>
            </p>
        </div>
      </div>
    )
  }

  private getSectors (data: any, radius: number): string[] {
    const total = data.reduce((prev, cur) => prev + cur, 0)
    const secttorCommands = []

    let r1 = radius - 10
    let r2 = radius - 60
    let x
    let y
    let rad = 0
    let rad0 = 0
    let sectorCmd

    for (let i = 0; i < 4; i++) {
      sectorCmd = []
      rad0 = rad
      rad += data[i] / total * Math.PI
      x = (-Math.cos(rad0) * r1).toFixed(2)
      y = (-Math.sin(rad0) * r1).toFixed(2)
      sectorCmd.push(`M${x},${y}`)
      x = (-Math.cos(rad) * r1).toFixed(2)
      y = (-Math.sin(rad) * r1).toFixed(2)
      sectorCmd.push(`A${r1},${r1},0,0,1,${x},${y}`)

      x = (-Math.cos(rad) * r2).toFixed(2)
      y = (-Math.sin(rad) * r2).toFixed(2)
      sectorCmd.push(`L${x},${y}`)
      x = (-Math.cos(rad0) * r2).toFixed(2)
      y = (-Math.sin(rad0) * r2).toFixed(2)
      sectorCmd.push(`A${r2},${r2},0,0,0,${x},${y}Z`)
      secttorCommands.push(sectorCmd.join(''))
    }
    return secttorCommands
  }

  private getLabels (data: any, radius: number): {text: string, x: number, y: number}[] {
    const total = data.reduce((prev, cur) => prev + cur, 0)
    const labels = []

    let r = radius - 35
    let rad0 = 0
    let rad = 0
    let text
    let x
    let y

    for (let i = 0; i < 4; i++) {
      text = ~~(data[i] / total * 100 + 0.5) + '%'
      rad0 = data[i] / total * Math.PI
      x = (-Math.cos(rad + rad0 / 2) * r).toFixed(2)
      y = (-Math.sin(rad + rad0 / 2) * r + 6).toFixed(2)
      labels.push({text, x, y})
      rad += rad0
    }
    return labels
  }

  private mouseMoveHandler (index) {
    return function (ev) {
      if (this.props.onSectorMouseMove) {
        this.props.onSectorMouseMove({
          pageX: ev.pageX,
          pageY: ev.pageY,
          label: TOOL_TIPS[index],
          color: COLORS[index],
          value: ~~(this.props.data[index] + 0.5),
        })
      }
    }.bind(this)
  }

  private mouseLeaveHandler () {
    if (this.props.onSectorMouseLeave) {
      this.props.onSectorMouseLeave()
    }
  }
}
