import * as _ from 'underscore'
import * as RPC from './rpc'
import PlotList  from './plotlist'
import { ResolutionType, WEEKDAYS } from '../constant'
import { IBar, Datasource, SymbolInfo } from './datasource'

const DAY_OFF_NUM = 7 - WEEKDAYS.length

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

  /**
   * 请求一段时间范围内的数据
   * @param  {number}               from 开始时间，精确到秒
   * @param  {number}               to   结束时间，精确到秒
   * @return {Promise<IStockBar[]>}      请求到的数据结果
   */
  public loadTimeRange (from: number, to: number): Promise<IStockBar[]> {
    const firstBar = this._plotList.first()
    const lastBar = this._plotList.last()
    const symbol = this._symbol
    const resolution = this._resolution
    const right = this._right
    if (from > to) {
      return Promise.resolve()
      // throw TypeError('from must less than to.')
    }
    if (firstBar) {
      if (lastBar.time < to && lastBar.time <= from) {
        from = lastBar.time
      } else if (firstBar.time > from && firstBar.time <= to) {
        to = firstBar.time
      }
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
   * @param  {number}  loadNum 加载的条数
   * @param  {number}  startFrom 从某个基准点时刻加载历史数据
   * @return {Promise}
   */
  public loadHistory (loadNum: number): Promise<any> {
    if (!this._hasMoreHistory) {
      return Promise.resolve()
    }

    const toTime = this._requestFromTime ?
                     this._requestFromTime : this._plotList.first() ?
                       this._plotList.first().time : this.now()

    let fromTime = 0
    let maxTimeSpan = 0

    switch (this._resolution) {
      case '1':
        fromTime = toTime - loadNum * 60 - DAY_OFF_NUM * 24 * 3600
        maxTimeSpan = 10 * 24 * 3600
        break
      case '5':
        fromTime = toTime - loadNum * 5 * 60 - 5 * 24 * 3600
        maxTimeSpan = 30 * 24 * 3600
        break
      case '15':
        fromTime = toTime - loadNum * 15 * 60 - 10 * 24 * 3600
        maxTimeSpan = 90 * 24 * 3600
        break
      case '30':
        fromTime = toTime - loadNum * 30 * 60 - 20 * 24 * 3600
        maxTimeSpan = 180 * 24 * 3600
        break
      case '60':
        fromTime = toTime - loadNum * 60 * 60 - 20 * 24 * 3600
        maxTimeSpan = 360 * 24 * 3600
        break
      case 'D':
        fromTime = toTime - loadNum * 24 * 3600
        maxTimeSpan = 0
        break
      case 'W':
        fromTime = toTime - loadNum * 7 * 24 * 3600
        maxTimeSpan = 0
        break
      case 'M':
        fromTime = toTime - loadNum * 30 * 24 * 3600
        maxTimeSpan = 0
        break
      default:
        throw new Error('unsupport resolution')
    }

    this._requestFromTime = fromTime

    return new Promise((resolve, reject) =>
      this.loadTimeRange(fromTime, toTime)
        .then(stockBars => {
          const requestToTime = this._plotList.first() ?
                                  this._plotList.first().time : this.now()

          // 如果plotList的size已经大于loadNum，则已经请求足够多的数据了，可以结束请求
          if (this._plotList.size() >= loadNum) {
            resolve()
          // 对于resolution为 D\W\M的，如果请求不到新的数据，则直接认为没有新数据了，不必继续请求了。
          } else if (maxTimeSpan === 0 && stockBars.length === 0) {
            this._hasMoreHistory = false
            resolve()
          // 对于resolution为1、5、15、30和60的，如果请求的时长大于了最大值时，认为已经没有新数据了。
          } else if (requestToTime - this._requestFromTime >= maxTimeSpan) {
            resolve()
          // 除却以上情况，认为后续可能还有新的数据，继续请求
          } else {
            this.loadHistory(loadNum)
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
            this._symbolInfo = data
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
                    exchange: symbol.exchange,
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
