import * as EventEmitter from 'eventemitter3'
import ChartModel from '../model/chart'
import CrosshairModel from '../model/crosshair'
import { Datasource } from '../datasource'
import AxisYRenderer from '../graphic/axisy'
import YTickMark from './ytickmark'

export type YRange = {
  max: number
  min: number
}

export const MARGIN_RATIO = .05

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

  constructor (datasource: Datasource, crosshair: CrosshairModel) {
    super()
    this._margin = 0
    this._isValid = false
    this._datasource = datasource
    this._crosshair = crosshair
    this._graphic = new AxisYRenderer(this)
    this._tickmark = new YTickMark(this)
  }

  get margin (): number {
    const height = this.height
    const margin = height * MARGIN_RATIO + this._margin
    return height - 2 * margin < 1 ? (height - 1) / 2 : margin
  }

  set margin (margin: number) {
    const height = this.height
    this._margin = height - 2 * margin >= 1 ? margin - height * MARGIN_RATIO : (height - 1) / 2
    this._isValid = false
    this._chart.chartLayout.emit('barmarginchange')
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
    const margin = this.margin
    const availHeight = this.height - margin * 2
    const diff1 = range.max - range.min
    const diff2 = range.max - value
    return (diff2 / diff1) * availHeight + margin
  }

  public getValueByY (value: number, range: YRange = this.range): number {
    const margin = this.margin
    const height = this.height
    const availHeight = height - margin * 2
    const diff1 = range.max - range.min
    return (height - margin - value) * diff1 / availHeight + range.min
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
