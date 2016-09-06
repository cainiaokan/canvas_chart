import * as EventEmitter from 'eventemitter3'
import CrosshairRenderer from '../graphic/crosshair'
import ChartModel from '../model/chart'

interface IPoint {
  x: number
  y: number
}

export default class CrosshairModel extends EventEmitter {
  public hover: boolean = false
  private _point: IPoint
  private _graphic: CrosshairRenderer
  private _chart: ChartModel

  constructor () {
    super()
    this._graphic = new CrosshairRenderer(this)
  }

  get point (): IPoint {
    return this._point
  }

  set point (point: IPoint) {
    this._point = point
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
    // TODO
    // 因为指针时间会导致关联的dom刷新，为了保证dom刷新跟canvas刷新的同步，故而将指针移动的时间通知
    // 推迟到draw函数中进行，而不是在set函数中进行。
    // 刷新不同步的后果是，dom刷新将不能保证状态为最新，例如canvas的请求的帧动画尚未执行，dom就执行了
    // 刷新操作，但此时dom使用的canvas状态尚未更新。会导致数据不一致的情况产生。
    this.emit('cursormove')
  }
}
