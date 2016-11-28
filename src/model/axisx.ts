import * as EventEmitter from 'eventemitter3'
import CrosshairModel from '../model/crosshair'
import { Datasource } from '../datasource'
import { ResolutionType } from '../constant'
import AxisXRenderer from '../graphic/axisx'
import XTickMark from './xtickmark'

const weekdays = [1, 2, 3, 4, 5]
const openHours = [
  [[9, 30], [11, 30]],
  [[13, 0], [15, 0]],
]

export interface ITimeBar {
  time: number
  x: number
}

const MAX_MARGIN = 500
const MARGIN = 50
export const MAX_BAR_WIDTH = 30
export const MIN_BAR_WIDTH = 5

export default class AxisXModel extends EventEmitter {

  public ctx: CanvasRenderingContext2D
  public width: number
  public height: number

  private _barWidth: number = 8
  private _offset: number = -MARGIN
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
    this.emit('barwidthchange', this._barWidth)
  }

  get isValid (): boolean {
    return this._isValid
  }

  get offset (): number {
    return this._offset
  }

  set offset (offset: number) {
    if (offset < -MAX_MARGIN) {
      this._offset = -MAX_MARGIN
    } else if (offset > this.getMaxOffset()) {
      this._offset = this.getMaxOffset()
    } else {
      this._offset = offset
    }
    this._isValid = false
    this.emit('offsetchange', this._offset)
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

    if (end > barSize) {
      end = barSize
    } else if (end < 0) {
      return timeBars
    }

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

    for (let i = bars.length - 1, x = posX; i >= 0; i--, x -= barWidth) {
      timeBars.unshift({ time: bars[i].time, x })
    }

    let time = timeBars[timeBars.length - 1].time

    while (posX < width) {
      posX += barWidth
      time = this.getNextTickTime(time, resolution)
      timeBars.push({ time, x: posX})
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

  // TODO 后续应该改为可以查找超过当前可见区域的x，跟getXByTime方法一样
  public findTimeBarByX (x: number): ITimeBar {
    const timeBars = this.getVisibleTimeBars()
    for (let i = 0, len = timeBars.length; i < len; i++) {
      const bar = timeBars[i]
      if (Math.abs(x - bar.x) <= this._barWidth / 2) {
        return bar
      }
    }
    return null
  }

  public getXByTime (time: number): number {
    let indexLeft
    let indexRight

    const timeBars = this.getVisibleTimeBars()
    const firstBar = timeBars[0]
    const lastBar = timeBars[timeBars.length - 1]

    if (firstBar.time > time) {
      indexLeft = this.datasource.search(time)
      indexRight = this.datasource.search(firstBar.time)
      return firstBar.x - this._barWidth * (indexRight - indexLeft)
    }

    if (lastBar.time < time) {
      indexLeft = this.datasource.search(lastBar.time)
      indexRight = this.datasource.search(time)
      return lastBar.x + this._barWidth * (indexRight - indexLeft)
    }

    for (let i = 0, len = timeBars.length; i < len; i++) {
      const bar = timeBars[i]
      if (bar.time === time) {
        return bar.x
      }
    }
    return null
  }

  public resetOffset () {
    this._offset = -MARGIN
  }

  private getMaxOffset (): number {
    const offset = (this._datasource.loaded() - 0.5) * this._barWidth - this.width + MAX_MARGIN
    return offset > 0 ? offset : 0
  }

  private getNextTickTime (time: number, resolution: ResolutionType) {
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
        if (weekdays.indexOf(nextDate.getDay()) === -1) {
          let day = nextDate.getDay() - 1 < 0 ? 6 : nextDate.getDay() - 1
          while (weekdays.indexOf(day) === -1) {
            day = day - 1 < 0 ? 6 : day - 1
          }
          nextDate.setTime(nextDate.getTime() - Math.abs(nextDate.getDay() - day) * (24 * 3600 * 1000))
        }
        break
      default:
        break
    }

    for (let i = 0,
         len = openHours.length,
         nextDateHour = nextDate.getHours(),
         nextDateMinute = nextDate.getMinutes(); i < len; i++) {
      let nextHours = openHours[i + 1]
      const curHours = openHours[i]
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
          nextHours = openHours[0]
          nextOpenHour = nextHours[0][0]
          nextOpenMinute = nextHours[0][1]
          nextDate.setTime(nextDate.getTime() + 24 * 3600 * 1000)
          nextDate.setHours(nextOpenHour + nextDateHour - curCloseHour)
          nextDate.setMinutes(nextOpenMinute + nextDateMinute - curCloseMinute)
          break
        }
      }
    }

    if (weekdays.indexOf(nextDate.getDay()) === -1) {
      let day = nextDate.getDay() + 1
      while (weekdays.indexOf(day % 7) === -1) {
        day++
      }
      nextDate.setTime(nextDate.getTime() + Math.abs(day - nextDate.getDay()) * (24 * 3600 * 1000))
    }

    return ~~(nextDate.getTime() / 1000)
  }
}
