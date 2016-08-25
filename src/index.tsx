import './style/common.css'
import * as _ from 'underscore'
import * as React from 'react'
import * as ReactDOM from 'react-dom'

import ChartLayout from './component/chartlayout'

interface IState {
  height: number
  width: number
}

class Page extends React.Component<any, IState> {

  constructor () {
    super()
    const ctn = document.getElementById('chart_container')
    this.state = {
      height: document.documentElement.clientHeight,
      width: ctn.clientWidth,
    }
    window.onresize = _.throttle(() => {
      this.setState({
        height: document.documentElement.clientHeight,
        width: ctn.clientWidth,
      })
    }, 500)
  }

  public render () {
    return <ChartLayout
      symbol={'SH000001'}
      height={this.state.height}
      width={this.state.width}
      shape={'mountain'}
      resolution={'D'} />
  }
}

ReactDOM.render(
  <Page />,
  document.getElementById('chart_container')
)
