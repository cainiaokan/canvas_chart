import ChartModel from './chart'
import { BasePatternRenderer, WavePatternRenderer, ShapePatternRenderer, Point } from '../graphic/pattern'

export type PatternType = 'wave' | 'mhead' | 'whead' | 'hsp' | 'hsb' | 'triangle'
type PointsData = {
  bwPoints?: Point[]
  swPoints?: Point[]
  trendLines?: Point[][]
  points?: Point[]
}
export default class Pattern {
  public isHidden: boolean
  private _type: PatternType
  private _renderer: BasePatternRenderer

  constructor (chart: ChartModel, type: PatternType, { bwPoints, swPoints, trendLines, points }: PointsData) {
    this.isHidden = false
    this._type = type
    switch (type) {
      case 'wave':
        this._renderer = new WavePatternRenderer(chart, bwPoints, swPoints)
        break
      case 'mhead':
      case 'whead':
      case 'hsp':
      case 'hsb':
      case 'triangle':
        this._renderer = new ShapePatternRenderer(chart, points, trendLines)
        break
      default:
        break
    }
  }

  public draw (ctx: CanvasRenderingContext2D): void {
    this._renderer.draw(ctx)
  }

  public isNowVisible (): boolean {
    return this._renderer.isNowVisible()
  }
}
