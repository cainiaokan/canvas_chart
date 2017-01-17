import '../../../style/btn.less'
import * as React from 'react'
import ChartLayoutModel from '../../../model/chartlayout'
import { Right } from '../../../datasource'

const rightLabels = ['除权', '前复权']
const rightValues = [0, 1]

export default class RightOption extends React.Component<any, any> {
  public static contextTypes = {
    chartLayout: React.PropTypes.instanceOf(ChartLayoutModel),
  }

  public context: { chartLayout: ChartLayoutModel }

  private _chartLayout: ChartLayoutModel

  constructor (props: any, context: { chartLayout: ChartLayoutModel }) {
    super(props, context)
    this._chartLayout = context.chartLayout
    this.updateView = this.updateView.bind(this)
    this.rightSelectHandler = this.rightSelectHandler.bind(this)
  }

  public shouldComponentUpdate () {
    return false
  }

  public componentDidMount () {
    this._chartLayout.addListener('right_change', this.updateView)
  }

  public componentWillUnmount () {
    this._chartLayout.removeListener('right_change', this.updateView)
  }

  public render () {
    const right = this._chartLayout.mainDatasource.right
    return (
      <div className='chart-btn-group' onClick={this.rightSelectHandler}>
          {
            rightValues.map((val, index) => {
              let className = 'btn'
              if (right === val) {
                className += ' active'
              }
              return <button key={val} className={className} value={val}>{rightLabels[index]}</button>
            })
          }
      </div>
    )
  }

  private updateView () {
    this.forceUpdate()
  }

  private rightSelectHandler (ev) {
    const right = +ev.target.value as Right
    const chartLayout = this._chartLayout
    if (chartLayout.mainDatasource.right !== right) {
      chartLayout.setRight(right)
      this.forceUpdate()
    }
  }
}
