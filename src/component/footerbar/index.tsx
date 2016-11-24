import './index.less'
import * as React from 'react'
import { StudyType } from '../../constant'
import ChartLayoutModel from '../../model/chartlayout'

type Prop = {
  chartLayout: ChartLayoutModel,
  width: number,
  height: number,
}

type State = {
  study: boolean []
}

export default class FooterBar extends React.Component<Prop, State> {
  constructor () {
    super()
    this.state = {
      study: [false, false, false, false, false],
    }
  }

  public shouldComponentUpdate (nextProps: Prop) {
    const curProp = this.props
    return curProp.chartLayout !== nextProps.chartLayout ||
           curProp.width !== nextProps.width ||
           curProp.height !== nextProps.height
  }

  public render () {
    const studies = ['MACD', 'KDJ', 'RSI', 'BOLL', 'CCI']
    return (
      <div className='chart-footerbar' style={ {width: this.props.width + 'px', height: this.props.height + 'px'} }>
        <div className='control-list' onClick={this.clickHandler.bind(this)}>
          {
            studies.map((study, i) =>
              <a href='javascript:;' data-index={i}
                className={this.state.study[i] ? 'active' : ''}>
                {study}
              </a>
            )
          }
        </div>
      </div>
    )
  }

  private clickHandler (ev: MouseEvent) {
    const dom: any = ev.target

    if (dom.tagName.toUpperCase() !== 'A') {
      return
    }
    const chartLayout = this.props.chartLayout
    const studyIndex = dom.dataset.index
    const studyName: StudyType = dom.innerHTML

    if (!this.state.study[studyIndex]) {
      this.state.study[studyIndex] = true
      chartLayout.addStudy(studyName)
    } else {
      this.state.study[studyIndex] = false
      chartLayout.removeStudy(studyName)
    }

    // 刷新视图
    this.forceUpdate()
  }
}
