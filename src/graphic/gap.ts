import { StockDatasource } from '../datasource'
import GraphModel from '../model/graph'

export default class GapRenderer {
  private _graph: GraphModel
  private _gapCache: { time1: number, time2: number, from: number, to: number, lastBarTime: number} = null
  // 记住firstBar的时间，以便之后再次计算跳空缺口时，直接从此位置开始，而不需要从头计算
  private _firstBarTime: number = 0
  constructor (graph: GraphModel) {
    this._graph = graph
  }

  /**
   * 获取离现在最近的一个跳空缺口
   */
  public findLastGap () {
    const graph = this._graph
    const axisX = graph.chart.axisX
    const datasource = graph.datasource as StockDatasource

    if (datasource.loaded() < 2) {
      return null
    }

    let gapCache = this._gapCache
    const visibleTimeBars = axisX.getVisibleTimeBars()

    /*
     * lastBarTime用来记录bars是否有更新，如果有更新的话，需要重新计算跳空。
     */
    if (gapCache &&
        gapCache.lastBarTime === datasource.last().time) {
      if (gapCache.time2 > visibleTimeBars[0].time &&
          gapCache.time2 < visibleTimeBars[visibleTimeBars.length - 1].time) {
        return gapCache
      } else {
        return null
      }
    }

    let curIndex = this._firstBarTime ? datasource.search(this._firstBarTime) : datasource.loaded() - 1

    const lastBarTime = datasource.last().time
    let findGap = false

    let time1
    let time2
    let from
    let to
    let curBar
    let lastBar
    let max = datasource.max(curIndex)
    let min = datasource.min(curIndex)

    while (curIndex) {
      curBar = datasource.barAt(curIndex)
      lastBar = datasource.barAt(curIndex - 1)

      max = Math.max(max, curBar.high)
      min = Math.min(min, curBar.low)

      time1 = lastBar.time
      time2 = curBar.time

      if (lastBar.low > max) {
        findGap = true
        from = lastBar.low
        to = max
        break
      } else if (lastBar.high < min) {
        findGap = true
        from = lastBar.high
        to = min
        break
      }
      curIndex--
    }

    if (findGap) {
      this._gapCache = gapCache = findGap ? { time1, time2, from, to, lastBarTime} : null
      if (gapCache.time2 > visibleTimeBars[0].time &&
          gapCache.time2 < visibleTimeBars[visibleTimeBars.length - 1].time) {
        return gapCache
      } else {
        return null
      }
    } else {
      this._firstBarTime = datasource.first().time
      return null
    }
  }

  public draw (ctx: CanvasRenderingContext2D) {
    const chart = this._graph.chart
    const axisX = chart.axisX
    const axisY = chart.axisY
    const width = axisX.width
    const gap = this.findLastGap()

    if (gap) {
      const x2 = ~~axisX.getXByTime(gap.time2)
      const y1 = ~~axisY.getYByValue(gap.from)
      const y2 = ~~axisY.getYByValue(gap.to)
      const h = ~~(Math.abs(y2 - y1))

      ctx.save()
      ctx.fillStyle = '#636363'
      ctx.font = '12 px Verdana, Arial, sans-serif'
      ctx.fillRect(
        x2,
        y2 < y1 ? y2 : y1,
        width - x2,
        h > 0 ? h : 1)
      ctx.fillStyle = 'black'
      ctx.fillText(Number(gap.from).toFixed(2) + '-' + Number(gap.to).toFixed(2), x2, y1 < y2 ? y1 - 2 : y2 - 2)
      ctx.restore()
    }

  }

  public clearCache () {
    this._firstBarTime = 0
    this._gapCache = null
  }
}
