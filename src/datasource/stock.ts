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
  protected _plotList: PlotList<IStockBar>

  /**
   * 股票代码
   * @type {string}
   */
  private _symbol: string

  private _requestFromTime: number

  /**
   * @constructor
   * @param {string} symbol     股票代码
   * @param {string} resolution 解析度
   */
  constructor (symbol: string, resolution: ResolutionType = '1') {
    super(resolution)
    this._symbol = symbol
    this._plotList = new PlotList<IStockBar>()
  }

  get symbol (): string {
    return this._symbol
  }

  set symbol (symbol: string) {
    this._symbol = symbol
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

  public search (time, bias): number {
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
        this._plotList.first().time : ~~(Date.now() / 1000)
    let fromTime = 0
    let maxTimeSpan = 0
    switch (this._resolution) {
      case '1':
        fromTime = toTime - 480 * 60 - 18 * 3600
        maxTimeSpan = 30 * 24 * 3600
        break
      case '5':
        fromTime = toTime - 480 * 5 * 60 - 18 * 3600
        maxTimeSpan = 30 * 24 * 3600
        break
      case '15':
        fromTime = toTime - 480 * 15 * 60 - 5 * 18 * 3600
        maxTimeSpan = 60 * 24 * 3600
        break
      case '30':
        fromTime = toTime - 480 * 30 * 60 - 10 * 18 * 3600
        maxTimeSpan = 120 * 24 * 3600
        break
      case '60':
        fromTime = toTime - 480 * 60 * 60 - 20 * 18 * 3600
        maxTimeSpan = 240 * 24 * 3600
        break
      case 'D':
        fromTime = toTime - 300 * 24 * 3600
        maxTimeSpan = 365 * 24 * 3600
        break
      case 'W':
        fromTime = toTime - 240 * 7 * 24 * 3600
        maxTimeSpan = 3000 * 24 * 3600
        break
      case 'M':
        fromTime = toTime - 240 * 30 * 24 * 3600
        maxTimeSpan = 10000 * 24 * 3600
        break
      default:
        throw new Error('unsupport resolution')
    }
    this._requestFromTime = fromTime

    return new Promise((resolve, reject) => {
      this.loadTimeRange(fromTime, toTime)
        .then(() => {
          const requestToTime = this._plotList.first() ? this._plotList.first().time : ~~(Date.now() / 1000)
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
    })

  }

  public loadTimeRange (from: number, to: number): Promise<any> {
    const firstBar = this._plotList.first()
    const lastBar = this._plotList.last()
    if (from >= to) {
      throw TypeError('from must less than to.')
    }
    if (firstBar) {
      if (lastBar.time < to && lastBar.time <= from) {
        from = lastBar.time
      } else if (firstBar.time > from && firstBar.time <= to) {
        to = firstBar.time
      }
    }

    return RPC.getStockBars(this._symbol, this._resolution, from, to)
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
            this._plotList.merge(stockBars)
          })
      )
  }

  public resolveSymbol (): Promise<SymbolInfo> {
    return new Promise((resolve, reject) => {
      RPC.resolveSymbol(this._symbol)
        .then(response => {
          response
            .json()
            .then(data => {
              resolve({
                description: data.description,
                exchange: data.exchange,
                symbol: data.symbol,
                type: data.type,
              })
            })
            .catch(reject)
        })
        .catch(reject)
    })
  }

  public searchSymbols (keyword): Promise<SymbolInfo[]> {
    return new Promise((resolve, reject) => {
      RPC.searchSymbols(keyword)
        .then(response => {
          response
            .json()
            .then(data => {
              resolve(data.map(symbol => {
                return {
                  description: symbol.description,
                  exchange: symbol.exchange,
                  symbol: symbol.symbol,
                  type: symbol.type,
                }
              }))
            })
            .catch(reject)
        })
        .catch(reject)
    })
  }

  /**
   * 清空缓存
   */
  public clearCache(): void {
    super.clearCache()
    this._requestFromTime = null
    this._plotList.clear()
  }
}
