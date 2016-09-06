import PlotModel from '../model/plot'
import { IYRange } from '../model/axisy'

export interface IChartStyle {
  color?: string
  colorDown?: string
  lineWidth?: number
  fillColor?: string
  histogramBase?: number
}

abstract class BaseChartRenderer {
  public ctx: CanvasRenderingContext2D
  protected plotModel: PlotModel
  protected style: IChartStyle
  protected rangeY: IYRange

  constructor (plotModel: PlotModel, style: IChartStyle) {
    this.plotModel = plotModel
    this.style = style
  }

  public draw (): void {
    this.rangeY = null
  }

  public getRangeY (): IYRange {
    if (this.rangeY) {
      return this.rangeY
    } else {
      return this.rangeY = this.calcRangeY()
    }
  }

  protected abstract calcRangeY (): IYRange
}

export default BaseChartRenderer
