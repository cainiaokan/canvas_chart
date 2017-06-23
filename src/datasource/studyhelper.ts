import { Datasource, DataAdapter } from './'
import moment = require('moment')
import { OPEN_HOUR, OPEN_MINUTE } from '../constant'

type Context = {
  datasource: Datasource
  adapter: DataAdapter
  cacheObj: {}
}

let context: Context = null

export function setContext (datasource: Datasource, adapter: DataAdapter) {
  context = {
    datasource,
    adapter,
    cacheObj : {},
  }
}

export function clearContext () {
  context = null
}

export function getContext (): Context {
  return context
}

type Attr = (c: number, n?: number) => number

export const H = function (c: number): number {
  const { datasource, adapter } = context
  return adapter(datasource.barAt(c))[3]
}

export const L = function (c: number): number {
  const { datasource, adapter } = context
  return adapter(datasource.barAt(c))[4]
}

export const C = function (c: number): number {
  const { datasource, adapter } = context
  return adapter(datasource.barAt(c))[2]
}

export const LC = function (c: number): number {
  return REF(c, 1, C)
}

/**
 * 获取最近一个交易日的开盘时间对应的数据bar索引
 * @param  {Datasource} datasource 数据源
 * @return {number}                数据Bar的索引
 */
function getLastOpenIndex (datasource: Datasource): number {
  const m =
    moment(datasource.last().time * 1000)
      .hour(OPEN_HOUR)
      .minute(OPEN_MINUTE)
  return datasource.search(~~(m.toDate().getTime() / 1000))
}

/**
 * 均价
 * @param  {number} c 当前的索引标号
 * @return {number}   均值
 */
export function $MA (c: number): number {
  const { datasource, adapter, cacheObj } = context
  const cacheKey = `$ma_openIndex`
  const openIndex = cacheObj[cacheKey] || getLastOpenIndex(datasource)
  cacheObj[cacheKey] = openIndex

  let amount = 0
  let volume = 0

  for (let i = openIndex, data; i <= c; i++) {
    data = adapter(datasource.barAt(i))
    amount += data[2]
    volume += data[3] * 100
  }

  return amount / volume
}

/**
 * 均线
 * @param  {number} c    当前的索引标号
 * @param  {number} n    均线参数，5日均线，10日均线等
 * @param  {Attr}   attr
 * @return {number}      均值
 */
export function MA (c: number, n: number, attr: Attr): number {
  const { datasource, adapter } = context
  const start = c - n + 1
  const end = c + 1
  let ma = 0

  for (let i = start; i < end; i++) {
    ma += attr(i)
  }

  return ma / (end - start)
}

export function LLV (c: number, n: number, attr: Attr): number {
  const start = c - n + 1
  const end = c + 1
  let min = Number.MAX_VALUE
  for (let i = start, val; i < end; i++) {
    val = attr(i)
    if (val < min) {
      min = val
    }
  }
  return min
}

export function HHV (c: number, n: number, attr: Attr): number {
  const start = c - n + 1
  const end = c + 1
  let max = -Number.MAX_VALUE
  for (let i = start, val; i < end; i++) {
    val = attr(i)
    if (val > max) {
      max = val
    }
  }
  return max
}

export function REF (c: number, n: number, attr: Attr): number {
  return attr(c - n)
}

export function SUM (c: number, n: number, attr): number {
  const start = c - n + 1
  const end = c + 1
  let sum = 0
  for (let i = start; i < end; i++) {
    sum += attr(i)
  }
  return sum
}

export function STD (c: number, n: number, attr: Attr): number {
  const start = c - n + 1
  const end = c + 1

  let ma = 0

  for (let i = start; i < end; i++) {
    ma += attr(i)
  }

  ma /= end - start

  let md = 0

  for (let i = start; i < end; i++) {
    md += Math.pow(attr(i) - ma, 2)
  }

  return Math.sqrt(md / (end - start))
}

export function AVEDEV (c: number, n: number, attr: Attr): number {
  const start = c - n + 1
  const end = c + 1

  let ma = 0

  for (let i = start; i < end; i++) {
    ma += attr(i)
  }

  ma /= end - start

  let dev = 0

  for (let i = start; i < end; i++) {
    dev += Math.abs(attr(i) - ma)
  }

  return dev / (end - start)
}

export function EMA (c: number, n: number, attr: Attr): number {
  const { cacheObj } = context
  const hash = attr.toString()
  const cacheKey = `ema${hash}${n}_${c}`
  const prevKey = `ema${hash}${n}_${c - 1}`

  if (typeof cacheObj[cacheKey] === 'number') {
    return cacheObj[cacheKey]
  }

  if (typeof cacheObj[prevKey] === 'number') {
    return cacheObj[cacheKey] =
      2 / (n + 1) * (attr(c) - cacheObj[prevKey]) + cacheObj[prevKey]
  }

  // 回溯5倍的n，过小的倍数会导致计算精确度不够
  const start = c - n * 5
  const end = c + 1
  let ema = 0
  for (let i = start + 1; i < end; i++) {
    ema = 2 / (n + 1) * (attr(i) - ema) + ema
  }
  return cacheObj[cacheKey] = ema
}

export function SMA (c: number, n: number, w: number, attr: Attr): number {
  const { cacheObj } = context
  const hash = attr.toString()
  const cacheKey = `sma${hash}${n}_${c}`
  const prevKey = `sma${hash}${n}_${c - 1}`

  if (typeof cacheObj[cacheKey] === 'number') {
    return cacheObj[cacheKey]
  }

  if (cacheObj[prevKey]) {
    return cacheObj[cacheKey] =
      (w * attr(c) + (n - w) * cacheObj[prevKey]) / n
  }

  // 回溯8倍的n，过小的倍数会导致计算精确度不够
  const start = c - n * 8
  const end = c + 1
  let sma = 50
  for (let i = start + 1; i < end; i++) {
    sma = (w * attr(i) + (n - w) * sma) / n
  }
  return cacheObj[cacheKey] = sma
}
