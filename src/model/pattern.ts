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
  public _isVisible: boolean
  private _isValid = false
  private _type: PatternType
  private _renderer: BasePatternRenderer

  constructor (chart: ChartModel, type: PatternType, { bwPoints, swPoints, trendLines, points }: PointsData) {
    this._type = type
    switch (type) {
      case 'wave':
        this._renderer = new WavePatternRenderer(chart, bwPoints, swPoints)
      this._isVisible = !!chart.chartLayout.readFromLS('chart.showWaveForm')
        break
      case 'mhead':
      case 'whead':
      case 'hsp':
      case 'hsb':
      case 'triangle':
        this._renderer = new ShapePatternRenderer(chart, points, trendLines)
        this._isVisible = !!chart.chartLayout.readFromLS('chart.showReverseRelay')
        break
      default:
        break
    }
  }

  get isVisible (): boolean {
    return this._isVisible
  }

  set isVisible (isVisible: boolean) {
    if (this._isVisible !== isVisible) {
      this._isVisible = isVisible
      this._isValid = false
    }
  }

  get type (): PatternType {
    return this._type
  }

  get isValid (): boolean {
    return this._isValid
  }

  public draw (ctx: CanvasRenderingContext2D): void {
    this._renderer.draw(ctx)
    this._isValid = true
  }

  public isNowVisible (): boolean {
    return this._renderer.isNowVisible()
  }
}
