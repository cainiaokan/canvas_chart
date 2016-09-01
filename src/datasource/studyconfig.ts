import { IChartStyle } from '../graphic/basechart'
import { ShapeType } from '../constant'
import { Datasource, IBar, IDataAdapter, ILineBar, IColumnBar } from '../datasource'

export interface IDataConverter {
  (
    data: Array<any>,
    index: number,
    datasource: Datasource,
    adapter: IDataAdapter,
    input: any
  ): Array<IBar>
}

interface IStudyConfig {
  [propName: string]: {
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
    output: function (
      data: Array<any>,
      index: number,
      datasource: Datasource,
      adapter: IDataAdapter,
      input: any): Array<ILineBar> {

      const length = input.length
      const start = index - length + 1
      const end = index + 1

      if (end - start < input || start < 0) {
        return null
      }

      return [{
        time: data[0],
        val: datasource
          .slice(start, end)
          .reduce((prev, cur) => prev + adapter(cur)[1], 0) / length,
      }]
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
    output: function (
      data: Array<any>,
      index: number,
      datasource: Datasource,
      adapter: IDataAdapter,
      input: any): Array<IColumnBar> {
      return [{
        down: data[2],
        time: data[0],
        val: data[1],
      }]
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
}
