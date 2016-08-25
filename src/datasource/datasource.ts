import * as Promise from 'es6-promise'
import * as EventEmitter from 'eventemitter3'

/**
 * 基本数据规格，必须包含时间戳序列
 */
export interface IBar {
  time: number
}

export interface ILineBar extends IBar {
  val: number
}

export interface IColumnBar extends ILineBar {
  positive: boolean
}

export interface IDataAdapter {
  (bar: IBar): Array<any> | IBar
}

/**
 * @class
 * 数据源
 */
export abstract class Datasource extends EventEmitter {
  protected _hasMore: boolean = true

  constructor () {
    super()
  }

  public abstract getResolution (): string

  public abstract setResolution (resolution: string): void

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
  /**
   * 清空缓存
   */
  public abstract clearCache(): void

  get hasMore (): boolean {
    return this._hasMore
  }
}
