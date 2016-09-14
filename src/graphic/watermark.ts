import ChartModel from '../model/chart'

export default class WatermarkRenderer {
  private _chart: ChartModel

  constructor (chart: ChartModel) {
    this._chart = chart
  }

  public draw () {
    const ctx = this._chart.ctx
    const width = parseInt(ctx.canvas.style.width)
    const height = parseInt(ctx.canvas.style.height)

    const fontSize = ~~(height * .3)
    ctx.save()
    ctx.font = fontSize + 'px Verdana, Arial, sans-serif'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba( 85, 85, 85, 0.15)'
    ctx.fillText('趣炒股网', width / 2, height / 2)
    ctx.restore()
  }

}
