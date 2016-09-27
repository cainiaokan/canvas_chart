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

export function STD (c: number, n: number, ma: number, attr: Attr) {
  const { datasource, adapter } = context
  const { get } = attr
  const start = c - n + 1

  if (start < 0) {
    return null
  }

  let md = 0
  for (let i = start; i <= c; i++) {
    md += Math.pow(get(i, n, datasource, adapter) - ma, 2)
  }
  return Math.sqrt(md / n)
}

export function EMA (c: number, n: number, attr: Attr): number {
  const { datasource, adapter, cacheObj } = context
  const { prop, get } = attr
  const cacheKey = 'ema' + prop + n + c
  const prevKey = 'ema' + prop + n + (c - 1)

  if (typeof cacheObj[cacheKey] === 'number') {
    return cacheObj[cacheKey]
  } else if (typeof cacheObj[prevKey] === 'number') {
    return cacheObj[cacheKey] =
      2 / (n + 1) * (get(c, n, datasource, adapter) - cacheObj[prevKey]) + cacheObj[prevKey]
  } else {
    const start = c - ~~(n * 5) < 0 ? 0 : c - ~~(n * 5)
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
  const cacheKey = 'sma' + prop + n + c
  const prevKey = 'sma' + prop + n + (c - 1)

  if (typeof cacheObj[cacheKey] === 'number') {
    return cacheObj[cacheKey]
  } else if (cacheObj[prevKey]) {
    return cacheObj[cacheKey] =
      (get(c, n, datasource, adapter) + (n - 1) * cacheObj[prevKey]) / n
  }

  const start = c - n * 10 < 0 ? 0 : c - n * 10
  let sma = 50
  for (let i = start + 1, end = c + 1; i < end; i++) {
    sma = (get(i, n, datasource, adapter) + (n - 1) * sma) / n
  }
  cacheObj[cacheKey] = sma
  return sma
}

export function LLV (c: number, n: number, attr: Attr): number {
  const { datasource, adapter, cacheObj } = context
  const { prop, get } = attr
  const cacheKey = 'llv' + prop + n + c

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
  const cacheKey = 'hhv' + prop + n + c

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

// export function RSV (
//   length: number,
//   curIndex: number,
//   datasource: Datasource,
//   adapter: DataAdapter,
//   cache: {[propName: string]: any}): number {
//   const cacheKey = 'RSV' + curIndex
//   if (cache[cacheKey]) {
//     return cache[cacheKey]
//   }
//   const start = curIndex - length + 1 < 0 ? 0 : curIndex - length + 1
//   const bars = datasource.slice(start, curIndex + 1)
//   const low = Math.min.apply(Math, bars.map(bar => adapter(bar)[4]))
//   const high = Math.max.apply(Math, bars.map(bar => adapter(bar)[3]))
//   const cur = adapter(datasource.barAt(curIndex))[2]
//   if (high === low) {
//     return cache[cacheKey] = 0
//   }
//   const rsv = (cur - low) / (high - low) * 100
//   cache[cacheKey] = rsv
//   return rsv
// }

// export function K (
//   n: number,
//   fastLength: number,
//   curIndex: number,
//   datasource: Datasource,
//   adapter: DataAdapter,
//   cache: {[propName: string]: any}): number {
//   const cacheKey = 'K' + curIndex
//   const prevKey = 'K' + (curIndex - 1)

//   if (typeof cache[cacheKey] === 'number') {
//     return cache[cacheKey]
//   } else if (cache[prevKey]) {
//     return cache[cacheKey] =
//       2 / fastLength * cache[prevKey] +
//       RSV(n, curIndex, datasource, adapter, cache) / fastLength
//   }

//   let dateBack = curIndex - n * 10
//   dateBack = dateBack < 0 ? 0 : dateBack
//   let k = 50
//   for (let i = dateBack + 1, len = curIndex; i <= len; i++) {
//     k = 2 / fastLength * k + RSV(n, i, datasource, adapter, cache) / fastLength
//   }
//   cache[cacheKey] = k
//   return k
// }

// export function D (
//   n: number,
//   fastLength: number,
//   slowLength: number,
//   curIndex: number,
//   datasource: Datasource,
//   adapter: DataAdapter,
//   cache: {[propName: string]: any}): number {
//   const cacheKey = 'D' + curIndex
//   const prevKey = 'D' + (curIndex - 1)
//   if (typeof cache[cacheKey] === 'number') {
//     return cache[cacheKey]
//   } else if (cache[prevKey]) {
//     return cache[cacheKey] =
//       2 / slowLength * cache[prevKey] +
//       K(n, fastLength, curIndex, datasource, adapter, cache) / slowLength
//   }
//   let dateBack = curIndex - n * 10
//   dateBack = dateBack < 0 ? 0 : dateBack
//   let d = 50
//   for (let i = dateBack + 1, len = curIndex; i <= len; i++) {
//     d = 2 / slowLength * d + K(n, fastLength, i, datasource, adapter, cache) / slowLength
//   }
//   cache[cacheKey] = d
//   return d
// }

// export function RSI (
//   length: number,
//   curIndex: number,
//   datasource: Datasource,
//   adapter: DataAdapter): number {
//   const start = curIndex - length + 1 < 0 ? 0 : curIndex - length + 1
//   const bars = datasource.slice(start, curIndex + 1)
//   let positive = 0
//   let negtive = 0
//   bars.forEach((bar, i) => {
//     const change = start + i - 1 < 0 ? 0 : adapter(bar)[2] - adapter(datasource.barAt(start + i - 1))[2]
//     if (change >= 0) {
//       positive += change
//     } else {
//       negtive -= change
//     }
//   })
//   const RS = positive / negtive
//   return RS / (1 + RS) * 100
// }
