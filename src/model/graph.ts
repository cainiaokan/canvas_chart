import { Datasource, IBar, IDataAdapter, IDataConverter } from '../datasource'
import PlotModel from './plot'
import AxisXModel from './axisx'
import AxisYModel from './axisy'
import CrosshairModel from './crosshair'
import { IChartStyle } from '../graphic/basechart'

abstract class GraphModel {
  protected _plots: Array<PlotModel>
  protected _ctx: CanvasRenderingContext2D
  protected _datasource: Datasource
  protected _axisX: AxisXModel
  protected _axisY: AxisYModel
  protected _crosshair: CrosshairModel
  protected _adapter: IDataAdapter
  protected _converter: IDataConverter
  protected _input: { [propName: string]: any }
  protected _isPrice: boolean
  private _visibleBars: Array<Array<IBar>>
  private _cache: { [propName: number]: Array<IBar> }

  constructor (
    datasource: Datasource,
    axisX: AxisXModel, axisY: AxisYModel,
    crosshair: CrosshairModel,
    isPrice: boolean,
    adapter: IDataAdapter,
    converter: IDataConverter,
    input: any = null,
    style: Array<IChartStyle> = []) {
    this._datasource = datasource
    this._axisX = axisX
    this._axisY = axisY
    this._crosshair = crosshair
    this._isPrice = isPrice
    this._adapter = adapter
    this._converter = converter
    this._input = input
    this._plots = []
    this._cache = {}
  }

  public draw () {
    this._visibleBars = null
    this._plots.forEach(plot => plot.draw())
  }

  public setCanvasContext (ctx: CanvasRenderingContext2D) {
    this._ctx = ctx
    this._plots.forEach(plot => plot.graphic.ctx = ctx)
  }

  public getPrevBar (): Array<IBar> {
    const point = this._crosshair.point
    if (!point) {
      return null
    }
    const timeBar = this._axisX.findTimeBarByX(point.x - this._axisX.barWidth)
    if (!timeBar) {
      return null
    }
    return this._cache[timeBar.time]
  }

  public getCurBar (): Array<IBar> {
    const point = this._crosshair.point
    if (!point) {
      return null
    }
    const timeBar = this._axisX.findTimeBarByX(point.x)
    if (!timeBar) {
      return null
    }
    return this._cache[timeBar.time]
  }

  /**
   * 获取所有可见范围内的bar数据
   * @return {Array<IBar>}
   */
  public getVisibleBars (): Array<Array<IBar>> {
    if (this._visibleBars) {
      return this._visibleBars
    }

    const timeBars = this._axisX.getVisibleTimeBars()
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

    const visibleBars = []
    let i = 0
    let j = 0
    let curData
    let curBar
    let timeBar
    const len = timeBars.length
    const dataLength = data.length
    while (i < len && j < dataLength) {
      curData = data[j]
      curBar = curData ? curData[0] : null
      timeBar = timeBars[i]
      if (!curBar) {
        i++
        j++
      } else if (curBar.time === timeBar.time) {
        for (let k = 0, cbar = data[j], klen = cbar.length; k < klen; k++) {
          cbar[k].x = timeBar.x
        }
        visibleBars.push(data[j])
        i++
        j++
      } else if (curBar.time > timeBar.time) {
        i++
      } else {
        j++
      }
    }

    return this._visibleBars = visibleBars
  }

  get plots (): Array<PlotModel> {
    return this._plots
  }

  get ctx (): CanvasRenderingContext2D {
    return this._ctx
  }

  get datasource (): Datasource {
    return this._datasource
  }

  get axisX (): AxisXModel {
    return this._axisX
  }

  get axisY (): AxisYModel {
    return this._axisY
  }

  public clearCache () {
    this._cache = {}
  }

}

export default GraphModel
