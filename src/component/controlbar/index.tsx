import './index.less'
import '../../style/btn.less'
import * as React from 'react'
import * as _ from 'underscore'
import ChartLayoutModel, { preferredTimeRange } from '../../model/chartlayout'

type Prop = {
  width: number
}

export default class ControlBar extends React.Component<Prop, any> {
  public static contextTypes = {
    chartLayout: React.PropTypes.instanceOf(ChartLayoutModel),
  }

  public context: { chartLayout: ChartLayoutModel }

  private _chartLayout: ChartLayoutModel

  constructor (props: Prop, context: { chartLayout: ChartLayoutModel }) {
    super(props, context)
    this._chartLayout = context.chartLayout
    this.state = {}
    this.openDialogHandler = this.openDialogHandler.bind(this)
    this.timeRangeClickHandler = this.timeRangeClickHandler.bind(this)
  }

  public shouldComponentUpdate (nextProps: Prop) {
    return !_.isEqual(this.props, nextProps)
  }

  public render () {
    return (
      <div className='chart-footerbar' style={ {width: this.props.width + 'px'} }>
        <div className='control-list'>
          {
            preferredTimeRange.map(range =>
              <a key={range}
                 className='mini-btn'
                 href='javascript:;'
                 data-value={range}
                 onClick={this.timeRangeClickHandler}>{range}</a>
            )
          }
          <a className='mini-btn' href='javascript:;' onClick={this.openDialogHandler}>定位时间</a>
        </div>
      </div>
    )
  }

  private timeRangeClickHandler (ev) {
    const range = ev.target.dataset.value
    this._chartLayout.setTimeRange(range)
  }

  private openDialogHandler () {
    this._chartLayout.toggleGoToDate(true)
  }
}
