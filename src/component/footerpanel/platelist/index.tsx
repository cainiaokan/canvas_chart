import './index.less'

import * as React from 'react'
import ChartLayoutModel from '../../../model/chartlayout'

type Prop = {
  chartLayout: ChartLayoutModel
}

export default class MainBoard extends React.Component<Prop, any> {
  constructor () {
    super()
    this.clickHandler = this.clickHandler.bind(this)
  }

  public shouldComponentUpdate () {
    return false
  }

  public render () {
    return (
      <div className='chart-plate-list'>
      </div>
    )
  }

  private clickHandler (ev) {
  }
}
