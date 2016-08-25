import { IChartStyle } from '../graphic/basechart'
import { ShapeType } from '../constant'
import { Datasource, IBar, IDataAdapter, ILineBar, IColumnBar } from '../datasource'

export interface IDataConverter {
  (
    data: Array<any> | IBar,
    index: number,
    datasource: Datasource,
    adapter: IDataAdapter,
    input: any
  ): Array<IBar>
}

interface IStudyConfig {
  [propName: string]: {
    output: IDataConverter
    plots: Array<{
      isPrice: boolean
      style: IChartStyle
      shape: ShapeType
    }>
  }
}

export const studyConfig: IStudyConfig = {
  'MA': {
    output: function (
      data: Array<any>,
      index: number,
      datasource: Datasource,
      adapter: IDataAdapter,
      input: any): Array<ILineBar> {

      const start = index - input + 1
      const end = index + 1

      if (end - start < input || start < 0) {
        return null
      }

      return [{
        time: data[0],
        val: datasource
          .slice(start, end)
          .reduce((prev, cur) => prev + adapter(cur)[1], 0) / input,
      }]
    },
    plots: [
      {
        isPrice: true,
        shape: 'line',
        style: {
          lineColor: '#000000',
          lineWidth: 1,
        },
      },
    ],
  },
  'VOLUME': {
    output: function (
      data: Array<any>,
      index: number,
      datasource: Datasource,
      adapter: IDataAdapter,
      input: any): Array<IColumnBar> {
      return [{
        positive: data[2],
        time: data[0],
        val: data[1],
      }]
    },
    plots: [
      {
        isPrice: false,
        shape: 'column',
        style: {
          highColor: '#ff524f',
          lowColor: '#2bbe65',
        },
      },
    ],
  },
}
