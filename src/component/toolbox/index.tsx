import './index.less'
import * as React from 'react'
import ChartLayoutModel from '../../model/chartlayout'
import BaseToolRenderer from '../../graphic/basetool'
import LineToolRenderer from '../../graphic/linetool'

type Prop = {
  chartLayout: ChartLayoutModel
}

type State = {
  selectedIndex?: number
  selectedIndex2?: number
}

const toolsList = [
  ['chart-tools-trend-line', 'chart-tools-trend-angle'],
]

export default class ToolBox extends React.Component<Prop, State> {
  constructor () {
    super()
    this.resetTool = this.resetTool.bind(this)
    this.state = {
      selectedIndex: -1,
      selectedIndex2: 0,
    }
  }

  public componentShouldUpdate () {
    return false
  }

  public componentDidMount () {
    this.props.chartLayout.addListener('drawingtoolend', this.resetTool)
  }

  public componentDidUnmount () {
    this.props.chartLayout.removeListener('drawingtoolend',  this.resetTool)
  }

  public render () {
    return <div className='chart-tools'>
      <ul className='chart-tools-group'>
        {
          toolsList.map((tools, i) =>
            <li className={this.state.selectedIndex === i ? 'selected' : ''}>
              <span className='chart-tools-btn'>
                <span className={`chart-tools-btn-main ${tools[this.state.selectedIndex2]}`}
                      data-index={i}
                      onClick={this.selectToolHandler.bind(this)}></span>
                <span className='chart-tools-btn-more'></span>
              </span>
            </li>
          )
        }
      </ul>
    </div>
  }

  private selectToolHandler (ev) {
    const index = +ev.target.dataset.index
    if (index !== this.state.selectedIndex) {
      this.setState({
        selectedIndex: index,
        selectedIndex2: 0,
      })
      this.props.chartLayout.selectedDrawingTool = this.getDrawingToolByName(toolsList[index][0])
    }
  }

  private getDrawingToolByName (toolName: string): BaseToolRenderer {
    switch (toolName) {
      case 'chart-tools-trend-line':
        return new LineToolRenderer()
      case 'chart-tools-trend-angle':
        return null
      default:
        throw 'Can\'t find any drawing tool match name ' + toolName
    }
  }

  private resetTool () {
    this.setState({
      selectedIndex: -1,
      selectedIndex2: 0,
    })
  }
}
