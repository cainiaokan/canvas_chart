import * as EventEmitter from 'eventemitter3'
import CrosshairModel from '../model/crosshair'
import { Datasource } from '../datasource'
import AxisXRenderer from '../graphic/axisx'
import XTickMark from './xtickmark'

// const weekdays = [1, 2, 3, 4, 5]
// const openHours = [9, 30, 11, 30, 13, 0, 15, 0]

interface ISize {
  width: number,
  height: number
}

export interface ITimeBar {
  time: number
  x: number
}

const MARGIN = 50
export const MAX_BAR_WIDTH = 50
export const MIN_BAR_WIDTH = 3

export default class AxisXModel extends EventEmitter {

  private _size: ISize
  private _barWidth: number = 5
  private _offset: number = -MARGIN
  private _datasource: Datasource
  private _crosshair: CrosshairModel
  private _graphic: AxisXRenderer
  private _tickmark: XTickMark
  private _visibleTimeBars: Array<ITimeBar>

  constructor (
    datasource: Datasource, crosshair: CrosshairModel) {
    super()
    this._datasource = datasource
    this._crosshair = crosshair
    this._tickmark = new XTickMark(this)
    this._graphic = new AxisXRenderer(this)
  }

  get size (): ISize {
    return this._size
  }

  set size (size: ISize) {
    this._size = size
    this.emit('resize', size)
  }

  get barWidth (): number {
    return this._barWidth
  }

  set barWidth (width: number) {
    this._barWidth = width
    this.emit('barwidthchange', width)
  }

  get offset (): number {
    return this._offset
  }

  set offset (offset: number) {
    this._offset = offset
    this.emit('offsetchange', offset)
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

  public getVisibleTimeBars (): Array<ITimeBar> {
    if (this._visibleTimeBars) {
      return this._visibleTimeBars
    }

    const datasource = this._datasource
    const width = this._size.width
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

    for (let i = bars.length - 1, pos = ~~(posX + 0.5); i >= 0; i--) {
      const bar = bars[i]
      timeBars[i] = {
        time: bar.time,
        x: pos,
      }
      pos -= barWidth
    }

    return this._visibleTimeBars = timeBars
  }

  get maxOffset (): number {
    const offset = (this._datasource.loaded() - 0.5) * this._barWidth - this._size.width + MARGIN
    return offset > 0 ? offset : 0
  }

  get minOffset (): number {
    return -MARGIN
  }

  public draw (clearCache = true): void {
    if (clearCache) {
      this._visibleTimeBars = null
      this._tickmark.clearTickmarks()
    }
    this._graphic.draw()
  }

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

  public resetOffset () {
    this.offset = -MARGIN
    this.barWidth = 5
  }
}
