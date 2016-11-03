import * as EventEmitter from 'eventemitter3'
import ChartModel from '../model/chart'
import CrosshairModel from '../model/crosshair'
import { Datasource } from '../datasource'
import AxisYRenderer from '../graphic/axisy'
import YTickMark from './ytickmark'

type Size = {
  width: number,
  height: number
}

export type YRange = {
  max: number
  min: number
}

export const MARGIN_RATIO = .05

export default class AxisYModel extends EventEmitter {

  public ctx: CanvasRenderingContext2D
  public range: YRange

  private _margin: number
  private _size: Size
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
    const height = this._size.height
    const margin = height * MARGIN_RATIO + this._margin
    return height - 2 * margin < 1 ? (height - 1) / 2 : margin
  }

  set margin (margin: number) {
    const height = this._size.height
    this._margin = height - 2 * margin >= 1 ? margin - height * MARGIN_RATIO : (height - 1) / 2
    this._isValid = false
    this._chart.chartLayout.emit('barmarginchange')
  }

  get isValid (): boolean {
    return this._isValid
  }

  get size (): Size {
    return this._size
  }

  set size (size: Size) {
    this._size = size
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

  public getYByValue (value: number, range: YRange): number {
    const margin = this.margin
    const height = this._size.height - margin * 2
    const diff1 = range.max - range.min
    const diff2 = range.max - value
    return (diff2 / diff1) * height + margin
  }

  public getValueByY (value: number, range: YRange): number {
    const margin = this.margin
    const height = this._size.height - margin * 2
    const diff1 = range.max - range.min
    return (this._size.height - margin - value) * diff1 / height + range.min
  }

  public draw (): void {
    this._tickmark.clearTickmarks()
    this._isValid = true
    this._graphic.draw()
  }
}
