import { Datasource, IBar, DataAdapter, DataConverter } from '../datasource'
import { setContext, clearContext } from '../datasource'
import ChartModel from './chart'
import PlotModel from './plot'
import { YRange } from './axisy'

let sequence = 1

abstract class GraphModel {
  protected _plots: PlotModel[]
  protected _datasource: Datasource
  protected _chart: ChartModel
  protected _adapter: DataAdapter
  protected _calc: DataConverter
  protected _input: any[]
  protected _isPrice: boolean
  protected _isMain: boolean
  protected _isComparison: boolean
  protected _isVisible: boolean
  protected _id: number

  private _hover: boolean = false
  private _selected: boolean = false
  private _isValid: boolean = true
  private _visibleBarCache: any[][]
  private _cache: { [propName: number]: any[] }

  constructor (
    datasource: Datasource,
    chart: ChartModel,
    isPrice: boolean,
    isMain: boolean,
    isComparison: boolean,
    isVisible: boolean,
    adapter: DataAdapter,
    calc: DataConverter,
    input: any = null) {
    this._datasource = datasource
    this._chart = chart
    this._isPrice = isPrice
    this._isMain = isMain
    this._isComparison = isComparison
    this._isVisible = isVisible
    this._adapter = adapter
    this._calc = calc
    this._input = input
    this._id = sequence++
    this._plots = []
    this._cache = {}
  }

  get input (): any[] {
    return this._input
  }

  set input (input: any[]) {
    this._input = input
    this._isValid = false
  }

  get id (): number {
    return this._id
  }

  get isPrice (): boolean {
    return this._isPrice
  }

  get isMain (): boolean {
    return this._isMain
  }

  get isComparison (): boolean {
    return this._isComparison
  }

  get selected (): boolean {
    return this._selected
  }

  get isVisible (): boolean {
    return this._isVisible
  }

  set isVisible (visible: boolean) {
    this.isVisible = visible
    this._isValid = false
  }

  set selected (selected: boolean) {
    if (this._selected !== selected) {
      this._selected = selected
      this._isValid = false
    }
  }

  get hover (): boolean {
    return this._hover
  }

  set hover (hover: boolean) {
    if (this._hover !== hover) {
      this._hover = hover
      this._isValid = false
    }
  }

  get isValid (): boolean {
    return this._isValid
  }

  get plots (): PlotModel[] {
    return this._plots.slice(0)
  }

  get datasource (): Datasource {
    return this._datasource
  }

  get chart (): ChartModel {
    return this._chart
  }

  public draw (ctx: CanvasRenderingContext2D) {
    this._plots.forEach(plot => plot.draw(ctx))
    this._isValid = true
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
    return this._plots.reduce((range: YRange, plot: PlotModel) => {
      const r = plot.graphic.calcRangeY()
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

  public hitTest (select = false): boolean {
    for (let i = this._plots.length - 1; i >= 0; i--) {
      if (this._plots[i].hitTest()) {
        if (select) {
          this.selected = true
        }
        return this.hover = true
      }
    }
    if (select) {
      this.selected = false
    }
    return this.hover = false
  }

  /**
   * 获取所有可见范围内的bar数据
   * @return {IBar[]}
   */
  public getVisibleBars (): IBar[][] {
    if (this._visibleBarCache) {
      return this._visibleBarCache
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

    setContext(this._datasource, this._adapter)

    for (
      let i = 0,
          len = bars.length,
          bar,
          start = this._datasource.search(bars[0].time),
          cache; i < len; i++, start++) {
      bar = bars[i]
      cache = this._cache[bar.time]
      if (!cache) {
        cache = this._calc(
          this._adapter(bar),
          start,
          this._input
        )
        this._cache[bar.time] = cache
      }
      data.push(cache)
    }

    clearContext()

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
          if (cbar[k]) {
            cbar[k][0] = timeBar.x
          }
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

    return this._visibleBarCache = visibleBars
  }

  public clearVisibleBarCache () {
    this._visibleBarCache = null
  }

  public clearCache () {
    this._visibleBarCache = null
    this._cache = {}
  }
}

export default GraphModel
