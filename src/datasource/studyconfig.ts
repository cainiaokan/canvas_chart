import { ChartStyle } from '../graphic/basechart'
import { ShapeType } from '../constant'
import { Datasource, IStockBar, DataAdapter } from '../datasource'
import { MA, STD, AVEDEV, EMA, LLV, HHV, SMA, REF } from './studyhelper'

export type DataConverter = {
  (
    data: any[],
    index: number,
    input: any[]
  ): any[][]
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

const CLOSE = {
  prop: 'close',
  get (c: number, n: number, datasource: Datasource, adapter: DataAdapter): number {
    return adapter(datasource.barAt(c))[2]
  },
}

export const studyConfig: StudyConfig = {
  'MA': {
    stockAdapter (bar: IStockBar) {
      return [0, bar.time, bar.close]
    },
    input: [5],
    isPrice: true,
    output: (data: any[], index: number, input: any[]): any[][] => {
      const n = input[0]
      const ma = MA(index, n, CLOSE)
      return ma !== null ? [
        [
          0,
          data[1],
          ma,
        ],
      ] : null
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
      return [
        data,
      ]
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
    output: (data: any[], index: number, input: any[]): any[][] => {
      // 0: posX, 1: time, 2: value
      if (index - input[0] < 0) {
        return null
      }
      const n = input[0]
      const ma = MA(index, n, CLOSE)
      const mb = STD(index, n, CLOSE)
      const time = data[1]
      const ub = ma + input[1] * mb
      const lb = ma - input[1] * mb
      return [
        [
          0,
          time,
          ma,
        ],
        [
          0,
          time,
          ub,
        ],
        [
          0,
          time,
          lb,
        ],
        [
          0,
          time,
          ub,
          lb,
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
    output: (data: any[], index: number, input: any[]): any[][] => {
      // 0: posX, 1: time, 2: value
      const fast = input[0]
      const slow = input[1]
      const signal = input[2]
      const time = data[1]
      const DIF = EMA(index, fast, CLOSE) - EMA(index, slow, CLOSE)
      const DIFT = {
        prop: 'dif',
        get (c: number, n: number, datasource: Datasource, adapter: DataAdapter): number {
          return EMA(c, fast, CLOSE) - EMA(c, slow, CLOSE)
        },
      }
      const DEA = EMA(index, signal, DIFT)
      const MACD = (DIF - DEA) * 2
      return [
        [0, time, MACD],
        [0, time, DIF],
        [0, time, DEA],
      ]
    },
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
    output: (data: any[], index: number, input: any[]): any[][] => {
      const signal = input[0]
      if (index - signal < 0) {
        return null
      }
      const HIGH = {
        prop: 'high',
        get (c: number, n: number, datasource: Datasource, adapter: DataAdapter): number {
          return adapter(datasource.barAt(c))[3]
        },
      }

      const LOW = {
        prop: 'low',
        get (c: number, n: number, datasource: Datasource, adapter: DataAdapter): number {
          return adapter(datasource.barAt(c))[4]
        },
      }
      const RSV = {
        prop: 'rsv',
        get (c: number, n: number, datasource: Datasource, adapter: DataAdapter): number {
          return (adapter(datasource.barAt(c))[2] - LLV(c, signal, LOW)) /
            (HHV(c, signal, HIGH) - LLV(c, signal, LOW)) * 100
        },
      }
      const K = {
        prop: 'k',
        get (c: number, n: number, datasource: Datasource, adapter: DataAdapter): number {
          return SMA(c, n, 1, RSV)
        },
      }
      let k = SMA(index, input[1], 1, RSV)
      let d = SMA(index, input[2], 1, K)
      let j = 3 * k - 2 * d
      const time = data[1]
      if (k < 0) {
        k = 0
      } else if (k > 100) {
        k = 100
      }
      if (d < 0) {
        d = 0
      } else if (d > 100) {
        d = 100
      }
      if (j < 0) {
        j = 0
      } else if (j > 100) {
        j = 100
      }
      return [
        [0, time, k],
        [0, time, d],
        [0, time, j],
      ]
    },
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
  'RSI': {
    stockAdapter (bar: IStockBar) {
      return [0, bar.time, bar.close]
    },
    input: [6, 12, 24],
    isPrice: false,
    output: (data: any[], index: number, input: any[]): any[][] => {
      const time = data[1]
      const POS = {
        prop: 'pos',
        get (c: number, n: number, datasource: Datasource, adapter: DataAdapter): number {
          return Math.max(adapter(datasource.barAt(c))[2] - REF(c, n, CLOSE), 0)
        },
      }
      const ABS = {
        prop: 'abs',
        get (c: number, n: number, datasource: Datasource, adapter: DataAdapter): number {
          return Math.abs(adapter(datasource.barAt(c))[2] - REF(c, n, CLOSE))
        },
      }
      return [
        index - input[0] >= 0 ? [0, time, SMA(index, input[0], 1, POS) / SMA(index, input[0], 1, ABS) * 100] : null,
        index - input[1] >= 0 ? [0, time, SMA(index, input[1], 1, POS) / SMA(index, input[1], 1, ABS) * 100] : null,
        index - input[2] >= 0 ? [0, time, SMA(index, input[2], 1, POS) / SMA(index, input[2], 1, ABS) * 100] : null,
      ]
    },
    plots: [
      {
        shape: 'line',
        style: {
          color: '#f8b439',
        },
      },
      {
        shape: 'line',
        style: {
          color: '#1b96ff',
        },
      },
      {
        shape: 'line',
        style: {
          color: '#ea45b3',
        },
      },
    ],
  },
  'CCI': {
    stockAdapter (bar: IStockBar) {
      return [0, bar.time, bar.high, bar.low, bar.close]
    },
    input: [14],
    isPrice: false,
    output: (data: any[], index: number, input: any[]): any[][] => {
      const len = input[0]
      if (index - len < 0) {
        return null
      }
      const time = data[1]
      const TYP = {
        prop: 'typ',
        get (c: number, n: number, datasource: Datasource, adapter: DataAdapter): number {
          const bar = adapter(datasource.barAt(c))
          return (bar[2] + bar[3] + bar[4]) / 3
        },
      }

      return [
        [
          0,
          time,
          ((data[2] + data[3] + data[4]) / 3 - MA(index, len, TYP)) / (0.015 * AVEDEV(index, len, TYP)),
        ],
      ]
    },
    plots: [
      {
        shape: 'line',
        style: {
          color: 'rgba( 60, 120, 216, 1)',
        },
      },
    ],
  },
}
