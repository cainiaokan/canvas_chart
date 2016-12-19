import { Datasource, DataAdapter } from './'
import moment = require('moment')
import { OPEN_DAYS, OPEN_HOUR, OPEN_MINUTE } from '../constant'

let context: {
  datasource: Datasource
  adapter: DataAdapter
  cacheObj: {}
} = null

type Attr = {
  prop: string
  get: (c: number, n: number, datasource: Datasource, adapter: DataAdapter) => number
}

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

/**
 * 获取最近一个交易日的开盘时间对应的数据bar索引
 * @param  {Datasource} datasource 数据源
 * @return {number}                数据Bar的索引
 */
function getLastOpenIndex (datasource: Datasource): number {
  const m = moment(datasource.now() * 1000)
  m.hours(OPEN_HOUR)
  m.minute(OPEN_MINUTE)
  while (OPEN_DAYS.indexOf(m.weekday()) === -1) {
    m.subtract(1, 'days')
  }
  const openIndex = datasource.search(~~(m.toDate().getTime() / 1000))
  return openIndex !== -1 ? openIndex : 0
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

  if (c < openIndex) {
    return null
  }

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
  const { get } = attr
  const start = c - n + 1
  const end = c + 1
  let ma = 0

  if (start < 0) {
    return null
  }

  for (let i = start; i < end; i++) {
    ma += get(i, n, datasource, adapter)
  }

  return ma / (end - start)
}

export function STD (c: number, n: number, attr: Attr): number {
  const { datasource, adapter } = context
  const { get } = attr
  const start = c - n + 1
  const end = c + 1

  if (start < 0) {
    return null
  }

  let ma = 0

  for (let i = start; i < end; i++) {
    ma += get(i, n, datasource, adapter)
  }

  ma /= end - start

  let md = 0

  for (let i = start; i < end; i++) {
    md += Math.pow(get(i, n, datasource, adapter) - ma, 2)
  }

  return Math.sqrt(md / (end - start))
}

export function AVEDEV (c: number, n: number, attr: Attr): number {
  const { datasource, adapter } = context
  const { get } = attr
  const start = c - n + 1
  const end = c + 1

  if (start < 0) {
    return null
  }

  let ma = 0

  for (let i = start; i < end; i++) {
    ma += get(i, n, datasource, adapter)
  }

  ma /= end - start

  let dev = 0

  for (let i = start; i < end; i++) {
    dev += Math.abs(get(i, n, datasource, adapter) - ma)
  }

  return dev / (end - start)
}

export function EMA (c: number, n: number, attr: Attr): number {
  const { datasource, adapter, cacheObj } = context
  const { prop, get } = attr
  const cacheKey = `ema${prop}${n}_${c}`
  const prevKey = `ema${prop}${n}_${c - 1}`

  if (typeof cacheObj[cacheKey] === 'number') {
    return cacheObj[cacheKey]
  } else if (typeof cacheObj[prevKey] === 'number') {
    return cacheObj[cacheKey] =
      2 / (n + 1) * (get(c, n, datasource, adapter) - cacheObj[prevKey]) + cacheObj[prevKey]
  } else {
    const start = c - n * 3 < 0 ? 0 : c - n * 3
    let ema = 0
    for (let i = start + 1, end = c + 1; i < end; i++) {
      ema = 2 / (n + 1) * (get(i, n, datasource, adapter) - ema) + ema
    }
    cacheObj[cacheKey] = ema
    return ema
  }
}

export function SMA (c: number, n: number, w: number, attr: Attr): number {
  const { datasource, adapter, cacheObj } = context
  const { prop, get } = attr
  const cacheKey = `sma${prop}${n}_${c}`
  const prevKey = `sma${prop}${n}_${c - 1}`

  if (typeof cacheObj[cacheKey] === 'number') {
    return cacheObj[cacheKey]
  } else if (cacheObj[prevKey]) {
    return cacheObj[cacheKey] =
      (w * get(c, n, datasource, adapter) + (n - w) * cacheObj[prevKey]) / n
  } else {
    const start = c - n * 5 < 0 ? 0 : c - n * 5
    const end = c + 1
    let sma = 50
    for (let i = start + 1; i < end; i++) {
      sma = (w * get(i, n, datasource, adapter) + (n - w) * sma) / n
    }
    cacheObj[cacheKey] = sma
    return sma
  }
}

export function LLV (c: number, n: number, attr: Attr): number {
  const { datasource, adapter, cacheObj } = context
  const { prop, get } = attr
  const cacheKey = `llv${prop}${n}_${c}`

  if (typeof cacheObj[cacheKey] === 'number') {
    return cacheObj[cacheKey]
  }
  const start = c - n + 1 < 0 ? 0 : c - n + 1
  const end = c + 1
  let min = Number.MAX_VALUE
  for (let i = start, val; i < end; i++) {
    val = get(i, n, datasource, adapter)
    if (val < min) {
      min = val
    }
  }
  return cacheObj[cacheKey] = min
}

export function HHV (c: number, n: number, attr: Attr): number {
  const { datasource, adapter, cacheObj } = context
  const { prop, get } = attr
  const cacheKey = `hhv${prop}${n}_${c}`

  if (typeof cacheObj[cacheKey] === 'number') {
    return cacheObj[cacheKey]
  }
  const start = c - n + 1 < 0 ? 0 : c - n + 1
  const end = c + 1
  let max = -Number.MAX_VALUE
  for (let i = start, val; i < end; i++) {
    val = get(i, n, datasource, adapter)
    if (val > max) {
      max = val
    }
  }
  return cacheObj[cacheKey] = max
}

export function REF (c: number, n: number, attr: Attr): number {
  const { datasource, adapter } = context
  const { get } = attr
  if (c - 1 < 0) {
    return null
  } else {
    return get(c - 1, n, datasource, adapter)
  }
}
