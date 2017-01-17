import './index.less'
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

type Prop = {
  width: number
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
    this.selectSymbolHandler = this.selectSymbolHandler.bind(this)
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
          onSelect={this.selectSymbolHandler} />
        <ResolutionOption />
        <FullScreen />
        <Compare />
        <StudySelector />
        {
          resolution > '1' ? <MASetting /> : null
        }
        {
          chartLayout.mainDatasource.symbolInfo.type === 'stock' ?
          <RightOption /> : null
        }
      </div>
    )
  }

  private updateView () {
    this.forceUpdate()
  }

  private selectSymbolHandler (symbol) {
    this._chartLayout.setSymbol(symbol)
  }
}
