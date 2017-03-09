import './index.less'
import '../../../style/btn.less'

import * as React from 'react'
import * as _ from 'underscore'

import ChartLayoutModel from '../../../model/chartlayout'
import GraphModel from '../../../model/graph'

import SearchBox from '../searchbox'
import Dialog from '../../widget/dialog'

type Prop = {
  onAddComparison: (symbol: string) => number
  onRemoveComparison: (graphId: number) => void
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
  public static contextTypes = {
    chartLayout: React.PropTypes.instanceOf(ChartLayoutModel),
  }

  public context: { chartLayout: ChartLayoutModel }

  private _chartLayout: ChartLayoutModel
  private _indexesCheckState: { [propName: string]: number } = {}

  constructor (props: any, context: { chartLayout: ChartLayoutModel }) {
    super(props, context)
    this._chartLayout = context.chartLayout
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
    this._chartLayout.addListener('graph_remove', this.graphRemoveHandler)
  }

  public componentWillUnmount () {
    this._chartLayout.removeListener('graph_remove', this.graphRemoveHandler)
  }

  public shouldComponentUpdate (nextProps: any, nextState: State) {
    return !_.isEqual(this.props, nextProps) ||
           !_.isEqual(this.state, nextState)
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
          <SearchBox className='chart-compare-search'
                     placeholder='输入检索股票'
                     onSelect={this.selectSymbolHandler} />
          {
            indexes.map((indexGroup, i) =>
              <div key={i} className='index-shortcut'>
                {
                  indexGroup.map(indexInfo =>
                    <div key={indexInfo[0]}>
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
    this._chartLayout.addComparison(symbol)
  }

  private checkChangeHandler (ev) {
    const checked = ev.target.checked
    const symbol = ev.target.value

    if (checked) {
      this._indexesCheckState[symbol] = this.props.onAddComparison(symbol)
    } else {
      this.props.onRemoveComparison(this._indexesCheckState[symbol])
      this._indexesCheckState[symbol] = null
    }
  }

  // 用户手动移除比较图形时
  private graphRemoveHandler (graph: GraphModel) {
    const indexesCheckState = this._indexesCheckState
    Object.keys(indexesCheckState).forEach(key => {
      if (graph.isComparison && graph.id === indexesCheckState[key]) {
        indexesCheckState[key] = null
      }
    })
  }
}
