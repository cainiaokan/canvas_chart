import * as _ from 'underscore'

import { BasePatternRenderer, Point } from './basepattern'
import ChartModel from '../../model/chart'

const DEFAULT_COLOR = 'rgba( 60, 120, 216, 1)'

export class ShapePatternRenderer extends BasePatternRenderer {
  private _trendLines: Point[][]
  private _points: Point[]

  constructor (chart: ChartModel, points: Point[], trendLines: Point[][]) {
    super(chart)
    this._points = points
    this._trendLines = trendLines
  }

  public draw (ctx: CanvasRenderingContext2D) {
    const points = this._points
    const trendLines = this._trendLines
    const chart = this._chart
    const datasource = chart.datasource
    const axisX = chart.axisX
    const axisY = chart.axisY
    const visibleRange = axisX.getVisibleTimeBars()
    const lastVisibleBar = visibleRange[visibleRange.length - 1]
    const lastBar = datasource.last()

    let len = points.length
    let line: Point[]
    let point: Point = null
    let x: number
    let y: number

    ctx.save()
    ctx.lineWidth = 3
    ctx.setLineDash([6, 6])
    ctx.strokeStyle = DEFAULT_COLOR

    ctx.beginPath()

    if (len) {
      point = points[0]
      x = ~~axisX.getXByTime(point.time)
      y = ~~axisY.getYByValue(point.value)
      ctx.moveTo(x, y)
    }

    for (let i = 1; i < len; i++) {
      point = points[i]
      x = ~~axisX.getXByTime(point.time)
      y = ~~axisY.getYByValue(point.value)
      ctx.lineTo(x, y)
    }

    ctx.stroke()
    ctx.beginPath()

    ctx.lineWidth = 1
    ctx.strokeStyle = '#666666'
    len = trendLines.length

    for (let i = 0, distance, slope; i < len; i++) {
      line = trendLines[i]
      distance = datasource.search(line[1].time) - datasource.search(line[0].time)
      slope = (line[1].value - line[0].value) / distance
      x = ~~axisX.getXByTime(line[0].time)
      y = ~~axisY.getYByValue(line[0].value)

      ctx.moveTo(x, y)

      x = ~~axisX.getXByTime(line[1].time)
      y = ~~axisY.getYByValue(line[1].value)

      ctx.lineTo(x, y)

      if (lastVisibleBar.time > line[1].time) {
        if (lastVisibleBar.time > lastBar.time) {
          distance = visibleRange.length - 1 - axisX.search(lastBar.time) + datasource.search(lastBar.time) - datasource.search(line[1].time)
        } else {
          distance = datasource.search(lastVisibleBar.time) - datasource.search(line[1].time)
        }
        x = lastVisibleBar.x
        y = ~~axisY.getYByValue(line[1].value + distance * slope)
        ctx.lineTo(x, y)
      }
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

    const times = _.pluck(this._points, 'time')

    return !(firstBar.time > _.max(times) || lastBar.time < _.min(times))
  }
}
