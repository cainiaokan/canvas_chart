import './style/normalize.css'
import './style/common.css'

import * as React from 'react'
import * as _ from 'underscore'
import { render } from 'react-dom'
import Provider from './provider'

import { getParameterByName } from './util'
import ChartLayout from './component/chartlayout'
import ChartLayoutModel from './model/chartlayout'

const defaultConfig = {
    symbol: 'sh000001',
    resolution: '1',
    showsidebar: true,
    showtoolbox: true,
    shownavbar: true,
    showfooterpanel: true,
}

const chartConfig = window.chartConfig

const paramConfig = {
  symbol: getParameterByName('symbol'),
  resolution: getParameterByName('resolution'),
  showsidebar: getParameterByName('showsidebar'),
  showtoolbox: getParameterByName('showtoolbox'),
  shownavbar: getParameterByName('shownavbar'),
  showfooterpanel: getParameterByName('showfooterbar'),
}

_.defaults(chartConfig, defaultConfig, paramConfig)

const container = document.getElementById('chart_container')
const chartLayoutModel = new ChartLayoutModel()

function renderChart () {
  render(
    <Provider chartLayout={chartLayoutModel}>
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

renderChart()
