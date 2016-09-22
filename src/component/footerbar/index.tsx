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
  chartLayout: ChartLayoutModel
}

type State = {
}

export default class FooterBar extends React.Component<Prop, State> {
  constructor () {
    super()
  }

  public componentWillMount () {
    this.state = {}
  }

  public render () {
    const studies = ['MACD', 'BOLL', 'KDJ']
    return (
      <div className='chart-footerbar'>
        <div className='control-list'>
          {studies.map(study => <a onClick={this.clickHandler.bind(this)}>{study}</a>)}
        </div>
      </div>
    )
  }

  private clickHandler (ev: MouseEvent) {
    const chartLayout = this.props.chartLayout
    const dom = ev.target as HTMLElement
    const study = dom.innerText
    const config = studyConfig[study]
    Array.prototype.slice.call(dom.parentElement.querySelectorAll('a'))
      .filter(ele => ele !== dom)
      .forEach(ele => (ele as HTMLElement).classList.remove('active'))
    dom.classList.toggle('active')

    if (chartLayout.study) {
      chartLayout.charts
        .some((chart, i) => {
          if (chart.graphs.some((graph, j) => {
            if (graph instanceof StudyModel && graph.studyType === chartLayout.study) {
              chart.graphs.splice(j, 1)
              chartLayout.study = null
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

    if (dom.classList.contains('active')) {
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
    }
    chartLayout.study = study as StudyType
    chartLayout.emit('studychange')
  }
}
