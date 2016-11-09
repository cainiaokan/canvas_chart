import ChartModel from '../model/chart'
import { getCanvasHeight, getCanvasWidth } from '../util'

export default class WatermarkRenderer {
  private _chart: ChartModel

  constructor (chart: ChartModel) {
    this._chart = chart
  }

  public draw () {
    const ctx = this._chart.ctx
    const width = getCanvasWidth(ctx.canvas)
    const height = getCanvasHeight(ctx.canvas)

    const fontSize = ~~(height * .25)
    ctx.save()
    ctx.font = fontSize + 'px Verdana, Arial, sans-serif'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#e6e6e6'
    ctx.fillText('趣炒股网', width / 2, height / 2)
    ctx.restore()
  }
}
