import './index.less'
import '../../../style/btn.less'
import * as React from 'react'
import * as _ from 'underscore'
import ChartLayoutModel from '../../../model/chartlayout'
import SearchBox from '../searchbox'
import Dialog from '../../widget/dialog'

type Prop = {
  chartLayout: ChartLayoutModel
}

type State = {
  showCompareDialog?: boolean,
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
  private _indexesCheckState: { [propName: string]: number } = {}

  constructor () {
    super()
    this.state = {
      showCompareDialog: false,
    }
    this.showDialogHandler = this.showDialogHandler.bind(this)
    this.dialogCloseHandler = this.dialogCloseHandler.bind(this)
    this.selectSymbolHandler = this.selectSymbolHandler.bind(this)
    this.checkChangeHandler = this.checkChangeHandler.bind(this)
    this.graphRemoveHandler = this.graphRemoveHandler.bind(this)
  }

  public componentDidMount () {
    this.props.chartLayout.addListener('graph_remove', this.graphRemoveHandler)
  }

  public componentDidUnMount () {
    this.props.chartLayout.removeListener('graph_remove', this.graphRemoveHandler)
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
                             defaultChecked={!!this._indexesCheckState[indexInfo[0]]}
                             onChange={this.checkChangeHandler} />
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

  private checkChangeHandler (ev) {
    const checked = ev.target.checked
    const symbol = ev.target.value
    const chartLayout = this.props.chartLayout

    if (checked) {
      this._indexesCheckState[symbol] = chartLayout.addComparison(symbol)
    } else {
      chartLayout.removeComparison(this._indexesCheckState[symbol])
      this._indexesCheckState[symbol] = null
    }
  }

  private graphRemoveHandler (graph) {
    const indexesCheckState = this._indexesCheckState
    Object.keys(indexesCheckState).forEach(key => {
      if (graph.id === indexesCheckState[key]) {
        indexesCheckState[key] = null
      }
    })
  }
}
