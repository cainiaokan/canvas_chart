import './index.less'
import * as React from 'react'
import { DOWN_EVENT, DOWN_EVENT_REACT, MOVE_EVENT, UP_EVENT } from '../../constant'

type Prop = {
  title: string
  width?: number
  height?: number
  onClose?: () => void
}

export default class Dialog extends React.Component<Prop, any> {
  public refs: {
    container: HTMLDivElement
  }

  private _dragStart = false
  private _dragPosX = 0
  private _dragPosY = 0

  constructor () {
    super()
    this.closeHandler = this.closeHandler.bind(this)
    this.clickOutsideHandler = this.clickOutsideHandler.bind(this)
    this.dragStartHandler = this.dragStartHandler.bind(this)
    this.dragMoveHandler = this.dragMoveHandler.bind(this)
    this.dragEndHandler = this.dragEndHandler.bind(this)
  }

  public componentDidMount () {
    const container = this.refs.container
    const pageHeight = document.documentElement.clientHeight
    const pageWidth = document.documentElement.clientWidth
    const style = this.refs.container.style
    const props = this.props
    const width = props.width || container.clientWidth
    const height = props.height || container.clientHeight
    style.width = props.width + 'px'
    style.height = props.height + 'px'
    style.top = pageHeight / 2 - height / 2 + 'px'
    style.left = pageWidth / 2 - width / 2 + 'px'
    document.addEventListener(DOWN_EVENT, this.clickOutsideHandler)
    document.addEventListener(MOVE_EVENT, this.dragMoveHandler)
    document.addEventListener(UP_EVENT, this.dragEndHandler)
  }

  public componentWillUnmount () {
    document.removeEventListener(DOWN_EVENT, this.clickOutsideHandler)
    document.removeEventListener(MOVE_EVENT, this.dragMoveHandler)
    document.removeEventListener(UP_EVENT, this.dragEndHandler)
  }

  public render () {
    const dragEvents = {
      [DOWN_EVENT_REACT]: this.dragStartHandler,
    }

    return <div ref='container' className='chart-dialog'>
      <h3 {...dragEvents}>{this.props.title}</h3>
      <a href='javascript:;' className='close' onClick={this.closeHandler}></a>
      <div className='chart-dialog-body'>
        {
          this.props.children
        }
      </div>
    </div>
  }

  private closeHandler () {
    const closeCallback = this.props.onClose
    if (typeof closeCallback === 'function') {
      closeCallback()
    }
  }

  private clickOutsideHandler (ev) {
    const container = this.refs.container
    const target = ev.target
    if (target !== container && !container.contains(target)) {
      this.closeHandler()
    }
  }

  private dragStartHandler (ev) {
    const touchDrag = ev.touches && ev.touches.length === 1
    this._dragStart = true
    this._dragPosX = touchDrag ? ev.touches[0].pageX : ev.pageX
    this._dragPosY = touchDrag ? ev.touches[0].pageY : ev.pageY
  }

  private dragMoveHandler (ev) {
    if (!this._dragStart) {
      return
    }

    const style = this.refs.container.style
    const touchDrag = ev.touches && ev.touches.length === 1
    const posX = touchDrag ? ev.touches[0].pageX : ev.pageX
    const posY = touchDrag ? ev.touches[0].pageY : ev.pageY
    const diffX = posX - this._dragPosX
    const diffY = posY - this._dragPosY

    style.left = parseFloat(style.left) + diffX + 'px'
    style.top = parseFloat(style.top) + diffY + 'px'

    this._dragPosX = posX
    this._dragPosY = posY
  }

  private dragEndHandler () {
    this._dragStart = false
  }
}
