import '../../style/popup_menu.less'

import * as React from 'react'
import * as _ from 'underscore'
import ChartLayoutModel from '../../model/chartlayout'

export type ContextMenuConfig = {
  x: number
  y: number
  items: {name: string, type: string}[]
  actions: (actionType: string) => void
}

type Prop = ContextMenuConfig

export default class ContextMenu extends React.Component<Prop, any> {
  public static contextTypes = {
    chartLayout: React.PropTypes.instanceOf(ChartLayoutModel),
  }

  public static defaultProps = {
  }

  public refs: {
    container: HTMLDivElement
  }

  private _chartLayout: ChartLayoutModel

  constructor (props: Prop, context: { chartLayout: ChartLayoutModel }) {
    super(props)
    this._chartLayout = context.chartLayout
    this.closeHandler = this.closeHandler.bind(this)
    this.clickOutsideHandler = this.clickOutsideHandler.bind(this)
    this.onSelectMenu = this.onSelectMenu.bind(this)
  }

  public shouldComponentUpdate (nextProps: Prop) {
    return !_.isEqual(this.props, nextProps)
  }

  public componentDidMount () {
    document.addEventListener('mousedown', this.clickOutsideHandler)
    document.addEventListener('touchstart', this.clickOutsideHandler)
  }

  public componentWillUnmount () {
    document.removeEventListener('mousedown', this.clickOutsideHandler)
    document.removeEventListener('touchstart', this.clickOutsideHandler)
  }

  public render () {
    const { x, y, items } = this.props
    return (
      <ul
      ref='container'
      className='chart-contextmenu popup-menu'
      style={ {left: `${x}px`, top: `${y}px`} }>
      {
        items.map(item =>
          <li
            key={item.type}
            data-type={item.type}
            onMouseDown={this.onSelectMenu}
            onTouchStart={this.onSelectMenu}>
            {item.name}
          </li>
        )
      }
    </ul>
    )
  }

  private onSelectMenu (ev) {
    if (ev.touches) {
      ev.preventDefault()
    }
    const actionType = ev.target.dataset.type
    this.props.actions(actionType)
    this.closeHandler()
  }

  private closeHandler () {
    this._chartLayout.setContextMenu(null)
  }

  private clickOutsideHandler (ev) {
    const container = this.refs.container
    const target = ev.target
    if (target !== container && !container.contains(target)) {
      this.closeHandler()
    }
  }
}
