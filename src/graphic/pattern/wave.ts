import * as _ from 'underscore'

import { BasePatternRenderer, Point } from './basepattern'
import ChartModel from '../../model/chart'

const DEFAULT_COLOR = 'rgba( 60, 120, 216, 1)'

export class WavePatternRenderer extends BasePatternRenderer {
  private _bwPoints: Point[]
  private _swPoints: Point[]

  constructor (chart: ChartModel, bwPoints: Point[], swPoints: Point[]) {
    super(chart)
    this._bwPoints = bwPoints
    this._swPoints = swPoints
  }

  public draw (ctx: CanvasRenderingContext2D) {
    const bwPoints = this._bwPoints
    const swPoints = this._swPoints
    const chart = this._chart
    const axisX = chart.axisX
    const axisY = chart.axisY

    let len = bwPoints.length
    let point: Point = null
    let x: number
    let y: number

    ctx.save()
    ctx.lineWidth = 3
    ctx.strokeStyle = DEFAULT_COLOR
    ctx.setLineDash([6, 6])

    ctx.beginPath()

    if (len) {
      point = bwPoints[0]
      x = ~~axisX.getXByTime(point.time)
      y = ~~axisY.getYByValue(point.value)
      ctx.moveTo(x, y)
    }

    for (let i = 1; i < len; i++) {
      point = bwPoints[i]
      x = ~~axisX.getXByTime(point.time)
      y = ~~axisY.getYByValue(point.value)
      ctx.lineTo(x, y)
    }

    ctx.stroke()

    ctx.lineWidth = 3
    ctx.beginPath()

    len = swPoints.length

    if (len) {
      point = swPoints[0]
      x = ~~axisX.getXByTime(point.time)
      y = ~~axisY.getYByValue(point.value)
      ctx.moveTo(x, y)
    }

    for (let i = 1; i < len; i++) {
      point = swPoints[i]
      x = ~~axisX.getXByTime(point.time)
      y = ~~axisY.getYByValue(point.value)
      ctx.lineTo(x, y)
    }

    ctx.stroke()
    ctx.restore()
  }

  public hitTest (): boolean {
    return false
  }

  public isNowVisible (): boolean {
    const visibleRange = this._chart.axisX.getVisibleTimeBars()
    const firstBar = visibleRange[0]
    const lastBar = visibleRange[visibleRange.length - 1]

    const bTimes = _.pluck(this._bwPoints, 'time')
    const sTimes = _.pluck(this._swPoints, 'time')

    return !(firstBar.time > Math.max(_.max(bTimes), _.max(sTimes)) || lastBar.time < _.min(bTimes))
  }
}
