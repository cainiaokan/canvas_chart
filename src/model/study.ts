import * as _ from 'underscore'
import { StudyType } from '../constant'
import { Datasource, studyConfig, IDataAdapter } from '../datasource'
import { IChartStyle } from '../graphic/basechart'
import PlotModel from './plot'
import AxisXModel from './axisx'
import AxisYModel from './axisy'
import Graph from './graph'
import CrosshairModel from './crosshair'

export default class StudyModel extends Graph {

  private _studyType: StudyType
  private _styles: Array<IChartStyle>

  constructor (
    datasource: Datasource,
    axisX: AxisXModel,
    axisY: AxisYModel,
    crosshair: CrosshairModel,
    study: StudyType,
    adapter: IDataAdapter,
    input: any = null,
    style?: Array<IChartStyle>) {

    const config = studyConfig[study]
    super(datasource, axisX, axisY, crosshair, config.isPrice, adapter, config.output, input)
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

  get styles (): Array<IChartStyle> {
    return this._styles
  }

  get input (): any {
    return this._input
  }
}
