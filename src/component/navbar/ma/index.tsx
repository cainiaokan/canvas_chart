import './index.less'
import '../../../style/btn.less'
import * as React from 'react'
import * as _ from 'underscore'
import ChartLayoutModel, { DEFAULT_MA_PROPS } from '../../../model/chartlayout'
import Dialog from '../../dialog'

type Prop = {
  chartLayout: ChartLayoutModel
}

type State = {
  showDialog?: boolean,
}

export default class MASettings extends React.Component<Prop, State> {

  constructor () {
    super()
    this.state = {
      showDialog: false,
    }
    this.showDialogHandler = this.showDialogHandler.bind(this)
    this.closeDialogHandler = this.closeDialogHandler.bind(this)
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
              maProps.map((ma, i) =>
                <tr>
                  <td>
                    <input id={`chart-settings-ma${i}`} type='checkbox' defaultChecked={ma.isVisible} />
                    <label htmlFor={`chart-settings-ma${i}`}>均线1</label>
                  </td>
                  <td><input type='text' defaultValue={ma.length + ''}/></td>
                </tr>
              )
            }
            </tbody>
          </table>
        </Dialog> : null
      }
    </div>
  }

  private showDialogHandler () {
    this.setState({ showDialog: true })
  }

  private closeDialogHandler () {
    this.setState({ showDialog: false })
  }
}
