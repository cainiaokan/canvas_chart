import './style/common.css'
import * as React from 'react'
import { render } from 'react-dom'

import ChartLayout from './component/chartlayout'

type State = {
  height: number
  width: number
}

class Page extends React.Component<any, State> {

  constructor () {
    super()
    this.state = {
      height: document.documentElement.clientHeight,
      width: document.documentElement.clientWidth,
    }
    window.onresize = () => {
      this.setState({
        height: document.documentElement.clientHeight,
        width: document.documentElement.clientWidth,
      })
    }
    document.ontouchmove = this.preventDefaultInteraction
    document.ondblclick = this.preventDefaultInteraction
  }

  public componentWillUnmount () {
    document.ontouchmove = null
    document.ontouchend = null
    window.onresize = null
  }

  public render () {
    return <ChartLayout
      symbol={'SH000001'}
      // symbol={'000516'}
      height={this.state.height}
      width={this.state.width}
      shape={'candle'}
      resolution={'1'}
      shownavbar={true}
      showfooterbar={true}
      showsidebar={true} />
  }

  private preventDefaultInteraction (ev) {
    ev.preventDefault()
  }
}

render(
  <Page />,
  document.getElementById('chart_container')
)
