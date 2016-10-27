import './index.less'
import * as React from 'react'
import StudyModel from '../../model/study'
import { StudyType } from '../../constant'
import ChartLayoutModel from '../../model/chartlayout'
import ChartModel from '../../model/chart'
import AxisYModel from '../../model/axisy'
import CrosshairModel from '../../model/crosshair'
import { studyConfig } from '../../datasource'

type Prop = {
  chartLayout: ChartLayoutModel,
  width: number,
  height: number,
}

type State = {
  study: '' | StudyType
}

export default class FooterBar extends React.Component<Prop, State> {
  constructor () {
    super()
    this.state = {
      study: '',
    }
  }

  public render () {
    const studies = ['MACD', 'KDJ', 'RSI', 'BOLL', 'CCI']
    return (
      <div className='chart-footerbar' style={ {width: this.props.width + 'px', height: this.props.height + 'px'} }>
        <div className='control-list' onClick={this.clickHandler.bind(this)}>
          {
            studies.map(study =>
              <a href='javascript:;'
                className={study === this.state.study ? 'active' : ''}>
                {study}
              </a>
            )
          }
        </div>
      </div>
    )
  }

  private clickHandler (ev: MouseEvent) {
    const dom = ev.target as HTMLElement

    if (dom.tagName.toUpperCase() !== 'A') {
      return
    }
    const chartLayout = this.props.chartLayout
    const oldStudy = this.state.study
    const study = dom.innerText as StudyType
    const config = studyConfig[study]

    // 先把当前的study移除
    if (this.state.study) {
      chartLayout.charts
        .some((chart, i) => {
          if (chart.graphs.some((graph, j) => {
            if (graph instanceof StudyModel && graph.studyType === oldStudy) {
              chart.graphs.splice(j, 1)
              chartLayout.study = null
              this.state.study = ''
              return true
            } else {
              return false
            }
          })) {
            if (!chart.graphs.length) {
              chartLayout.charts.splice(i, 1)
            }
            return true
          } else {
            return false
          }
        })
    }

    // 如果当前你点击的study跟原来不同，那就添加新的study
    if (oldStudy !== study) {
      if (config.isPrice) {
        const studyModel = new StudyModel(
          chartLayout.mainDatasource,
          chartLayout.mainChart,
          study as StudyType
        )
        chartLayout.mainChart.graphs.push(studyModel)
      } else {
        const mainDatasource = chartLayout.mainDatasource
        const crosshair = new CrosshairModel(chartLayout)
        const axisX = chartLayout.axisx
        const axisY = new AxisYModel(mainDatasource, crosshair)
        const chart = new ChartModel(
          chartLayout,
          mainDatasource,
          axisX, axisY,
          crosshair,
          config.isPrice
        )
        const studyModel = new StudyModel(
          chartLayout.mainDatasource,
          chart,
          study as StudyType
        )

        axisY.chart = chart
        crosshair.chart = chart

        chart.graphs = [studyModel]
        chartLayout.charts.push(chart)
      }

      chartLayout.study = study
      this.state.study = study
    }
    // 刷新视图
    this.setState(this.state)
  }
}
