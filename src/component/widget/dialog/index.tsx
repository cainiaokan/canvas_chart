import './index.less'
import * as React from 'react'
import * as _ from 'underscore'

type Prop = {
  title: string
  width?: number
  height?: number
  className?: string
  onClose?: () => void
}

export default class Dialog extends React.Component<Prop, any> {
  public static defaultProps = {
    className: '',
  }

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

  public shouldComponentUpdate (nextProps: Prop) {
    return !_.isEqual(this.props, nextProps)
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
    document.addEventListener('mousedown', this.clickOutsideHandler)
    document.addEventListener('touchstart', this.clickOutsideHandler)
    document.addEventListener('mousemove', this.dragMoveHandler)
    document.addEventListener('touchmove', this.dragMoveHandler)
    document.addEventListener('mouseup', this.dragEndHandler)
    document.addEventListener('touchend', this.dragEndHandler)
  }

  public componentWillUnmount () {
    document.removeEventListener('mousedown', this.clickOutsideHandler)
    document.removeEventListener('touchstart', this.clickOutsideHandler)
    document.removeEventListener('mousemove', this.dragMoveHandler)
    document.removeEventListener('touchmove', this.dragMoveHandler)
    document.removeEventListener('mouseup', this.dragEndHandler)
    document.removeEventListener('touchend', this.dragEndHandler)
  }

  public render () {
    return <div ref='container' className={`${this.props.className} chart-dialog`}>
      <h3 onMouseDown={this.dragStartHandler} onTouchStart={this.dragStartHandler}>
        {this.props.title}
      </h3>
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
    if (!!ev.touches) {
      ev.preventDefault()
    }
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
