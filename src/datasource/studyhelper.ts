import { Datasource, DataAdapter, DataConverter } from './'

export function cacheable (output: DataConverter): DataConverter {
  let cache = {}
  const cachebaleConverter: DataConverter = function (
      data: any[],
      index: number,
      datasource: Datasource,
      adapter: DataAdapter,
      input: any[]): any[][] {
    return output(data, index, datasource, adapter, input, cache)
  }
  cachebaleConverter.clearCache = () => cache = {}
  return cachebaleConverter
}

export function DEA (
  signalLength: number,
  slowLen: number,
  fastLen: number,
  curIndex: number,
  datasource: Datasource,
  adapter: DataAdapter,
  cache: {[propName: string]: any}): number {
  const cacheKey = 'DEA' + curIndex
  const prevKey = 'DEA' + (curIndex - 1)

  if (cache[cacheKey]) {
    return cache[cacheKey]
  } else if (cache[prevKey]) {
    return cache[cacheKey] =
      2 / (signalLength + 1) *
        (EMA(fastLen, curIndex, datasource, adapter, cache) -
        EMA(slowLen, curIndex, datasource, adapter, cache)) +
        (signalLength - 1) / (signalLength + 1) * cache[prevKey]
  }
  let dateBack = curIndex - ~~(signalLength * 5)
  dateBack = dateBack < 0 ? 0 : dateBack
  let dea = 0
  for (let i = dateBack + 1, len = curIndex, dif; i <= len; i++) {
    dif = EMA(fastLen, i, datasource, adapter, cache) - EMA(slowLen, i, datasource, adapter, cache)
    dea = 2 / (signalLength + 1) * dif + (signalLength - 1) / (signalLength + 1) * dea
  }
  cache[cacheKey] = dea
  return dea
}

export function EMA (
  length: number,
  curIndex: number,
  datasource: Datasource,
  adapter: DataAdapter,
  cache: {[propName: string]: any}): number {
  const cacheKey = 'EMA' + length + curIndex
  const prevKey = 'EMA' + length + (curIndex - 1)

  if (cache[cacheKey]) {
    return cache[cacheKey]
  } else if (cache[prevKey]) {
    return cache[cacheKey] =
      2 / (length + 1) * (adapter(datasource.barAt(curIndex))[2] - cache[prevKey]) + cache[prevKey]
  }
  let dateBack = curIndex - ~~(length * 5)
  dateBack = dateBack < 0 ? 0 : dateBack
  let ema = adapter(datasource.barAt(dateBack))[2]
  for (let i = dateBack + 1, len = curIndex, bar; i <= len; i++) {
    bar = adapter(datasource.barAt(i))
    ema = 2 / (length + 1) * (bar[2] - ema) + ema
  }
  cache[cacheKey] = ema
  return ema
}

export function RSV (
  length: number,
  curIndex: number,
  datasource: Datasource,
  adapter: DataAdapter,
  cache: {[propName: string]: any}): number {
  const cacheKey = 'RSV' + curIndex
  if (cache[cacheKey]) {
    return cache[cacheKey]
  }
  const start = curIndex - length + 1
  const bars = datasource.slice(start < 0 ? 0 : start, curIndex + 1)
  const low = Math.min.apply(Math, bars.map(bar => adapter(bar)[4]))
  const high = Math.max.apply(Math, bars.map(bar => adapter(bar)[3]))
  const cur = adapter(datasource.barAt(curIndex))[2]
  const rsv = (cur - low) / (high - low) * 100
  cache[cacheKey] = rsv
  return rsv
}

export function K (
  n: number,
  fastLength: number,
  curIndex: number,
  datasource: Datasource,
  adapter: DataAdapter,
  cache: {[propName: string]: any}): number {
  const cacheKey = 'K' + curIndex
  const prevKey = 'K' + (curIndex - 1)

  if (cache[cacheKey]) {
    return cache[cacheKey]
  } else if (cache[prevKey]) {
    return cache[cacheKey] =
      2 / fastLength * cache[prevKey] +
      RSV(n, curIndex, datasource, adapter, cache) / fastLength
  }

  let dateBack = curIndex - n * 10
  dateBack = dateBack < 0 ? 0 : dateBack
  let k = 50
  for (let i = dateBack + 1, len = curIndex; i <= len; i++) {
    k = 2 / fastLength * k + RSV(n, i, datasource, adapter, cache) / fastLength
  }
  cache[cacheKey] = k
  return k
}

export function D (
  n: number,
  fastLength: number,
  slowLength: number,
  curIndex: number,
  datasource: Datasource,
  adapter: DataAdapter,
  cache: {[propName: string]: any}): number {
  const cacheKey = 'D' + curIndex
  const prevKey = 'D' + (curIndex - 1)
  if (cache[cacheKey]) {
    return cache[cacheKey]
  } else if (cache[prevKey]) {
    return cache[cacheKey] =
      2 / slowLength * cache[prevKey] +
      K(n, fastLength, curIndex, datasource, adapter, cache) / slowLength
  }
  let dateBack = curIndex - n * 10
  dateBack = dateBack < 0 ? 0 : dateBack
  let d = 50
  for (let i = dateBack + 1, len = curIndex; i <= len; i++) {
    d = 2 / slowLength * d + K(n, fastLength, i, datasource, adapter, cache) / slowLength
  }
  cache[cacheKey] = d
  return d
}
