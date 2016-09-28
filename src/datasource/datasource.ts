import * as Promise from 'es6-promise'
import * as EventEmitter from 'eventemitter3'
import { ResolutionType } from '../constant'

/**
 * 基本数据规格，必须包含时间戳序列
 */
export interface IBar {
  time: number
}

export type DataAdapter = {
  (bar: IBar): any[]
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
  protected _timeDiff: number
  protected _hasMore: boolean = true
  protected _requestFromTime: number
  protected _pulseInterval = 60

  constructor (resolution: ResolutionType, timeDiff: number) {
    super()
    this._resolution = resolution
    this._timeDiff = timeDiff
  }

  get pulseInterval () {
    return this._pulseInterval
  }

  get resolution (): ResolutionType {
    return this._resolution
  }

  set resolution (resolution: ResolutionType) {
    this._resolution = resolution
  }

  public abstract barAt (index): IBar

  public abstract first (): IBar

  public abstract last (): IBar

  public abstract slice(start?: number, end?: number): IBar[]

  public abstract range (from: number, to: number): IBar[]

  public abstract loaded (): number

  public abstract search (time: number, bias?: number): number

  /**
   * 从数据源中加载数据集
   * @param  {number}  num 加载的条数
   * @return {Promise}
   */
  public abstract loadHistory(num: number): Promise<any>

  public abstract loadTimeRange(from: number, to: number): Promise<any>

  public abstract resolveSymbol(): Promise<SymbolInfo>

  /**
   * 清空缓存
   */
  public clearCache(): void {
    this._hasMore = true
    this._requestFromTime = null
  }

  public now(): number {
    return ~~(Date.now() / 1000) - this._timeDiff
  }

  get hasMore (): boolean {
    return this._hasMore
  }
}