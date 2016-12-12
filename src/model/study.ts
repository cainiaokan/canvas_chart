import * as _ from 'underscore'
import { StudyType } from '../constant'
import { Datasource, studyConfig } from '../datasource'
import { ChartStyle } from '../graphic/diagram'
import ChartModel from './chart'
import PlotModel from './plot'
import Graph from './graph'

export default class StudyModel extends Graph {

  private _studyType: StudyType
  private _styles: ChartStyle[]
  private _inputLabels: string[]

  constructor (
    datasource: Datasource,
    chart: ChartModel,
    study: StudyType,
    input?: any,
    style?: ChartStyle[]) {

    const config = studyConfig[study]
    super(datasource, chart, config.isPrice, false, false, config.stockAdapter, config.output, input || config.input)
    this._studyType = study
    this._styles = style || _.pluck(config.plots, 'style')
    this._inputLabels = config.inputLabels || []

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

  get inputLabels (): string[] {
    return this._inputLabels
  }
}
