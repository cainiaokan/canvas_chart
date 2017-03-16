import * as _ from 'underscore'
import { StudyType } from '../constant'
import { ChartStyle } from '../graphic/diagram'
import ChartModel from './chart'
import { studyConfig, PressureSupportDatasource } from '../datasource'
import PlotModel from './plot'
import Graph from './graph'

export default class StudyModel extends Graph {

  private _studyType: StudyType
  private _inputLabels: string[]
  private _noLegend: boolean
  private _isFixed: boolean

  constructor (
    chart: ChartModel,
    study: StudyType,
    visible = true,
    input?: any,
    styles?: ChartStyle[]) {
    const config = studyConfig[study]
    const mainDatasource = chart.chartLayout.mainDatasource
    const symbol = mainDatasource.symbol
    const resolution = mainDatasource.resolution
    const timeDif = mainDatasource.timeDiff
    let datasource = null
    switch (study) {
      case '压力支撑':
        datasource = new PressureSupportDatasource(symbol, resolution, timeDif)
        break
      default:
        datasource = chart.datasource
        break
    }
    styles = styles || _.pluck(config.plots, 'style')

    super(datasource, chart, config.isPrice, false, false, visible, styles, config.adapter, config.output, input || config.input)
    this._isFixed = config.isFixed
    this._studyType = study
    this._inputLabels = config.inputLabels || []
    this._noLegend = !!config.noLegend
    config.plots.forEach((plotConfig, index) => {
      this._plots.push(
        new PlotModel(
          this,
          index,
          plotConfig.shape,
          _.extend({}, plotConfig.style, styles ? styles[index] : {})
        )
      )
    })
  }

  get isFixed (): boolean {
    return this._isFixed
  }

  get noLegend (): boolean {
    return this._noLegend
  }

  get studyType (): StudyType {
    return this._studyType
  }

  get inputLabels (): string[] {
    return this._inputLabels
  }
}
