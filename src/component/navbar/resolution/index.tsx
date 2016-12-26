import './index.less'
import '../../../style/btn.less'
import * as React from 'react'
import * as _ from 'underscore'
import { ResolutionType } from '../../../constant'
import ChartLayoutModel from '../../../model/chartlayout'

type Prop = {
  chartLayout: ChartLayoutModel
  resolution: ResolutionType
}

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

export default class ResolutionOption extends React.Component<Prop, State> {
  private resolution = 'D'

  constructor () {
    super()
    this.state = {
      showMoreResolution: false,
    }
    this.resolutionSelectHandler = this.resolutionSelectHandler.bind(this)
    this.showMoreResolutionHandler = this.showMoreResolutionHandler.bind(this)
    this.hideMoreResolutionHandler = this.hideMoreResolutionHandler.bind(this)
  }

  public componentDidMount () {
    document.addEventListener('mousedown', this.hideMoreResolutionHandler)
    document.addEventListener('touchstart', this.hideMoreResolutionHandler)
  }

  public componentWillUnmount () {
    document.removeEventListener('mousedown', this.hideMoreResolutionHandler)
    document.removeEventListener('touchstart', this.hideMoreResolutionHandler)
  }

  public shouldComponentUpdate (nextProps: Prop, nextState: State) {
    const curProp = this.props
    return curProp.resolution !== nextProps.resolution ||
           !_.isEqual(this.state, nextState)
  }

  public render () {
    const selectedResolution = this.props.resolution

    if (selectedResolution !== '1') {
      this.resolution = selectedResolution
    }

    return <div className='chart-resolution chart-btn-group'>
        <a href='javascript:;'
           className={`btn ${selectedResolution === '1' ? 'active' : ''}`}
           data-value={1}
           onClick={this.resolutionSelectHandler}>
          {resolutionConfig['1']}
        </a>
        <a href='javascript:;'
           className={`btn ${this.resolution === selectedResolution ? 'active' : ''}`}
           data-value={this.resolution}
           onClick={this.resolutionSelectHandler}>
          {resolutionConfig[this.resolution]}
        </a>
        <a href='javascript:;'
           className='btn btn-more'
           onClick={this.showMoreResolutionHandler}>
           <i></i>
        </a>
        {
          this.state.showMoreResolution ?
          <ul className='more-resolution'>
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

  private resolutionSelectHandler (ev) {
    if (!!ev.touches) {
      ev.preventDefault()
    }
    const resolution = ev.target.dataset.value
    if (this.props.resolution !== resolution) {
      this.props.chartLayout.setResolution(resolution)
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
