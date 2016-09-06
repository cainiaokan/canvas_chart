import AxisXMoel, { ITimeBar } from './axisx'
import { pad } from '../util'

interface IXTickMark {
  bold: boolean
  time: string
  type: string
  x: number
}

const TICK_MARK_MIN_SPACE = 50

export default class XTickMark {
  private _axis: AxisXMoel
  private _tickmarks: IXTickMark[]

  constructor (axis: AxisXMoel) {
    this._axis = axis
  }

  public clearTickmarks (): void {
    this._tickmarks = null
  }

  public getTickMarksByTimeBars (timeBars: ITimeBar[]): IXTickMark[] {

    if (this._tickmarks) {
      return this._tickmarks
    }

    const tickmarks: IXTickMark[] = []

    if (!timeBars.length) {
      return tickmarks
    }

    const resolution = this._axis.datasource.resolution
    const barWidth = this._axis.barWidth
    let minTickSpan = '1'

    switch (resolution) {
      case '1':
        if (barWidth >= TICK_MARK_MIN_SPACE) {
          minTickSpan = '1'
        } else if (barWidth * 5 >= TICK_MARK_MIN_SPACE) {
          minTickSpan = '5'
        } else if (barWidth * 10 >= TICK_MARK_MIN_SPACE) {
          minTickSpan = '10'
        } else if (barWidth * 15 >= TICK_MARK_MIN_SPACE) {
          minTickSpan = '15'
        } else if (barWidth * 30 >= TICK_MARK_MIN_SPACE) {
          minTickSpan = '30'
        } else if (barWidth * 60 >= TICK_MARK_MIN_SPACE) {
          minTickSpan = '60'
        } else if (barWidth * 24 * 60 >= TICK_MARK_MIN_SPACE) {
          minTickSpan = 'D'
        } else if (barWidth * 30 * 24 * 60 >= TICK_MARK_MIN_SPACE) {
          minTickSpan = 'M'
        } else if (barWidth * 360 * 24 * 60 >= TICK_MARK_MIN_SPACE) {
          minTickSpan = 'Y'
        } else {
          minTickSpan = 'Y'
        }
        break
      case '5':
        if (barWidth >= TICK_MARK_MIN_SPACE) {
          minTickSpan = '5'
        } else if (barWidth * 6 >= TICK_MARK_MIN_SPACE) {
          minTickSpan = '30'
        } else if (barWidth * 12 >= TICK_MARK_MIN_SPACE) {
          minTickSpan = '60'
        } else if (barWidth * 24 * 12 >= TICK_MARK_MIN_SPACE) {
          minTickSpan = 'D'
        } else if (barWidth * 30 * 24 * 12 >= TICK_MARK_MIN_SPACE) {
          minTickSpan = 'M'
        } else if (barWidth * 360 * 24 * 12 >= TICK_MARK_MIN_SPACE) {
          minTickSpan = 'Y'
        } else {
          minTickSpan = 'Y'
        }
        break
      case '15':
        if (barWidth >= TICK_MARK_MIN_SPACE) {
          minTickSpan = '15'
        } else if (barWidth * 2 >= TICK_MARK_MIN_SPACE) {
          minTickSpan = '30'
        } else if (barWidth * 4 >= TICK_MARK_MIN_SPACE) {
          minTickSpan = '60'
        } else if (barWidth * 24 * 60 / 15 >= TICK_MARK_MIN_SPACE) {
          minTickSpan = 'D'
        } else if (barWidth * 30 * 24 * 60 / 15 >= TICK_MARK_MIN_SPACE) {
          minTickSpan = 'M'
        } else if (barWidth * 360 * 24 * 60 / 15 >= TICK_MARK_MIN_SPACE) {
          minTickSpan = 'Y'
        } else {
          minTickSpan = 'Y'
        }
        break
      case '30':
        if (barWidth >= TICK_MARK_MIN_SPACE) {
          minTickSpan = '30'
        } else if (barWidth * 2 >= TICK_MARK_MIN_SPACE) {
          minTickSpan = '60'
        } else if (barWidth * 24 * 2 >= TICK_MARK_MIN_SPACE) {
          minTickSpan = 'D'
        } else if (barWidth * 30 * 24 * 2 >= TICK_MARK_MIN_SPACE) {
          minTickSpan = 'M'
        } else if (barWidth * 360 * 24 * 2 >= TICK_MARK_MIN_SPACE) {
          minTickSpan = 'Y'
        } else {
          minTickSpan = 'Y'
        }
        break
      case '60':
        if (barWidth >= TICK_MARK_MIN_SPACE) {
          minTickSpan = '60'
        } else if (barWidth * 24 >= TICK_MARK_MIN_SPACE) {
          minTickSpan = 'D'
        } else if (barWidth * 30 * 24 >= TICK_MARK_MIN_SPACE) {
          minTickSpan = 'M'
        } else if (barWidth * 360 * 24 >= TICK_MARK_MIN_SPACE) {
          minTickSpan = 'Y'
        } else {
          minTickSpan = 'Y'
        }
        break
      case 'D':
        if (barWidth >= TICK_MARK_MIN_SPACE) {
          minTickSpan = 'D'
        } else if (barWidth * 30 >= TICK_MARK_MIN_SPACE) {
          minTickSpan = 'M'
        } else if (barWidth * 360 >= TICK_MARK_MIN_SPACE) {
          minTickSpan = 'Y'
        } else {
          minTickSpan = 'Y'
        }
        break
      case 'W':
        if (barWidth >= TICK_MARK_MIN_SPACE) {
          minTickSpan = 'D'
        } else if (barWidth * 4 >= TICK_MARK_MIN_SPACE) {
          minTickSpan = 'M'
        } else if (barWidth * 51 >= TICK_MARK_MIN_SPACE) {
          minTickSpan = 'Y'
        } else {
          minTickSpan = 'Y'
        }
        break
      case 'M':
        if (barWidth >= TICK_MARK_MIN_SPACE) {
          minTickSpan = 'M'
        } else if (barWidth * 12 >= TICK_MARK_MIN_SPACE) {
          minTickSpan = 'Y'
        } else {
          minTickSpan = 'Y'
        }
        break
      default:
        throw 'unsupported resolution'
    }

    let passedSpan = TICK_MARK_MIN_SPACE
    for (let i = 1, len = timeBars.length; i < len; i++) {
      const bar = timeBars[i]
      let [
        prevYear,
        prevMonth,
        prevDate,
        prevHours,
      ] = (d => {
        return [
          d.getFullYear(),
          d.getMonth() + 1,
          d.getDate(),
          d.getHours(),
        ]
      })(new Date(timeBars[i - 1].time * 1000))

      let [
        curYear,
        curMonth,
        curDate,
        curHours,
        curMinutes,
      ] = (d => {
        return [
          d.getFullYear(),
          d.getMonth() + 1,
          d.getDate(),
          d.getHours(),
          d.getMinutes(),
        ]
      })(new Date(timeBars[i].time * 1000))

      passedSpan += barWidth

      const curTickMark = tickmarks[tickmarks.length - 1]

      if (prevYear !== curYear) {
        if (passedSpan < TICK_MARK_MIN_SPACE && curTickMark.type < 'Y') {
          tickmarks.pop()
          passedSpan = TICK_MARK_MIN_SPACE
        }
        if (minTickSpan < 'Y' || passedSpan >= TICK_MARK_MIN_SPACE) {
          tickmarks.push({
            bold: true,
            time: curYear.toString(),
            type: 'Y',
            x: bar.x,
          })
          passedSpan = 0
        }
      } else if (prevMonth !== curMonth) {
        if (passedSpan < TICK_MARK_MIN_SPACE && curTickMark.type < 'M') {
          tickmarks.pop()
          passedSpan = TICK_MARK_MIN_SPACE
        }
        if (minTickSpan < 'M' || passedSpan >= TICK_MARK_MIN_SPACE) {
          tickmarks.push({
            bold: true,
            time: curMonth + '月',
            type: 'M',
            x: bar.x,
          })
          passedSpan = 0
        }
      } else if (prevDate !== curDate) {
        if (passedSpan < TICK_MARK_MIN_SPACE && curTickMark.type < 'D') {
          tickmarks.pop()
          passedSpan = TICK_MARK_MIN_SPACE
        }
        if (minTickSpan < 'D' || passedSpan >= TICK_MARK_MIN_SPACE) {
          tickmarks.push({
            bold: true,
            time: curDate.toString(),
            type: 'D',
            x: bar.x,
          })
          passedSpan = 0
        }
      } else if (
        prevHours !== curHours ||
        curMinutes === 30 ||
        curMinutes % 15 === 0 ||
        curMinutes % 10 === 0 ||
        curMinutes % 5 === 0
      ) {
        let type = 1
        if (prevHours !== curHours) {
          type = 60
        } else if (curMinutes === 30) {
          type = 30
        } else if (curMinutes % 15 === 0) {
          type = 15
        } else if (curMinutes % 10 === 0) {
          type = 10
        } else if (curMinutes % 5 === 0) {
          type = 5
        }
        if (passedSpan < TICK_MARK_MIN_SPACE && +curTickMark.type < type) {
          tickmarks.pop()
          passedSpan = TICK_MARK_MIN_SPACE
        }
        if (passedSpan >= TICK_MARK_MIN_SPACE) {
          tickmarks.push({
            bold: false,
            time: pad(curHours.toString(), 2) + ':' + pad(curMinutes.toString(), 2),
            type: type.toString(),
            x: bar.x,
          })
          passedSpan = 0
        }
      }
    }

    this._tickmarks = tickmarks

    return tickmarks
  }
}
