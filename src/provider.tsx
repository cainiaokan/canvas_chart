import * as React from 'react'
import ChartLayout from './model/chartlayout'

type Prop = {
  chartLayout: ChartLayout
}

export default class Provider extends React.Component<Prop, any> {
  public static childContextTypes = {
    chartLayout: React.PropTypes.instanceOf(ChartLayout),
  }

  private chartLayout: ChartLayout

  constructor (props: Prop, context: { chartLayout: ChartLayout }) {
    super(props, context)
    this.chartLayout = props.chartLayout
  }

  public getChildContext() {
    return { chartLayout: this.chartLayout }
  }

  public render() {
    return React.Children.only(this.props.children)
  }
}
