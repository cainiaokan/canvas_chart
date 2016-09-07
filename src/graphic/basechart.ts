import PlotModel from '../model/plot'
import { YRange } from '../model/axisy'

export type ChartStyle = {
  color?: string
  colorDown?: string
  lineWidth?: number
  fillColor?: string
  histogramBase?: number
}

abstract class BaseChartRenderer {
  protected plotModel: PlotModel
  protected style: ChartStyle
  protected rangeY: YRange

  constructor (plotModel: PlotModel, style: ChartStyle) {
    this.plotModel = plotModel
    this.style = style
  }

  public draw (): void {
    this.rangeY = null
  }

  public getRangeY (): YRange {
    if (this.rangeY) {
      return this.rangeY
    } else {
      return this.rangeY = this.calcRangeY()
    }
  }

  public abstract hitTest (): boolean

  protected abstract calcRangeY (): YRange
}

export default BaseChartRenderer
