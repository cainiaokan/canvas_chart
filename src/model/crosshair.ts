import * as EventEmitter from 'eventemitter3'
import CrosshairRenderer from '../graphic/crosshair'
import AxisX from '../model/axisx'
import AxisY from '../model/axisy'

interface IPoint {
  x: number
  y: number
}

export default class CrosshairModel extends EventEmitter {
  private _point: IPoint
  private _graphic: CrosshairRenderer
  private _axisX: AxisX
  private _axisY: AxisY

  constructor () {
    super()
    this._graphic = new CrosshairRenderer(this)
  }

  get point (): IPoint {
    return this._point
  }

  set point (point: IPoint) {
    this._point = point
    this.emit('cursormove', point)
  }

  get graphic (): CrosshairRenderer {
    return this._graphic
  }

  set axisX (axisX: AxisX) {
    this._axisX = axisX
  }

  set axisY (axisY: AxisY) {
    this._axisY = axisY
  }

  get axisX (): AxisX {
    return this._axisX
  }

  get axisY (): AxisY {
    return this._axisY
  }
}
