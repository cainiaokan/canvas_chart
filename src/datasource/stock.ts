import * as RPC from './rpc'
import PlotList  from './plotlist'
import { ResolutionType } from '../constant'
import { IBar, Datasource, SymbolInfo } from './datasource'

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
  private _symbolInfo: SymbolInfo

  /**
   * @constructor
   * @param {string} symbol     股票代码
   * @param {string} resolution 解析度
   */
  constructor (symbol: string, resolution: ResolutionType, timeDiff: number = 0) {
    super(resolution, timeDiff)
    this._symbolInfo = {
      symbol,
      type: 'stock',
      exchange: '',
      description: '',
    }
    this._plotList = new PlotList<IStockBar>()
  }

  get symbolInfo (): SymbolInfo {
    return this._symbolInfo
  }

  set symbolInfo (symbolInfo: SymbolInfo) {
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

  public search (time, bias?): number {
    return this._plotList.search(time, bias)
  }

  /**
   * 从数据源中加载数据集
   * @param  {number}  num 加载的条数
   * @return {Promise}   
   */
  public loadHistory (loadNum: number): Promise<any> {
    if (!this._hasMore) {
      return Promise.resolve()
    }
    const toTime = this._requestFromTime ?
      this._requestFromTime : this._plotList.first() ?
        this._plotList.first().time : this.now()
    let fromTime = 0
    let maxTimeSpan = 0
    switch (this._resolution) {
      case '1':
        fromTime = toTime - (480 * 60) * 6
        maxTimeSpan = 10 * 24 * 3600
        break
      case '5':
        fromTime = toTime - (480 * 5 * 60) * 6
        maxTimeSpan = 30 * 24 * 3600
        break
      case '15':
        fromTime = toTime - (480 * 15 * 60) * 6
        maxTimeSpan = 90 * 24 * 3600
        break
      case '30':
        fromTime = toTime - (480 * 30 * 60) * 6
        maxTimeSpan = 180 * 24 * 3600
        break
      case '60':
        fromTime = toTime - (480 * 3600) * 6
        maxTimeSpan = 360 * 24 * 3600
        break
      case 'D':
        fromTime = toTime - 480 * 24 * 3600
        maxTimeSpan = 3 * 360 * 24 * 3600
        break
      case 'W':
        fromTime = toTime - 480 * 7 * 24 * 3600
        maxTimeSpan = 20 * 360 * 24 * 3600
        break
      case 'M':
        fromTime = toTime - 480 * 30 * 24 * 3600
        maxTimeSpan = 100 * 360 * 24 * 3600
        break
      default:
        throw new Error('unsupport resolution')
    }
    this._requestFromTime = fromTime

    return new Promise((resolve, reject) =>
      this.loadTimeRange(fromTime, toTime)
        .then(() => {
          const requestToTime = this._plotList.first() ? this._plotList.first().time : this.now()
          if (this._plotList.size() >= loadNum) {
            resolve()
          } else if (requestToTime - this._requestFromTime >= maxTimeSpan) {
            this._hasMore = false
            resolve()
          } else {
            this.loadHistory(loadNum)
              .then(resolve)
              .catch(reject)
          }
        })
        .catch(reject)
    )
  }

  public loadTimeRange (from: number, to: number): Promise<any> {
    const firstBar = this._plotList.first()
    const lastBar = this._plotList.last()
    const symbol = this._symbolInfo.symbol
    const resolution = this._resolution
    if (from > to) {
      throw TypeError('from must less than to.')
    }
    if (firstBar) {
      if (lastBar.time < to && lastBar.time <= from) {
        from = lastBar.time
      } else if (firstBar.time > from && firstBar.time <= to) {
        to = firstBar.time
      }
    }

    return RPC.getStockBars(symbol, resolution, from, to)
      .then(
        response => response.json()
          .then(data => {
            const stockBars: IStockBar[] = []
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
            // 请求期间symbol和resolution都没发生改变，则merge
            if (symbol.toUpperCase() === this._symbolInfo.symbol.toUpperCase() &&
                resolution === this._resolution) {
              this._plotList.merge(stockBars)
            } else {
              // 抛出异常是为了终止后续请求
              throw new Error('response expired')
            }
          })
      )
  }

  public resolveSymbol (): Promise<SymbolInfo> {
    return new Promise((resolve, reject) => {
      RPC.resolveSymbol(this._symbolInfo.symbol)
        .then(response => response
          .json()
          .then(data => {
            this._symbolInfo.description = data.description
            this._symbolInfo.exchange = data.exchange
            this._symbolInfo.symbol = data.symbol
            this._symbolInfo.type = data.type
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
              resolve(data.map(symbol => {
                return {
                  description: symbol.description,
                  exchange: symbol.exchange,
                  symbol: symbol.symbol,
                  type: symbol.type,
                }
              }))
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
