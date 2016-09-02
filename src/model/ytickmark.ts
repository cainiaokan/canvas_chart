import AxisYMoel from './axisy'
import { padRight } from '../util'

const TICK_SPAN = 30
const precision = 2

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
    const span = this.normalizeTickSpan(diff2 / (height / TICK_SPAN))

    min -= (min % span)

    while (min <= max) {
      tickmarks.push({
        value: min,
        y: axisY.getYByValue(min, axisY.range),
      })
      min += span
    }

    this._tickmarks = tickmarks
    return tickmarks
  }

  /**
   * 计算合适的刻度距离，以便展示的美观性
   * @param {number} span [description]
   */
  private normalizeTickSpan (span: number) {
    let array = span.toFixed(precision)
    let carry = 0
    let re = []
    span = +array
    for (let i = 0, len = array.length, cur; i < len; i++) {
      cur = array[i]
      if (cur === '.') {
        re.push(cur)
      } else {
        cur = +cur
        if (cur === 0) {
          re.push(cur)
        } else if (cur < 5) {
          if (cur < 3) {
            re.push(cur + 1)
            break
          } else {
            re.push(5)
            break
          }
        } else {
          if (i - 1 >= 0) {
            if (re[i - 1] === '.') {
              re[i - 2] += 1
            } else {
              re[i - 1] += 1
            }
            re.push(0)
          } else {
            re.push(1)
            re.push(0)
            carry = 1
          }
          break
        }
      }
    }
    let padLength = 1
    span = ~~span
    while (span >= 10) {
      padLength ++
      span /= 10
    }
    return +padRight(re.join(''), padLength + carry)
  }
}
