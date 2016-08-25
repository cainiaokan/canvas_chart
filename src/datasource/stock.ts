import * as RPC from './rpc'
import PlotList  from './plotlist'
import { IBar, Datasource } from './datasource'

/**
 * 股票信息的数据规格
 */
export interface IStockBar extends IBar {
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
   * 解析度
   * @type {string}
   */
  protected _resolution: string

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
  constructor (symbol: string, resolution: string = '1') {
    super()
    this._symbol = symbol
    this._resolution = resolution
    this._plotList = new PlotList<IStockBar>()
  }

  public getSymbol (): string {
    return this._symbol
  }

  public setSymbol (symbol: string) {
    this._symbol = symbol
    this.emit('symbolchange', symbol)
  }

  public getResolution (): string {
    return this._resolution
  }

  public setResolution (resolution: string = '1') {
    this._resolution = resolution
    this.emit('resolutionchange', resolution)
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

  public slice (start?: number, end?: number): Array<IStockBar> {
    return this._plotList.slice(start, end)
  }

  public range (from: number, to: number): Array<IStockBar> {
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
  public loadMore(loadNum: number): Promise<any> {
    const toTime = this._requestFromTime ?
      this._requestFromTime : this._plotList.first() ?
        this._plotList.first().time - 1000 : ~~(Date.now() / 1000)
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

    return new Promise((resolve, reject) =>
      RPC.getStockBars(this._symbol, this._resolution, fromTime, toTime)
        .then(
          response => response.json()
            .then(data => {
              const stockBars: Array<IStockBar> = []
              const requestToTime = this._plotList.first() ? this._plotList.first().time : ~~(Date.now() / 1000)
              data.t.forEach((time, index) => {
                const barData: IStockBar = {
                  close: data.c[index],
                  high: data.h[index],
                  low: data.l[index],
                  open: data.o[index],
                  time: data.t[index],
                  volume: data.v[index],
                }
                if (data.tr) {
                  barData.turnover = data.tr[index]
                }
                if (data.zd) {
                  barData.changerate = data.zd[index]
                }
                stockBars.push(barData)
              })
              this._plotList.merge(stockBars)
              if (this._plotList.size() >= loadNum) {
                this._requestFromTime = 0
                resolve()
              } else if (requestToTime - this._requestFromTime >= maxTimeSpan) {
                this._hasMore = false
                resolve()
              } else {
                this.loadMore(loadNum)
                  .then(resolve)
                  .catch(reject)
              }
            }).catch(reject)
        )
    )
  }

  /**
   * 清空缓存
   */
  public clearCache(): void {
    this._plotList.clear()
  }
}
