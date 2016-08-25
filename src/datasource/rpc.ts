import * as ES6Promise from 'es6-promise'
// polyfill es6 Promise API
ES6Promise.polyfill()

import 'isomorphic-fetch'

const DOMAIN = 'http://www.quchaogu.com'

/**
 * 获取股票数据
 * @param  {string}  symbol     股票代码
 * @param  {string}  resolution 解析度(分时、5分钟、日K、周K、月k等)
 * @param  {number}  from       开始时间戳（精确到秒）
 * @param  {number}  to         结束时间戳（精确到秒）
 * @return {Promise<IResponse>}          
 */
export function getStockBars (
  symbol: string, resolution: string,
  from: number, to: number): Promise<IResponse> {
  return fetch(`${DOMAIN}/chart/history/?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}`)
}
