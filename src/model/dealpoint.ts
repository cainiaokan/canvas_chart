import { StaticDatasource, IDBar } from '../datasource'
import ChartModel from './chart'
import PlotModel from './plot'
import GraphModel from './graph'

function adapterFunc (bar) {
  bar = bar as IDBar
  return[0, bar.time, bar.type, bar.price]
}

export default class DealPointModel extends GraphModel {
  constructor (
    datasource: StaticDatasource<IDBar>,
    chart: ChartModel) {
    super(datasource, chart, 1, true, false, false, false, true, null, adapterFunc, bar => [bar])
    this._plots.push(
      new PlotModel(
        this,
        0,
        'arrow',
        null,
      )
    )
  }

  public draw () {
    const ctx = this._chart.ctx
    super.draw(ctx)
  }

  /**
   * override
   */
  public invalidateLastBarCache () {
    // do nothing
  }
}
