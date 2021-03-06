import * as EventEmitter from 'eventemitter3'
import CrosshairRenderer from '../graphic/crosshair'
import ChartLayout from '../model/chartlayout'
import ChartModel from '../model/chart'

export type Point = {
  x: number
  y: number
}

export default class CrosshairModel extends EventEmitter {
  private _point: Point
  private _graphic: CrosshairRenderer
  private _chartLayout: ChartLayout
  private _chart: ChartModel

  constructor (chartLayout: ChartLayout) {
    super()
    this._chartLayout = chartLayout
    this._graphic = new CrosshairRenderer(this)
  }

  get point (): Point {
    return this._point
  }

  set point (point: Point) {
    if (!this._point ||
        !point ||
        point.x !== this._point.x ||
        point.y !== this._point.y) {
      this._point = point
    }
  }

  get graphic (): CrosshairRenderer {
    return this._graphic
  }

  get chart (): ChartModel {
    return this._chart
  }

  set chart (chart: ChartModel) {
    this._chart = chart
  }

  public draw () {
    this.graphic.draw()
  }
}
