import './index.less'
import '../../style/btn.less'
import * as React from 'react'
import * as _ from 'underscore'
import ChartLayoutModel, { preferredTimeRange } from '../../model/chartlayout'
import GoToDate from './gotodate'

type Prop = {
  chartLayout: ChartLayoutModel
  width: number
  height: number
}

type State = {
}

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
              <a key={range} className='mini-btn' href='javascript:;' data-value={range} onClick={this.timeRangeClickHandler}>{range}</a>
            )
          }
          <GoToDate chartLayout={this.props.chartLayout} />
        </div>
      </div>
    )
  }

  private timeRangeClickHandler (ev) {
    const range = ev.target.dataset.value
    this.props.chartLayout.setTimeRange(range)
  }
}
