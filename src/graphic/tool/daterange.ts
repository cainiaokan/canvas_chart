import * as _ from 'underscore'
import { formatNumber } from '../../util'
import { BaseToolRenderer, Vertex } from './basetool'
import { StockDatasource } from '../../datasource'
import { HIT_TEST_TOLERANCE } from '../../constant'

type StatData = {
  startPrice: string
  endPrice: string
  high: string
  low: string
  changeRate: string
  amplitude: string
  volume: string
  amount: string
  upCount: number
  downCount: number
  crossCount: number
}

const legendTableLayout = [
  ['起始价', 'startPrice', '终止价', 'endPrice'],
  ['最高', 'high', '最低', 'low'],
  ['涨跌幅', 'changeRate', '振幅', 'amplitude'],
  ['总手', 'volume', '金额', 'amount'],
  ['阳线', 'upCount', '阴线', 'downCount'],
  ['十字星', 'crossCount'],
]

const colorSettings = {
  startPrice: '#000',
  endPrice: '#000',
  high: '#d32f2f',
  low: '#00796b',
  changeRate: null,
  amplitude: '#54a9ff',
  volume: '#54a9ff',
  amount: '#54a9ff',
  upCount: '#d32f2f',
  downCount: '#00796b',
  crossCount: '#000',
}

export class DateRangeRenderer extends BaseToolRenderer {

  private _datasource: StockDatasource
  private _statData: StatData

  constructor (datasource: StockDatasource) {
    super()
    this._datasource = datasource
  }

  /**
   * @override
   * 画图工具当前是否可见
   */
  public isNowVisible (): boolean {
    const axisX = this._chart.axisX
    const visibleBars = axisX.getVisibleTimeBars()
    const vertexes = this._vertexes
    return vertexes[0].time <= visibleBars[visibleBars.length - 1].time &&
           vertexes[1].time >= visibleBars[0].time
  }

  get vertexes (): Vertex[] {
    const axisY = this._chart.axisY
    const range = axisY.range

    return this._vertexes.map(vertex => ({
      time: vertex.time,
      value: (range.max + range.min) / 2,
    }))
  }

  get statData () {
    if (this._isValid && this.isFinished()) {
      return this._statData
    }
    const datasource = this._datasource
    const axisX = this._chart.axisX
    let startTime = this._vertexes[0].time
    let endTime = this._vertexes.length > 1 ? this._vertexes[1].time : axisX.findTimeBarByX(this.getCursor().x).time
    let tmp
    if (startTime > endTime) {
      tmp = startTime
      startTime = endTime
      endTime = tmp
    }
    const bars = datasource.range(startTime, endTime)

    if (bars.length === 0) {
      return this._statData = null
    }

    const startPrice = bars[0].open
    const endPrice = bars[bars.length - 1].close
    const high = Math.max.apply(Math,  _.pluck(bars, 'high'))
    const low = Math.min.apply(Math, _.pluck(bars, 'low'))
    const volume = formatNumber(_.pluck(bars, 'volume').reduce((memo, cur) => {
      return memo + cur
    }, 0), 2) + '手'
    const amount = formatNumber(_.pluck(bars, 'amount').reduce((memo, cur) => {
      return memo + cur
    }, 0), 2)
    const upCount = bars.reduce((memo, bar) => {
      return bar.close >= bar.open ? memo + 1 : memo
    }, 0)
    const downCount = bars.reduce((memo, bar) => {
      return bar.close < bar.open ? memo + 1 : memo
    }, 0)
    const crossCount = bars.reduce((memo, bar) => {
      return bar.open === bar.close && bar.high > bar.low ? memo + 1 : memo
    }, 0)
    return this._statData = {
      startPrice: formatNumber(startPrice, 2),
      endPrice: formatNumber(endPrice, 2),
      high: formatNumber(high, 2),
      low: formatNumber(low, 2),
      changeRate: (endPrice >= startPrice ? '+' : '') + ((endPrice / startPrice - 1) * 100).toFixed(2) + '%',
      amplitude: ((high / low - 1) * 100).toFixed(2) + '%',
      volume, amount,
      upCount, downCount,
      crossCount,
    }
  }

  public drawTool (ctx: CanvasRenderingContext2D) {
    const chart = this._chart
    const axisX = chart.axisX
    const vertexes = this._vertexes
    const curPoint = this.getCursor()
    const isFinished = this.isFinished()
    const height = chart.height
    const resolution = this._datasource.resolution

    ctx.strokeStyle = '#ababab'
    ctx.lineWidth = 1
    ctx.beginPath()

    let lTime
    let rTime
    let tmp
    let lx
    let rx

    if (isFinished) {
      lTime = vertexes[0].time
      rTime = vertexes[1].time
      if (lTime > rTime) {
        tmp = lTime
        lTime = rTime
        rTime = tmp
      }
      lx = ~~axisX.getXByTime(lTime)
      rx = ~~axisX.getXByTime(rTime)
      ctx.moveTo(lx, 0)
      ctx.lineTo(lx, height)
      ctx.moveTo(rx, 0)
      ctx.lineTo(rx, height)
    } else {
      lx = ~~axisX.getXByTime(vertexes[0].time)
      rx = curPoint.x
      if (lx > rx) {
        tmp = lx
        lx = rx
        rx = tmp
      }
      ctx.moveTo(lx, 0)
      ctx.lineTo(lx, height)
      ctx.moveTo(rx, 0)
      ctx.lineTo(rx, height)
    }
    ctx.stroke()

    ctx.beginPath()
    ctx.strokeStyle = '#a000a0'
    ctx.setLineDash([6, 6])
    ctx.moveTo(lx, height / 2)
    ctx.lineTo(rx, height / 2)
    ctx.moveTo(rx - 8, height / 2 - 8)
    ctx.lineTo(rx, height / 2)
    ctx.moveTo(rx - 8, height / 2 + 8)
    ctx.lineTo(rx, height / 2)
    ctx.stroke()

    ctx.globalAlpha = .3
    ctx.fillStyle = '#6b91c5'

    ctx.rect(lx, 0, rx - lx, height)
    ctx.fill()

    const padding = 14
    const lineHeight = 20
    const columeWidth = 80
    const legendWidth = columeWidth * 4
    const legendHeight = lineHeight * legendTableLayout.length + padding * 2
    const legendX = lx + (rx - lx) / 2 - legendWidth / 2
    const legendY = height - legendHeight
    const statData = this.statData

    if (resolution > '1' && !!statData) {

      ctx.globalAlpha = 1
      ctx.setLineDash([0, 0])
      ctx.lineWidth = 1
      ctx.strokeStyle = '#6b91c5'
      ctx.fillStyle = '#eee'
      ctx.beginPath()

      ctx.rect(legendX, legendY, legendWidth, legendHeight)
      ctx.fill()
      ctx.stroke()

      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.font = '10px Verdana, Arial, sans-serif'

      for (let i = 0, len1 = legendTableLayout.length, row, y; i < len1; i++) {
        row = legendTableLayout[i]
        y = legendY + padding + (i + 0.5) * lineHeight
        for (let j = 0, len2 = row.length, label, value, x, key, color; j < len2; j += 2) {
          x = legendX + columeWidth * j + padding
          label = row[j]
          ctx.fillStyle = '#000'
          ctx.textAlign = 'left'
          ctx.fillText(label, x, y)

          key = row[j + 1]
          value = statData[key]
          color = colorSettings[key]
          x = legendX + columeWidth * (j + 2) - padding
          if (!!color) {
            ctx.fillStyle = color
          } else {
            ctx.fillStyle = value.charAt(0) === '+' ? '#d32f2f' : '#00796b'
          }
          ctx.textAlign = 'right'
          ctx.fillText(value, x, y)
        }
      }
    }
  }

  public hitTestTool (): boolean {
    const chart = this._chart
    const height = chart.height
    const axisX = chart.axisX
    let vertexes = this._vertexes
    const { x, y } = this.getCursor()
    const x1 = ~~axisX.getXByTime(vertexes[0].time)
    const x2 = ~~axisX.getXByTime(vertexes[1].time)
    const lx = x1 <= x2 ? x1 : x2
    const rx = x1 <= x2 ? x2 : x1

    return Math.abs(lx - x) < HIT_TEST_TOLERANCE ||
           Math.abs(rx - x) < HIT_TEST_TOLERANCE ||
           (x >= lx && y <= rx && Math.abs(y - height / 2) < HIT_TEST_TOLERANCE)
  }

  public isFinished (): boolean {
    return this._vertexes.length === 2
  }
}
