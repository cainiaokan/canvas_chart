import './style/common.css'

import * as React from 'react'
import { render } from 'react-dom'

import ChartLayout from './component/chartlayout'

function renderChart () {
  render(
    <ChartLayout
      symbol={'SH000001'}
      height={document.documentElement.clientHeight}
      width={document.documentElement.clientWidth}
      shape={'candle'}
      resolution={'1'} />,
    document.getElementById('chart_container')
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
