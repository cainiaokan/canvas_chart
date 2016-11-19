import * as EventEmitter from 'eventemitter3'
import {
  SymbolInfo,
  getStockInfo,
  getCapitalFlow,
  getIndexesInfo,
  getRealtimeTools,
  getFinancingInfo,
  getPlatesBySymbol,
  getNonrealtimeTools,
} from '../../datasource'

const RETRY_DELAY = 10000

export type StockInfo = {
  open: number
  high: number
  low: number
  preClose: number
  price: number
  changeRate: number
  changePrice: number
  amount: number
  volume: number
  turnover: number
  amplitude: number
  inVol: number
  outVol: number

  selling: number[][]
  buying: number[][]

  pressure: number
  support: number

  ticks: { time: string, price: string, volume: string, type: '1' | '2' | '3' }[]
}

export type CapitalFlowInfo = {
  barChartData: number[]
  donutChartData: number[]
}

export type IndexInfo = {
  symbol: string
  price: string
  changeRate: number
  changeAmount: number
}

export type IndexesInfo = {
  sh000001: IndexInfo
  sz399001: IndexInfo
  sz399005: IndexInfo
  sz399006: IndexInfo
  sz399300: IndexInfo
}

export type RealtimeTools = {
  hugutong: any[]
  shortTermMove: any[]
  goUpStaying: any[]
  fallStaying: any[]
}

export type FinancingInfo = {
  InventoryTurnover: string
  LiabilityToEquityRatio: string
  asset_liability_ratio: string
  asset_write_down: string
  book_value_per_share: string
  borrowingFromCentralBank: string
  capital_surplus: string
  capital_surplus_per_share: string
  cashAndCentralBankDeposit: string
  cashChangeDueToFOREX: string
  cashPaidToEmployee: string
  common_stock: string
  currentRatio: string
  daysAccountReceivableTurnover: string
  daysInventoryTurnover: string
  daysOperationPeriod: string
  depositFromIntermediaries: string
  deposits: string
  earning_per_Share: string
  equity: string
  finance_day: string
  financingCashflowIn: string
  financingCashflowOut: string
  fixed_asset: string
  gainLossFromFairValueChange: string
  heldForTradingFinancialAsset: string
  heldForTradingFinancialLiabilities: string
  held_for_sale_financial_asset: string
  id: string
  incomeTax: string
  intangible_asset: string
  interbankDeposit: string
  interest_expense: string
  interest_income: string
  interest_payable: string
  interest_receivable: string
  investmentCashflowIn: string
  investmentCashflowOut: string
  investment_income: string
  loanAndAdvances: string
  longterm_equity_investment: string
  management_expense: string
  minority_interest: string
  miscellaneousTaxAndFee: string
  netChangeOfCashAndCashEquivalent: string
  netChangeOfClientAndOtherIntermediaryDeposit: string
  netChangeOfClientLoanAndAdvances: string
  netFinancingCashflow: string
  netInvestmentCashflow: string
  netProcessingFeeAndCommissionIncome: string
  net_income: string
  net_income_growth_rate: string
  net_interest_income: string
  net_operating_cashflow: string
  operating_cash_flow_per_share: string
  operating_cashflow_in: string
  operating_cashflow_out: string
  quickRatio: string
  quickRatioConservative: string
  remittance_income: string
  report_day: string
  retained_earning: string
  retained_earning_per_share: string
  returnOnEquityGrowthRate: string
  return_on_Equity: string
  return_on_equity_diluted: string
  revenue: string
  revenue_growth_rate: string
  salary_payable: string
  stock_code: string
  stock_id: string
  tax_payable: string
  total_asset: string
  total_earning: string
  total_liabilities: string
  total_operating_expense: string
  total_operating_income: string
}

export type PlateList = {
  concept: string[],
  industry: string[],
}

export type NonRealtimeTools = {
  bankCapital: string[]
  stockForumSentiment: string
  searchSentiment: string
  institutionCapital: string[]
  investerCapital: string[]
  tradingInvester: string
  liftBanCapitalisation: string
  pressure: string
  support: string
  financingBalance: string
  financingBalanceChange: string[]
  newInvester: string
}

export type PollData = {
  stockInfo?: StockInfo
  capitalFlowInfo?: CapitalFlowInfo
  indexesInfo?: IndexesInfo
  realtimeTools?: RealtimeTools
  financingInfo?: FinancingInfo
  plates?: PlateList
  nonRealtimeTools?: NonRealtimeTools
}

export default class PollManager extends EventEmitter {
  private _symbolInfo: SymbolInfo

  private _tabIndex: number

  private _timers: {
    stockInfo?: number
    capitalFlowInfo?: number
    indexesInfo?: number
    realtimeTools?: number
  } = {}

  private _data: PollData = {}

  constructor (symbolInfo: SymbolInfo, tabIndex: number) {
    super()
    this._symbolInfo = symbolInfo
    this._tabIndex = tabIndex
    this.pollStockInfo = this.pollStockInfo.bind(this)
    this.pollCapitalFlow = this.pollCapitalFlow.bind(this)
    this.pollIndexesInfo = this.pollIndexesInfo.bind(this)
    this.pollRealtimeTools = this.pollRealtimeTools.bind(this)
  }

  set symbolInfo (symbolInfo: SymbolInfo) {
    this._symbolInfo = symbolInfo
  }

  get symbolInfo (): SymbolInfo {
    return this._symbolInfo
  }

  set tabIndex (tabIndex: number) {
    if (tabIndex === this._tabIndex) {
      return
    }
    // switch (this._tabIndex) {
    //   case 0:
    //     // clearTimeout(this._timers.stockInfo)
    //     clearTimeout(this._timers.capitalFlowInfo)
    //     break
    //   case 1:
    //     clearTimeout(this._timers.indexesInfo)
    //     clearTimeout(this._timers.realtimeTools)
    //   default:
    // }
    this._tabIndex = tabIndex
    switch (tabIndex) {
      case 0:
        if (!this._timers.capitalFlowInfo) {
          if (this.symbolInfo.type === 'stock') {
            this.pollCapitalFlow()
          }
        }
        break
      case 1:
        if (!this._timers.indexesInfo) {
          this.pollIndexesInfo()
        }
        if (!this._timers.realtimeTools) {
          this.pollRealtimeTools()
        }
        break
      case 2:
        if (this._symbolInfo.type === 'stock' && !this._data.financingInfo) {
          this.getFinancingInfo()
        }
        break
      case 3:
        if (this._symbolInfo.type === 'stock' && !this._data.plates) {
          this.getPlates()
        }
        break
      case 4:
        if (!this._data.nonRealtimeTools) {
          this.getNonRealtimeTools()
        }
        break
      default:
    }
  }

  public start () {
    this.pollStockInfo()
    switch (this._tabIndex) {
      case 0:
        if (this.symbolInfo.type === 'stock') {
          this.pollCapitalFlow()
        }
        break
      case 1:
        this.pollIndexesInfo()
        this.pollRealtimeTools()
        break
      case 2:
        this.getFinancingInfo()
        break
      case 3:
        this.getPlates()
        break
      case 4:
        this.getNonRealtimeTools()
        break
      default:
        break
    }
  }

  public restart () {
    this.stop()
    this.start()
  }

  public stop () {
    Object.keys(this._timers).forEach(key => clearTimeout(this._timers[key]))
    this._data = {}
    this._timers = {}
  }

  private pollStockInfo () {
    // if (this._tabIndex !== 0) {
    //   return this._timers.stockInfo = setTimeout(this.pollStockInfo, this._refreshDelay.stockInfo)
    // }
    getStockInfo(this._symbolInfo.symbol)
      .then(response =>
        response.json()
          .then(data => {
            const ds = data.data.stock_info
            const dp = data.data.pressure
            const stockInfo: StockInfo = {
              open: ds.open,
              high: ds.high,
              low: ds.low,
              preClose: ds.pre_close,
              price: ds.price,
              changeRate: ds.p_change,
              changePrice: ds.price_change,
              amount: ds.amount,
              volume: ds.volume,
              turnover: ds.turnover,
              amplitude: ds.zf,
              inVol: ds.invol,
              outVol: ds.outvol,
              selling: ds.a5_p ? [
                [ds.a5_p, ds.a5_v],
                [ds.a4_p, ds.a4_v],
                [ds.a3_p, ds.a3_v],
                [ds.a2_p, ds.a2_v],
                [ds.a1_p, ds.a1_v],
              ] : null,
              buying: ds.b1_p ? [
                [ds.b1_p, ds.b1_v],
                [ds.b2_p, ds.b2_v],
                [ds.b3_p, ds.b3_v],
                [ds.b4_p, ds.b4_v],
                [ds.b5_p, ds.b5_v],
              ] : null,
              pressure: +dp.upper_price,
              support: +dp.lower_price,
              ticks: data.data.ticks_list,
            }

            this._data.stockInfo = stockInfo
            this._timers.stockInfo = setTimeout(this.pollStockInfo, data.data.reflush_time * 1000)
            this.emit('data', this._data)
          })
      )
      .catch(() => {
        this._timers.stockInfo = setTimeout(this.pollStockInfo, RETRY_DELAY)
      })
  }

  private pollCapitalFlow () {
    if (this._symbolInfo.type !== 'stock' || this._tabIndex !== 0) {
      this._timers.capitalFlowInfo = null
      return
    }
    getCapitalFlow(this._symbolInfo.symbol)
      .then(response =>
        response.json()
          .then(data => {
            data = data.data
            const barChartData = data.map(d => (d.mainIn - d.mainOut) / 1E4).reverse()
            data = data[0]
            const retailIn = data.retailIn / 1E4
            const retailOut = data.retailOut / 1E4
            const mainIn = data.mainIn / 1E4
            const mainOut = data.mainOut / 1E4
            const donutChartData = [retailIn, mainIn, mainOut, retailOut]

            const chartData: CapitalFlowInfo = {
              barChartData,
              donutChartData,
            }

            this._data.capitalFlowInfo = chartData
            this._timers.capitalFlowInfo = setTimeout(this.pollCapitalFlow, 3 * 60 * 1000)
            this.emit('data', this._data)
          })
      )
      .catch(() => {
        this._timers.capitalFlowInfo = setTimeout(this.pollCapitalFlow, RETRY_DELAY)
      })
  }

  private pollIndexesInfo () {
    if (this._tabIndex !== 1) {
      this._timers.indexesInfo = null
      return
    }
    getIndexesInfo()
      .then(response =>
        response.json()
          .then(data => {
            const reflushinter = data.data.reflushinter
            data = data.data.data
            const indexesInfo: IndexesInfo = {
              sh000001: null,
              sz399001: null,
              sz399005: null,
              sz399006: null,
              sz399300: null,
            }
            Object.keys(data).forEach(key => {
              const res = data[key]
              indexesInfo[key] = {
                symbol: key,
                price: res.price,
                changeRate: res.p_change,
                changeAmount: res.price_change,
              }
            })

            this._data.indexesInfo = indexesInfo
            this._timers.indexesInfo = setTimeout(this.pollIndexesInfo, reflushinter * 1000)
            this.emit('data', this._data)
          })
      )
      .catch(() => {
        this._timers.indexesInfo = setTimeout(this.pollIndexesInfo, RETRY_DELAY)
      })
  }

  private pollRealtimeTools () {
    if (this._tabIndex !== 1) {
      this._timers.realtimeTools = null
      return
    }
    getRealtimeTools()
      .then(response =>
        response.json()
          .then(data => {
            data = data.data
            const clzReg = /class='(.*?)'/
            const innerTextReg = />(.*?)</
            const upAndFallStaying = data.zhangdieting.split('/<')

            const realtimeTools: RealtimeTools = {
              hugutong: [innerTextReg.exec(data.hugutong)[1], clzReg.exec(data.hugutong)[1]],
              shortTermMove: [innerTextReg.exec(data.jzjd)[1], clzReg.exec(data.jzjd)[1]],
              goUpStaying: [innerTextReg.exec(upAndFallStaying[0])[1], clzReg.exec(upAndFallStaying[0])[1]],
              fallStaying: [innerTextReg.exec(upAndFallStaying[1])[1], clzReg.exec(upAndFallStaying[1])[1]],
            }

            this._data.realtimeTools = realtimeTools
            this._timers.realtimeTools = setTimeout(this.pollRealtimeTools, data.flush_time * 1000)
            this.emit('data', this._data)
          })
      )
      .catch(() => {
        this._timers.realtimeTools = setTimeout(this.pollRealtimeTools, RETRY_DELAY)
      })
  }

  private getFinancingInfo () {
    if (this._symbolInfo.type !== 'stock') {
      return
    }
    getFinancingInfo(this._symbolInfo.symbol)
      .then(response =>
        response.json()
          .then(data => {
            this._data.financingInfo = data.data
            this.emit('data', this._data)
          })
      )
  }

  private getPlates () {
    if (this._symbolInfo.type !== 'stock') {
      return
    }
    getPlatesBySymbol(this._symbolInfo.symbol)
      .then(response =>
        response.json()
          .then(data => {
            this._data.plates = data.data
            this.emit('data', this._data)
          })
      )
  }

  private getNonRealtimeTools () {
    getNonrealtimeTools()
      .then(respopnse =>
        respopnse.json()
          .then(data => {
            const clzReg = /class="(.*?)"/
            const tagReg = /<.*?>/g
            const pressureStrs = data.data.pressure_str.split(/\/(?=\<)/)
            const financingStrs = data.data.rzInfo_str.split('\&nbsp;')
            data = data.data
            this._data.nonRealtimeTools = {
              bankCapital: [data.bankInfo_str.replace(tagReg, ''), clzReg.exec(data.bankInfo_str)[1]],
              stockForumSentiment: data.guba_str.replace(tagReg, ''),
              searchSentiment: data.search_str.replace(tagReg, ''),
              institutionCapital: [data.jgInfo_str.replace(tagReg, ''), clzReg.exec(data.jgInfo_str)[1]],
              investerCapital: [data.zijin_str.replace(tagReg, ''), clzReg.exec(data.zijin_str)[1]],
              tradingInvester: data.jiaoyi_str.replace(tagReg, ''),
              liftBanCapitalisation: data.jiejingInfo_str.replace(tagReg, ''),
              support: pressureStrs[1].replace(tagReg, ''),
              pressure: pressureStrs[0].replace(tagReg, ''),
              financingBalance: financingStrs[0],
              financingBalanceChange: [financingStrs[1].replace(tagReg, ''), clzReg.exec(financingStrs[1])[1]],
              newInvester: data.xinzeng_str.replace(tagReg, ''),
            }
            this.emit('data', this._data)
          })
      )
  }
}
