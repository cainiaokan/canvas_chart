import * as _ from 'underscore'
import { StudyType } from '../constant'
import { Datasource, studyConfig, IDataAdapter } from '../datasource'
import { IChartStyle } from '../graphic/basechart'
import ChartModel from './chart'
import PlotModel from './plot'
import Graph from './graph'

export default class StudyModel extends Graph {

  private _studyType: StudyType
  private _styles: IChartStyle[]

  constructor (
    datasource: Datasource,
    chart: ChartModel,
    study: StudyType,
    adapter: IDataAdapter,
    input: any = null,
    style?: IChartStyle[]) {

    const config = studyConfig[study]
    super(datasource, chart, config.isPrice, adapter, config.output, input)
    this._studyType = study
    this._styles = style || _.pluck(config.plots, 'style')

    config.plots.forEach((plotConfig, index) => {
      this._plots.push(
        new PlotModel(
          this,
          index,
          plotConfig.shape,
          _.extend({}, plotConfig.style, style ? style[index] : {})
        )
      )
    })
  }

  get studyType (): StudyType {
    return this._studyType
  }

  get styles (): IChartStyle[] {
    return this._styles
  }

  get input (): any {
    return this._input
  }
}
