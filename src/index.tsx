import './style/normalize.css'
import './style/common.css'

import * as React from 'react'
import { render } from 'react-dom'
import Provider from './provider'

import ChartLayout from './component/chartlayout'
import ChartLayoutModel from './model/chartlayout'

const container = document.getElementById('chart_container')
const chartLayoutModel = new ChartLayoutModel()

function renderChart () {
  render(
    <Provider chartLayout={chartLayoutModel}>
      <ChartLayout
        symbol={'sh000001'}
        height={document.documentElement.clientHeight}
        width={document.documentElement.clientWidth}
        shape={'candle'}
        // showsidebar={false}
        // showtoolbox={false}
        // shownavbar={false}
        // showfooterbar={false}
        resolution={'1'} />
    </Provider>,
    container
  )
}

// 页面resize时重新渲染
window.onresize = renderChart

renderChart()
