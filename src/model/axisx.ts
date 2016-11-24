import * as EventEmitter from 'eventemitter3'
import CrosshairModel from '../model/crosshair'
import { Datasource } from '../datasource'
import AxisXRenderer from '../graphic/axisx'
import XTickMark from './xtickmark'

// const weekdays = [1, 2, 3, 4, 5]
// const openHours = [9, 30, 11, 30, 13, 0, 15, 0]

export interface ITimeBar {
  time: number
  x: number
}

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
    if (offset < -MARGIN) {
      this._offset = -MARGIN
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

    const datasource = this._datasource
    const width = this.width
    const barWidth = this._barWidth
    const barSize = datasource.loaded()
    const offset = this._offset
    let end = barSize - ~~(offset / barWidth)
    let posX = width - barWidth / 2
    if (end > barSize) {
      end = barSize
    } else if (end < 0) {
      return []
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
    const timeBars = []

    for (let i = bars.length - 1; i >= 0; i--) {
      const bar = bars[i]
      timeBars[i] = {
        time: bar.time,
        x: posX,
      }
      posX -= barWidth
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
    const offset = (this._datasource.loaded() - 0.5) * this._barWidth - this.width + MARGIN
    return offset > 0 ? offset : 0
  }
}
