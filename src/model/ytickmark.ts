import AxisYMoel, { MARGIN }from './axisy'

const TICK_SPAN = 30

export default class YTickMark {
  private _axis: AxisYMoel
  constructor (axis: AxisYMoel) {
    this._axis = axis
  }

  public getTickMarksByTimeBars (): Array<number> {
    const tickmarks = []
    if (!this._axis.range) {
      return tickmarks
    }
    let min = this._axis.range.min
    let max = this._axis.range.max

    if (min === max) {
      return tickmarks
    }

    const height = this._axis.size.height
    const diff1 = max - min
    const diff2 = diff1 * height / (height - 2 * MARGIN)
    const margin = (diff2 - diff1) / 2
    min -= margin
    max += margin
    min = ~~min
    const span = Math.ceil(diff2 / (height / TICK_SPAN))
    while (min <= max) {
      tickmarks.push(~~min)
      min += span
    }
    return tickmarks
  }
}
