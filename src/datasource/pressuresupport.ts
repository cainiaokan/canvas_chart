import moment = require('moment')
import { getPressureSupport } from './rpc'
import PlotList  from './plotlist'
import {
  ResolutionType,
  OPEN_TIME_RANGE,
} from '../constant'
import { IBar, Datasource } from './base'

/**
 * 股票信息的数据规格
 */
export interface IPSBar extends IBar {
  pressure: number
  support: number
}

/**
 * 股票数据源
 */
export class PressureSupportDatasource extends Datasource {

  /**
   * 数据集
   * @type {PlotList}
   */
  private _plotList: PlotList<IPSBar>

  /**
   * 股票代码
   * @type {string}
   */
  private _symbol: string

  /**
   * @constructor
   * @param {string} symbol     股票代码
   * @param {string} resolution 解析度
   */
  constructor (symbol: string, resolution: ResolutionType, timeDiff: number = 0) {
    super(resolution, timeDiff)
    this._symbol = symbol
    this._plotList = new PlotList<IPSBar>()
  }

  get symbol (): string {
    return this._symbol
  }

  set symbol (symbol: string) {
    this._symbol = symbol
  }

  public barAt (index: number): IPSBar {
    return this._plotList.get(index)
  }

  public first (): IPSBar {
    return this._plotList.first()
  }

  public last (): IPSBar {
    return this._plotList.last()
  }

  public slice (start?: number, end?: number): IPSBar[] {
    return this._plotList.slice(start, end)
  }

  public range (from: number, to: number): IPSBar[] {
    return this._plotList.range(from, to)
  }

  public loaded (): number {
    return this._plotList.size()
  }

  public search (time): number {
    return this._plotList.search(time)
  }

  public max (fromIndex: number, toIndex = this.loaded()) {
    const bars = this.slice(fromIndex, toIndex)

    let max = -Number.MAX_VALUE
    bars.forEach(bar => max = bar.pressure > max ? bar.pressure : max)

    return max
  }

  public min (fromIndex: number, toIndex = this.loaded()) {
    const bars = this.slice(fromIndex, toIndex)

    let min = Number.MAX_VALUE
    bars.forEach(bar => min = bar.support < min ? bar.support : min)

    return min
  }

  /**
   * 请求一段时间范围内的数据
   * @param  {number}               from 开始时间，精确到秒
   * @param  {number}               to   结束时间，精确到秒
   * @return {Promise<IPSBar[]>}      请求到的数据结果
   */
  public loadTimeRange (from: number, to: number): Promise<IPSBar[]> {
    const symbol = this._symbol
    const resolution = this._resolution

    if (from > to) {
      return Promise.resolve([])
      // throw TypeError('from must less than to.')
    }

    const fromDate = moment(from * 1000).format('YYYYMMDD')
    const toDate = moment(to  * 1000).format('YYYYMMDD')

    return new Promise((resolve, reject) =>
      getPressureSupport(symbol, fromDate, toDate)
        .then(data => {
          let bars: IPSBar[] = []
          if (resolution === 'D') {
            bars = data.data.map(item => ({
              time: +item.timestamp,
              pressure: +item.upper_price,
              support: +item.lower_price,
            }))
          } else {
            let stops = OPEN_TIME_RANGE.map(timeRange => timeRange[1])
            let starts = OPEN_TIME_RANGE.map(timeRange => timeRange[0])
            let step = null
            let pressure
            let support
            switch (this._resolution) {
              case '1':
                step = 1
                break
              case '5':
                step = 5
                break
              case '15':
                step = 15
                break
              case '30':
                step = 30
                break
              case '60':
                step = 60
                break
              default:
                throw 'unsupported resolution'
            }

            data.data.forEach(item => {
              stops.forEach((stop, i) => {
                const stopHour = stop[0]
                const stopMinute = stop[1]
                const startHour = starts[i][0]
                const startMinute = starts[i][1]
                const close = moment((+item.timestamp + stopHour * 3600 + stopMinute * 60) * 1000)
                const current = moment((+item.timestamp + startHour * 3600 + startMinute * 60) * 1000)
                pressure = +item.upper_price > 0 ? +item.upper_price : pressure
                support = +item.lower_price > 0 ? +item.lower_price : support
                while (!current.add(step, 'minute').isAfter(close)) {
                  bars.push({
                    time: current.toDate().getTime() / 1000,
                    pressure, support,
                  })
                }
              })
            })
          }

          if (symbol.toUpperCase() === this._symbol.toUpperCase() &&
              resolution === this._resolution) {
            this._plotList.merge(bars)
            resolve(bars)
          } else {
            reject('response expired')
          }
        })
        .catch(reject)
    )
  }

  /**
   * 清空缓存
   */
  public clearCache(): void {
    super.clearCache()
    this._plotList.clear()
  }
}
