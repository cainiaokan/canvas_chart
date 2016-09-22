import { ChartStyle } from '../graphic/basechart'
import { ShapeType } from '../constant'
import { Datasource, IStockBar, DataAdapter } from '../datasource'
import { cacheable, EMA, DEA, K, D } from './studyhelper'

export type DataConverter = {
  (
    data: any[],
    index: number,
    datasource: Datasource,
    adapter: DataAdapter,
    input: any[],
    cache?: {[propName: string]: any}
  ): any[][]
  clearCache? (): void
}

type StudyConfig = {
  [propName: string]: {
    [propName: string]: any
    stockAdapter: DataAdapter
    input: any[]
    isPrice: boolean
    output: DataConverter
    plots: Array<{
      style: ChartStyle
      shape: ShapeType
    }>
  }
}

export const studyConfig: StudyConfig = {
  'MA': {
    stockAdapter (bar: IStockBar) {
      return [0, bar.time, bar.close]
    },
    input: [5],
    isPrice: true,
    output: (
      data: any[],
      index: number,
      datasource: Datasource,
      adapter: DataAdapter,
      input: any[]): any[][] => {

      const n = input[0]
      const start = index - n + 1
      const end = index + 1

      if (end - start < n || start < 0) {
        return null
      }

      return [
        [
          data[0],
          data[1],
          datasource.slice(start, end).reduce((prev, cur) => prev + adapter(cur)[2], 0) / n,
        ],
      ]
    },
    plots: [
      {
        shape: 'line',
        style: {
          color: '#000000',
          lineWidth: 1,
        },
      },
    ],
  },
  'VOLUME': {
    stockAdapter (bar: IStockBar) {
      return [0, bar.time, bar.volume, bar.close < bar.open]
    },
    input: [],
    isPrice: false,
    output: (data: any[]): any[][] => {
      return [data.slice(0, 4)]
    },
    plots: [
      {
        shape: 'column',
        style: {
          color: '#ff524f',
          colorDown: '#2bbe65',
          scale: 0.25,
        },
      },
    ],
  },
  'BOLL': {
    stockAdapter (bar: IStockBar) {
      return [0, bar.time, bar.close]
    },
    input: [20, 2],
    isPrice: true,
    output: (
      data: any[],
      index: number,
      datasource: Datasource,
      adapter: DataAdapter,
      input: any[]): any[][] => {
      // 0: posX, 1: time, 2: value
      const n = input[0]
      const dateBack = index - n + 1 < 0 ? 0 : index - n + 1
      const ma = datasource
        .slice(dateBack, index + 1)
        .reduce((prev, cur) => prev + adapter(cur)[2], 0) / (index + 1 - dateBack)
      let md = 0
      for (let i = dateBack; i <= index; i++) {
        md += Math.pow(adapter(datasource.barAt(i))[2] - ma, 2)
      }
      md = Math.sqrt(md / n)
      const posX = data[0]
      const time = data[1]
      const upper = ma + input[1] * md
      const lower = ma - input[1] * md
      return [
        [
          posX,
          time,
          ma,
        ],
        [
          posX,
          time,
          upper,
        ],
        [
          posX,
          time,
          lower,
        ],
        [
          posX,
          time,
          upper,
          lower,
        ],
      ]
    },
    plots: [
      {
        shape: 'line',
        style: {
          color: '#FF0000',
          lineWidth: 1,
        },
      },
      {
        shape: 'line',
        style: {
          color: '#0000FF',
          lineWidth: 1,
        },
      },
      {
        shape: 'line',
        style: {
          color: '#0000FF',
          lineWidth: 1,
        },
      },
      {
        shape: 'band',
        style: {
          color: '#000080',
          noLegend: true,
          transparency: .1,
        },
      },
    ],
  },
  'MACD': {
    stockAdapter (bar: IStockBar) {
      return [0, bar.time, bar.close]
    },
    input: [12, 26, 9],
    isPrice: false,
    output: cacheable((
      // 0: posX, 1: time, 2: value
      data: any[],
      index: number,
      datasource: Datasource,
      adapter: DataAdapter,
      input: any[],
      cache: {[propName: string]: any}): any[][] => {
      const posX = data[0]
      const time = data[1]
      const dif = EMA(input[0], index, datasource, adapter, cache) -
        EMA(input[1], index, datasource, adapter, cache)
      const dea = DEA(input[2], input[1], input[0], index, datasource, adapter, cache)
      const bar = (dif - dea) * 2
      return [
        [posX, time, bar],
        [posX, time, dif],
        [posX, time, dea],
      ]
    }),
    plots: [
      {
        shape: 'histogram',
        style: {
          color: '#FF0000',
          colorDown: '#008000',
          histogramBase: 0,
        },
      },
      {
        shape: 'line',
        style: {
          color: '#0000FF',
        },
      },
      {
        shape: 'line',
        style: {
          color: '#FFA600',
        },
      },
    ],
  },
  'KDJ': {
    stockAdapter (bar: IStockBar) {
      return [0, bar.time, bar.close, bar.high, bar.low]
    },
    input: [9, 3, 3],
    isPrice: false,
    output: cacheable((
      data: any[],
      index: number,
      datasource: Datasource,
      adapter: DataAdapter,
      input: any[],
      cache: {[propName: string]: any}): any[][] => {
      const k = K(input[0], input[1], index, datasource, adapter, cache)
      const d = D(input[0], input[1], input[2], index, datasource, adapter, cache)
      const j = 3 * k - 2 * d
      const x = data[0]
      const time = data[1]
      return [
        [x, time, k],
        [x, time, d],
        [x, time, j],
      ]
    }),
    plots: [
      {
        shape: 'line',
        style: {
          color: '#0000FF',
        },
      },
      {
        shape: 'line',
        style: {
          color: '#FFA600',
        },
      },
      {
        shape: 'line',
        style: {
          color: '#FF00FF',
        },
      },
    ],
  },
}
