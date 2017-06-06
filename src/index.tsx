import './style/normalize.css'
import './style/common.css'

import * as React from 'react'
import * as _ from 'underscore'
import Spinner = require('spin')
import { render } from 'react-dom'
import Provider from './provider'
import { getUrlParams } from './util'
import ChartLayout from './component/chartlayout'
import ChartLayoutModel from './model/chartlayout'
import ChartModel from './model/chart'
import AxisXModel from './model/axisx'
import AxisYModel from './model/axisy'
import StockModel from './model/stock'
import DealPointModel from './model/dealpoint'
import CrosshairModel from './model/crosshair'
import { StockDatasource, StaticDatasource, IDBar, getServerTime } from './datasource'

const chartConfig = window.chartConfig || {}
const paramConfig = getUrlParams()
const container = document.getElementById('chart_container')
const chartLayout = new ChartLayoutModel()

Object.keys(paramConfig).forEach(key => {
  try {
    paramConfig[key] = JSON.parse(paramConfig[key])
  } catch (ex) {
    // do nothing
  }
})

_.defaults(chartConfig, paramConfig, {
  symbol: 'sh000001',
  resolution: chartLayout.readFromLS('qchart.resolution') || '1',
  shape: 'candle',
  right: 1,
  closetime: null,
})

const mainDatasource = new StockDatasource(
  chartConfig.symbol, chartConfig.resolution,
  chartConfig.right,
  chartConfig.closetime,
)

chartLayout.mainDatasource = mainDatasource

const spinner = new Spinner({}).spin(document.documentElement)

function renderChart () {
  render(
    <Provider chartLayout={chartLayout}>
      <ChartLayout
        height={document.documentElement.clientHeight}
        width={document.documentElement.clientWidth}
        shape={'candle'}
        {...chartConfig} />
    </Provider>,
    container
  )
}

// 页面resize时重新渲染
window.onresize = renderChart

Promise.all([
  getServerTime(),
  mainDatasource.resolveSymbol(chartConfig.symbol),
])
.then(resolves => {
  mainDatasource.timeDiff = ~~(Date.now() / 1000) - +resolves[0]
  const { resolution } = mainDatasource
  const crosshair = new CrosshairModel(chartLayout)
  const axisX = new AxisXModel(mainDatasource, crosshair)
  const axisY = new AxisYModel(mainDatasource, crosshair)
  const chart = new ChartModel(
    chartLayout,
    mainDatasource,
    axisX, axisY,
    crosshair,
    true,
    true
  )
  axisY.chart = chart
  crosshair.chart = chart
  chartLayout.axisx = axisX
  chart.addGraph(
    new StockModel(
      mainDatasource, chart,
      true, true, false,
      resolution === '1' && chartConfig.shape === 'candle' ? 'line' : chartConfig.shape,
      { lineWidth: 2 }
    )
  )

  // tob平台显示买卖点
  if (chartConfig.buy_sell_list) {
    let data = chartConfig.buy_sell_list
    delete chartConfig.buy_sell_list
    const ds = new StaticDatasource<IDBar>(resolution, data)
    const dealpoint = new DealPointModel(ds, chart)
    chart.addGraph(dealpoint)
  }

  chartLayout.addChart(chart)
  chartLayout.resetStudies()
  chartLayout.addPatterns()

  renderChart()
  spinner.stop()
  history.replaceState(null, document.title, `/?symbol=${mainDatasource.symbol}&resolution=${resolution}`)
})
