import * as _ from 'underscore'
import moment = require('moment')
import * as RPC from './rpc'
import PlotList  from './plotlist'
import { ResolutionType, OPEN_DAYS, OPEN_MINITES_COUNT } from '../constant'
import { IBar, Datasource } from './base'

/**
 * 股票信息的数据规格
 */
export interface IStockBar extends IBar {
  amount: number
  open: number
  close: number
  high: number
  low: number
  volume: number
  turnover?: number
  changerate?: number
}

export type SymbolInfo = {
  symbol: string
  type: 'stock' | 'index',
  exchange: string
  description: string
}

/**
 * 股票数据源
 */
export class StockDatasource extends Datasource {

  /**
   * 数据集
   * @type {PlotList<T>}
   */
  private _plotList: PlotList<IStockBar>

  /**
   * 股票代码
   * @type {string}
   */
  private _symbol: string

  /**
   * 股票详细信息
   * @type {SymbolInfo}
   */
  private _symbolInfo: SymbolInfo

  private _right: number

  /**
   * @constructor
   * @param {string} symbol     股票代码
   * @param {string} resolution 解析度
   */
  constructor (symbol: string, resolution: ResolutionType, right: number, timeDiff: number = 0) {
    super(resolution, timeDiff)
    this._symbol = symbol
    this._right = right
    this._symbolInfo = null
    this._plotList = new PlotList<IStockBar>()
  }

  get right (): number {
    return this._right
  }

  set right (right: number) {
    this._right = right
  }

  get symbol (): string {
    return this._symbol
  }

  set symbol (symbol: string) {
    this._symbol = symbol
  }

  get symbolInfo (): SymbolInfo {
    return this._symbolInfo
  }

  set symbolInfo (symbolInfo: SymbolInfo) {
    this._symbol = symbolInfo.symbol
    this._symbolInfo = symbolInfo
  }

  public barAt (index: number): IStockBar {
    return this._plotList.get(index)
  }

  public first (): IStockBar {
    return this._plotList.first()
  }

  public last (): IStockBar {
    return this._plotList.last()
  }

  public slice (start?: number, end?: number): IStockBar[] {
    return this._plotList.slice(start, end)
  }

  public range (from: number, to: number): IStockBar[] {
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
    bars.forEach(bar => max = bar.high > max ? bar.high : max)

    return max
  }

  public min (fromIndex: number, toIndex = this.loaded()) {
    const bars = this.slice(fromIndex, toIndex)

    let min = Number.MAX_VALUE
    bars.forEach(bar => min = bar.low < min ? bar.low : min)

    return min
  }

  /**
   * 请求一段时间范围内的数据
   * @param  {number}               from 开始时间，精确到秒
   * @param  {number}               to   结束时间，精确到秒
   * @return {Promise<IStockBar[]>}      请求到的数据结果
   */
  public loadTimeRange (from: number, to: number): Promise<IStockBar[]> {
    const symbol = this._symbol
    const resolution = this._resolution
    const right = this._right

    if (from > to) {
      return Promise.resolve([])
      // throw TypeError('from must less than to.')
    }

    return new Promise((resolve, reject) =>
      RPC.getStockBars(symbol, resolution, right, from, to)
        .then(
          response => response.json()
            .then(data => {
              let stockBars: IStockBar[] = []
              data.t.forEach((time, index) => {
                const barData: IStockBar = {
                  amount: data.a[index],
                  close: data.c[index],
                  high: data.h[index],
                  low: data.l[index],
                  open: data.o[index],
                  time: data.t[index],
                  volume: data.v[index],
                }
                this._pulseInterval = data.interval
                if (data.tr) {
                  barData.turnover = data.tr[index]
                }
                if (data.zd) {
                  barData.changerate = data.zd[index]
                }
                stockBars.push(barData)
              })

              // 过滤time重复的bar数据
              stockBars = _.unique(stockBars, bar => bar.time)

              // 请求期间symbol和resolution都没发生改变，则merge
              if (symbol.toUpperCase() === this._symbol.toUpperCase() &&
                  resolution === this._resolution) {
                this._plotList.merge(stockBars)
                resolve(stockBars)
              } else {
                reject('response expired')
              }
            })
        )
        .catch(reject)
    )
  }

  /**
   * 从数据源中加载历史数据集
   * @param  {number}  requiredNum 加载的条数
   * @param  {number}  loaded      已经加载的条数
   * @return {Promise}
   */
  public loadHistory (requiredNum: number, loaded = 0, lastRequestFromTime?: number): Promise<any> {
    if (!this._hasMoreHistory) {
      return Promise.resolve()
    }

    const toTime = lastRequestFromTime ?
                     lastRequestFromTime : this._plotList.first() ?
                       this._plotList.first().time : this.now() + 24 * 3600

    let fromTime = 0
    let maxTimeSpan = 0

    switch (this._resolution) {
      case '1':
        fromTime = toTime - ~~(requiredNum / OPEN_MINITES_COUNT + 1) * 24 * 3600
        maxTimeSpan = 10 * 24 * 3600
        break
      case '5':
        fromTime = toTime - ~~(requiredNum / OPEN_MINITES_COUNT * 5 + 1) * 24 * 3600
        maxTimeSpan = 20 * 24 * 3600
        break
      case '15':
        fromTime = toTime - ~~(requiredNum / OPEN_MINITES_COUNT * 15 + 1) * 24 * 3600
        maxTimeSpan = 45 * 24 * 3600
        break
      case '30':
        fromTime = toTime - ~~(requiredNum / OPEN_MINITES_COUNT * 30 + 1) * 24 * 3600
        maxTimeSpan = 90 * 24 * 3600
        break
      case '60':
        fromTime = toTime - ~~(requiredNum / OPEN_MINITES_COUNT * 60 + 1) * 24 * 3600
        maxTimeSpan = 180 * 24 * 3600
        break
      case 'D':
        fromTime = toTime - 2 * requiredNum * 24 * 3600
        maxTimeSpan = 360 * 24 * 3600
        break
      case 'W':
        fromTime = toTime - 1.5 * requiredNum * 7 * 24 * 3600
        maxTimeSpan = 360 * 24 * 3600
        break
      case 'M':
        fromTime = toTime - 1.2 * requiredNum * 30 * 24 * 3600
        maxTimeSpan = 360 * 24 * 3600
        break
      default:
        throw new Error('unsupport resolution')
    }

    // 修整fromTime，若fromTime在休市期间，则将时间前推以跳过休市时间，从而避免无效请求
    const fromMoment = moment(fromTime * 1000)

    while (OPEN_DAYS.indexOf(fromMoment.day()) === -1) {
      fromMoment.subtract(1, 'days')
    }

    fromTime = ~~(fromMoment.toDate().getTime() / 1000)

    return new Promise((resolve, reject) =>
      this.loadTimeRange(fromTime, toTime)
        .then(stockBars => {
          const requestToTime = this._plotList.first() ?
                                  this._plotList.first().time : this.now()

          const count = stockBars.length
          loaded += count

          // 如果plotList的size已经大于requiredNum，则已经请求足够多的数据了，可以结束请求
          if (loaded >= requiredNum) {
            resolve()
          // 如果请求的时长大于了最大时间跨度值时，认为已经没有新数据了。
          } else if (requestToTime - fromTime >= maxTimeSpan) {
            this._hasMoreHistory = false
            resolve()
          } else {
            this.loadHistory(requiredNum, loaded, fromTime)
              .then(resolve)
              .catch(reject)
          }
        })
        .catch(reject)
    )
  }

  public resolveSymbol (): Promise<SymbolInfo> {
    return new Promise((resolve, reject) => {
      RPC.resolveSymbol(this._symbol)
        .then(response => response
          .json()
          .then(data => {
            this._symbolInfo = {
              description: data.description,
              exchange: data['exchange-listed'],
              symbol: data.symbol,
              type: data.type,
            }
            resolve()
          })
          .catch(reject)
        )
        .catch(reject)
    })
  }

  public searchSymbols (keyword): Promise<SymbolInfo[]> {
    return new Promise(resolve =>
      RPC.searchSymbols(keyword)
        .then(response =>
          response
            .json()
            .then(data =>
              resolve(
                data.map(
                  symbol => ({
                    description: symbol.description,
                    exchange: symbol['exchange-listed'],
                    symbol: symbol.symbol,
                    type: symbol.type,
                  })
                )
              )
            )
        )
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
