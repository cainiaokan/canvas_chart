import * as EventEmitter from 'eventemitter3'
import CrosshairModel from '../model/crosshair'
import { Datasource } from '../datasource'
import { ResolutionType, OPEN_DAYS, OPEN_TIME_RANGE } from '../constant'
import AxisXRenderer from '../graphic/axisx'
import XTickMark from './xtickmark'

export interface ITimeBar {
  time: number
  x: number
}

export const INITIAL_OFFSET = 50
export const MAX_BAR_WIDTH = 30
export const MIN_BAR_WIDTH = 1

export default class AxisXModel extends EventEmitter {

  public ctx: CanvasRenderingContext2D
  public width: number
  public height: number

  private _barWidth: number = 8
  private _offset: number = -INITIAL_OFFSET
  private _datasource: Datasource
  private _crosshair: CrosshairModel
  private _graphic: AxisXRenderer
  private _tickmark: XTickMark
  private _visibleTimeBars: ITimeBar[]
  private _isValid: boolean = false

  constructor (
    datasource: Datasource, crosshair: CrosshairModel) {
    super()
    this._datasource = datasource
    this._crosshair = crosshair
    this._tickmark = new XTickMark(this)
    this._graphic = new AxisXRenderer(this)
  }

  get barWidth (): number {
    return this._barWidth
  }

  set barWidth (width: number) {
    if (width < MIN_BAR_WIDTH) {
      this._barWidth = MIN_BAR_WIDTH
    } else if (width > MAX_BAR_WIDTH) {
      this._barWidth = MAX_BAR_WIDTH
    } else {
      this._barWidth = width
    }
    this._isValid = false
    this.emit('barwidth_change', this._barWidth)
  }

  get isValid (): boolean {
    return this._isValid
  }

  get offset (): number {
    return this._offset
  }

  set offset (offset: number) {
    if (offset < this.getMinOffset()) {
      this._offset = this.getMinOffset()
    } else if (offset > this.getMaxOffset()) {
      this._offset = this.getMaxOffset()
    } else {
      this._offset = offset
    }
    this._isValid = false
    this.emit('offset_change', this._offset)
  }

  get datasource (): Datasource {
    return this._datasource
  }

  get graphic (): AxisXRenderer {
    return this._graphic
  }

  get tickmark (): XTickMark {
    return this._tickmark
  }

  get crosshair(): CrosshairModel {
    return this._crosshair
  }

  public getVisibleTimeBars (): ITimeBar[] {
    if (this._visibleTimeBars) {
      return this._visibleTimeBars
    }

    const timeBars = []
    const datasource = this._datasource
    const resolution = datasource.resolution
    const width = this.width
    const barWidth = this._barWidth
    const barSize = datasource.loaded()
    const offset = this._offset
    let end = barSize - ~~(offset / barWidth)
    let posX = width - barWidth / 2
    let x
    let time

    if (end > barSize) {
      end = barSize
    } else if (end < 0) {
      return timeBars
    }

    // 修正posX
    if (offset >= 0) {
      posX += offset % barWidth
    } else {
      posX += offset
    }

    let start = end - Math.ceil(posX / barWidth) - 1

    if (start <= 0) {
      start = 0
    }

    const bars = datasource.slice(start, end)

    if (!bars.length) {
      return timeBars
    }

    x = posX

    for (let i = bars.length - 1; i >= 0; i--, x -= barWidth) {
      timeBars.unshift({ time: bars[i].time, x })
    }

    time = timeBars[0].time

    // 数据不足显示的时候，使用扩展填充
    while (x >= 0) {
      time = this.getPrevTickTime(time, resolution)
      timeBars.unshift({ time, x })
      x -= barWidth
    }

    x = posX

    time = timeBars[timeBars.length - 1].time

    while (x <= width - barWidth / 2) {
      x += barWidth
      time = this.getNextTickTime(time, resolution)
      timeBars.push({ time, x })
    }

    return this._visibleTimeBars = timeBars
  }

  public draw (useCache = false) {
    const ctx = this.ctx
    const width = this.width
    const height = this.height

    if (!useCache) {
      this._visibleTimeBars = null
      this._tickmark.clearTickmarks()
    }

    ctx.save()
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
    this._graphic.draw()
    ctx.restore()
    this._isValid = true
  }

  public findTimeBarByX (x: number): ITimeBar {
    const barWidth = this._barWidth
    const visibleTimeBars = this.getVisibleTimeBars()
    const firstVisibleBar = visibleTimeBars[0]
    const lastVisibleBar = visibleTimeBars[visibleTimeBars.length - 1]
    const resolution = this._datasource.resolution

    if (!visibleTimeBars.length) {
      return null
    }

    if (x > lastVisibleBar.x) {
      let baseX = lastVisibleBar.x
      let offset = ~~((x - baseX + 0.5 * barWidth) / barWidth)
      let time = lastVisibleBar.time
      x = baseX + offset * barWidth
      while (offset--) {
        time = this.getNextTickTime(time, resolution)
      }
      return { x, time }
    } else if (x < firstVisibleBar.x) {
      let baseX = firstVisibleBar.x
      let offset = ~~((baseX - x + 0.5 * barWidth) / barWidth)
      let time = firstVisibleBar.time
      x = baseX - offset * barWidth
      while (offset--) {
        time = this.getPrevTickTime(time, resolution)
      }
      return { x, time }
    } else {
      let baseX = firstVisibleBar.x
      let offset = ~~((x - baseX + 0.5 * barWidth) / barWidth)
      return visibleTimeBars[offset]
    }
  }

  public getXByTime (time: number): number {
    const visibleTimeBars = this.getVisibleTimeBars()
    const barWidth = this._barWidth
    const datasource = this._datasource
    const firstVisibleBar = visibleTimeBars[0]
    const lastVisibleBar = visibleTimeBars[visibleTimeBars.length - 1]

    if (!visibleTimeBars.length) {
      return null
    }

    // 在现有数据范围内，直接使用已有的x坐标
    if (time >= firstVisibleBar.time && time <= lastVisibleBar.time) {
      return visibleTimeBars[this.search(time)].x
    }

    // 如果time超出了当前数据范围，则需要单独计算x坐标值
    const baseX = time < firstVisibleBar.time ? firstVisibleBar.x : lastVisibleBar.x
    const resolution = datasource.resolution
    let distance = 0
    let baseTime = time < firstVisibleBar.time ? firstVisibleBar.time : lastVisibleBar.time

    while (baseTime !== time) {
      if (baseTime < time) {
        baseTime = this.getNextTickTime(baseTime, resolution)
        distance++
      } else {
        time = this.getNextTickTime(time, resolution)
        distance--
      }
    }

    return baseX + distance * barWidth
  }

  public getNextTickTime (time: number, resolution: ResolutionType) {
    let nextDate: Date
    switch (resolution) {
      case '1':
        time += 60
        nextDate = new Date(time * 1000)
        break
      case '5':
        time += 60 * 5
        nextDate = new Date(time * 1000)
        break
      case '15':
        time += 60 * 15
        nextDate = new Date(time * 1000)
        break
      case '30':
        time += 60 * 30
        nextDate = new Date(time * 1000)
        break
      case '60':
        time += 60 * 60
        nextDate = new Date(time * 1000)
        break
      case 'D':
        time += 60 * 60 * 24
        nextDate = new Date(time * 1000)
        break
      case 'W':
        time += 7 * 60 * 60 * 24
        nextDate = new Date(time * 1000)
        // 保证按照每周五对齐数据
        while (nextDate.getDay() !== 5) {
          nextDate.setTime(nextDate.getTime() + 24 * 3600 * 1000)
        }
        break
      case 'M':
        nextDate = new Date(time * 1000)
        if (nextDate.getMonth() === 11) {
          nextDate.setFullYear(nextDate.getFullYear() + 1)
          nextDate.setDate(1)
          nextDate.setMonth(1)
          nextDate.setTime(nextDate.getTime() - 24 * 3600 * 1000)
        } else if (nextDate.getMonth() === 10) {
          nextDate.setFullYear(nextDate.getFullYear() + 1)
          nextDate.setDate(1)
          nextDate.setMonth(0)
          nextDate.setTime(nextDate.getTime() - 24 * 3600 * 1000)
        } else {
          nextDate.setDate(1)
          nextDate.setMonth(nextDate.getMonth() + 2)
          nextDate.setTime(nextDate.getTime() - 24 * 3600 * 1000)
        }
        if (OPEN_DAYS.indexOf(nextDate.getDay()) === -1) {
          let day = nextDate.getDay()
          let diffDays = 0
          while (OPEN_DAYS.indexOf(day) === -1) {
            day = day - 1 < 0 ? 6 : day - 1
            diffDays++
          }
          nextDate.setTime(nextDate.getTime() - diffDays * (24 * 3600 * 1000))
        }
        break
      default:
        break
    }

    if (resolution <= '60') {
      for (let i = 0,
           len = OPEN_TIME_RANGE.length,
           nextDateHour = nextDate.getHours(),
           nextDateMinute = nextDate.getMinutes(); i < len; i++) {
        let nextHours = OPEN_TIME_RANGE[i + 1]
        const curHours = OPEN_TIME_RANGE[i]
        const curCloseHour = curHours[1][0]
        const curCloseMinute = curHours[1][1]
        let nextOpenHour
        let nextOpenMinute

        if (!!nextHours) {
          nextOpenHour = nextHours[0][0]
          nextOpenMinute = nextHours[0][1]
          if ((nextDateHour > curCloseHour ||
             (nextDateHour === curCloseHour && nextDateMinute > curCloseMinute)) &&
             (nextDateHour < nextOpenHour ||
             (nextDateHour === nextOpenHour && nextDateMinute < nextOpenMinute))) {
            nextDate.setHours(nextOpenHour + nextDateHour - curCloseHour)
            nextDate.setMinutes(nextOpenMinute + nextDateMinute - curCloseMinute)
            break
          }
        } else {
          if (nextDateHour > curCloseHour ||
             (nextDateHour === curCloseHour && nextDateMinute > curCloseMinute)) {
            nextHours = OPEN_TIME_RANGE[0]
            nextOpenHour = nextHours[0][0]
            nextOpenMinute = nextHours[0][1]
            nextDate.setTime(nextDate.getTime() + 24 * 3600 * 1000)
            nextDate.setHours(nextOpenHour + nextDateHour - curCloseHour)
            nextDate.setMinutes(nextOpenMinute + nextDateMinute - curCloseMinute)
            break
          }
        }
      }
    }

    if (OPEN_DAYS.indexOf(nextDate.getDay()) === -1) {
      let day = nextDate.getDay()
      let diffDays = 0
      while (OPEN_DAYS.indexOf(day % 7) === -1) {
        diffDays++
        day++
      }
      nextDate.setTime(nextDate.getTime() + diffDays * (24 * 3600 * 1000))
    }

    return ~~(nextDate.getTime() / 1000)
  }

  public getPrevTickTime (time: number, resolution: ResolutionType) {
    let prevDate: Date
    switch (resolution) {
      case '1':
        time -= 60
        prevDate = new Date(time * 1000)
        break
      case '5':
        time -= 60 * 5
        prevDate = new Date(time * 1000)
        break
      case '15':
        time -= 60 * 15
        prevDate = new Date(time * 1000)
        break
      case '30':
        time -= 60 * 30
        prevDate = new Date(time * 1000)
        break
      case '60':
        time -= 60 * 60
        prevDate = new Date(time * 1000)
        break
      case 'D':
        time -= 60 * 60 * 24
        prevDate = new Date(time * 1000)
        break
      case 'W':
        time -= 7 * 60 * 60 * 24
        prevDate = new Date(time * 1000)
        // 保证按照每周五对齐数据
        while (prevDate.getDay() !== 5) {
          prevDate.setTime(prevDate.getTime() + 24 * 3600 * 1000)
        }
        break
      case 'M':
        prevDate = new Date(time * 1000)
        prevDate.setDate(1)
        prevDate.setTime(prevDate.getTime() - 24 * 3600 * 1000)
        if (OPEN_DAYS.indexOf(prevDate.getDay()) === -1) {
          let day = prevDate.getDay()
          let diffDays = 0
          while (OPEN_DAYS.indexOf(day) === -1) {
            day = day - 1 < 0 ? 6 : day - 1
            diffDays++
          }
          prevDate.setTime(prevDate.getTime() - diffDays * (24 * 3600 * 1000))
        }
        break
      default:
        break
    }

    if (resolution <= '60') {
      for (let i = OPEN_TIME_RANGE.length - 1,
           prevDateHour = prevDate.getHours(),
           prevDateMinute = prevDate.getMinutes(); i >= 0; i--) {
        let prevHours = OPEN_TIME_RANGE[i - 1]
        const curHours = OPEN_TIME_RANGE[i]
        const curOpenHour = curHours[0][0]
        const curOpenMinute = curHours[0][1]
        let prevCloseHour
        let prevCloseMinute

        if (!!prevHours) {
          prevCloseHour = prevHours[1][0]
          prevCloseMinute = prevHours[1][1]
          if ((prevDateHour > prevCloseHour ||
             (prevDateHour === prevCloseHour && prevDateMinute > prevCloseMinute)) &&
             (prevDateHour < curOpenHour ||
             (prevDateHour === curOpenHour && prevDateMinute < curOpenMinute))) {
            prevDate.setHours(prevCloseHour - (prevDateHour - curOpenHour))
            prevDate.setMinutes(prevCloseMinute - (prevDateMinute - curOpenMinute))
            break
          // 向收盘截止时间对齐。例如9:30应当展示位了前一交易日的收盘时间15:00
          } else if ((prevDateHour === prevCloseHour && prevDateMinute === prevCloseMinute) ||
                   (prevDateHour === curOpenHour && prevDateMinute === curOpenMinute)) {
            prevDate.setHours(prevCloseHour)
            prevDate.setMinutes(prevCloseMinute)
          }
        } else {
          if (prevDateHour < curOpenHour ||
             (prevDateHour === curOpenHour && prevDateMinute < curOpenMinute)) {
            prevHours = OPEN_TIME_RANGE[OPEN_TIME_RANGE.length - 1]
            prevCloseHour = prevHours[1][0]
            prevCloseMinute = prevHours[1][1]
            prevDate.setTime(prevDate.getTime() - 24 * 3600 * 1000)
            prevDate.setHours(prevCloseHour - (curOpenHour - prevDateHour))
            prevDate.setMinutes(prevCloseMinute - (curOpenMinute - prevDateMinute))
            break
          // 向收盘截止时间对齐。例如9:30应当展示位了前一交易日的收盘时间15:00
          } else if (prevDateHour === curOpenHour && prevDateMinute === curOpenMinute) {
            prevHours = OPEN_TIME_RANGE[OPEN_TIME_RANGE.length - 1]
            prevCloseHour = prevHours[1][0]
            prevCloseMinute = prevHours[1][1]
            prevDate.setTime(prevDate.getTime() - 24 * 3600 * 1000)
            prevDate.setHours(prevCloseHour)
            prevDate.setMinutes(prevCloseMinute)
          }
        }
      }
    }

    if (OPEN_DAYS.indexOf(prevDate.getDay()) === -1) {
      let day = prevDate.getDay()
      let diffDays = 0
      while (OPEN_DAYS.indexOf(day) === -1) {
        day = day - 1 < 0 ? 6 : day - 1
        diffDays++
      }
      prevDate.setTime(prevDate.getTime() - diffDays * (24 * 3600 * 1000))
    }

    return ~~(prevDate.getTime() / 1000)
  }

  public search (time: number): number {
    const visibleBars = this.getVisibleTimeBars()
    if (!visibleBars.length) {
      return -1
    }
    if (time < visibleBars[0].time || time > visibleBars[visibleBars.length - 1].time) {
      return -1
    }
    return this.bsearch(time, 0, visibleBars.length - 1, visibleBars)
  }

  public resetOffset () {
    this._offset = -INITIAL_OFFSET
  }

  private getMaxOffset (): number {
    return (this._datasource.loaded() - 10) * this._barWidth
  }

  private getMinOffset (): number {
    return this._barWidth * 10 - this.width
  }

  /**
   * 二分查找时间戳对应数据集合中的下标索引
   * @param  {number}     time        时间戳（精确到秒）
   * @param  {number}     fromIndex   开始查找范围
   * @param  {number}     toIndex     结束查找范围
   * @param  {ITimeBar[]} visibleBars bar数据
   * @return {number}                 下标索引
   */
  private bsearch(time: number, fromIndex: number, toIndex: number, visibleBars: ITimeBar[]): number {
    const pivot = ~~((fromIndex + toIndex) / 2)
    const value = visibleBars[pivot].time

    if (fromIndex === toIndex) {
      if (time === value) {
        return pivot
      } else {
        return -1
      }
    }

    if (value === time) {
      return pivot
    } else if (value > time) {
      return this.bsearch(time, fromIndex, pivot, visibleBars)
    } else {
      return this.bsearch(time, pivot + 1, toIndex, visibleBars)
    }
  }
}
