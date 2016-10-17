import './index.less'
import * as React from 'react'
import { ResolutionType } from '../../constant'
import SearchBox from './searchbox'
import FullScreen from './fullscreen'
import ChartLayoutModel from '../../model/chartlayout'

type Prop = {
  chartLayout: ChartLayoutModel
  resolution: ResolutionType
}

type State = {
  selected: string
}

const labels = ['分时', '日K', '5分钟', '15分钟', '30分钟', '60分钟', '周K', '月K']
const values = ['1', 'D', '5', '15', '30', '60', 'W', 'M']

export default class Navbar extends React.Component<Prop, State> {

  public componentWillMount () {
    this.state = {
      selected: this.props.resolution,
    }
  }

  public render () {
    return (
      <div className='chart-navbar'>
        <SearchBox chartLayout={this.props.chartLayout} />
        <div className='chart-btn-group' onClick={this.mouseclickhandler.bind(this)}>
          {
            values.map((val, index) => {
              let className = 'btn'
              if (this.state.selected === val) {
                className += ' active'
              }
              return <button className={className} value={val}>{labels[index]}</button>
            })
          }
        </div>
        <FullScreen />
      </div>
    )
  }

  private mouseclickhandler (ev) {
    const resolution = ev.target.value
    if (this.state.selected === resolution) {
      return
    }
    this.props.chartLayout.setResolution(resolution)
    this.setState({ selected: resolution })
  }
}
