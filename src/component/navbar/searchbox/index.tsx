import './index.less'
import * as React from 'react'
import * as _ from 'underscore'
import ChartLayoutModel from '../../../model/chartlayout'
import { StockDatasource, SymbolInfo } from '../../../datasource'

type Prop = {
  className?: string
  placeholder?: string
  autofill?: boolean
  onSelect: (symbo: string) => void
}

type State = {
  focus?: boolean
  loading?: boolean,
  results?: Array<SymbolInfo>
  selectedIndex?: number
}

export default class SearchBox extends React.Component<Prop, State> {
  public static defaultProps = {
    className: '',
    placeholder: '',
    autofill: false,
  }

  public static contextTypes = {
    chartLayout: React.PropTypes.instanceOf(ChartLayoutModel),
  }

  public context: { chartLayout: ChartLayoutModel }

  public refs: {
      input: HTMLInputElement
  }

  private _chartLayout: ChartLayoutModel

  private searchSymbols = _.debounce(
    keyword => {
      this.setState({
        loading: true,
      })
      return (this.context.chartLayout.mainDatasource as StockDatasource)
        .searchSymbols(keyword)
        .then(symbols => {
          this.setState({
            loading: false,
            results: symbols,
          })
        })
    }, 300)

  constructor (props: Prop, context: { chartLayout: ChartLayoutModel }) {
    super(props, context)
    this._chartLayout = context.chartLayout
    this.state = {
      focus: false,
      loading: false,
      results: null,
      selectedIndex: 0,
    }
  }

  public shouldComponentUpdate (nextProps: Prop, nextState: State) {
    return !_.isEqual(this.props, nextProps) ||
           !_.isEqual(this.state, nextState)
  }

  public render () {
    const { focus, loading, results, selectedIndex } = this.state
    return (
      <div className={`chart-searchbox ${this.props.className} ${focus ? 'extended' : ''}`}>
        <input
          className='chart-searchbox-input'
          defaultValue={''}
          type='text'
          maxLength={100}
          placeholder={this.props.placeholder}
          ref='input'
          onKeyDown={this.keyDownHandler.bind(this)}
          onFocus={this.inputFocosHandler.bind(this)}
          onBlur={this.inputBlurHandler.bind(this)}
          onInput={this.inputHandler.bind(this)}/>
        <ul className='chart-searchresults'
          onClick={this.selectSymbolHandler.bind(this)}
          style={{ display: focus && (loading || results) ? 'block' : 'none' }}>
          {
            loading ? <li className='loading'></li> : null
          }
          {
            !loading && results && !results.length ?
              <li className='no-results'>查询结果为空</li> : null
          }
          {
            !loading && results ?
              results.map((symbol, index) =>
              <li
                key={symbol.symbol}
                data-index={index}
                onMouseEnter={this.mouseEnterHandler.bind(this)}
                className={`symbol-item ${selectedIndex === index ? 'selected' : ''}`}>
                <span className='symbol-code'>{symbol.symbol}</span>
                <span className='symbol-name'>{symbol.description}</span>
                <span className='symbol-exchanger'>{symbol.type}-{symbol.exchange}</span>
              </li>
              ) : null
          }
        </ul>
      </div>
    )
  }

  private selectSymbolHandler () {
    if (!this.state.results) {
      return
    }
    const index = this.state.selectedIndex
    const symbolInfo = this.state.results[index]
    this.props.onSelect(symbolInfo.symbol)
    if (this.props.autofill) {
      setTimeout(() => {
        this.refs.input.value = symbolInfo.symbol
        this.refs.input.blur()
      }, 300)
    }
  }

  private inputFocosHandler () {
    const el = this.refs.input
    el.selectionStart = 0
    el.selectionEnd = el.value.length
    this.setState({
      focus: true,
      results: null,
      selectedIndex: 0,
    })
  }

  private inputBlurHandler () {
    setTimeout(() => {
      this.setState({
        focus: false,
        selectedIndex: 0,
      })
    }, 300)
  }

  private inputHandler () {
    const el = this.refs.input
    const keyword = el.value
    const selectionStart = el.selectionStart
    el.value = keyword.toUpperCase()
    el.selectionStart = selectionStart
    if (keyword.length) {
      this.searchSymbols(keyword)
    } else {
      this.setState({
        results: null,
        selectedIndex: 0,
      })
    }
  }

  private mouseEnterHandler (ev) {
    const index = +ev.currentTarget.dataset.index
    this.setState({ selectedIndex: index })
  }

  private keyDownHandler (ev) {
    const size = this.state.results ? this.state.results.length : 0
    const index = this.state.selectedIndex
    switch (ev.keyCode) {
      case 38:
        this.setState({ selectedIndex: index - 1 < 0 ? size - 1 : index - 1})
        break
      case 40:
        this.setState({ selectedIndex: (index + 1) % size })
        break
      case 13:
        this.selectSymbolHandler()
        break
      default:
    }
  }
}
