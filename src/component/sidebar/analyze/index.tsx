import './index.less'

import * as React from 'react'
import * as _ from 'underscore'
import IScroll = require('iscroll')

import ChartLayoutModel from '../../../model/chartlayout'

type Prop = {
  height: number
}
type State = {
  showMA?: boolean
  showPressureSupport?: boolean
  showGap?: boolean
  showWaveForm?: boolean
  showReverseRelay?: boolean
}

export default class Analyze extends React.Component<Prop, State> {
  public static contextTypes = {
    chartLayout: React.PropTypes.instanceOf(ChartLayoutModel),
  }

  public refs: {
    scrollWrapper: HTMLDivElement
  }

  private _chartLayout: ChartLayoutModel
  private _scroller: IScroll

  constructor (props: Prop, context: { chartLayout: ChartLayoutModel }) {
    super(props, context)
    this._chartLayout = context.chartLayout
    this.state = {
      showMA: true,
      showPressureSupport: true,
      showGap: true,
      showWaveForm: true,
      showReverseRelay: true,
    }
    this.toggleHandler = this.toggleHandler.bind(this)
  }

  public componentDidMount () {
    this._scroller = new IScroll(this.refs.scrollWrapper, {
      mouseWheel: true,
      scrollbars: true,
      fadeScrollbars: true,
    })
  }

  public shouldComponentUpdate (nextProps: Prop, nextState: State) {
    return !_.isEqual(this.props, nextProps) ||
           !_.isEqual(this.state, nextState)
  }

  public render () {
    const {
      showMA, showGap, showPressureSupport,
      showWaveForm, showReverseRelay,
    } = this.state
    return (
      <div
        className='chart-analyze'
        ref='scrollWrapper'
        style={ {height: this.props.height + 'px'} }>
        <div>
          <h3>分析功能</h3>
          <div className='feature-group ma clearfix'>
            <div className='description'>
              分析时强制显示均线
            </div>
            <div
              className={`toggle-btn ${showMA ? 'on' : ''}`}
              data-type='ma'
              onClick={this.toggleHandler}></div>
          </div>
          <h4>支撑与压力</h4>
          <div className='feature-group support-pressure clearfix'>
            <div className='description'>
              <div className='pressure'>
                <span>压力：</span><span>14.15(+2.31%)</span>
              </div>
              <hr />
              <div className='support'>
                <span>支撑：</span><span>13.20(-1.88%)</span>
              </div>
            </div>
            <div
              className={`toggle-btn ${showPressureSupport ? 'on' : ''}`}
              data-type='pressure-support'
              onClick={this.toggleHandler}></div>
          </div>
          <h4>跳空与缺口</h4>
          <div className='feature-group gap clearfix'>
            <div className='description'>
              <p>
                2013.2.13&nbsp;&nbsp;
                <span className='negative'>12.31-12.58</span>
              </p>
              <p className='position'>当前价格位于缺口下方</p>
            </div>
            <div
              className={`toggle-btn ${showGap ? 'on' : ''}`}
              data-type='gap'
              onClick={this.toggleHandler}></div>
          </div>
          <h4>形态技术分析</h4>
          <div className='feature-group form-analyze clearfix'>
            <div className='description'>
              <p className='form-title'>波浪形态</p>
              <p>根据艾略特波段理论自动构建的形态，方便确定当前的波浪</p>
            </div>
            <div
              className={`toggle-btn ${showWaveForm ? 'on' : ''}`}
              data-type='wave-form'
              onClick={this.toggleHandler}></div>
          </div>
          <hr />
          <div className='feature-group form-analyze clearfix'>
            <div className='description'>
              <p className='form-title'>反转、中继形态</p>
              <p>自动构建常见的形态，如头肩顶，W底，上升三角形等</p>
              <p className='position'>当前大概率处于：W底</p>
            </div>
            <div
              className={`toggle-btn ${showReverseRelay ? 'on' : ''}`}
              data-type='reverse-relay-form'
              onClick={this.toggleHandler}></div>
          </div>
        </div>
      </div>
    )
  }
  private toggleHandler (ev) {
    const type = ev.currentTarget.dataset.type
    switch (type) {
      case 'ma':
        this.setState({ showMA: !this.state.showMA })
        break
      case 'pressure-support':
        this.setState({ showPressureSupport: !this.state.showPressureSupport })
        break
      case 'gap':
        this.setState({ showGap: !this.state.showGap })
        break
      case 'wave-form':
        this.setState({ showWaveForm: !this.state.showWaveForm })
        break
      case 'reverse-relay-form':
        this.setState({ showReverseRelay: !this.state.showReverseRelay })
        break
      default:
        break
    }
  }
}
