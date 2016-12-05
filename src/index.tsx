import './style/common.css'

import * as React from 'react'
import { render } from 'react-dom'

import ChartLayout from './component/chartlayout'

function renderChart () {
  render(
    <ChartLayout
      symbol={'SH000001'}
      // symbol={'000516'}
      height={document.documentElement.clientHeight}
      width={document.documentElement.clientWidth}
      shape={'candle'}
      resolution={'1'}
      shownavbar={true}
      showfooterbar={true}
      showsidebar={true} />,
    document.getElementById('chart_container')
  )
}

// 页面resize时重新渲染
window.onresize = renderChart

// 避免触屏设备拖拽页面
document.ontouchmove = ev => ev.preventDefault()

// touchend时组织默认事件，避免触屏设备中双击放大页面
// 直接出发click时间，同时避免触屏设备click事件的300ms延迟
document.ontouchend = ev => {
  ev.preventDefault()
  ev.target.dispatchEvent(new MouseEvent('click', {
    'view': window,
    'bubbles': true,
    'cancelable': true,
  }))
}

renderChart()
