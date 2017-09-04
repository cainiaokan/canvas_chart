import './index.less'
import * as React from 'react'
import { SketchPicker } from 'react-color'
import * as _ from 'underscore'
import { darkenRGB } from '../../../util'

type Prop = {
  defaultColor: string
  onChangeComplete?: (color: string) => void
}

type State = {
  color?: string
  showColorPicker?: boolean
}

export default class ColorPicker extends React.Component<Prop, State> {
  public refs: {
    container: HTMLDivElement
  }

  constructor () {
    super()
    this.state = {
      showColorPicker: false,
    }
    this.openColorPickerHandler = this.openColorPickerHandler.bind(this)
    this.colorChangeHandler = this.colorChangeHandler.bind(this)
    this.clickOutsideHandler = this.clickOutsideHandler.bind(this)
  }

  public shouldComponentUpdate (nextProps: Prop, nextState: State) {
    return !_.isEqual(this.props, nextProps) ||
           !_.isEqual(this.state, nextState)
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
    const color = this.state.color || this.props.defaultColor
    return <div>
      <div className='chart-color-picker'>
        <span className='chart-color-picker-btn'
              style={ {backgroundColor: color, border: `1px solid ${darkenRGB(color)}`} }
              onClick={this.openColorPickerHandler}>
        </span>
        {
          this.state.showColorPicker ?
            <div ref='container' className='chart-color-picker-positioning'>
              <SketchPicker
                width={'240px'}
                disableAlpha={true}
                color={color}
                presetColors={[]}
                onChangeComplete={this.colorChangeHandler} />
            </div>
           : null
        }
      </div>
    </div>
  }

  private openColorPickerHandler (ev) {
    this.setState({ showColorPicker: true })
  }

  private colorChangeHandler (colorResult: any) {
    const rgb = colorResult.rgb
    const color = 'rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')'
    this.props.onChangeComplete(color)
    this.setState({ color })
  }

  private clickOutsideHandler (ev) {
    const container = this.refs.container
    const target = ev.target
    if (!!container && target !== container && !container.contains(target)) {
      this.setState({ showColorPicker: false })
    }
  }
}
