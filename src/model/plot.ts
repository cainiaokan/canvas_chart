import { Datasource, IBar, IDataAdapter, IDataConverter } from '../datasource'
import { ITimeBar } from '../model/axisx'
import { ShapeType } from '../constant'
import AxisXModel from '../model/axisx'
import AxisYModel from '../model/axisy'
import Crosshair from '../model/crosshair'
import LineChartRenderer from '../graphic/linechart'
import MountainChartRenderer from '../graphic/mountainchart'
import ColumnChartRenderer from '../graphic/columnchart'
import BaseChartRenderer, { IChartStyle } from '../graphic/basechart'

export default class PlotModel {
  private _index: number
  private _datasource: Datasource
  private _axisX: AxisXModel
  private _axisY: AxisYModel
  private _crosshair: Crosshair
  private _shape: ShapeType
  private _graphic: BaseChartRenderer
  private _isPrice: boolean
  private _adapter: IDataAdapter
  private _converter: IDataConverter
  private _input: any
  private _barsCache: Array<{bar: IBar, time: ITimeBar}>
  private _cache: {
    [protertype: number]: Array<IBar>
  }

  constructor (
    index: number,
    datasource: Datasource,
    axisX: AxisXModel, axisY: AxisYModel,
    crosshair: Crosshair,
    shape: ShapeType, isPrice,
    adapter: IDataAdapter,
    converter: IDataConverter,
    input: any,
    style: IChartStyle) {
    this._index = index
    this._datasource = datasource
    this._axisX = axisX
    this._axisY = axisY
    this._crosshair = crosshair
    this._shape = shape
    this._isPrice = isPrice
    this._adapter = adapter
    this._converter = converter
    this._input = input
    this._cache = {}
    switch (shape) {
      case 'line':
        this._graphic = new LineChartRenderer(this, style)
        break
      case 'mountain':
        this._graphic = new MountainChartRenderer(this, style)
        break
      case 'column':
        this._graphic = new ColumnChartRenderer(this, style)
      default:
        // code...
        break
    }
  }

  get isPrice (): boolean {
    return this._isPrice
  }

  get graphic (): BaseChartRenderer {
    return this._graphic
  }

  get axisX (): AxisXModel {
    return this._axisX
  }

  get axisY (): AxisYModel {
    return this._axisY
  }

  public draw (): void {
    this._barsCache = null
    this._graphic.draw()
  }

  /**
   * 获取所有可见范围内的bar数据
   * @return {Array<{bar: any, time: ITimeBar}>} 结果集
   */
  public getBars (): Array<{bar: IBar, time: ITimeBar}> {
    if (this._barsCache) {
      return this._barsCache
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

    let start = this._datasource.search(bars[0].time)

    bars = bars.map(bar => {
      let cache = this._cache[bar.time]
      if (!!cache) {
        return cache[this._index]
      } else {
        cache = this._converter(
          this._adapter(bar),
          start++,
          this._datasource,
          this._adapter,
          this._input
        )
        this._cache[bar.time] = cache
        return !!cache ? cache[this._index] : null
      }
    })

    const results = []
    const len = timeBars.length
    for (let i = 0, j = 0; i < len && j < bars.length; ) {
      const bar = bars[j]
      if (!bar) {
        i++
        j++
      } else if (bar.time === timeBars[i].time) {
        results.push({
          bar: bar,
          time: timeBars[i],
        })
        i++
        j++
      } else if (bar.time > timeBars[i].time) {
        i++
      }
    }
    this._barsCache = results

    return results
  }

}
