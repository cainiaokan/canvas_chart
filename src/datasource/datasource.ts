import * as Promise from 'es6-promise'
import * as EventEmitter from 'eventemitter3'
import { ResolutionType } from '../constant'

/**
 * 基本数据规格，必须包含时间戳序列
 */
export interface IBar {
  time: number
  x?: number
}

export interface ILineBar extends IBar {
  val: number
}

export interface IColumnBar extends ILineBar {
  down: boolean
}

export interface ICandleBar extends IBar {
  high: number,
  low: number,
  open: number,
  close: number,
}

export interface IDataAdapter {
  (bar: IBar): Array<any>
}

export type SymbolInfo = {
  symbol: string
  type: 'stock' | 'index',
  exchange: string
  description: string
}

/**
 * @class
 * 数据源
 */
export abstract class Datasource extends EventEmitter {
  /**
   * 解析度
   * @type {ResolutionType}
   */
  protected _resolution: ResolutionType
  protected _hasMore: boolean = true

  constructor (resolution: ResolutionType) {
    super()
    this._resolution = resolution
  }

  get resolution (): ResolutionType {
    return this._resolution
  }

  set resolution (resolution: ResolutionType) {
    this._resolution = resolution
    this.emit('resolutionchange', resolution)
  }

  public abstract barAt (index): IBar

  public abstract first (): IBar

  public abstract last (): IBar

  public abstract slice(start?: number, end?: number): Array<IBar>

  public abstract range (from: number, to: number): Array<IBar>

  public abstract loaded (): number

  public abstract search (time: number, bias?: number): number

  /**
   * 从数据源中加载数据集
   * @param  {number}  num 加载的条数
   * @return {Promise}
   */
  public abstract loadMore(num: number): Promise<any>

  public abstract loadTimeRange(from: number, to: number): Promise<any>

  public abstract resolveSymbol(): Promise<SymbolInfo>

  /**
   * 清空缓存
   */
  public clearCache(): void {
    this._hasMore = true
  }

  get hasMore (): boolean {
    return this._hasMore
  }
}
