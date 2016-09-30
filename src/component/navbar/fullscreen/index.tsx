import './index.less'
import * as React from 'react'

/**
 * 标准化 requestFullscreen 方法
 * @param {DOM} elem 要全屏显示的元素(webkit下只要是DOM即可，Firefox下必须是文档中的DOM元素)
 */
function requestFullscreen( elem ) {
    if (elem.requestFullscreen) {
        elem.requestFullscreen()
    } else if (elem.webkitRequestFullScreen) {
        // 对 Chrome 特殊处理，
        // 参数 Element.ALLOW_KEYBOARD_INPUT 使全屏状态中可以键盘输入。
        if ( window.navigator.userAgent.toUpperCase().indexOf( 'CHROME' ) >= 0 ) {
            elem.webkitRequestFullScreen()
        } else {// Safari 浏览器中，如果方法内有参数，则 Fullscreen 功能不可用。
            elem.webkitRequestFullScreen()
        }
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen()
    }
}

export default class FullScreen extends React.Component<any, any> {
  public refs: {
    [propName: string]: any
    btn: HTMLElement
  }
  constructor () {
    super()
  }

  public componentWillMount () {
    this.state = {
      selected: this.props.resolution,
    }
  }

  public render () {
    return (
      <a ref='btn' className='full-screen' onClick={this.mouseclickhandler.bind(this)}></a>
    )
  }

  private mouseclickhandler (ev) {
    let chartRoot = this.refs.btn
    while (true) {
      chartRoot = chartRoot.parentElement
      if (chartRoot && chartRoot.classList.contains('chart-container')) {
        break
      }
    }
    requestFullscreen(chartRoot)
  }
}