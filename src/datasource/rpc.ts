import * as ES6Promise from 'es6-promise'
// polyfill es6 Promise API
ES6Promise.polyfill()

import 'isomorphic-fetch'

const API = 'http://api.quchaogu.com'
const QU_CHAO_GU = 'http://www.quchaogu.com'

/**
 * 获取股票数据
 * @param  {string}  symbol     股票代码
 * @param  {string}  resolution 解析度(分时、5分钟、日K、周K、月k等)
 * @param  {number}  from       开始时间戳（精确到秒）
 * @param  {number}  to         结束时间戳（精确到秒）
 * @return {Promise<IResponse>}   
 */
export function getStockBars (symbol: string, resolution: string, right: number,
                              from: number, to: number): Promise<IResponse> {
  return fetch(`${QU_CHAO_GU}/chart/history?symbol=${symbol}&resolution=${resolution}`
               + `&fq=${right}&from=${from}&to=${to}`)
}

export function resolveSymbol (symbol: string): Promise<IResponse> {
  return fetch(`${QU_CHAO_GU}/chart/symbols?symbol=${symbol}`)
}

export function searchSymbols (keyword: string): Promise<IResponse> {
  return fetch(`${QU_CHAO_GU}/chart/search?query=${keyword}&limit=15&type=&exchange=`)
}

export function getServerTime (): Promise<IResponse> {
  return fetch(`${QU_CHAO_GU}/chart/time`)
}

export function getStockInfo (symbol: string): Promise<IResponse> {
  return fetch(`${QU_CHAO_GU}/chart/stock/info?code=${symbol.toLowerCase()}&ticks_time=0`)
}

export function getCapitalFlow (symbol: string): Promise<IResponse> {
  return fetch(`${QU_CHAO_GU}/stock/moneyflow?code=${symbol}`)
}

export function getIndexesInfo (): Promise<IResponse> {
  return fetch(`${QU_CHAO_GU}/chart/stock/guzhi/`)
}

export function getRealtimeTools (): Promise<IResponse> {
  return fetch(`${QU_CHAO_GU}/chart/stock/realtimetool/`)
}

export function getFinancingInfo (symbol: string): Promise<IResponse> {
  return fetch(`${QU_CHAO_GU}/chart/stock/finance?code=${symbol}`)
}

export function getPlatesBySymbol (symbol: string): Promise<IResponse> {
  return fetch(`${API}/chart/bankuai/bystock?code=${symbol}`)
}

export function getAllPlates (key: 'zdf' | 'big_amount' | 'big_rate', sort: 'asc' | 'desc', start: number, count: number): Promise<IResponse> {
  return fetch(`${API}/chart/bankuai/list?sort=${key}&sort=${sort}&start=${start}&count=${count}`)
}

export function getStockListByPlate (plateId: string): Promise<IResponse> {
  return fetch(`${API}/chart/bankuai/stocklist?bk_id=${plateId}`)
}

export function getNonrealtimeTools (): Promise<IResponse> {
  return fetch(`${QU_CHAO_GU}/chart/stock/nonrealtime`)
}
