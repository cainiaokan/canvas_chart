import { Datasource, DataAdapter } from './'

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
