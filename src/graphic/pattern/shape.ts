import * as _ from 'underscore'

import { BasePatternRenderer, Point } from './basepattern'
import ChartModel from '../../model/chart'

const DEFAULT_COLOR = 'rgba( 60, 120, 216, 1)'
const trendLineColorPresets = ['rgba(102, 255, 153, .5)', 'rgba( 60, 120, 216, 1)']
const trendLineDashedPresets = [[0, 0], [8, 8]]

export class ShapePatternRenderer extends BasePatternRenderer {
  private _trendLines: Point[][]
  private _points: Point[]

  constructor (chart: ChartModel, points: Point[], trendLines: Point[][]) {
    super(chart)
    this._points = points
    this._trendLines = trendLines
  }

  public draw (ctx: CanvasRenderingContext2D) {
    const points = this._points || []
    const trendLines = this._trendLines || []
    const chart = this._chart
    const datasource = chart.datasource
    const axisX = chart.axisX
    const axisY = chart.axisY
    const visibleRange = axisX.getVisibleTimeBars()
    const firstVisibleBar = visibleRange[0]
    const lastVisibleBar = visibleRange[visibleRange.length - 1]
    const firstBar = datasource.first()
    const lastBar = datasource.last()

    let len = points.length
    let line: Point[]
    let point: Point = null
    let x: number
    let y: number

    ctx.save()
    ctx.lineWidth = 3
    ctx.setLineDash([8, 8])
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

    ctx.lineWidth = 3
    len = trendLines.length

    for (let i = 0, distance, slope; i < len; i++) {

      ctx.beginPath()
      ctx.strokeStyle = trendLineColorPresets[~~(i / 2)]
      ctx.setLineDash(trendLineDashedPresets[~~(i / 2)])
      line = trendLines[i]
      distance = datasource.search(line[1].time) - datasource.search(line[0].time)
      slope = (line[1].value - line[0].value) / distance

      if (firstVisibleBar.time < line[0].time) {
        if (firstVisibleBar.time < firstBar.time) {
          distance = axisX.search(firstBar.time) + datasource.search(line[0].time)
        } else {
          distance = datasource.search(line[0].time) - datasource.search(firstVisibleBar.time)
        }
        x = firstVisibleBar.x
        y = ~~axisY.getYByValue(line[0].value - distance * slope)
        ctx.moveTo(x, y)
      }

      x = ~~axisX.getXByTime(line[0].time)
      y = ~~axisY.getYByValue(line[0].value)

      ctx.lineTo(x, y)

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
      ctx.stroke()
    }
    ctx.restore()
  }

  public hitTest (): boolean {
    return false
  }

  public isNowVisible (): boolean {
    const visibleRange = this._chart.axisX.getVisibleTimeBars()
    const firstBar = visibleRange[0]
    const lastBar = visibleRange[visibleRange.length - 1]
    const points = this._points || []
    const lines = this._trendLines || []

    const times = _.pluck(
      lines.reduce((acc, line) => {
        acc.push(line[0])
        acc.push(line[1])
        return acc
       }, []).concat(points), 'time')

    return !(firstBar.time > _.max(times) || lastBar.time < _.min(times))
  }
}
