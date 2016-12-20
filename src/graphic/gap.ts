import { StockDatasource } from '../datasource'
import GraphModel from '../model/graph'

export default class GapRenderer {
  private _graph: GraphModel
  private _gapCache: { time1: number, time2: number, value1: number, value2: number, from: number, to: number, lastBarTime: number} = null

  constructor (graph: GraphModel) {
    this._graph = graph
  }

  /**
   * 获取离现在最近的一个跳空缺口
   */
  public findLastGap () {
    const graph = this._graph
    const axisX = graph.chart.axisX
    const visibleTimeBars = axisX.getVisibleTimeBars()

    if (!visibleTimeBars.length) {
      return null
    }

    let gapCache = this._gapCache
    const datasource = graph.datasource as StockDatasource

    /*
     * lastBarTime用来记录bars是否有更新，如果有更新的话，需要重新计算跳空。
     */
    if (gapCache &&
        gapCache.lastBarTime === datasource.last().time &&
        gapCache.time2 > visibleTimeBars[0].time &&
        gapCache.time2 < visibleTimeBars[visibleTimeBars.length - 1].time) {
      return gapCache
    }

    const firstIndex = 0
    let curIndex = datasource.loaded() - 1
    const lastBarTime = datasource.last().time
    let findGap = false

    let time1
    let time2
    let value1
    let value2
    let from
    let to
    let curBar
    let lastBar
    let max
    let min

    while (curIndex > firstIndex) {
      curBar = datasource.barAt(curIndex)
      lastBar = datasource.barAt(curIndex - 1)

      max = datasource.max(curIndex + 1)
      min = datasource.min(curIndex + 1)

      time1 = lastBar.time
      time2 = curBar.time

      if (lastBar.low > curBar.high && max < lastBar.low) {
        findGap = true
        to =  max > curBar.high ? max : curBar.high
        from = lastBar.low
        value1 = lastBar.low
        value2 = curBar.high
        break
      } else if (curBar.low > lastBar.high && min > lastBar.high) {
        findGap = true
        from = min < curBar.low ? min : lastBar.high
        to = curBar.low
        value1 = curBar.low
        value2 = lastBar.high
        break
      }
      curIndex--
    }

    if (findGap) {
      this._gapCache = gapCache = findGap ? { time1, value1, time2, value2, from, to, lastBarTime} : null
      return gapCache &&
          gapCache.time2 > visibleTimeBars[0].time &&
          gapCache.time2 < visibleTimeBars[visibleTimeBars.length - 1].time ? gapCache : null
    } else {
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
      const x2 = axisX.getXByTime(gap.time2)
      const y1 = axisY.getYByValue(gap.value1)
      const y2 = axisY.getYByValue(gap.value2)

      ctx.save()
      ctx.fillStyle = '#636363'
      ctx.font = '12 px Verdana, Arial, sans-serif'
      ctx.fillRect(
        x2,
        y1 - 1,
        width - x2,
        Math.ceil(y2 - y1 + 0.5))
      ctx.fillStyle = 'black'
      ctx.fillText(Number(gap.from).toFixed(2) + '-' + Number(gap.to).toFixed(2), x2, y1 - 2)
      ctx.restore()
    }

  }

  public clearCache () {
    this._gapCache = null
  }

}
