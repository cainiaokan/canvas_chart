import './index.less'

import * as React from 'react'
import * as _ from 'underscore'
import { animationQueue } from '../../util'

import ChartLayoutModel from '../../model/chartlayout'

type State = {
  animateStep?: 0 | 1 | 2 | 3 | 4 | 5
}

export default class Welcome extends React.Component<any, State> {
  public static contextTypes = {
    chartLayout: React.PropTypes.instanceOf(ChartLayoutModel),
  }

  public context: { chartLayout: ChartLayoutModel }

  private _chartLayout: ChartLayoutModel

  constructor (props: any, context: { chartLayout: ChartLayoutModel }) {
    super(props, context)
    this._chartLayout = context.chartLayout
    this.clickHandler = this.clickHandler.bind(this)
    this.state = {
      animateStep: 0,
    }
  }

  public componentDidMount () {
    animationQueue()
      .delay(500)
      .enqueue(() => this.setState({ animateStep: 1 }))
      .delay(300)
      .enqueue(() => this.setState({ animateStep: 2 }))
      .delay(120)
      .enqueue(() => this.setState({ animateStep: 4 }))
      .delay(300)
      .enqueue(() => this.setState({ animateStep: 5 }))
  }

  public shouldComponentUpdate (nextProps: any, nextState: State) {
    return !_.isEqual(this.state, nextState)
  }

  public render () {
    let className = ''
    switch (this.state.animateStep) {
      case 0:
        break
      case 1:
        className = 'ani-step-1'
        break
      case 2:
        className = 'ani-step-2'
        break
      case 3:
        className = 'ani-step-3'
        break
      case 4:
        className = 'ani-step-4'
        break
      case 5:
        className = 'ani-step-5'
        break
      default:
        break
    }
    return (
      <div className={`chart-welcome ${className}`}>
        <div className='blocker'></div>
        <div className='content cd-intro-content'>
          <div className='logo'></div>
          <h1>趣看盘</h1>
          <h2>更智能，&nbsp;更高效，&nbsp;更及时，&nbsp;更全面</h2>
          <p>看盘软件在十几年间都没有发生过重要的变化，应该这样吗?</p>
          <p>我们走访了数百家专业机构，发现他们<em>看盘的方式</em>和<em>主流看盘工具提供的功能</em>有非常<em>巨大的信息鸿沟</em>。</p>
          <p><em>几个IT工程师</em>，尝试做些创新， 试图帮您具备<em>专业的看盘视角和能力</em>。</p>
          <a href='javascript:;' className='proceed-btn' onClick={this.clickHandler}></a>
          <a href='/forums/' target='_blank' className='feedback-btn'>建议/反馈</a>
        </div>
      </div>
    )
  }
  private clickHandler () {
    animationQueue()
      .enqueue(() => this.setState({ animateStep: 3 }))
      .delay(300)
      .enqueue(() => this.setState({ animateStep: 0 }))
      .delay(300)
      .enqueue(() => this._chartLayout.toggleAbout(false))
  }
}
