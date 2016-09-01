import AxisYMoel from './axisy'

const TICK_SPAN = 30

interface IYTickMark {
  value: number
  y: number
}

export default class YTickMark {
  private _axisY: AxisYMoel
  private _tickmarks: Array<IYTickMark>

  constructor (axisY: AxisYMoel) {
    this._axisY = axisY
  }

  public clearTickmarks (): void {
    this._tickmarks = null
  }

  public getTickMarksByTimeBars (): Array<IYTickMark> {

    if (this._tickmarks) {
      return this._tickmarks
    }

    const tickmarks: Array<IYTickMark> = []

    if (!this._axisY.range) {
      return tickmarks
    }

    const axisY = this._axisY
    let min = this._axisY.range.min
    let max = this._axisY.range.max

    if (min === max) {
      return tickmarks
    }

    const height = this._axisY.size.height
    const diff1 = max - min
    const diff2 = diff1 * height / (height - 2 * this._axisY.margin)
    const margin = (diff2 - diff1) / 2
    min -= margin
    max += margin
    min = ~~min
    const span = Math.ceil(diff2 / (height / TICK_SPAN))
    while (min <= max) {
      tickmarks.push({
        value: ~~min,
        y: axisY.getYByValue(~~min, axisY.range),
      })
      min += span
    }

    this._tickmarks = tickmarks
    return tickmarks
  }
}
