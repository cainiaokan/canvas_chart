import * as _ from 'underscore'
import { StudyType } from '../constant'
import { ChartStyle } from '../graphic/diagram'
import ChartModel from './chart'
import { studyConfig, Datasource, PressureSupportDatasource } from '../datasource'
import PlotModel from './plot'
import Graph from './graph'

export default class StudyModel extends Graph {

  private _studyType: StudyType
  private _inputLabels: string[]
  private _noLegend: boolean
  private _datasourceType: 'remote' | 'local'

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
    let datasource: Datasource = null
    switch (study) {
      case '压力支撑':
        datasource = new PressureSupportDatasource(symbol, resolution, timeDif)
        break
      default:
        datasource = chart.datasource
        break
    }
    styles = styles || _.pluck(config.plots, 'style')

    super(datasource, chart, config.priority, config.isPrice, config.isRemovable, false, false, visible, styles, config.adapter, config.output, input || config.input)
    this._studyType = study
    this._datasourceType = config.datasourceType
    this._inputLabels = config.inputLabels || []
    this._noLegend = !!config.noLegend
    config.plots.forEach((plotConfig, index) => {
      this._plots.push(
        new PlotModel(
          this,
          index,
          plotConfig.shape,
          _.extend({}, plotConfig.style, styles ? styles[index] : {}),
          config.range,
        )
      )
    })
  }

  get noLegend (): boolean {
    return this._noLegend
  }

  get studyType (): StudyType {
    return this._studyType
  }

  get datasourceType (): 'local' | 'remote' {
    return this._datasourceType
  }

  get inputLabels (): string[] {
    return this._inputLabels
  }
}
