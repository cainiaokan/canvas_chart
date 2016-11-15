import './index.less'
import * as React from 'react'
import { StockDatasource, IStockBar } from '../../datasource'
import ChartModel from '../../model/chart'
import StudyModel from '../../model/study'
import StockModel from '../../model/stock'
import { formatNumber } from '../../util'

type Prop = {
  chartModel: ChartModel
}

export default class Legend extends React.Component<Prop, any> {

  constructor (proportion: number) {
    super()
    this.updateView = this.updateView.bind(this)
  }

  public componentShouldUpdate (nextProps: Prop) {
    const curProp = this.props
    return curProp.chartModel !== nextProps.chartModel
  }

  public componentDidMount () {
    this.props.chartModel.chartLayout.addListener('cursormove', this.updateView)
    this.props.chartModel.chartLayout.addListener('hit', this.updateView)
    this.props.chartModel.chartLayout.addListener('resolutionchange', this.updateView)
    this.props.chartModel.chartLayout.addListener('symbolchange', this.updateView)
  }

  public componentWillUnmound () {
    this.props.chartModel.chartLayout.removeListener('cursormove', this.updateView)
    this.props.chartModel.chartLayout.removeListener('hit', this.updateView)
    this.props.chartModel.chartLayout.removeListener('resolutionchange', this.updateView)
    this.props.chartModel.chartLayout.removeListener('symbolchange', this.updateView)
  }

  public render () {
    const maStudies = this.props.chartModel.graphs
      .filter(graph => graph instanceof StudyModel && graph.studyType === 'MA') as Array<StudyModel>
    return (
      <div className='chart-legend'>
        {
          this.props.chartModel.graphs.filter(graph => !(graph instanceof StudyModel)).map(graph => {
            if (graph instanceof StockModel) {
              const bars = graph.getCurBar()
              const prevBars = graph.getPrevBar()
              const datasource = graph.datasource as StockDatasource
              const bar = bars ?
                datasource.barAt(datasource.search(bars[0][1])) as IStockBar : null
              const prev = prevBars ?
                datasource.barAt(datasource.search(prevBars[0][1])) as IStockBar : null
              const colorUp = '#FF0000'
              const colorDown = '#008000'
              const resolution = datasource.resolution
              let resolutionText = null
              switch (resolution) {
                case '1':
                  resolutionText = '分时线'
                  break
                case '5':
                  resolutionText = '5分钟线'
                  break
                case '15':
                  resolutionText = '15分钟线'
                  break
                case '30':
                  resolutionText = '30分钟线'
                  break
                case '60':
                  resolutionText = '60分钟线'
                  break
                case 'D':
                  resolutionText = '日K线'
                  break
                case 'W':
                  resolutionText = '周K线'
                  break
                case 'M':
                  resolutionText = '月K线'
                  break
                default:
                  break
              }
              return [
              <div className='chart-legend-line'
                style={ {fontWeight: graph.hover || graph.selected ? 600 : 'normal'} }>
                <div className='chart-legend-item main'>
                  {datasource.symbolInfo ? datasource.symbolInfo.description : 'N/A'},{resolutionText}
                </div>
                <div className='chart-legend-item' style={ bar ? {
                  color: bar.changerate > 0 ?
                    colorUp : bar.changerate < 0 ?
                      colorDown : 'inherit',
                  display: resolution === '1' ? '' : 'none'} : {display : 'none'} }>
                  现价&nbsp;{bar ? formatNumber(bar.close) : 'N/A'}
                </div>
                <div className='chart-legend-item' style={ bar ? {
                  color: prev ? bar.open > prev.close ?
                    colorUp : bar.open < prev.close ?
                      colorDown : 'inherit' : 'inherit',
                  display: resolution > '1' ? '' : 'none'} : {display : 'none'} }>
                  开盘&nbsp;{bar ? formatNumber(bar.open) : 'N/A'}
                </div>
                <div className='chart-legend-item' style={ bar ? {
                  color: prev ? bar.high > prev.close ?
                    colorUp : bar.high < prev.close ?
                      colorDown : 'inherit' : 'inherit',
                  display: resolution > '1' ? '' : 'none'} : {display : 'none'} }>
                  最高&nbsp;{bar ? formatNumber(bar.high) : 'N/A'}
                </div>
                <div className='chart-legend-item' style={ bar ? {
                  color: prev ? bar.low > prev.close ?
                    colorUp : bar.low < prev.close ?
                      colorDown : 'inherit' : 'inherit',
                  display: resolution > '1' ? '' : 'none'} : {display : 'none'} }>
                  最低&nbsp;{bar ? formatNumber(bar.low) : 'N/A'}
                </div>
                <div className='chart-legend-item' style={ bar ? {
                  color: prev ? bar.close > prev.close ?
                    colorUp : bar.close < prev.close ?
                      colorDown : 'inherit' : 'inherit',
                  display: resolution > '1' ? '' : 'none'} : {display : 'none'} }>
                  收盘&nbsp;{bar ? formatNumber(bar.close) : 'N/A'}
                </div>
                <div className='chart-legend-item'
                  style={ bar ? {
                    color: bar.changerate > 0 ?
                      colorUp : bar.changerate < 0 ?
                        colorDown : 'inherit',
                    display: typeof bar.changerate === 'number' ? '' : 'none'} : {display: 'none'}}>
                  涨跌幅&nbsp;
                  {
                    bar && typeof bar.changerate === 'number' ?
                      (bar.changerate > 0 ? '+' : '') +
                      (bar.changerate * 100).toFixed(2) + '%'
                      :'N/A'
                  }
                </div>
                <div className='chart-legend-item'
                style={ {display: bar && typeof bar.turnover === 'string' ? '' : 'none'} }>
                  换手率&nbsp;{ bar && typeof bar.turnover === 'string' ? (+bar.turnover * 100).toFixed(2) + '%' : 'N/A'}
                </div>
              </div>,
              <div className='chart-legend-line'
                style={ {fontWeight: graph.hover || graph.selected ? 600 : 'normal'} }>
                <div className='chart-legend-item' style={ {display:bar ? '' : 'none'} }>
                  成交量&nbsp;{bar ? formatNumber(bar.volume) + '手' : 'N/A'}
                </div>
                <div className='chart-legend-item' style={ {display:bar ? '' : 'none'} }>
                  成交额&nbsp;{bar ? formatNumber(bar.amount) : 'N/A'}
                </div>
              </div>,
              ]
            }
          })
        }
        {
          maStudies.length ?
          <div className='chart-legend-line'>
            {
              maStudies.map(ma => {
                const bars = ma.getCurBar()
                const bar = bars ? bars[0] : null
                const styles = ma.styles
                return <div className='chart-legend-item'
                  style={ {
                    color: styles[0].color,
                    fontWeight: ma.hover || ma.selected ? 600 : 'normal',
                  } }>
                  {ma.studyType}{ma.input[0]}:&nbsp;{bar ? bar[2].toFixed(2) : 'N/A'}
                </div>
              })
            }
          </div> : null
        }
        {
          this.props.chartModel.graphs.filter(graph => (graph instanceof StudyModel)).map(graph => {
             if (graph instanceof StudyModel && graph.studyType !== 'MA' && graph.studyType !== 'VOLUME') {
              const bars = graph.getCurBar()
              return <div className='chart-legend-line'
                style={ {fontWeight: graph.hover || graph.selected ? 600 : 'normal'} }>
                <div className='chart-legend-item'>
                  {graph.studyType}({graph.input.join(',')})
                </div>
                {
                  bars && bars.map((bar, index) => !graph.styles[index].noLegend ?
                    <div className='chart-legend-item'
                    style={ {color: graph.styles[index].color} }>
                      {bar[2].toFixed(4)}
                    </div> : null
                  )
                }
              </div>
            }
          })
        }
      </div>
    )
  }

  private updateView () {
    this.forceUpdate()
  }
}
