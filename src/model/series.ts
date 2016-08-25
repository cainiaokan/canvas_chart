import * as _ from 'underscore'
import { ShapeType } from '../constant'
import { Datasource, IDataConverter } from '../datasource'
import { IChartStyle } from '../graphic/basechart'
import PlotModel from './plot'
import AxisXModel from './axisx'
import AxisYModel from './axisy'
import Graph from './graph'
import CrosshairModel from './crosshair'

export default class Series extends Graph {
  constructor (
    datasource: Datasource,
    axisX: AxisXModel,
    axisY: AxisYModel,
    crosshair: CrosshairModel,
    converter: IDataConverter,
    shape: ShapeType,
    style?: Array<IChartStyle>) {
    super(datasource)
    this._plots.push(
      new PlotModel(
        0,
        datasource,
        axisX, axisY,
        crosshair,
        shape,
        true,
        bar => bar,
        converter,
        null,
        _.extend({}, style[0])
      )
    )
  }
}
