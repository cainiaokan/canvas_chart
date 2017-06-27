import * as EventEmitter from 'eventemitter3'
import ChartModel from '../model/chart'
import CrosshairModel from '../model/crosshair'
import { Datasource } from '../datasource'
import AxisYRenderer from '../graphic/axisy'
import YTickMark from './ytickmark'
import { AxisType } from '../constant'

export type YRange = {
  base?: number
  max: number
  min: number
  maxPercentage?: number
  minPercentage?: number
}

export default class AxisYModel extends EventEmitter {

  public ctx: CanvasRenderingContext2D
  public range: YRange
  public width: number
  public height: number

  private _margin: number
  private _chart: ChartModel
  private _crosshair: CrosshairModel
  private _datasource: Datasource
  private _graphic: AxisYRenderer
  private _tickmark: YTickMark
  private _isValid: boolean
  private _type: AxisType

  constructor (datasource: Datasource, crosshair: CrosshairModel, type: AxisType = 'normal') {
    super()
    this._margin = 10
    this._isValid = false
    this._type = type
    this._datasource = datasource
    this._crosshair = crosshair
    this._graphic = new AxisYRenderer(this)
    this._tickmark = new YTickMark(this)
  }

  get margin (): number {
    const height = this.height
    if (this._margin > height / 2) {
      return height / 2 - 1
    } else {
      return this._margin
    }
  }

  set margin (margin: number) {
    const height = this.height
    if (margin > height / 2) {
      this._margin = height / 2 - 1
    } else {
      this._margin = margin
    }
    this._isValid = false
    this._chart.chartLayout.emit('barmargin_change')
  }

  get type (): AxisType {
    return this._type
  }

  set type (type: AxisType) {
    this._type = type
    this._isValid = false
  }

  get isValid (): boolean {
    return this._isValid
  }

  get chart (): ChartModel {
    return this._chart
  }

  set chart (chart: ChartModel) {
    this._chart = chart
  }

  get datasource (): Datasource {
    return this._datasource
  }

  get graphic (): AxisYRenderer {
    return this._graphic
  }

  get tickmark (): YTickMark {
    return this._tickmark
  }

  get crosshair(): CrosshairModel {
    return this._crosshair
  }

  public getYByValue (value: number, range: YRange = this.range): number {
    const isPercentage = this._type === 'percentage'
    const margin = this.margin
    const availHeight = this.height - margin * 2
    let diff1
    let diff2
    if (isPercentage && 'maxPercentage' in range) {
      value = (value - range.base) / range.base
      diff1 = range.maxPercentage - range.minPercentage
      diff2 = range.maxPercentage - value
      if (range.maxPercentage === 0 && range.minPercentage === 0) {
        return availHeight + margin
      } else if (range.maxPercentage === range.minPercentage) {
        return margin
      } else {
        return (diff2 / diff1) * availHeight + margin
      }
    } else {
      diff1 = range.max - range.min
      diff2 = range.max - value
      if (range.max === 0 && range.min === 0) {
        return availHeight + margin
      } else if (range.max === range.min) {
        return margin
      } else {
        return (diff2 / diff1) * availHeight + margin
      }
    }
  }

  public getValueByY (y: number, range: YRange = this.range): number {
    const type = this._type
    const margin = this.margin
    const height = this.height
    const availHeight = height - margin * 2
    let diff1
    if (type === 'percentage') {
      diff1 = range.maxPercentage - range.minPercentage
      return (height - margin - y) * diff1 / availHeight * range.base + range.min
    } else {
      diff1 = range.max - range.min
      return (height - margin - y) * diff1 / availHeight + range.min
    }
  }

  get maxVal () {
    return this.getValueByY(this.getYByValue(this.range.max) - this.margin)
  }

  get minVal () {
    return this.getValueByY(this.getYByValue(this.range.min) + this.margin)
  }

  public draw (useCache = false) {
    const ctx = this.ctx
    const width = this.width
    const height = this.height

    if (!useCache) {
      this._tickmark.clearTickmarks()
    }

    ctx.save()
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, width, height)
    this._graphic.draw()
    ctx.restore()
    this._isValid = true
  }
}
