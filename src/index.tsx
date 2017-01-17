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
        symbol={'SH000001'}
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

// 避免触屏设备拖拽页面
document.ontouchmove = ev => ev.preventDefault()

let lastDownTime = null

// touchend时组织默认事件，避免触屏设备中双击放大页面
document.ontouchend = ev => {
  if (lastDownTime && ev.timeStamp - lastDownTime < 300) {
    ev.preventDefault()
  }
  lastDownTime = ev.timeStamp
}

renderChart()
