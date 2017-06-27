import AxisYModel from '../model/axisy'

export default class AxisYRenderer {
  private _axis: AxisYModel

  constructor (axis: AxisYModel) {
    this._axis = axis
  }

  public draw () {
    const axis = this._axis
    const range = axis.range
    const isPercentage = axis.type === 'percentage'
    const chart = axis.chart
    const ctx = axis.ctx
    const width = axis.width
    const height = axis.height
    const axisY = axis
    const cursorPoint = axis.crosshair.point
    const hover = axis.crosshair.chart.hover
    const margin = 8

    ctx.strokeStyle = '#999999'
    ctx.lineWidth = 1

    ctx.translate(0.5, 0.5)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(0, height)

    ctx.font = '10px ans-serif'
    ctx.fillStyle = '#999999'
    ctx.textAlign = 'left'

    const tickmarks = axisY.tickmark.getTickMarksByTimeBars()

    for (let i = 0, len = tickmarks.length; i < len; i++) {
      const tickmark = tickmarks[i]
      ctx.moveTo(0, ~~tickmark.y)
      ctx.lineTo(5, ~~tickmark.y)
      ctx.fillText(tickmark.value.toFixed(2) + (isPercentage ? '%' : ''), 10, tickmark.y + 4)
    }

    ctx.closePath()
    ctx.stroke()

    if (chart.datasource.resolution > '1') {
      chart.graphs.forEach(graph =>
        graph.plots.forEach(plot =>
          plot.priceLabels.forEach(priceLabel => {
            const y = ~~axis.getYByValue(priceLabel.val)
            ctx.fillStyle = priceLabel.color
            ctx.fillRect(0, y - 6 - margin / 2, width + margin, 12 + margin)
            ctx.fillStyle = '#ffffff'
            ctx.fillText((isPercentage ? (priceLabel.val - range.base) / range.base * 100 : priceLabel.val).toFixed(2) + (isPercentage ? '%' : ''), 10, y + 4)
          })
        )
      )
    }

    if (cursorPoint && hover && axis.range) {
      const y = cursorPoint.y
      const value = axis.getValueByY(y)
      ctx.fillStyle = '#333333'
      ctx.fillRect(0, y - 6 - margin / 2, width + margin, 12 + margin)
      ctx.fillStyle = '#999999'
      ctx.fillText((isPercentage ? (value - range.base) / range.base * 100 : value).toFixed(2) + (isPercentage ? '%' : ''), 10, ~~(y + 4))
    }
  }
}
