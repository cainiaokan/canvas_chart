import './index.less'
import '../../style/btn.less'
import * as React from 'react'
import * as _ from 'underscore'
import ChartLayoutModel from '../../model/chartlayout'

type Prop = {
  chartLayout: ChartLayoutModel
  width: number
  height: number
}

type State = {
}

export default class FooterBar extends React.Component<Prop, State> {
  constructor () {
    super()
    this.state = {}
  }

  public shouldComponentUpdate (nextProps: Prop, nextState: State) {
    const curProps = this.props
    return curProps.width !== nextProps.width ||
           curProps.height !== nextProps.height ||
           !_.isEqual(this.state, nextState)
  }

  public render () {
    return (
      <div className='chart-footerbar' style={ {width: this.props.width + 'px', height: this.props.height + 'px'} }>
        <div className='control-list'>
        </div>
      </div>
    )
  }
}
