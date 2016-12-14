import './index.less'
import * as React from 'react'
import { ResolutionType } from '../../constant'
import ResolutionOption from './resolution'
import SearchBox from './searchbox'
import Compare from './compare'
import IndicatorSelector from './indicator'
import FullScreen from './fullscreen'
import RightOption from './right'
import ChartLayoutModel from '../../model/chartlayout'

type Prop = {
  chartLayout: ChartLayoutModel
  resolution: ResolutionType
  symbolType: string
  width: number
  right?: 0 | 1 | 2
}

export default class Navbar extends React.Component<Prop, any> {
  public static defaultProps = {
    right: 1,
    symbolType: '',
  }

  constructor () {
    super()
    this.selectSymbolHandler = this.selectSymbolHandler.bind(this)
  }

  public shouldComponentUpdate (nextProps: Prop) {
    const curProp = this.props
    return curProp.resolution !== nextProps.resolution ||
           curProp.symbolType !== nextProps.symbolType ||
           curProp.width !== nextProps.width ||
           curProp.right !== nextProps.right
  }

  public render () {
    const chartLayout = this.props.chartLayout
    return <div className='chart-navbar' style={ {width: this.props.width + 'px'} }>
        <SearchBox chartLayout={chartLayout}
                   className='chart-navbar-search'
                   autofill={true}
                   onSelect={this.selectSymbolHandler} />
        <ResolutionOption chartLayout={chartLayout} resolution={this.props.resolution} />
        <FullScreen />
        <Compare chartLayout={chartLayout} />
        <IndicatorSelector chartLayout={chartLayout} />
        {
          this.props.symbolType === 'stock' ?
          <RightOption chartLayout={chartLayout} right={this.props.right} /> : null
        }
      </div>
  }

  private selectSymbolHandler (symbol) {
    this.props.chartLayout.setSymbol(symbol)
  }
}
