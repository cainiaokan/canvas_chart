import './index.less'
import * as React from 'react'

type Prop = {
  onFullScreen: () => void
}

export default class FullScreen extends React.Component<Prop, any> {

  public shouldComponentUpdate () {
    return false
  }

  public render () {
    return (
      <a ref='btn' className='full-screen' title='全屏/取消'
        onClick={this.mouseclickhandler.bind(this)}></a>
    )
  }

  private mouseclickhandler (ev) {
    this.props.onFullScreen()
  }
}
