import ChartModel from '../model/chart'

export default class WatermarkRenderer {
  private _chart: ChartModel

  constructor (chart: ChartModel) {
    this._chart = chart
  }

  public draw (ctx: CanvasRenderingContext2D) {
    const chart = this._chart
    const width = chart.width
    const height = chart.height

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
