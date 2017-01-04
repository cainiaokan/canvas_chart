import './index.less'
import '../../../style/btn.less'
import * as React from 'react'
import * as _ from 'underscore'
import ChartLayoutModel, { DEFAULT_MA_PROPS, MA_PROP } from '../../../model/chartlayout'
import Dialog from '../../widget/dialog'
import ColorPicker from '../../widget/colorpicker'
import { cloneObj } from '../../../util'

type Prop = {
  chartLayout: ChartLayoutModel
}

type State = {
  showDialog?: boolean
  colorPickerIndex?: number
}

export default class MASettings extends React.Component<Prop, State> {

  private _originMAProps: MA_PROP[] = null
  private _maProps: MA_PROP[] = null

  constructor () {
    super()
    this.state = {
      showDialog: false,
      colorPickerIndex: -1,
    }
    this.showDialogHandler = this.showDialogHandler.bind(this)
    this.closeDialogHandler = this.closeDialogHandler.bind(this)
    this.checkStateChangeHandler = this.checkStateChangeHandler.bind(this)
    this.inputChangeHandler = this.inputChangeHandler.bind(this)
    this.cancelHandler = this.cancelHandler.bind(this)
  }

  public shouldComponentUpdate (nextProps: Prop, nextState: State) {
    return !_.isEqual(this.state, nextState)
  }

  public render () {
    const chartLayout = this.props.chartLayout
    const maProps = chartLayout.maProps[chartLayout.mainDatasource.resolution] || DEFAULT_MA_PROPS
    return <div className='chart-btn-group'>
      <button className='btn' onClick={this.showDialogHandler}>均线</button>
      {
        this.state.showDialog ?
        <Dialog title='均线设置'
                className='chart-ma-settings'
                onClose={this.closeDialogHandler}>
          <table>
            <tbody>
            {
              maProps.map((prop, i) =>
                <tr key={i}>
                  <td width='60'>
                    <input
                      id={`chart-settings-ma${i}`}
                      type='checkbox'
                      defaultChecked={prop.isVisible}
                      value={i}
                      onChange={this.checkStateChangeHandler} />
                    <label htmlFor={`chart-settings-ma${i}`}>均线{i + 1}</label>
                  </td>
                  <td width='130'>
                    <input type='text'
                      data-index={i}
                      defaultValue={prop.length + ''}
                      onChange={this.inputChangeHandler} />
                  </td>
                  <td width='30'>
                    <ColorPicker defaultColor={prop.color} onChangeComplete={this.colorChangeHandler(i)} />
                  </td>
                </tr>
              )
            }
            </tbody>
          </table>
          <div className='chart-ma-settings-btn-group clearfix'>
            <button className='btn btn-gray btn-smaller' onClick={this.cancelHandler}>取消</button>
            <button className='btn btn-blue btn-smaller' onClick={this.closeDialogHandler}>确定</button>
          </div>
        </Dialog> : null
      }
    </div>
  }

  private showDialogHandler () {
    const chartLayout = this.props.chartLayout
    const resolution = chartLayout.mainDatasource.resolution
    this._maProps = chartLayout.maProps[resolution] || cloneObj(DEFAULT_MA_PROPS)
    this._originMAProps = cloneObj(this._maProps)
    this.setState({ showDialog: true })
  }

  private closeDialogHandler () {
    this._maProps = null
    this._originMAProps = null
    this.setState({ showDialog: false })
  }

  private checkStateChangeHandler (ev) {
    const chartLayout = this.props.chartLayout
    const resolution = chartLayout.mainDatasource.resolution
    const isVisible = ev.target.checked
    const index = +ev.target.value
    const study = chartLayout.maStudies[index]
    const maProps = this._maProps

    maProps[index].isVisible = isVisible
    chartLayout.maProps[resolution] = maProps
    chartLayout.modifyGraph(study, { isVisible })
  }

  private inputChangeHandler (ev) {
    const chartLayout = this.props.chartLayout
    const resolution = chartLayout.mainDatasource.resolution
    const index = ev.target.dataset.index
    const value = +ev.target.value
    const study = chartLayout.maStudies[index]
    const maProps = this._maProps

    maProps[index].length = value
    chartLayout.maProps[resolution] = maProps
    chartLayout.modifyGraph(study, { input: [value] })
  }

  private colorChangeHandler (index) {
    return (color => {
      const chartLayout = this.props.chartLayout
      const resolution = chartLayout.mainDatasource.resolution
      const maProps = this._maProps
      const study = chartLayout.maStudies[index]
      const styles = study.styles

      maProps[index].color = color
      styles[0].color = color

      chartLayout.maProps[resolution] = maProps
      chartLayout.modifyGraph(study, { styles })
    }).bind(this)
  }

  private cancelHandler () {
    const chartLayout = this.props.chartLayout
    const resolution = chartLayout.mainDatasource.resolution
    const maStudies = chartLayout.maStudies
    const maProps = this._maProps
    const originMAProps = this._originMAProps
    originMAProps.forEach((originMAProp, i) => {
      const study = maStudies[i]
      const styles = study.styles
      if (!_.isEqual(originMAProp, maProps[i])) {
        styles[0].color = originMAProp.color
        chartLayout.modifyGraph(study, {
          input: [originMAProp.length],
          isVisible: originMAProp.isVisible,
          styles,
        })
      }
    })
    chartLayout.maProps[resolution] = originMAProps
    this.closeDialogHandler()
  }
}