import PlotList  from './plotlist'
import { ResolutionType } from '../constant'
import { IBar, Datasource } from './base'

export interface IDBar extends IBar {
  price: number
  type: 'b' | 's'
}

/**
 * 股票数据源
 */
export class StaticDatasource<T extends IBar> extends Datasource {

  /**
   * 数据集
   * @type {PlotList}
   */
  private _plotList: PlotList<T>

  /**
   * @constructor
   * @param {string} resolution 解析度
   * @param {RightType} right   复权设置
   * @param {number} timeDiff   与服务器的时差
   */
  constructor (resolution: ResolutionType, data: T[]) {
    super(resolution)
    this._plotList = new PlotList<T>()
    this._plotList.merge(data)
  }

  public barAt (index: number): T {
    return this._plotList.get(index)
  }

  public first (): T {
    return this._plotList.first()
  }

  public last (): T {
    return this._plotList.last()
  }

  public slice (start?: number, end?: number): T[] {
    return this._plotList.slice(start, end)
  }

  public range (from: number, to: number): T[] {
    return this._plotList.range(from, to)
  }

  public loaded (): number {
    return this._plotList.size()
  }

  public search (time): number {
    return this._plotList.search(time)
  }

  public max (fromIndex: number, toIndex = this.loaded()) {
    return 0
  }

  public min (fromIndex: number, toIndex = this.loaded()) {
    return 0
  }

  /**
   * 请求一段时间范围内的数据
   * @param  {number}               from 开始时间，精确到秒
   * @param  {number}               to   结束时间，精确到秒
   * @return {Promise<T[]>}      请求到的数据结果
   */
  public loadTimeRange (from: number, to: number): Promise<T[]> {
    return Promise.resolve()
  }

  /**
   * 清空缓存
   */
  public clearCache(): void {
    super.clearCache()
    this._plotList.clear()
  }
}
