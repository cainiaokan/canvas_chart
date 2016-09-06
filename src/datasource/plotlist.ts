import { IBar } from './datasource'

/**
 * @class
 * 图数据的操作集合
 */
export default class PlotList<T extends IBar> {
  /**
   * 缓存的数据集
   * @type {T[]}
   */
  private cache: T[]

  /**
   * @constructor
   */
  constructor () {
    this.cache = []
  }

  /**
   * 搜索时间戳对应的下标索引
   * @param  {number} time 时间戳（精确到秒）
   * @param  {number} bias 二分查找找不到精确值时的左右倾向,1为倾向左值，2为倾向右值，0为无倾向
   * @return {number}      下标索引
   */
  public search(time: number, bias: number = 0): number {
    if (this.cache.length === 0) {
      return
    }
    if (time < this.cache[0].time || time > this.cache[this.cache.length - 1].time) {
      return -1
    } else {
      return this.bsearch(time, 0, this.cache.length - 1, bias)
    }
  }

  /**
   * 获取下标索引位置的数据
   * @param  {number} index 下标索引
   * @return {T}            数据
   */
  public get(index: number): T {
    return this.cache[index] || null
  }

  public first(): T {
    return this.cache[0] || null
  }

  public last(): T {
    return this.cache[this.cache.length - 1] || null
  }

  /**
   * 返回数据集合的元素数量
   * @return {number} 数据集合的元素数量
   */
  public size(): number {
    return this.cache.length
  }

  public slice(start?: number, end?: number): T[] {
    return this.cache.slice(start, end)
  }

  /**
   * 返回指定时间范围的数据子集
   * @param  {number}   from 开始时间戳（精确到秒）
   * @param  {number}   to   结束时间戳（精确到秒）
   * @return {T[]}      数据子集
   */
  public range(from: number, to: number): T[] {
    let fromIndex = this.search(from, 2)
    let toIndex = this.search(to, 1)
    if (fromIndex === -1) {
      if (!this.first() || to < this.first().time) {
        return []
      }
      fromIndex = 0
    }
    if (toIndex === -1) {
      if (!this.last() || from > this.last().time) {
        return []
      }
      toIndex = this.cache.length - 1
    }
    return this.cache.slice(fromIndex, toIndex + 1)
  }

  /**
   * 讲新的数据集合并到当前数据集中
   * @param {T[]} newData 新数据集
   */
  public merge(newData: T[]): void {
    if (!newData.length) {
      return
    }
    newData = newData.sort((a, b) => a.time - b.time)
    const newDataFrom = newData[0]
    const newDataTo = newData[newData.length - 1]
    const cacheDataFrom = this.cache[0]
    const cacheDataTo = this.cache[this.cache.length - 1]
    if (!cacheDataFrom || !cacheDataTo) {
      this.cache = newData
    } else if (newDataFrom.time > cacheDataTo.time) {
      this.cache = this.cache.concat(newData)
    } else if (newDataTo.time < cacheDataFrom.time) {
      this.cache = newData.concat(this.cache)
    } else {
      if (newDataFrom.time < cacheDataFrom.time) {
        if (newDataTo.time >= cacheDataTo.time) {
          this.cache = newData
        } else {
          this.cache = newData.concat(this.cache.slice(this.search(newDataTo.time) + 1))
        }
      } else if (newDataTo.time > cacheDataTo.time) {
        this.cache = this.cache.slice(0, this.search(newDataFrom.time)).concat(newData)
      }
    }
  }

  /**
   * 清空数据集
   */
  public clear() {
    this.cache = []
  }

  /**
   * 二分查找时间戳对应数据集合中的下标索引
   * @param  {number} time      时间戳（精确到秒）
   * @param  {number} fromIndex 开始查找范围
   * @param  {number} toIndex   结束查找范围
   * @param  {number} bias      二分查找找不到精确值时的左右倾向
   * @return {number}           下标索引
   */
  private bsearch(time: number, fromIndex: number, toIndex: number, bias: number = 0): number {
    while (toIndex >= fromIndex) {
      const pivot = ~~((fromIndex + toIndex) / 2)
      const value = this.cache[pivot].time
      if (value === time) {
        return pivot
      } else if (value > time) {
        if (bias === 2 && fromIndex === pivot) {
          return fromIndex
        }
        return this.bsearch(time, fromIndex, pivot, bias)
      } else {
        if (bias === 1 && toIndex === pivot + 1) {
          return toIndex
        }
        return this.bsearch(time, pivot + 1, toIndex, bias)
      }
    }
    return -1
  }
}
