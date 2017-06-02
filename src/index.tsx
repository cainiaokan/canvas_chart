import './style/normalize.css'
import './style/common.css'

import * as React from 'react'
import * as _ from 'underscore'
import { render } from 'react-dom'
import Provider from './provider'

import { getUrlParams } from './util'
import ChartLayout from './component/chartlayout'
import ChartLayoutModel from './model/chartlayout'

const paramConfig = getUrlParams()

const container = document.getElementById('chart_container')
const chartLayoutModel = new ChartLayoutModel()

function renderChart () {
  render(
    <Provider chartLayout={chartLayoutModel}>
      <ChartLayout
        height={document.documentElement.clientHeight}
        width={document.documentElement.clientWidth}
        shape={'candle'}
        {..._.defaults(window.chartConfig, paramConfig)} />
    </Provider>,
    container
  )
}

// 页面resize时重新渲染
window.onresize = renderChart

renderChart()
