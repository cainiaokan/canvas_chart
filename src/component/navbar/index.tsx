import './index.less'
import * as React from 'react'
import { ResolutionType } from '../../constant'
import SearchBox from './searchbox'
import FullScreen from './fullscreen'
import ChartLayoutModel from '../../model/chartlayout'

type Prop = {
  chartLayout: ChartLayoutModel
  resolution: ResolutionType
  symbolType: string
  right?: number
}

type State = {
}

const studyLabels = ['分时', '日K', '5分钟', '15分钟', '30分钟', '60分钟', '周K', '月K']
const studyValues = ['1', 'D', '5', '15', '30', '60', 'W', 'M']

const rightLabels = ['除权', '前复权']
const rightValues = [0, 1]

export default class Navbar extends React.Component<Prop, State> {

  public static defaultProps = {
    right: 1,
    symbolType: '',
  }

  public componentWillMount () {
    this.state = {
      resolution: this.props.resolution,
      right: this.props.right,
    }
  }

  public componentShouldUpdate (nextProps: Prop) {
    const curProp = this.props
    return curProp.chartLayout !== nextProps.chartLayout ||
           curProp.resolution !== nextProps.resolution ||
           curProp.symbolType !== nextProps.symbolType ||
           curProp.right !== nextProps.right
  }

  public render () {
    return (
      <div className='chart-navbar'>
        <SearchBox chartLayout={this.props.chartLayout} />
        <div className='chart-btn-group resolution-btn-group' onClick={this.resolutionSelectHandler.bind(this)}>
          {
            studyValues.map((val, index) => {
              let className = 'btn'
              if (this.props.resolution === val) {
                className += ' active'
              }
              return <button className={className} value={val}>{studyLabels[index]}</button>
            })
          }
        </div>
        <FullScreen />
        {
          this.props.symbolType === 'stock' ?
          <div className='chart-btn-group right-btn-group' onClick={this.rightSelectHandler.bind(this)}>
          {
            rightValues.map((val, index) => {
              let className = 'btn'
              if (this.props.right === val) {
                className += ' active'
              }
              return <button className={className} value={val}>{rightLabels[index]}</button>
            })
          }
          </div> : null
        }
      </div>
    )
  }

  private resolutionSelectHandler (ev) {
    const resolution = ev.target.value
    if (this.props.resolution !== resolution) {
      this.props.chartLayout.setResolution(resolution)
    }
  }

  private rightSelectHandler (ev) {
    const right = +ev.target.value
    if (this.props.right !== right) {
      this.props.chartLayout.setRight(right)
    }
  }
}
