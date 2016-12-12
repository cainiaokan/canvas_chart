import './index.less'
import '../../../style/btn.less'
import * as React from 'react'
import * as _ from 'underscore'
import ChartLayoutModel from '../../../model/chartlayout'
import SearchBox from '../searchbox'
import Dialog from '../../dialog'

type Prop = {
  chartLayout: ChartLayoutModel
}

type State = {
  showCompareDialog?: boolean,
  indexesCheckState?: { [propName: string]: number },
}

const indexes = [
  [
    ['sh000001', '上证指数'],
    ['sz399001', '深证指数'],
  ],
  [
    ['sz399300', '沪深300'],
    ['sz399005', '中小板指'],
  ],
  [
    ['sz399006', '创业板指'],
  ],
]

export default class Compare extends React.Component<Prop, State> {

  constructor () {
    super()
    this.state = {
      showCompareDialog: false,
      indexesCheckState: {},
    }
    this.showDialogHandler = this.showDialogHandler.bind(this)
    this.dialogCloseHandler = this.dialogCloseHandler.bind(this)
    this.selectSymbolHandler = this.selectSymbolHandler.bind(this)
    this.onCheckedChangeHandler = this.onCheckedChangeHandler.bind(this)
  }

  public shouldComponentUpdate (nextProps: Prop, nextState: State) {
    return !_.isEqual(this.state, nextState)
  }

  public render () {
    return <div className='chart-compare chart-btn-group'>
      <button className='btn' onClick={this.showDialogHandler}>对比</button>
      {
        this.state.showCompareDialog ?
        <Dialog title='对比'
                width={320}
                className='chart-compare-dialog'
                onClose={this.dialogCloseHandler}>
          <SearchBox chartLayout={this.props.chartLayout}
                     className='chart-compare-search'
                     placeholder='输入检索股票'
                     onSelect={this.selectSymbolHandler} />
          {
            indexes.map(indexGroup =>
              <div className='index-shortcut'>
                {
                  indexGroup.map(indexInfo =>
                    <div>
                      <input id={`index_${indexInfo[0]}`}
                             type='checkbox'
                             value={indexInfo[0]}
                             checked={!!this.state.indexesCheckState[indexInfo[0]]}
                             onChange={this.onCheckedChangeHandler} />
                      <label htmlFor={`index_${indexInfo[0]}`}>{indexInfo[1]}</label>
                    </div>
                  )
                }
              </div>
            )
          }
        </Dialog> : null
      }
    </div>
  }

  private showDialogHandler () {
    this.setState({ showCompareDialog: true })
  }

  private dialogCloseHandler () {
    this.setState({ showCompareDialog: false })
  }

  private selectSymbolHandler (symbol) {
    this.props.chartLayout.addComparison(symbol)
  }

  private onCheckedChangeHandler (ev) {
    const checked = ev.target.checked
    const symbol = ev.target.value
    const chartLayout = this.props.chartLayout
    const indexesCheckState = {}

    if (checked) {
      _.extend(indexesCheckState, this.state.indexesCheckState, { [symbol]: chartLayout.addComparison(symbol) })
    } else {
      chartLayout.deleteComparison(this.state.indexesCheckState[symbol])
      _.extend(indexesCheckState, this.state.indexesCheckState, { [symbol]: null })
    }
    this.setState({ indexesCheckState })
  }
}
