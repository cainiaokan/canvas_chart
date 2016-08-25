import * as EventEmitter from 'eventemitter3'
import CrosshairModel from '../model/crosshair'
import { Datasource } from '../datasource'
import AxisYRenderer from '../graphic/axisy'
import YTickMark from './ytickmark'

interface ISize {
  width: number,
  height: number
}

export interface IYRange {
  max: number
  min: number
}

export const MARGIN = 20

export default class AxisYModel extends EventEmitter {

  public range: IYRange

  private _size: ISize
  private _crosshair: CrosshairModel
  private _datasource: Datasource
  private _graphic: AxisYRenderer
  private _tickmarks: YTickMark

  constructor (datasource: Datasource, crosshair: CrosshairModel) {
    super()
    this._datasource = datasource
    this._crosshair = crosshair
    this._graphic = new AxisYRenderer(this)
    this._tickmarks = new YTickMark(this)
  }

  get size (): ISize {
    return this._size
  }

  set size (size: ISize) {
    this._size = size
    this.emit('resize', size)
  }

  get datasource (): Datasource {
    return this._datasource
  }

  get graphic (): AxisYRenderer {
    return this._graphic
  }

  get tickmark (): YTickMark {
    return this._tickmarks
  }

  get crosshair(): CrosshairModel {
    return this._crosshair
  }

  public getYByValue (value: number, range: IYRange): number {
    const height = this._size.height - MARGIN * 2
    const diff1 = range.max - range.min
    const diff2 = range.max - value
    return ~~((diff2 / diff1) * height) + MARGIN
  }

  public getValueByY (value: number, range: IYRange): number {
    const height = this._size.height - MARGIN * 2
    const diff1 = range.max - range.min
    return (this._size.height - MARGIN - value) * diff1 / height + range.min
  }

  public draw (): void {
    this._graphic.draw()
  }

}
