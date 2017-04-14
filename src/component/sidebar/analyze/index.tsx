import './index.less'

import * as React from 'react'
import * as _ from 'underscore'
import IScroll = require('iscroll')

import ChartLayoutModel from '../../../model/chartlayout'
import { AnalysisData, StockInfo } from '../pollmanager'

type Prop = {
  height: number
  analysisData: AnalysisData
  stockInfo: StockInfo
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
    const chartLayout = context.chartLayout
    this._chartLayout = chartLayout
    this.state = {
      showMA: !!chartLayout.readFromLS('chart.forceMA'),
      showPressureSupport: !!chartLayout.readFromLS('chart.showPressureSupport'),
      showGap: !!chartLayout.readFromLS('chart.showGap'),
      showWaveForm: !!chartLayout.readFromLS('chart.showWaveForm'),
      showReverseRelay: !!chartLayout.readFromLS('chart.showReverseRelay'),
    }
    this.toggleHandler = this.toggleHandler.bind(this)
  }

  public componentDidMount () {
    this._scroller = new IScroll(this.refs.scrollWrapper, {
      mouseWheel: true,
      scrollbars: true,
      fadeScrollbars: true,
      click: true,
    })
  }

  public shouldComponentUpdate (nextProps: Prop, nextState: State) {
    return !_.isEqual(this.props, nextProps) ||
           !_.isEqual(this.state, nextState)
  }

  public render () {
    const { stockInfo, analysisData } = this.props
    const pressureInfo = analysisData ? analysisData.pressureInfo : null
    let gapInfo = analysisData ? analysisData.gapInfo : null

    const {
      showMA, showGap, showPressureSupport,
      showWaveForm, showReverseRelay,
    } = this.state

    let gapLow
    let gapHigh
    let price

    if (gapInfo && stockInfo) {
      price = +stockInfo.price
      gapLow = gapInfo.l1 > gapInfo.l2 ? gapInfo.l2 : gapInfo.l1
      gapHigh = gapInfo.l1 > gapInfo.l2 ? gapInfo.l1 : gapInfo.l2
      if (!('up' in gapInfo)) {
        gapInfo.up = price > gapLow
      }
      if (gapInfo.up) {
        if (price <= gapLow) {
          analysisData.gapInfo = null
          gapInfo = null
        } else if (price < gapHigh) {
          gapHigh = price
        }
      } else {
        if (price >= gapHigh) {
          analysisData.gapInfo = null
          gapInfo = null
        } else if (price > gapLow) {
          gapLow = price
        }
      }
      if (gapInfo) {
        gapInfo.l1 = gapLow
        gapInfo.l2 = gapHigh
      }
    }

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
            <a href='javascript:;'
              className={`toggle-btn ${showMA ? 'on' : ''}`}
              data-type='ma'
              onClick={this.toggleHandler}>
              <div className='toggle-tips'>在左侧图中展示</div>
            </a>
          </div>
          <h4>支撑与压力</h4>
          <div className='feature-group support-pressure clearfix'>
            <div className='description'>
              <div className='pressure'>
                <label>压力：</label><span>{pressureInfo && pressureInfo.upper_price ? (+pressureInfo.upper_price).toFixed(2) : '--'}</span>
              </div>
              <hr />
              <div className='support'>
                <label>支撑：</label><span>{pressureInfo && pressureInfo.upper_price ? (+pressureInfo.lower_price).toFixed(2) : '--'}</span>
              </div>
            </div>
            <a href='javascript:;'
              className={`toggle-btn ${showPressureSupport ? 'on' : ''}`}
              data-type='pressure-support'
              onClick={this.toggleHandler}>
              <div className='toggle-tips'>在左侧图中展示</div>
            </a>
          </div>
          <h4>跳空与缺口</h4>
          <div className='feature-group gap clearfix'>
            <div className='description'>
              {
                gapInfo && stockInfo ?
                <p>
                  <label>{gapInfo.dt}</label>&nbsp;&nbsp;
                  <span className={gapInfo.up ? 'positive' : 'negative'}>
                  {gapLow}-{gapHigh}
                  </span>
                </p> : <p>--</p>
              }
              {
                gapInfo && stockInfo ?
                <p className='position'>当前价格位于缺口{gapInfo.up ? '上方' : '下方'}</p> : null
              }
            </div>
            <a href='javascript:;'
              className={`toggle-btn ${showGap ? 'on' : ''}`}
              data-type='gap'
              onClick={this.toggleHandler}>
              <div className='toggle-tips'>在左侧图中展示</div>
            </a>
          </div>
          <h4>形态技术分析</h4>
          <div className='feature-group form-analyze clearfix'>
            <div className='description'>
              <p className='form-title'>波浪形态</p>
              <p>根据艾略特波段理论自动构建的形态，方便确定当前的波浪</p>
            </div>
            <a href='javascript:;'
              className={`toggle-btn ${showWaveForm ? 'on' : ''}`}
              data-type='wave-form'
              onClick={this.toggleHandler}>
              <div className='toggle-tips'>在左侧图中展示</div>
            </a>
          </div>
          <hr />
          <div className='feature-group form-analyze clearfix'>
            <div className='description'>
              <p className='form-title'>反转、中继形态</p>
              <p>自动构建常见的形态，如头肩顶，W底，上升三角形等</p>
              {/*<p className='position'>当前大概率处于：W底</p>*/}
            </div>
            <a href='javascript:;'
              className={`toggle-btn ${showReverseRelay ? 'on' : ''}`}
              data-type='reverse-relay-form'
              onClick={this.toggleHandler}>
              <div className='toggle-tips'>在左侧图中展示</div>
            </a>
          </div>
        </div>
      </div>
    )
  }
  private toggleHandler (ev) {
    const chartLayout = this._chartLayout
    const type = ev.currentTarget.dataset.type

    let isOpen = false
    let study = null

    switch (type) {
      case 'ma':
        isOpen = !this.state.showMA
        chartLayout.saveToLS('chart.forceMA', isOpen)

        if (isOpen) {
          if (chartLayout.mainDatasource.resolution === 'D') {
            chartLayout.maProps.forEach((prop, i) => chartLayout.modifyGraph(chartLayout.maStudies[i], { isVisible: prop.isVisible }))
          }
        } else {
          if (this.state.showWaveForm || this.state.showReverseRelay) {
            if (chartLayout.mainDatasource.resolution === 'D') {
              chartLayout.maStudies.forEach(ma => chartLayout.modifyGraph(ma, { isVisible: false }))
            }
          }
        }
        this.setState({ showMA: isOpen })
        break
      case 'pressure-support':
        isOpen = !this.state.showPressureSupport
        chartLayout.saveToLS('chart.showPressureSupport', isOpen)
        study = chartLayout.mainChart.studies.filter(s => s.studyType === '压力支撑')[0]
        if (!!study) {
          chartLayout.removeStudy(chartLayout.mainChart, study.id)
        } else {
          chartLayout.addStudy('压力支撑')
        }
        this.setState({ showPressureSupport: isOpen })
        break
      case 'gap':
        isOpen = !this.state.showGap
        chartLayout.setGapVisibility(isOpen)
        this.setState({ showGap: isOpen })
        break
      case 'wave-form':
        isOpen = !this.state.showWaveForm
        chartLayout.setWaveVisibility(isOpen)
        this.setState({ showWaveForm: isOpen })
        break
      case 'reverse-relay-form':
        isOpen = !this.state.showReverseRelay
        chartLayout.setReverseRelayVisibility(isOpen)
        this.setState({ showReverseRelay: isOpen })
        break
      default:
        break
    }
  }
}
