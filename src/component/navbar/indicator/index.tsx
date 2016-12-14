import './index.less'
import '../../../style/btn.less'
import * as React from 'react'
import * as _ from 'underscore'
import ChartLayoutModel from '../../../model/chartlayout'

type Prop = {
  chartLayout: ChartLayoutModel
}

type State = {
  showIndicatorSelector?: boolean
}

const studyNames = ['MA', 'MACD', 'KDJ', 'RSI', 'BOLL', 'CCI']

export default class IndicatorSelector extends React.Component<Prop, State> {

  constructor () {
    super()
    this.state = {
      showIndicatorSelector: false,
    }
    this.showMoreIndicatorHandler = this.showMoreIndicatorHandler.bind(this)
    this.hideMoreIndicatorHandler = this.hideMoreIndicatorHandler.bind(this)
    this.indicatorSelectHandler = this.indicatorSelectHandler.bind(this)
  }

  public componentDidMount () {
    document.addEventListener('mousedown', this.hideMoreIndicatorHandler)
    document.addEventListener('touchstart', this.hideMoreIndicatorHandler)
  }

  public componentWillUnmount () {
    document.removeEventListener('mousedown', this.hideMoreIndicatorHandler)
    document.removeEventListener('touchstart', this.hideMoreIndicatorHandler)
  }

  public shouldComponentUpdate (nextProps: Prop, nextState: State) {
    return !_.isEqual(this.state, nextState)
  }

  public render () {

    return <div className='chart-indicator-selector chart-btn-group'>
      <button className='btn' onClick={this.showMoreIndicatorHandler}>指标</button>
      {
        this.state.showIndicatorSelector ?
        <ul className='more-indicator'
            onMouseDown={this.indicatorSelectHandler}
            onTouchStart={this.indicatorSelectHandler}>
          {
            studyNames.map(studyName =>
              <li data-value={studyName}>
                {studyName}
              </li>
            )
          }
        </ul> : null
      }
    </div>
  }

  private showMoreIndicatorHandler () {
    this.setState({ showIndicatorSelector: true })
  }

  private hideMoreIndicatorHandler (ev) {
    if (this.state.showIndicatorSelector) {
      if (!!ev.touches) {
        ev.preventDefault()
      }
      this.setState({ showIndicatorSelector: false })
    }
  }

  private indicatorSelectHandler (ev) {
    if (!!ev.touches) {
      ev.preventDefault()
    }
    this.props.chartLayout.addStudy(ev.target.dataset.value)
  }
}
