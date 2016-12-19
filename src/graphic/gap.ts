import { StockDatasource } from '../datasource'
import GraphModel from '../model/graph'

export default class GapRenderer {
  private _graph: GraphModel
  private _gapCache: { time1: number, time2: number, value1: number, value2: number, low: number, high: number} = null

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

    const gapCache = this._gapCache

    if (gapCache) {
      return gapCache
    }

    if (gapCache &&
        gapCache.time2 > visibleTimeBars[0].time &&
        gapCache.time2 < visibleTimeBars[visibleTimeBars.length - 1].time) {
      return this._gapCache
    }

    const datasource = graph.datasource as StockDatasource

    const firstIndex = visibleTimeBars[0].time > datasource.first().time ?
      datasource.search(visibleTimeBars[0].time) : 0
    let curIndex = visibleTimeBars[visibleTimeBars.length - 1].time < datasource.last().time ?
      datasource.search(visibleTimeBars[visibleTimeBars.length - 1].time) : datasource.loaded() - 1
    let findGap = false

    let time1
    let time2
    let value1
    let value2
    let low
    let high
    let curBar
    let lastBar

    while (curIndex > firstIndex) {
      curBar = datasource.barAt(curIndex)
      lastBar = datasource.barAt(curIndex - 1)

      time1 = lastBar.time
      time2 = curBar.time

      if (lastBar.low - curBar.high > 0.01 && datasource.max(curIndex + 1) < curBar.high) {
        findGap = true
        low = curBar.high
        high = lastBar.low
        value1 = lastBar.low
        value2 = curBar.high
        break
      } else if (curBar.low - lastBar.high > 0.01 && datasource.min(curIndex + 1) > curBar.low) {
        findGap = true
        low = lastBar.high
        high = curBar.low
        value1 = curBar.low
        value2 = lastBar.high
        break
      }
      curIndex--
    }

    return this._gapCache = findGap ? { time1, value1, time2, value2, low, high} : null
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
        y1,
        width - x2,
        Math.ceil(y2 - y1 + 0.5))
      ctx.fillStyle = 'black'
      ctx.fillText(Number(gap.low).toFixed(2) + '-' + Number(gap.high).toFixed(2), x2, y1 - 2)
      ctx.restore()
    }

  }

  public clearCache () {
    this._gapCache = null
  }

}
