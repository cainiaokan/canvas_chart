import '../../../style/btn.less'
import * as React from 'react'
import ChartLayoutModel from '../../../model/chartlayout'

type Prop = {
  chartLayout: ChartLayoutModel
  right: 0 | 1 | 2
}

const rightLabels = ['除权', '前复权']
const rightValues = [0, 1]

export default class RightOption extends React.Component<Prop, any> {
  constructor () {
    super()
    this.rightSelectHandler = this.rightSelectHandler.bind(this)
  }

  public shouldComponentUpdate (nextProps: Prop) {
    const curProps = this.props
    return curProps.right !== nextProps.right
  }

  public render () {
    return <div className='chart-btn-group' onClick={this.rightSelectHandler}>
        {
          rightValues.map((val, index) => {
            let className = 'btn'
            if (this.props.right === val) {
              className += ' active'
            }
            return <button className={className} value={val}>{rightLabels[index]}</button>
          })
        }
    </div>
  }

  private rightSelectHandler (ev) {
    const right = +ev.target.value
    if (this.props.right !== right) {
      this.props.chartLayout.setRight(right)
    }
  }
}
