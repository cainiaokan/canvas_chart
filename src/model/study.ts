import * as _ from 'underscore'
import { StudyType } from '../constant'
import { Datasource, studyConfig, DataAdapter } from '../datasource'
import { ChartStyle } from '../graphic/basechart'
import ChartModel from './chart'
import PlotModel from './plot'
import Graph from './graph'

export default class StudyModel extends Graph {

  private _studyType: StudyType
  private _styles: ChartStyle[]

  constructor (
    datasource: Datasource,
    chart: ChartModel,
    study: StudyType,
    adapter: DataAdapter,
    input: any = null,
    style?: ChartStyle[]) {

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

  get styles (): ChartStyle[] {
    return this._styles
  }

  get input (): any {
    return this._input
  }
}
