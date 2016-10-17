import './index.less'
import * as React from 'react'
import ChartLayoutModel from '../../model/chartlayout'

type Prop = {
  chartLayout: ChartLayoutModel
  height: number
  width: number
}

export default class Sidebar extends React.Component<Prop, any> {

  public render () {
    return <div className='chart-sidebar' style={ {
      height: this.props.height,
      width: this.props.width,
    } }>
      <a href='javascript:;' className='sidebar-folding-btn' onClick={this.foldingBtnClickHandler.bind(this)}></a>
    </div>
  }

  private foldingBtnClickHandler (ev) {
    if (ev.target.classList.contains('folded')) {
      ev.target.classList.remove('folded')
      this.props.chartLayout.emit('sidebarchange', 'unfold')
    } else {
      ev.target.classList.add('folded')
      this.props.chartLayout.emit('sidebarchange', 'fold')
    }
  }
}
