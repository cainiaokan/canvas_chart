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

  constructor (
    datasource: Datasource,
    axisX: AxisXModel,
    axisY: AxisYModel,
    crosshair: CrosshairModel,
    study: StudyType,
    adapter: IDataAdapter,
    input: any = null,
    style: Array<IChartStyle> = []) {
    super(datasource)
    const config = studyConfig[study]
    this._plots = []
    config.plots.forEach((plotConfig, index) => {
      this._plots.push(
        new PlotModel(
          index,
          datasource,
          axisX, axisY,
          crosshair,
          plotConfig.shape,
          plotConfig.isPrice,
          adapter,
          config.output,
          input,
          _.extend({}, plotConfig.style, style[index])
        )
      )
    })
  }
}
