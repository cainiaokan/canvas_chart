import './style/common.css'
import './style/grid.less'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { ResolutionType } from './constant'

import ChartLayout from './component/chartlayout'

type State = {
  height: number
  width: number
}

class Page extends React.Component<any, State> {

  constructor () {
    super()
    const ctn = document.getElementById('chart_container')
    ctn.style.height = document.documentElement.clientHeight + 'px'
    ctn.style.width = document.documentElement.clientWidth + 'px'
    this.state = {
      height: document.documentElement.clientHeight,
      width: ctn.clientWidth,
    }
    window.onresize = () => {
      this.setState({
        height: document.documentElement.clientHeight,
        width: document.documentElement.clientWidth,
      })
      ctn.style.height = document.documentElement.clientHeight + 'px'
      ctn.style.width = document.documentElement.clientWidth + 'px'
    }
  }

  public render () {
    const width = (this.state.width - 20) / 3
    const height = (this.state.height - 15) / 2
    return <div className='grid gapping grid-col-3'>
      {
        (['1', '5', '15', 'D', 'W', 'M'] as ResolutionType[]).map(resolution =>
          <div className='grid-cell'>
            <ChartLayout
              symbol={'SH000001'}
              height={height}
              width={width}
              shape={resolution === '1' ? 'line' : 'candle'}
              resolution={resolution}
              shownavbar={false} />
          </div>
        )
      }
    </div>
  }
}

ReactDOM.render(
  <Page />,
  document.getElementById('chart_container')
)
