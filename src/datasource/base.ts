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

/**
 * @class
 * 数据源
 */
export abstract class Datasource extends EventEmitter {
  public basetime: number = 0
  /**
   * 解析度
   * @type {ResolutionType}
   */
  protected _resolution: ResolutionType
  protected _timeDiff: number
  protected _hasMoreHistory: boolean = true
  // 保存上次请求的起始时间，用来记录loadHistory上次加载到哪个时间点
  protected _pulseInterval = 60

  constructor (resolution: ResolutionType, timeDiff: number = 0) {
    super()
    this._resolution = resolution
    this._timeDiff = timeDiff
  }

  set timeDiff (timeDiff: number) {
    this._timeDiff = timeDiff
  }

  get timeDiff () {
    return this._timeDiff
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

  public abstract search (time: number): number

  public abstract loadTimeRange(from: number, to: number): Promise<any>

  /**
   * 清空缓存
   */
  public clearCache() {
    this._hasMoreHistory = true
  }

  public now(): number {
    return ~~(Date.now() / 1000) - this._timeDiff
  }

  get hasMoreHistory (): boolean {
    return this._hasMoreHistory
  }
}
