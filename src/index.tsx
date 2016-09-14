import './style/common.css'
import * as React from 'react'
import * as ReactDOM from 'react-dom'

import ChartLayout from './component/chartlayout'

type State = {
  height: number
  width: number
}

class Page extends React.Component<any, State> {

  constructor () {
    super()
    const gapWidth = 10
    const ctn = document.getElementById('chart_container')
    this.state = {
      height: document.documentElement.clientHeight - gapWidth,
      width: ctn.clientWidth - gapWidth,
    }
    window.onresize = () => {
      this.setState({
        height: document.documentElement.clientHeight - gapWidth,
        width: ctn.clientWidth - gapWidth,
      })
    }
  }

  public render () {
    return <ChartLayout
      symbol={'SH000001'}
      height={this.state.height}
      width={this.state.width}
      shape={'candle'}
      resolution={'1'}
      shownavbar={true} />
  }
}

ReactDOM.render(
  <Page />,
  document.getElementById('chart_container')
)
