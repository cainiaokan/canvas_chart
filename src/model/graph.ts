import { Datasource, IBar, DataAdapter, DataConverter } from '../datasource'
import ChartModel from './chart'
import PlotModel from './plot'
import { YRange } from './axisy'
import { ChartStyle } from '../graphic/basechart'

abstract class GraphModel {
  protected _plots: PlotModel[]
  protected _datasource: Datasource
  protected _chart: ChartModel
  protected _adapter: DataAdapter
  protected _converter: DataConverter
  protected _input: any[]
  protected _isPrice: boolean

  private _hover: boolean = false
  private _isValid: boolean = true
  private _visibleBars: IBar[][]
  private _cache: { [propName: number]: IBar[] }

  constructor (
    datasource: Datasource,
    chart: ChartModel,
    isPrice: boolean,
    adapter: DataAdapter,
    converter: DataConverter,
    input: any = null,
    style: Array<ChartStyle> = []) {
    this._datasource = datasource
    this._chart = chart
    this._isPrice = isPrice
    this._adapter = adapter
    this._converter = converter
    this._input = input
    this._plots = []
    this._cache = {}
  }

  get isPrice (): boolean {
    return this._isPrice
  }

  get hover (): boolean {
    return this._hover
  }

  set hover (hover: boolean) {
    this._hover = hover
    this._isValid = false
    this._chart.emit('hover', hover)
  }

  get isValid (): boolean {
    return this._isValid
  }

  get plots (): PlotModel[] {
    return this._plots
  }

  get datasource (): Datasource {
    return this._datasource
  }

  get chart (): ChartModel {
    return this._chart
  }

  public draw () {
    this._visibleBars = null
    this._plots.forEach(plot => plot.draw())
    this._isValid = true
    this._hover = false
  }

  public getPrevBar (): any[] {
    const point = this._chart.crosshair.point
    if (!point) {
      return null
    }
    const axisX = this._chart.axisX
    const timeBar = axisX.findTimeBarByX(point.x - axisX.barWidth)
    if (!timeBar) {
      return null
    }
    return this._cache[timeBar.time]
  }

  public getCurBar (): any[] {
    const point = this._chart.crosshair.point
    if (!point) {
      return null
    }
    const timeBar = this._chart.axisX.findTimeBarByX(point.x)
    if (!timeBar) {
      return null
    }
    return this._cache[timeBar.time]
  }

  public getNextBar (): any[] {
    const point = this._chart.crosshair.point
    if (!point) {
      return null
    }
    const axisX = this._chart.axisX
    const timeBar = axisX.findTimeBarByX(point.x + axisX.barWidth)
    if (!timeBar) {
      return null
    }
    return this._cache[timeBar.time]
  }

  public getRangeY (): YRange {
    return this._plots.reduce((range: YRange, plot) => {
      const r = plot.graphic.getRangeY()
      if (!r) {
        return range
      }
      if (!range) {
        return {
          max: r.max,
          min: r.min,
        }
      }
      if (r.max > range.max) {
        range.max = r.max
      }
      if (r.min < range.min) {
        range.min = r.min
      }
      return range
    }, null)
  }

  public hitTest (): boolean {
    return this.hover = this._plots.some(plot => plot.hitTest())
  }

  /**
   * 获取所有可见范围内的bar数据
   * @return {IBar[]}
   */
  public getVisibleBars (): IBar[][] {
    if (this._visibleBars) {
      return this._visibleBars
    }

    const timeBars = this._chart.axisX.getVisibleTimeBars()
    const firstTimeBar = timeBars[0]
    const lastTimeBar = timeBars[timeBars.length - 1]

    if (!firstTimeBar || !lastTimeBar) {
      return []
    }

    let bars =
      this._datasource
        .range(firstTimeBar.time, lastTimeBar.time)

    if (!bars.length) {
      return []
    }

    const data = []

    for (
      let i = 0,
          len = bars.length,
          bar,
          start = this._datasource.search(bars[0].time),
          cache; i < len; i++) {
      bar = bars[i]
      cache = this._cache[bar.time]
      if (!cache) {
        cache = this._converter(
          this._adapter(bar),
          start++,
          this._datasource,
          this._adapter,
          this._input
        )
        this._cache[bar.time] = cache
      }
      data.push(cache)
    }

    // 清理缓存转换函数的缓存
    if (this._converter.clearCache) {
      this._converter.clearCache()
    }

    const visibleBars = []
    let i = 0
    let j = 0
    let curData
    let curBar
    let timeBar
    const len = timeBars.length
    const dataLength = data.length
    // 对齐时间轴，以主数据源的timebar为准，timebars中不存在的time要忽略掉
    while (i < len && j < dataLength) {
      curData = data[j]
      curBar = curData ? curData[0] : null
      timeBar = timeBars[i]
      if (!curBar) {
        i++
        j++
      } else if (curBar[1] === timeBar.time) {
        for (let k = 0, cbar = curData, klen = cbar.length; k < klen; k++) {
          cbar[k][0] = timeBar.x
        }
        visibleBars.push(curData)
        i++
        j++
      } else if (curBar[1] > timeBar.time) {
        i++
      } else {
        j++
      }
    }

    return this._visibleBars = visibleBars
  }

  public clearCache () {
    this._cache = {}
  }

}

export default GraphModel
