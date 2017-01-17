import './index.less'

import * as React from 'react'
import ChartLayoutModel from '../../../model/chartlayout'

export default class RecentVisit extends React.Component<any, any> {
  public static contextTypes = {
    chartLayout: React.PropTypes.instanceOf(ChartLayoutModel),
  }

  public context: { chartLayout: ChartLayoutModel }

  public refs: {
    body: HTMLDivElement
  }

  private _chartLayout: ChartLayoutModel

  constructor (props: any, context: { chartLayout: ChartLayoutModel }) {
    super(props, context)
    this._chartLayout = context.chartLayout
    this.clickHandler = this.clickHandler.bind(this)
  }

  public shouldComponentUpdate () {
    return false
  }

  public render () {
    return (
      <div className='chart-recent-visit'>
      </div>
    )
  }

  private clickHandler (ev) {
  }
}
