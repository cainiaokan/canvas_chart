import * as EventEmitter from 'eventemitter3'
import {
  getStockInfo,
  getCapitalFlow,
  getIndexesInfo,
  getRealtimeTools,
} from '../../datasource'

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

export type PollData = {
  stockInfo?: StockInfo
  capitalFlowInfo?: CapitalFlowInfo
  indexesInfo?: IndexesInfo
  realtimeTools?: RealtimeTools
}

export default class PollManager extends EventEmitter {
  private _symbol: string

  private _tabIndex: number

  private _refreshDelay: {
    stockInfo?: number
    capitalFlowInfo?: number
    indexesInfo?: number
    realtimeTools?: number
  } = {}

  private _timers: {
    stockInfo?: number
    capitalFlowInfo?: number
    indexesInfo?: number
    realtimeTools?: number
  } = {}

  private _data: PollData = {}

  constructor (symbol: string, tabIndex: number) {
    super()
    this._symbol = symbol
    this._tabIndex = tabIndex
    this.pollStockInfo = this.pollStockInfo.bind(this)
    this.pollCapitalFlow = this.pollCapitalFlow.bind(this)
    this.pollIndexesInfo = this.pollIndexesInfo.bind(this)
    this.pollRealtimeTools = this.pollRealtimeTools.bind(this)
  }

  set symbol (symbol: string) {
    this._symbol = symbol
  }

  set tabIndex (tabIndex: number) {
    switch (this._tabIndex) {
      case 0:
        // clearTimeout(this._timers.stockInfo)
        clearTimeout(this._timers.capitalFlowInfo)
        break
      case 1:
        clearTimeout(this._timers.indexesInfo)
        clearTimeout(this._timers.realtimeTools)
      default:
    }
    switch (tabIndex) {
      case 0:
        // if (this._refreshDelay.stockInfo) {
        //   this._timers.stockInfo = setTimeout(this.pollStockInfo, this._refreshDelay.stockInfo)
        // } else {
        //   this.pollStockInfo()
        // }
        if (this._refreshDelay.capitalFlowInfo) {
          this._timers.capitalFlowInfo = setTimeout(this.pollCapitalFlow, this._refreshDelay.capitalFlowInfo)
        } else {
          this.pollCapitalFlow()
        }
        break
      case 1:
        if (this._refreshDelay.indexesInfo) {
          this._timers.indexesInfo = setTimeout(this.pollIndexesInfo, this._refreshDelay.indexesInfo)
        } else {
          this.pollIndexesInfo()
        }
        if (this._refreshDelay.realtimeTools) {
          this._timers.realtimeTools = setTimeout(this.pollRealtimeTools, this._refreshDelay.realtimeTools)
        } else {
          this.pollRealtimeTools()
        }
        break
      default:
    }
    this._tabIndex = tabIndex
  }

  public start () {
    switch (this._tabIndex) {
      case 0:
        this.pollStockInfo()
        this.pollCapitalFlow()
        break
      case 1:
        this.pollIndexesInfo()
        this.pollRealtimeTools()
        break
      default:
    }
  }

  public restart () {
    this.stop()
    this.start()
  }

  public stop () {
    Object.keys(this._timers).forEach(key => clearTimeout(this._timers[key]))
  }

  private pollStockInfo () {
    // if (this._tabIndex !== 0) {
    //   return this._timers.stockInfo = setTimeout(this.pollStockInfo, this._refreshDelay.stockInfo)
    // }
    getStockInfo(this._symbol)
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

            this._refreshDelay.stockInfo = data.data.reflush_time * 1000
            this._data.stockInfo = stockInfo
            this._timers.stockInfo = setTimeout(this.pollStockInfo, this._refreshDelay.stockInfo)
            this.emit('data', this._data)
          })
      )
  }

  private pollIndexesInfo () {
    if (this._tabIndex !== 1) {
      return this._timers.indexesInfo = setTimeout(this.pollIndexesInfo, this._refreshDelay.indexesInfo)
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

            this._refreshDelay.indexesInfo = reflushinter * 1000
            this._data.indexesInfo = indexesInfo
            this._timers.indexesInfo = setTimeout(this.pollIndexesInfo, this._refreshDelay.indexesInfo)
            this.emit('data', this._data)
          })
      )
  }

  private pollRealtimeTools () {
    if (this._tabIndex !== 1) {
      return this._timers.realtimeTools = setTimeout(this.pollRealtimeTools, this._refreshDelay.realtimeTools)
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
              hugutong: [innerTextReg.exec(data.hugutong)[1], clzReg.exec(data.hugutong)[1] === 'red'],
              shortTermMove: [innerTextReg.exec(data.jzjd)[1], clzReg.exec(data.jzjd)[1]],
              goUpStaying: [innerTextReg.exec(upAndFallStaying[0])[1], clzReg.exec(upAndFallStaying[0])[1]],
              fallStaying: [innerTextReg.exec(upAndFallStaying[1])[1], clzReg.exec(upAndFallStaying[1])[1]],
            }

            this._refreshDelay.realtimeTools = data.flush_time * 1000
            this._data.realtimeTools = realtimeTools
            this._timers.realtimeTools = setTimeout(this.pollRealtimeTools, this._refreshDelay.realtimeTools)
            this.emit('data', this._data)
          })
      )
  }

  private pollCapitalFlow () {
    getCapitalFlow(this._symbol)
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

            this._refreshDelay.capitalFlowInfo = 3 * 60 * 1000
            this._data.capitalFlowInfo = chartData
            this._timers.capitalFlowInfo = setTimeout(this.pollCapitalFlow, this._refreshDelay.capitalFlowInfo)
            this.emit('data', this._data)
          })
      )
  }
}
