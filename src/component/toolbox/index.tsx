import './index.less'
import * as React from 'react'
import ChartLayoutModel from '../../model/chartlayout'

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
  public refs: {
    [propName: string]: any
  }

  constructor () {
    super()
    this.state = {
      selectedIndex: -1,
      selectedIndex2: 0,
    }
  }

  public componentShouldUpdate (nextProps: Prop) {
    const curProp = this.props
    return curProp.chartLayout !== nextProps.chartLayout
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
    }
  }
}
