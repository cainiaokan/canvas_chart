import { IChartStyle } from '../graphic/basechart'
import { ShapeType } from '../constant'
import { Datasource, IDataAdapter } from '../datasource'
import { cacheable, EMA, DEA, K, D } from './studyhelper'

export type IDataConverter = {
  (
    data: any[],
    index: number,
    datasource: Datasource,
    adapter: IDataAdapter,
    input: any[],
    cache?: {[propName: string]: any}
  ): any[][]
  clearCache? (): void
}

type IStudyConfig = {
  [propName: string]: {
    [propName: string]: any,
    isPrice: boolean
    output: IDataConverter
    plots: Array<{
      style: IChartStyle
      shape: ShapeType
    }>
  }
}

export const studyConfig: IStudyConfig = {
  'MA': {
    isPrice: true,
    output: (
      data: any[],
      index: number,
      datasource: Datasource,
      adapter: IDataAdapter,
      input: any[]): any[][] => {

      const length = input[0]
      const start = index - length + 1
      const end = index + 1

      if (end - start < length || start < 0) {
        return null
      }

      return [
        [
          data[0],
          data[1],
          datasource.slice(start, end).reduce((prev, cur) => prev + adapter(cur)[2], 0) / length,
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
        },
      },
    ],
  },
  'MACD': {
    isPrice: false,
    output: cacheable((
      data: any[],
      index: number,
      datasource: Datasource,
      adapter: IDataAdapter,
      input: any[],
      cache: {[propName: string]: any}): any[][] => {
      const dif = EMA(input[0], index, datasource, adapter, cache) -
        EMA(input[1], index, datasource, adapter, cache)
      const dea = DEA(input[2], input[1], input[0], index, datasource, adapter, cache)
      const bar = (dif - dea) * 2
      return [
        [data[0], data[1], bar],
        [data[0], data[1], dif],
        [data[0], data[1], dea],
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
    isPrice: false,
    output: cacheable((
      data: any[],
      index: number,
      datasource: Datasource,
      adapter: IDataAdapter,
      input: any[],
      cache: {[propName: string]: any}): any[][] => {
      const k = K(input[0], input[1], index, datasource, adapter, cache)
      const d = D(input[0], input[1], input[2], index, datasource, adapter, cache)
      const j = 3 * k - 2 * d
      return [
        [data[0], data[1], k],
        [data[0], data[1], d],
        [data[0], data[1], j],
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
