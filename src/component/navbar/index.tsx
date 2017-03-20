import './index.less'
import '../../style/btn.less'

import * as React from 'react'
import * as _ from 'underscore'
import ResolutionOption from './resolution'
import SearchBox from './searchbox'
import Compare from './compare'
import StudySelector from './study'
import FullScreen from './fullscreen'
import RightOption from './right'
import MASetting from './ma'
import ChartLayoutModel from '../../model/chartlayout'
import StudyModel from '../../model/study'

import { ChartStyle } from '../../graphic/diagram'
import { ResolutionType, RightType, StudyType } from '../../constant'

type Prop = {
  width: number
  onSymbolChange: (symbol: string) => void
  onResolutionChange: (resolution: ResolutionType) => void
  onRightChange: (rightType: RightType) => void
  onAddComparison: (symbol: string) => number
  onRemoveComparison: (graphId: number) => void
  onAddStudy: (study: StudyType) => void
  onStudyModified: (study: StudyModel, properties: {input?: any[], isVisible?: boolean, styles?: ChartStyle[]}) => void
  onFullScreen: () => void
}

export default class Navbar extends React.Component<Prop, any> {
  public static contextTypes = {
    chartLayout: React.PropTypes.instanceOf(ChartLayoutModel),
  }

  public context: { chartLayout: ChartLayoutModel }

  private _chartLayout: ChartLayoutModel

  constructor (props: Prop, context: { chartLayout: ChartLayoutModel }) {
    super(props, context)
    this._chartLayout = context.chartLayout
    this.updateView = this.updateView.bind(this)
    this.onShowAbout = this.onShowAbout.bind(this)
    this.onShowNewest = this.onShowNewest.bind(this)
  }

  public shouldComponentUpdate (nextProps: Prop) {
    return !_.isEqual(this.props, nextProps)
  }

  public componentDidMount () {
    const chartLayout = this._chartLayout
    chartLayout.addListener('resolution_change', this.updateView)
    chartLayout.addListener('symbol_change', this.updateView)
  }

  public componentWillUnmount () {
    const chartLayout = this._chartLayout
    chartLayout.removeListener('resolution_change', this.updateView)
    chartLayout.removeListener('symbol_change', this.updateView)
  }

  public render () {
    const chartLayout = this._chartLayout
    const resolution = chartLayout.mainDatasource.resolution

    return (
      <div className='chart-navbar' style={ {width: this.props.width + 'px'} }>
        <SearchBox
          className='chart-navbar-search'
          autofill={true}
          onSelect={this.props.onSymbolChange} />

        <ResolutionOption
          onResolutionChange={this.props.onResolutionChange} />

        <FullScreen
          onFullScreen={this.props.onFullScreen} />

        <Compare
          onAddComparison={this.props.onAddComparison}
          onRemoveComparison={this.props.onRemoveComparison} />

        <StudySelector onAddStudy={this.props.onAddStudy} />

        {
          resolution > '1' ? <MASetting onStudyModified={this.props.onStudyModified} /> : null
        }

        {
          chartLayout.mainDatasource.symbolInfo.type === 'stock' ?
          <RightOption onRightChange={this.props.onRightChange} /> : null
        }
        <button className='about btn' onClick={this.onShowAbout}>关于</button>
        <button className='newest btn' onClick={this.onShowNewest}>最新功能</button>
      </div>
    )
  }

  private onShowAbout () {
    this._chartLayout.toggleAbout(true)
  }

  private onShowNewest () {
    this._chartLayout.showAnalysisSidebarTab()
  }

  private updateView () {
    this.forceUpdate()
  }
}
