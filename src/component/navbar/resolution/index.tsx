import './index.less'
import '../../../style/btn.less'
import '../../../style/popup_menu.less'

import * as React from 'react'
import * as _ from 'underscore'
import ChartLayoutModel from '../../../model/chartlayout'

type State = {
  showMoreResolution?: boolean
}

const moreResolution = ['5', '15', '30', '60', 'D', 'W', 'M']

const resolutionConfig = {
  '1': '分时',
  '5': '5分钟',
  '15': '15分钟',
  '30': '30分钟',
  '60': '60分钟',
  'D': '日K',
  'W': '周K',
  'M': '月K',
}

export default class ResolutionOption extends React.Component<any, State> {
  public static contextTypes = {
    chartLayout: React.PropTypes.instanceOf(ChartLayoutModel),
  }

  public context: { chartLayout: ChartLayoutModel }

  private _resolution = 'D'
  private _chartLayout: ChartLayoutModel

  constructor (props: any, context: { chartLayout: ChartLayoutModel }) {
    super(props, context)
    this._chartLayout = context.chartLayout
    this.state = {
      showMoreResolution: false,
    }
    this.updateView = this.updateView.bind(this)
    this.resolutionSelectHandler = this.resolutionSelectHandler.bind(this)
    this.showMoreResolutionHandler = this.showMoreResolutionHandler.bind(this)
    this.hideMoreResolutionHandler = this.hideMoreResolutionHandler.bind(this)
  }

  public componentDidMount () {
    this._chartLayout.addListener('resolution_change', this.updateView)
    document.addEventListener('mousedown', this.hideMoreResolutionHandler)
    document.addEventListener('touchstart', this.hideMoreResolutionHandler)
  }

  public componentWillUnmount () {
    this._chartLayout.removeListener('resolution_change', this.updateView)
    document.removeEventListener('mousedown', this.hideMoreResolutionHandler)
    document.removeEventListener('touchstart', this.hideMoreResolutionHandler)
  }

  public shouldComponentUpdate (nextProps: any, nextState: State) {
    return !_.isEqual(this.state, nextState)
  }

  public render () {
    const selectedResolution = this._chartLayout.mainDatasource.resolution

    if (selectedResolution !== '1') {
      this._resolution = selectedResolution
    }

    return <div className='chart-resolution chart-btn-group'>
        <a href='javascript:;'
           className={`btn ${selectedResolution === '1' ? 'active' : ''}`}
           data-value={1}
           onClick={this.resolutionSelectHandler}>
          {resolutionConfig['1']}
        </a>
        <a href='javascript:;'
           className={`btn ${this._resolution === selectedResolution ? 'active' : ''}`}
           data-value={this._resolution}
           onClick={this.resolutionSelectHandler}>
          {resolutionConfig[this._resolution]}
        </a>
        <a href='javascript:;'
           className='btn btn-more'
           onClick={this.showMoreResolutionHandler}>
           <i></i>
        </a>
        {
          this.state.showMoreResolution ?
          <ul className='popup-menu'>
            {
              moreResolution.map(resolution =>
                <li key={resolution} data-value={resolution}
                    onMouseDown={this.resolutionSelectHandler}
                    onTouchStart={this.resolutionSelectHandler}>
                  {resolutionConfig[resolution]}
                </li>
              )
            }
          </ul> : null
        }
      </div>
  }

  private updateView () {
    this.forceUpdate()
  }

  private resolutionSelectHandler (ev) {
    if (!!ev.touches) {
      ev.preventDefault()
    }

    const chartLayout = this._chartLayout
    const resolution = ev.target.dataset.value
    if (chartLayout.mainDatasource.resolution !== resolution) {
      chartLayout.saveToLS('qchart.resolution', resolution)
      chartLayout.setResolution(resolution)
      this.forceUpdate()
    }
  }

  private showMoreResolutionHandler () {
    this.setState({ showMoreResolution: true })
  }

  private hideMoreResolutionHandler (ev) {
    if (this.state.showMoreResolution) {
      if (!!ev.touches) {
        ev.preventDefault()
      }
      this.setState({ showMoreResolution: false })
    }
  }
}
