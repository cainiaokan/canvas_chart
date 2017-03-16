import { ChartStyle } from '../graphic/diagram'
import { ShapeType, ResolutionType } from '../constant'
import { IStockBar, DataAdapter, IPSBar } from '../datasource'
import {
  getContext,
  H,
  L,
  C,
  LC,
  SUM,
  REF,
  $MA,
  MA,
  STD,
  AVEDEV,
  EMA,
  LLV,
  HHV,
  SMA,
} from './studyhelper'

export type DataConverter = {
  (
    data: any[],
    index: number,
    input: any[]
  ): any[][]
}

const SUPPORT_ALL_RESOLUTION: ResolutionType[] = ['1', '5', '15', '30', '60', 'D', 'W', 'M']

type StudyConfig = {
  [propName: string]: {
    adapter: DataAdapter
    input?: any[]
    supportResolutions: ResolutionType[]
    inputLabels?: string[]
    isPrice: boolean
    isFixed: boolean
    noLegend: boolean
    output: DataConverter
    plots: Array<{
      style: ChartStyle
      shape: ShapeType
    }>
  }
}

export const studyConfig: StudyConfig = {
  '压力支撑': {
    adapter (bar: IPSBar) {
      return [0, bar.time, bar.pressure, bar.support]
    },
    output (data: any[], index: number, input: any[]): any[][] {
      const time = data[1]
      return [
        [0, time, data[2]],
        [0, time, data[3]],
      ]
    },
    supportResolutions: ['1', '5', '15', '30', '60', 'D'],
    isPrice: true,
    isFixed: true,
    noLegend: false,
    plots: [
      {
        shape: 'line',
        style: {
          color: '#ff9c00',
          lineWidth: 1,
        },
      }, {
        shape: 'line',
        style: {
          color: '#2b89cc',
          lineWidth: 1,
        },
      },
    ],
  },
  '均价': {
    adapter (bar: IStockBar) {
      return [0, bar.time, bar.amount, bar.volume]
    },
    output: (data: any[], index: number, input: any[]): any[][] => {
      const ma = $MA(index)
      return ma !== null ? [
        [
          0,
          data[1],
          ma,
        ],
      ] : null
    },
    supportResolutions: ['1'],
    isPrice: true,
    isFixed: true,
    noLegend: false,
    plots: [
      {
        shape: 'line',
        style: {
          color: 'orange',
          lineWidth: 1,
        },
      },
    ],
  },
  'MA': {
    adapter (bar: IStockBar) {
      return [0, bar.time, bar.close]
    },
    input: [5],
    inputLabels: ['长度'],
    supportResolutions: ['5', '15', '30', '60', 'D', 'W', 'M'],
    isPrice: true,
    isFixed: true,
    noLegend: false,
    output: (data: any[], index: number, input: any[]): any[][] => {
      const n = input[0]
      const ma = MA(index, n, C)
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
    adapter (bar: IStockBar) {
      return [0, bar.time, bar.volume, bar.close < bar.open]
    },
    input: [],
    inputLabels: [],
    supportResolutions: SUPPORT_ALL_RESOLUTION,
    isPrice: false,
    isFixed: true,
    noLegend: true,
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
          opacity: .2,
        },
      },
    ],
  },
  'BOLL': {
    adapter (bar: IStockBar) {
      return [0, bar.time, bar.close]
    },
    input: [20, 2],
    inputLabels: [],
    supportResolutions: SUPPORT_ALL_RESOLUTION,
    isPrice: true,
    isFixed: false,
    noLegend: false,
    output: (data: any[], index: number, input: any[]): any[][] => {
      // 0: posX, 1: time, 2: value
      if (index - input[0] < 0) {
        return null
      }
      const n = input[0]
      const ma = MA(index, n, C)
      const mb = STD(index, n, C)
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
          opacity: .1,
        },
      },
    ],
  },
  'MACD': {
    adapter (bar: IStockBar) {
      return [0, bar.time, bar.close]
    },
    input: [12, 26, 9],
    inputLabels: [],
    supportResolutions: SUPPORT_ALL_RESOLUTION,
    isPrice: false,
    isFixed: false,
    noLegend: false,
    output: (data: any[], index: number, input: any[]): any[][] => {
      // 0: posX, 1: time, 2: value
      const fast = input[0]
      const slow = input[1]
      const signal = input[2]
      const time = data[1]

      const DIF = EMA(index, fast, C) - EMA(index, slow, C)
      const DIFT = function (c: number): number {
        return EMA(c, fast, C) - EMA(c, slow, C)
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
          color: 'rgb(255, 0, 110)',
          colorDown: 'rgb(255, 0, 110)',
          histogramBase: 0,
        },
      },
      {
        shape: 'line',
        style: {
          color: 'rgb(0, 148, 255)',
        },
      },
      {
        shape: 'line',
        style: {
          color: 'rgb(255, 106, 0)',
        },
      },
    ],
  },
  'KDJ': {
    adapter (bar: IStockBar) {
      return [0, bar.time, bar.close, bar.high, bar.low]
    },
    input: [9, 3, 3],
    inputLabels: [],
    supportResolutions: SUPPORT_ALL_RESOLUTION,
    isPrice: false,
    isFixed: false,
    noLegend: false,
    output: (data: any[], index: number, input: any[]): any[][] => {
      const signal = input[0]
      const m1 = input[1]
      const m2 = input[2]

      const RSV = function (c: number): number {
        return (C(c) - LLV(c, signal, L)) /
          (HHV(c, signal, H) - LLV(c, signal, L)) * 100
      }

      const K = function (c: number): number {
        return SMA(c, m1, 1, RSV)
      }

      let k = K(index)
      let d = SMA(index, m2, 1, K)
      let j = 3 * k - 2 * d

      const time = data[1]
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
    adapter (bar: IStockBar) {
      return [0, bar.time, bar.close]
    },
    input: [6, 12, 24],
    inputLabels: [],
    supportResolutions: SUPPORT_ALL_RESOLUTION,
    isPrice: false,
    isFixed: false,
    noLegend: false,
    output: (data: any[], index: number, input: any[]): any[][] => {
      if (index - Math.max.apply(Math, input) < 0) {
        return null
      }

      const [r1, r2, r3] = input
      const time = data[1]
      const POS = function (c: number): number {
        return Math.max(C(c) - LC(c), 0)
      }
      const ABS = function (c: number): number {
        return Math.abs(C(c) - LC(c))
      }
      return [
        [0, time, SMA(index, r1, 1, POS) / SMA(index, r1, 1, ABS) * 100],
        [0, time, SMA(index, r2, 1, POS) / SMA(index, r2, 1, ABS) * 100],
        [0, time, SMA(index, r3, 1, POS) / SMA(index, r3, 1, ABS) * 100],
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
    adapter (bar: IStockBar) {
      return [0, bar.time, bar.close, bar.high, bar.low]
    },
    input: [14],
    inputLabels: [],
    supportResolutions: SUPPORT_ALL_RESOLUTION,
    isPrice: false,
    isFixed: false,
    noLegend: false,
    output: (data: any[], index: number, input: any[]): any[][] => {
      const len = input[0]
      if (index - len < 0) {
        return null
      }
      const time = data[1]
      const TYP = function (c: number): number {
        return (C(c) + H(c) + L(c)) / 3
      }

      return [
        [
          0,
          time,
          (TYP(index) - MA(index, len, TYP)) / (0.015 * AVEDEV(index, len, TYP)),
        ],
      ]
    },
    plots: [
      {
        shape: 'line',
        style: {
          color: 'rgba(60, 120, 216, 1)',
        },
      },
    ],
  },
  'CR': {
    adapter (bar: IStockBar) {
      return [0, bar.time, bar.close, bar.high, bar.low]
    },
    input: [26, 5, 10, 20],
    inputLabels: [],
    supportResolutions: SUPPORT_ALL_RESOLUTION,
    isPrice: false,
    isFixed: false,
    noLegend: false,
    output: (data: any[], index: number, input: any[]): any[][] => {
      const n: number = input[0]
      const ma1: number = input[1]
      const ma2: number = input[2]
      const ma3: number = input[3]

      if (index - n < 0) {
        return null
      }

      const time = data[1]

      const MID = function (c: number): number {
        return (C(c) + H(c) + L(c)) / 3
      }

      const POS = function (c: number): number {
        return Math.max(0, H(c) - REF(c, 1, MID))
      }

      const NEG = function (c: number): number {
        return Math.max(0, REF(c, 1, MID) - L(c))
      }

      const CR = function (c: number): number {
        const { cacheObj } = getContext()
        const cacheKey = `CR${c}`

        if (cacheObj[cacheKey]) {
          return cacheObj[cacheKey]
        }

        const cr = SUM(c, n, POS) / SUM(c, n, NEG) * 100
        cacheObj[cacheKey] = cr
        return cr
      }

      const MA1 = function (c: number): number {
        return MA(c, ma1, CR)
      }

      const MA2 = function (c: number): number {
        return MA(c, ma2, CR)
      }

      const MA3 = function (c: number): number {
        return MA(c, ma3, CR)
      }

      return [
        [0, time, CR(index)],
        index - n - ma1 > 0 ? [0, time, REF(index, ma1 / 2.5 + 1, MA1)] : null,
        index - n - ma2 > 0 ? [0, time, REF(index, ma2 / 2.5 + 1, MA2)] : null,
        index - n - ma3 > 0 ? [0, time, REF(index, ma3 / 2.5 + 1, MA3)] : null,
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
          color: '#ff9900',
        },
      },
      {
        shape: 'line',
        style: {
          color: '#ff00ff',
        },
      },
      {
        shape: 'line',
        style: {
          color: '#00ff00',
        },
      },
    ],
  },
}
