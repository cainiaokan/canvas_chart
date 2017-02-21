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
      [key: string]: (Element)
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
    }
  }

  public shouldComponentUpdate (nextProps: Prop, nextState: State) {
    return !_.isEqual(this.props, nextProps) ||
           !_.isEqual(this.state, nextState)
  }

  public render () {
    const state = this.state
    return (
      <div className={`chart-searchbox ${this.props.className} ${this.state.focus ? 'extended' : ''}`}>
        <input className='chart-searchbox-input'
               defaultValue={''}
               type='text'
               maxLength={100}
               placeholder={this.props.placeholder}
               ref='input'
               onFocus={this.inputFocosHandler.bind(this)}
               onBlur={this.inputBlurHandler.bind(this)}
               onInput={this.keyDownHandler.bind(this)}/>
        <ul className='chart-searchresults'
          style={
            {
              display: state.focus && (state.loading || state.results) ? 'block' : 'none',
            }
          }>
          {
            state.loading ? <li className='loading'></li> : null
          }
          {
            !state.loading && state.results && !state.results.length ?
              <li className='no-results'>查询结果为空</li> : null
          }
          {
            !state.loading && state.results ?
              state.results.map((symbol, index) =>
              <li key={symbol.symbol} className='symbol-item' onClick={this.selectSymbolHandler.bind(this, index)}>
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

  private selectSymbolHandler (index) {
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
    })
  }

  private inputBlurHandler () {
    setTimeout(() => {
      this.setState({ focus: false })
    }, 300)
  }

  private keyDownHandler () {
    const el = this.refs.input
    const keyword = el.value
    const selectionStart = el.selectionStart
    el.value = keyword.toUpperCase()
    el.selectionStart = selectionStart
    if (keyword.length) {
      this.searchSymbols(keyword)
    } else {
      this.setState({ results: null })
    }
  }
}
