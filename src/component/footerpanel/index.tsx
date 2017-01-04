import './index.less'
import '../../style/btn.less'
import * as React from 'react'
import * as _ from 'underscore'
import ChartLayoutModel from '../../model/chartlayout'

type Prop = {
  chartLayout: ChartLayoutModel
  width: number
}

type State = {
  folded?: boolean
  activeIndex?: number
}

const TAB_CONFIG = ['自选股', '最近访问', '板块列表', '大盘综合']

export default class ControlBar extends React.Component<Prop, State> {
  constructor () {
    super()
    this.state = {
      folded: true,
      activeIndex: -1,
    }
    this.clickHandler = this.clickHandler.bind(this)
  }

  public shouldComponentUpdate (nextProps: Prop, nextState: State) {
    const curProps = this.props
    return curProps.width !== nextProps.width ||
           !_.isEqual(this.state, nextState)
  }

  public render () {
    return (
      <div className='chart-footer-panel' style={ {width: this.props.width + 'px' } }>
        <div className={`chart-btn-group ${this.state.folded ? 'folded' : ''}`}>
          {
            TAB_CONFIG.map((label, i) =>
              <button
                key={i}
                className={`btn ${this.state.activeIndex === i ? 'active' : ''}`}
                data-index={i}
                onClick={this.clickHandler}>{label}</button>
            )
          }
        </div>
        {
          !this.state.folded ?
          <div className='panel-board'>
          </div> : null
        }
      </div>
    )
  }

  private clickHandler (ev) {
    const index = +ev.target.dataset.index
    const newFoleded = this.state.activeIndex === index ? true : false
    const newActiveIndex = newFoleded ? -1 : index
    this.props.chartLayout.emit('footer_panel_toggle', newFoleded)
    this.setState({
      folded: newFoleded,
      activeIndex: newActiveIndex,
    })
  }
}