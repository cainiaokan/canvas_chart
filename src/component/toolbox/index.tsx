import './index.less'
import * as React from 'react'
import { SUPPORT_TOUCH } from '../../constant'
import ChartLayoutModel from '../../model/chartlayout'
import BaseToolRenderer from '../../graphic/basetool'
import LineToolRenderer from '../../graphic/linetool'

type Prop = {
  chartLayout: ChartLayoutModel
}

type State = {
  selectedIndex?: number
  selectedIndex2?: number
  showMoreTools?: boolean
}

const toolsList = [
  [['chart-tools-crosshair', '十字指针'], ['chart-tools-pointer', '箭头']],
  [['chart-tools-trend-line', '趋势线'], ['chart-tools-trend-angle', '角度趋势线']],
]

export default class ToolBox extends React.Component<Prop, State> {

  private _longTapDetectTimeout: number
  private _clickCanceled: boolean = false

  constructor () {
    super()
    this.resetTool = this.resetTool.bind(this)
    this.startHandler = this.startHandler.bind(this)
    this.endHandler = this.endHandler.bind(this)
    this.moveHandler = this.moveHandler.bind(this)
    this.showMoreTools = this.showMoreTools.bind(this)
    this.state = {
      selectedIndex: -1,
      selectedIndex2: 0,
      showMoreTools: false,
    }
  }

  public shouldComponentUpdate (nextProp: Prop, nextState: State) {
    const curState = this.state
    return curState.selectedIndex !== nextState.selectedIndex ||
           curState.selectedIndex2 !== nextState.selectedIndex2 ||
           curState.showMoreTools !== nextState.showMoreTools
  }

  public componentDidMount () {
    this.props.chartLayout.addListener('drawingtoolend', this.resetTool)
  }

  public componentDidUnmount () {
    this.props.chartLayout.removeListener('drawingtoolend',  this.resetTool)
  }

  public render () {
    let mainBtnEventHandler
    if (SUPPORT_TOUCH) {
      mainBtnEventHandler = {
        onTouchStart: this.startHandler,
        onTouchEnd: this.endHandler,
        onTouchMove: this.moveHandler,
        onTouchCancel: this.endHandler,
      }
    } else {
      mainBtnEventHandler = {
        onMouseDown: this.startHandler,
        onMouseUp: this.endHandler,
        onMouseMove: this.moveHandler,
      }
    }

    return <div className='chart-tools'>
      <ul className='chart-tools-group'>
        {
          toolsList.map((tools, i) =>
            <li className={this.state.selectedIndex === i ? 'selected' : ''}>
              <span className='chart-tools-btn'>
                <span className={`chart-tools-btn-main ${tools[this.state.selectedIndex2][0]}`}
                      title={this.state.selectedIndex === i ? tools[this.state.selectedIndex2][1] : tools[0][1]}
                      data-index={i} {...mainBtnEventHandler}></span>
                <span className='chart-tools-btn-more' onClick={() => this.showMoreTools(i)}></span>
              </span>
              {
                this.state.showMoreTools && this.state.selectedIndex === i ?
                <ul className='chart-tools-more'>
                  {
                    toolsList[i].map(tool => <li><span className={tool[0]}></span>{tool[1]}</li>)
                  }
                </ul> : null
              }
            </li>
          )
        }
      </ul>
    </div>
  }

  private startHandler (ev) {
    const selectedIndex = +ev.target.dataset.index
    this._clickCanceled = false
    this._longTapDetectTimeout = setTimeout(() => this.showMoreTools(selectedIndex), 500)
  }

  private moveHandler () {
    this._clickCanceled = true
    clearInterval(this._longTapDetectTimeout)
  }

  private endHandler (ev) {
    const index1 = +ev.target.dataset.index
    const index2 = this.state.selectedIndex2
    if (!this.state.showMoreTools && !this._clickCanceled) {
      clearInterval(this._longTapDetectTimeout)
      this.selectTool(index1, index2)
    }
  }

  private selectTool (selectedIndex, selectedIndex2) {
    this.setState({ selectedIndex, selectedIndex2 })
    if (selectedIndex === 0) {
      switch (toolsList[selectedIndex][selectedIndex2][0]) {
        case 'chart-tools-crosshair':
          this.props.chartLayout.setDefaultCursor('crosshair')
          break
        case 'chart-tools-pointer':
          this.props.chartLayout.setDefaultCursor('default')
          break
        default:
          break
      }
    } else {
      this.props.chartLayout.selectedDrawingTool =
        this.getDrawingToolByName(toolsList[selectedIndex][selectedIndex2][0])
    }
  }

  private showMoreTools (selectedIndex) {
    this.setState({ selectedIndex, showMoreTools: true })
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
