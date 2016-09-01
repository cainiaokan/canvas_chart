import './index.less'
import * as React from 'react'
import * as _ from 'underscore'
import { StockDatasource, SymbolInfo } from '../../datasource'
import ChartLayoutModel from '../../model/chartlayout'

type Prop = {
  chartLayout: ChartLayoutModel
}

type State = {
  focus: boolean
  loading: boolean,
  results: Array<SymbolInfo>
}

export default class SearchBox extends React.Component<Prop, State> {
  public refs: {
      [key: string]: (Element)
      input: HTMLInputElement
  }
  private searchSymbols = _.debounce(
    keyword => {
      this.state.loading = true
      this.setState(this.state)
      return (this.props.chartLayout.mainDatasource as StockDatasource)
        .searchSymbols(keyword)
        .then(symbols => {
          const state = this.state
          state.results = symbols
          state.loading = false
          this.setState(state)
        })
    }, 300)

  constructor (proportion: number) {
    super()
    this.state = {
      focus: false,
      loading: false,
      results: null,
    }
  }

  public render () {
    const state = this.state
    return (
      <div className='chart-searchbox'>
        <input className='chart-searchbox-input' type='text' maxLength={100} ref='input'
          onFocus={this.inputFocosHandler.bind(this)}
          onBlur={this.inputBlurHandler.bind(this)}
          onInput={this.inputHandler.bind(this)}/>
        <ul className='chart-searchresults' style={ {display: state.focus ? 'block' : 'none'} }>
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
              <li className='symbol-item'
                onClick={this.selectSymbolHandler.bind(this)} data-index={index}>
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

  private selectSymbolHandler (ev: MouseEvent) {
    const el = ev.currentTarget as HTMLElement
    const index = el.dataset.index
    const symbolInfo = this.state.results[index]
    this.props.chartLayout.setSymbol(symbolInfo)
    this.refs.input.value = symbolInfo.symbol
  }

  private inputFocosHandler () {
    const el = this.refs.input
    el.selectionStart = 0
    el.selectionEnd = el.value.length
    this.state.focus = true
    this.state.results = null
    this.setState(this.state)
  }

  private inputBlurHandler () {
    setTimeout(() => {
      this.state.focus = false
      this.setState(this.state)
    }, 100)
  }

  private inputHandler () {
    const el = this.refs.input
    const keyword = this.refs.input.value
    el.value = el.value.toUpperCase()
    if (keyword.length) {
      this.searchSymbols(keyword)
    } else {
      this.state.results = null
      this.setState(this.state)
    }
  }

}
