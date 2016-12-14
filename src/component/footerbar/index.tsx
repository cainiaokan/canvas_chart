import './index.less'
import '../../style/btn.less'
import * as React from 'react'
import * as _ from 'underscore'
import * as moment from 'moment'
import ChartLayoutModel from '../../model/chartlayout'
import { INITIAL_OFFSET } from '../../model/axisx'
import { ResolutionType, OPEN_TIME_RANGE, OPEN_DAYS } from '../../constant'
import GoToDate from './gotodate'

type Prop = {
  chartLayout: ChartLayoutModel
  width: number
  height: number
}

type State = {
}

const preferredTimeRange = ['1天', '5天', '1月', '1年', '全部']
const perferredResolution = ['1', '5', '30', 'D', 'M'] as ResolutionType[]

export default class FooterBar extends React.Component<Prop, State> {
  constructor () {
    super()
    this.state = {}
    this.timeRangeClickHandler = this.timeRangeClickHandler.bind(this)
  }

  public shouldComponentUpdate (nextProps: Prop, nextState: State) {
    const curProps = this.props
    return curProps.width !== nextProps.width ||
           curProps.height !== nextProps.height ||
           !_.isEqual(this.state, nextState)
  }

  public render () {
    return (
      <div className='chart-footerbar' style={ {width: this.props.width + 'px', height: this.props.height + 'px'} }>
        <div className='control-list'>
          {
            preferredTimeRange.map(range =>
              <a className='mini-btn' href='javascript:;' data-value={range} onClick={this.timeRangeClickHandler}>{range}</a>
            )
          }
          <GoToDate chartLayout={this.props.chartLayout} />
        </div>
      </div>
    )
  }

  private timeRangeClickHandler (ev) {
    const range = ev.target.dataset.value
    const resolution = perferredResolution[preferredTimeRange.indexOf(range)]
    const chartLayout = this.props.chartLayout
    const mainDatasource = chartLayout.mainDatasource
    const axisX = chartLayout.axisx

    const openTime = OPEN_TIME_RANGE[0][0]
    const closeTime = OPEN_TIME_RANGE[OPEN_TIME_RANGE.length - 1][1]
    const thisMoment = moment(mainDatasource.now() * 1000)
    const openMoment = moment({ hour: openTime[0], minute: openTime[1]})
    const closeMoment = moment({ hour: closeTime[0], minute: closeTime[1]})

    const toTime = ~~(thisMoment.toDate().getTime() / 1000)
    const fromTime = ~~(function (): number {
      switch (range) {
        case '1天':
          return thisMoment.isAfter(closeMoment) ?
            openMoment.toDate().getTime() :
            openMoment.subtract(1, 'days').toDate().getTime()
        case '5天':
          let retMoment = thisMoment.isAfter(closeMoment) ?
            openMoment :
            openMoment.subtract(1, 'days')
          let loop = 4
          while (loop--) {
            retMoment.subtract(1, 'days')
            if (OPEN_DAYS.indexOf(retMoment.day()) === -1) {
              loop++
            }
          }
          return retMoment.toDate().getTime()
        case '1月':
          return openMoment.subtract(1, 'months').toDate().getTime()
        case '1年':
          return openMoment.subtract(1, 'years').toDate().getTime()
        case '全部':
          return 0
        default:
          throw 'unsupport range type'
      }
    }() / 1000)

    if (resolution !== chartLayout.mainDatasource.resolution) {
      chartLayout.setResolution(resolution)
    }

    const fromIndex = mainDatasource.search(fromTime)

    if (fromIndex === -1) {
      mainDatasource.loadTimeRange(fromTime, toTime)
        .then(bars => {
          if (bars.length) {
            axisX.barWidth = (axisX.width - INITIAL_OFFSET) / bars.length
          } else {
            // 加载不到数据说明有停牌的可能因此之间返回
            return
          }
        })
    } else {
      axisX.barWidth = (axisX.width - INITIAL_OFFSET) / (mainDatasource.loaded() -  fromIndex)
    }

    axisX.resetOffset()
  }
}
