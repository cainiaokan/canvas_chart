import ChartModel from '../../model/chart'

export type Point = {
  time: number
  value: number
}

export abstract class BasePatternRenderer {
  protected _chart: ChartModel

  constructor (chart: ChartModel) {
    this._chart = chart
  }

  public abstract draw(ctx: CanvasRenderingContext2D): void
  public abstract hitTest (): boolean
  public abstract isNowVisible (): boolean
}
