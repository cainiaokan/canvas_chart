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

window.onresize = renderChart
document.ontouchmove = ev => ev.preventDefault()

renderChart()
