import './index.less'
import * as React from 'react'
import * as _ from 'underscore'
import { SUPPORT_TOUCH, START_EVENT } from '../../constant'
import ChartLayoutModel from '../../model/chartlayout'
import {
  BaseToolRenderer,
  TrendAngleToolRenderer,
  TrendLineToolRenderer,
} from '../../graphic/tool'

type Prop = {
  chartLayout: ChartLayoutModel
}

type State = {
  selectedIndex?: number
  selectedIndex2?: number[]
  showMoreTools?: boolean
}

const toolsList = [
  [['chart-tools-crosshair', '十字指针'], ['chart-tools-pointer', '箭头']],
  [['chart-tools-trend-line', '趋势线'], ['chart-tools-trend-angle', '角度趋势线']],
  [['chart-tools-eraser', '删除画线']],
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
    this.selectToolHandler = this.selectToolHandler.bind(this)
    this.hideMoreTools = this.hideMoreTools.bind(this)
    this.showMoreTools = this.showMoreTools.bind(this)
    this.state = {
      selectedIndex: 0,
      selectedIndex2: [0, 0, 0],
      showMoreTools: false,
    }
  }

  public shouldComponentUpdate (nextProp: Prop, nextState: State) {
    return !_.isEqual(this.state, nextState)
  }

  public componentDidMount () {
    this.props.chartLayout.addListener('drawingtoolend', this.resetTool)
    this.props.chartLayout.addListener('removedrawingtool', this.resetTool)
    document.addEventListener(START_EVENT, this.hideMoreTools)
  }

  public componentDidUnmount () {
    this.props.chartLayout.removeListener('drawingtoolend',  this.resetTool)
    this.props.chartLayout.removeListener('removedrawingtool', this.resetTool)
    document.removeEventListener(START_EVENT, this.hideMoreTools)
  }

  public render () {
    let mainBtnEventHandler
    let moreBtnEventHandler
    if (SUPPORT_TOUCH) {
      mainBtnEventHandler = {
        onTouchStart: this.startHandler,
        onTouchEnd: this.endHandler,
        onTouchMove: this.moveHandler,
        onTouchCancel: this.endHandler,
      }
      moreBtnEventHandler = {
        onTouchStart: this.selectToolHandler,
      }
    } else {
      mainBtnEventHandler = {
        onMouseDown: this.startHandler,
        onMouseUp: this.endHandler,
        onMouseMove: this.moveHandler,
      }
      moreBtnEventHandler = {
        onMouseDown: this.selectToolHandler,
      }
    }

    return <div className='chart-tools'>
      <ul className='chart-tools-group'>
        {
          toolsList.map((tools, i) =>
            <li className={this.state.selectedIndex === i ? 'selected' : ''}>
              <span className='chart-tools-btn'>
                <span className={`chart-tools-btn-main ${tools[this.state.selectedIndex2[i]][0]}`}
                      title={tools[this.state.selectedIndex2[i]][1]}
                      data-index={i} {...mainBtnEventHandler}></span>
                {
                  tools.length > 1 ?
                  <span className='chart-tools-btn-more' data-index={i} onClick={this.showMoreTools}></span> : null
                }
              </span>
              {
                this.state.showMoreTools && this.state.selectedIndex === i ?
                <div className='chart-tools-more'>
                  {
                    toolsList[i].map((tool, j) =>
                      <a href='javascript:;' data-index1={i} data-index2={j} {...moreBtnEventHandler}>
                        <span className={tool[0]}></span>{tool[1]}
                      </a>
                    )
                  }
                </div> : null
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
    if (toolsList[selectedIndex].length > 1) {
      this._longTapDetectTimeout = setTimeout(() => this.showMoreTools(selectedIndex), 500)
    }
  }

  private moveHandler () {
    this._clickCanceled = true
    clearInterval(this._longTapDetectTimeout)
  }

  private endHandler (ev) {
    const selectedIndex = +ev.target.dataset.index
    const selectedIndex2 = this.state.selectedIndex2

    if (!this.state.showMoreTools && !this._clickCanceled) {
      clearInterval(this._longTapDetectTimeout)
      this.selectTool(selectedIndex, selectedIndex2[selectedIndex])
    }
  }

  private selectToolHandler (ev) {
    this.selectTool(+ev.currentTarget.dataset.index1, +ev.currentTarget.dataset.index2)
  }

  private showMoreTools (ev: any) {
    this.setState({ selectedIndex: typeof ev === 'object' ? +ev.target.dataset.index : ev, showMoreTools: true })
  }

  private hideMoreTools (ev) {
    this.setState({ showMoreTools: false })
  }

  private selectTool (index1, index2) {
    const chartLayout = this.props.chartLayout
    const selectedIndex2 = this.state.selectedIndex2
    selectedIndex2[index1] = index2

    chartLayout.willEraseDrawingTool = false

    if (index1 === 0) {
      switch (toolsList[index1][index2][0]) {
        case 'chart-tools-crosshair':
          chartLayout.setDefaultCursor('crosshair')
          break
        case 'chart-tools-pointer':
          chartLayout.setDefaultCursor('default')
          break
        default:
          break
      }
      this.resetTool()
    } else if (index1 === toolsList.length - 1) {
      chartLayout.willEraseDrawingTool = true
      this.setState({
        selectedIndex: index1,
        showMoreTools: false,
      })
      chartLayout.selectedDrawingTool = null
    } else {
      chartLayout.selectedDrawingTool = this.getDrawingToolByName(toolsList[index1][index2][0])
      this.setState({
        selectedIndex: index1,
        selectedIndex2,
        showMoreTools: false,
      })
    }
  }

  private getDrawingToolByName (toolName: string): BaseToolRenderer {
    switch (toolName) {
      case 'chart-tools-trend-line':
        return new TrendLineToolRenderer()
      case 'chart-tools-trend-angle':
        return new TrendAngleToolRenderer()
      default:
        throw 'Can\'t find any drawing tool match name ' + toolName
    }
  }

  private resetTool () {
    const chartLayout = this.props.chartLayout
    this.setState({
      selectedIndex: 0,
    })
    chartLayout.willEraseDrawingTool = false
    chartLayout.selectedDrawingTool = null
  }
}
