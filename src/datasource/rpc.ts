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
  return fetch(`${API}/chart/index/list/`)
}

export function getRealtimeTools (): Promise<IResponse> {
  return fetch(`${QU_CHAO_GU}/chart/stock/realtimetool/`)
}

export function getFinancingInfo (symbol: string): Promise<IResponse> {
  return fetch(`${QU_CHAO_GU}/chart/stock/finance?code=${symbol}`)
}

/**
 * 根据股票代码获取相关板块列表
 * @param  {string}             symbol 股票代码
 * @return {Promise<IResponse>}        响应
 */
export function getPlatesBySymbol (symbol: string): Promise<IResponse> {
  return fetch(`${API}/chart/bankuai/bystock?code=${symbol}`)
}

/**
 * 获取所有板块的数据
 * @param  {'zdf'|'big_amount'|'big_rate'}  key 排序的key
 * @param  {'asc'|'desc'}                   sort 排序方式
 * @param  {number}                         start 起始下标
 * @param  {number}                         count 获取总条数
 * @return {Promise<IResponse>}             响应
 */
export function getAllPlates (key: 'zdf' | 'big_amount' | 'big_rate', sort: 'asc' | 'desc', start: number, count: number): Promise<IResponse> {
  return fetch(`${API}/chart/bankuai/list?key=${key}&sort=${sort}&start=${start}&count=${count}`)
}

/**
 * 通过板块ID获取股票列表
 * @param  {string}             plateId 板块ID
 * @return {Promise<IResponse>}         响应
 */
export function getStockListByPlateId (plateId: string): Promise<IResponse> {
  return fetch(`${API}/chart/bankuai/stocklist?bk_id=${plateId}`)
}

/**
 * 通过code批量获取股票信息
 * @param  {string[]}           codes code数组
 * @return {Promise<IResponse>}       响应
 */
export function getStockListByCodes (codes: string[], key: 'zdf' | 'price' | 'sz' | 'lt_sz' | 'hy', sort: 'desc' | 'asc'): Promise<IResponse> {
  return fetch(`${API}/chart/stock/zixuan?code_list=${codes.join(',')}&key=${key}&sort=${sort}`)
}

/**
 * 获取指数下的股票列表
 * @param  {string}             indexId 指数ID
 * @return {Promise<IResponse>}         响应
 */
export function getStockListByIndexId (indexId: string): Promise<IResponse> {
  return fetch(`${API}/chart/index/stocks?index_id=${indexId}`)
}

export function getNonrealtimeTools (): Promise<IResponse> {
  return fetch(`${QU_CHAO_GU}/chart/stock/nonrealtime`)
}
