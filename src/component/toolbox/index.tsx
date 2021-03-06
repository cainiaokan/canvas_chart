import './index.less'
import * as React from 'react'
import * as _ from 'underscore'
import ChartLayoutModel from '../../model/chartlayout'
import {
  BaseToolRenderer,
  TrendAngleToolRenderer,
  TrendLineToolRenderer,
  VertLineRenderer,
  HorzLineRenderer,
  DateRangeRenderer,
} from '../../graphic/tool'

type State = {
  selectedIndex?: number
  selectedIndex2?: number[]
  showMoreIndex?: number
  showMoreTools?: boolean
}

const toolsList = [
  [['chart-tools-crosshair', '十字指针'], ['chart-tools-pointer', '箭头']],
  [
    ['chart-tools-trend-line', '趋势线'],
    ['chart-tools-trend-angle', '角度趋势线'],
    ['chart-tools-vert-line', '垂直线'],
    ['chart-tools-horz-line', '水平线'],
  ],
  [
    ['chart-tools-date-range', '日期范围'],
  ],
  [['chart-tools-eraser', '删除画线']],
]

export default class ToolBox extends React.Component<any, State> {
  public static contextTypes = {
    chartLayout: React.PropTypes.instanceOf(ChartLayoutModel),
  }

  public context: { chartLayout: ChartLayoutModel }

  private _chartLayout: ChartLayoutModel
  private _longTapDetectTimeout: number
  private _clickCanceled: boolean = false

  constructor (props: any, context: { chartLayout: ChartLayoutModel }) {
    super(props, context)
    this._chartLayout = context.chartLayout
    this.resetTool = this.resetTool.bind(this)
    this.downHandler = this.downHandler.bind(this)
    this.upHandler = this.upHandler.bind(this)
    this.moveHandler = this.moveHandler.bind(this)
    this.selectToolHandler = this.selectToolHandler.bind(this)
    this.hideMoreTools = this.hideMoreTools.bind(this)
    this.showMoreTools = this.showMoreTools.bind(this)
    this.state = {
      selectedIndex: 0,
      selectedIndex2: [0, 0, 0, 0],
      showMoreTools: false,
    }
  }

  public shouldComponentUpdate (nextProp: any, nextState: State) {
    return !_.isEqual(this.state, nextState)
  }

  public componentDidMount () {
    const chartLayout = this._chartLayout
    chartLayout.addListener('drawingtool_begin', this.resetTool)
    // chartLayout.addListener('drawingtool_remove', this.resetTool)
    document.addEventListener('mousedown', this.hideMoreTools)
    document.addEventListener('touchstart', this.hideMoreTools)
  }

  public componentWillUnmount () {
    const chartLayout = this._chartLayout
    chartLayout.removeListener('drawingtool_begin',  this.resetTool)
    // chartLayout.removeListener('drawingtool_remove', this.resetTool)
    document.removeEventListener('mousedown', this.hideMoreTools)
    document.removeEventListener('touchstart', this.hideMoreTools)
  }

  public render () {
    return <div className='chart-tools'>
      <ul className='chart-tools-group'>
        {
          toolsList.map((tools, i) =>
            <li key={i} className={this.state.selectedIndex === i ? 'selected' : ''}>
              <span className='chart-tools-btn'>
                <span className={`chart-tools-btn-main ${tools[this.state.selectedIndex2[i]][0]}`}
                      title={tools[this.state.selectedIndex2[i]][1]}
                      data-index={i}
                      onMouseDown={this.downHandler}
                      onTouchStart={this.downHandler}
                      onMouseUp={this.upHandler}
                      onTouchEnd={this.upHandler}
                      onMouseMove={this.moveHandler}
                      onTouchMove={this.moveHandler}></span>
                {
                  tools.length > 1 ?
                  <span className='chart-tools-btn-more' data-index={i} onClick={this.showMoreTools}></span> : null
                }
              </span>
              {
                this.state.showMoreTools && this.state.showMoreIndex === i ?
                <div className='chart-tools-more'>
                  {
                    toolsList[i].map((tool, j) =>
                      <a href='javascript:;'
                         key={tool[0]}
                         data-index1={i}
                         data-index2={j}
                         onMouseDown={this.selectToolHandler}
                         onTouchStart={this.selectToolHandler}>
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

  private downHandler (ev) {
    if (ev.touches) {
      ev.preventDefault()
    }
    const selectedIndex = +ev.target.dataset.index
    this._clickCanceled = false
    if (toolsList[selectedIndex].length > 1) {
      this._longTapDetectTimeout = setTimeout(() => this.showMoreTools(selectedIndex), 300)
    }
  }

  private moveHandler () {
    this._clickCanceled = true
    clearInterval(this._longTapDetectTimeout)
  }

  private upHandler (ev) {
    const selectedIndex = +ev.target.dataset.index
    const selectedIndex2 = this.state.selectedIndex2

    if (!this.state.showMoreTools && !this._clickCanceled) {
      clearInterval(this._longTapDetectTimeout)
      this.selectTool(selectedIndex, selectedIndex2[selectedIndex], !!ev.touches)
    }
  }

  private selectToolHandler (ev) {
    if (ev.touches) {
      ev.preventDefault()
    }
    this.selectTool(+ev.currentTarget.dataset.index1, +ev.currentTarget.dataset.index2, !!ev.touches)
  }

  private showMoreTools (ev: any) {
    this.setState({ showMoreIndex: typeof ev === 'object' ? +ev.target.dataset.index : ev, showMoreTools: true })
  }

  private hideMoreTools (ev) {
    if (this.state.showMoreTools) {
      if (!!ev.touches) {
        ev.preventDefault()
      }
      this.setState({ showMoreTools: false })
    }
  }

  private selectTool (index1, index2, isTouchEvent) {
    const chartLayout = this._chartLayout
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
      chartLayout.isEditMode = false
      this.resetTool()
    } else if (index1 === toolsList.length - 1) {
      chartLayout.willEraseDrawingTool = true
      this.setState({
        selectedIndex: index1,
        showMoreTools: false,
      })
      chartLayout.selectedDrawingTool = null
      chartLayout.isEditMode = false
    } else {
      chartLayout.selectedDrawingTool = this.getDrawingToolByName(toolsList[index1][index2][0])
      if (isTouchEvent) {
        chartLayout.isEditMode = true
      }
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
      case 'chart-tools-vert-line':
        return new VertLineRenderer()
      case 'chart-tools-horz-line':
        return new HorzLineRenderer()
      case 'chart-tools-date-range':
        return new DateRangeRenderer(this._chartLayout.mainDatasource)
      default:
        throw 'Can\'t find any drawing tool match name ' + toolName
    }
  }

  private resetTool () {
    const chartLayout = this._chartLayout
    this.setState({
      selectedIndex: 0,
    })
    chartLayout.willEraseDrawingTool = false
    chartLayout.selectedDrawingTool = null
  }
}
