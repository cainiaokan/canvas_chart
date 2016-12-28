import './index.less'
import '../../style/btn.less'

import * as React from 'react'
import * as _ from 'underscore'
import { StockDatasource } from '../../datasource'
import ChartLayout from '../../model/chartlayout'
import ChartModel from '../../model/chart'
import StudyModel from '../../model/study'
// import Dialog from '../../component/widget/dialog'
import { formatNumber } from '../../util'

/** 这里有性能问题，鼠标频繁重绘legend，windows Edge浏览器卡顿。想办法解决 */

type Prop = {
  chartLayout: ChartLayout
  chartModel: ChartModel
}

type State = {
  showSettingDialog?: boolean
}

export default class Legend extends React.Component<Prop, State> {
  public refs: {
    settingForm: HTMLFormElement
  }

  private _studyInSetting: StudyModel = null

  constructor (proportion: number) {
    super()
    this.state = {
      showSettingDialog: false,
    }
    this.cursorMoveHandler = this.cursorMoveHandler.bind(this)
    this.studySettingsDialogOpenHandler = this.studySettingsDialogOpenHandler.bind(this)
    this.studySettingDialogCloseHanlder = this.studySettingDialogCloseHanlder.bind(this)
    this.removeStudyHandler = this.removeStudyHandler.bind(this)
    this.removeCompareHandler = this.removeCompareHandler.bind(this)
    this.confirmBtnClickHanler = this.confirmBtnClickHanler.bind(this)
    this.privateSubmitForm = this.privateSubmitForm.bind(this)
    this.updateView = this.updateView.bind(this)
  }

  public shouldComponentUpdate (nextProps: Prop, nextState: State) {
    return !_.isEqual(this.state, nextState)
  }

  public componentDidMount () {
    const chartLayout = this.props.chartLayout
    chartLayout.addListener('cursor_move', this.cursorMoveHandler)
    chartLayout.addListener('graph_hover', this.updateView)
    chartLayout.addListener('graph_select', this.updateView)
    chartLayout.addListener('resolution_change', this.updateView)
    chartLayout.addListener('symbol_change', this.updateView)
    chartLayout.addListener('graph_add', this.updateView)
    chartLayout.addListener('graph_remove', this.updateView)
    chartLayout.addListener('graph_modify', this.updateView)
  }

  public componentWillUnmount () {
    const chartLayout = this.props.chartLayout
    chartLayout.removeListener('cursor_move', this.cursorMoveHandler)
    chartLayout.removeListener('graph_hover', this.updateView)
    chartLayout.removeListener('graph_select', this.updateView)
    chartLayout.removeListener('resolution_change', this.updateView)
    chartLayout.removeListener('symbol_change', this.updateView)
    chartLayout.removeListener('graph_add', this.updateView)
    chartLayout.removeListener('graph_remove', this.updateView)
    chartLayout.removeListener('graph_modify', this.updateView)
  }

  public render () {
    const chart = this.props.chartModel
    // 过滤出所有非指标图
    const mainGraph = chart.mainGraph
    const compares = chart.compares
    // 过滤出所有指标图
    const studies = chart.studies
    // 过滤出所有均线指标图
    const maStudies = studies.filter(graph => graph.studyType === 'MA' && graph.isVisible) as Array<StudyModel>
    // 过滤出所有非均线指标
    const nonMAStudies = studies.filter(graph => graph.studyType !== 'MA' && graph.isVisible) as Array<StudyModel>

    // const studyInSetting = this._studyInSetting
    // const input = this.state.showSettingDialog ? studyInSetting.input : null
    // const inputLabels = this.state.showSettingDialog ? studyInSetting.inputLabels : null

    return (
      <div className='chart-legend'>
        {
          [mainGraph].map(graph => {
            if (!graph) {
              return null
            }
            // 股票类图形
            const curBar = graph.getCurBar()
            const prevBar = graph.getPrevBar()
            const datasource = graph.datasource as StockDatasource
            const cur = curBar ? datasource.barAt(datasource.search(curBar[0][1])) : null
            const prev = prevBar ? datasource.barAt(datasource.search(prevBar[0][1])) : null
            const comparable = !!prev && !!cur
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
            return <div key={graph.id} className='chart-legend-line'
              style={ {fontWeight: graph.hover || graph.selected ? 600 : 'normal'} }>
              <div className='chart-legend-item main'>
                {!datasource.symbolInfo ? '加载中' : `${datasource.symbolInfo.description},${resolutionText}`}
              </div>
              {
                resolution === '1' ?
                <div className='chart-legend-item' style={ {
                     color: !!cur ? cur.changerate > 0 ?
                      colorUp : cur.changerate < 0 ?
                        colorDown : 'inherit' : 'inherit'} }>
                  现&nbsp;{cur ? cur.close.toFixed(2) : 'N/A'}
                </div> : [
                <div key='open' className='chart-legend-item' style={ {
                     color: comparable ? cur.open > prev.close ?
                      colorUp : cur.open < prev.close ?
                        colorDown : 'inherit' : 'inherit'} }>
                  开&nbsp;{cur ? cur.open.toFixed(2) : 'N/A'}
                </div>,
                <div key='high' className='chart-legend-item' style={ {
                     color: comparable ? cur.high > prev.close ?
                      colorUp : cur.high < prev.close ?
                        colorDown : 'inherit' : 'inherit',
                  display: resolution > '1' ? '' : 'none'} }>
                  高&nbsp;{cur ? cur.high.toFixed(2) : 'N/A'}
                </div>,
                <div key='low' className='chart-legend-item' style={ {
                     color: comparable ? cur.low > prev.close ?
                      colorUp : cur.low < prev.close ?
                        colorDown : 'inherit' : 'inherit',
                  display: resolution > '1' ? '' : 'none'} }>
                  低&nbsp;{cur ? cur.low.toFixed(2) : 'N/A'}
                </div>,
                <div key='close' className='chart-legend-item' style={ {
                     color: comparable ? cur.close > prev.close ?
                      colorUp : cur.close < prev.close ?
                        colorDown : 'inherit' : 'inherit',
                  display: resolution > '1' ? '' : 'none'} }>
                  收&nbsp;{cur ? cur.close.toFixed(2) : 'N/A'}
                </div>]
              }
              <div className='chart-legend-item'
                   style={ {
                    color: !!cur ? cur.changerate > 0 ?
                      colorUp : cur.changerate < 0 ?
                        colorDown : 'inherit' : 'inherit'} }>
                涨跌&nbsp;
                {
                  !!cur && typeof cur.changerate === 'number' ?
                    (cur.changerate > 0 ? '+' : '') +
                    (cur.changerate * 100).toFixed(2) + '%'
                    :'N/A'
                }
              </div>
              {
                !!cur && typeof cur.turnover === 'string' ?
                <div className='chart-legend-item'>
                  换手&nbsp;{ (+cur.turnover * 100).toFixed(2) + '%'}
                </div> : null
              }
              <div className='chart-legend-item'>
                量&nbsp;{!!cur ? formatNumber(cur.volume) + '手' : 'N/A'}
              </div>
              <div className='chart-legend-item'>
                额&nbsp;{!!cur ? formatNumber(cur.amount) : 'N/A'}
              </div>
            </div>
          })
        }
        {
          compares.map(graph => {
            const datasource = graph.datasource as StockDatasource
            const color = graph.styles[0].color
            const curBar = mainGraph.getCurBar()
            const cur = curBar ? datasource.barAt(datasource.search(curBar[0][1])) : null
            return <div key={graph.id} className='chart-legend-line'
              style={ {fontWeight: graph.hover || graph.selected ? 600 : 'normal'} }>
              <div className='chart-legend-item'>
                {!datasource.symbolInfo ? '加载中' : datasource.symbolInfo.description}
              </div>
              <div className='chart-legend-item' style={ { color } }>
                {cur ? cur.close.toFixed(2) : 'N/A'}
              </div>
              <a className='chart-legend-btn'
                 href='javascript:;'
                 data-id={graph.id}
                 onClick={this.removeCompareHandler}>
                <svg xmlns='http://www.w3.org/2000/svg' viewBox='-2.4 120.9 14 14' width='14' height='14'>
                  <path d='M-2.4 120.9v14h14v-14zm3.34 2.123l3.66 3.66 3.66-3.66 1.217 1.22-3.66 3.658 3.66 3.66-1.22 1.22-3.658-3.66-3.66 3.66-1.22-1.22 3.66-3.66-3.66-3.66z'></path>
                </svg>
              </a>
            </div>
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
                return <div key={ma.id} className='chart-legend-item'
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
          nonMAStudies.map(study => {
            if (!study.noLegend) {
              const curBar = study.getCurBar()
              return <div key={study.id} className='chart-legend-line'
                style={ {fontWeight: study.hover || study.selected ? 600 : 'normal'} }>
                <div className='chart-legend-item'>
                  {study.studyType}{
                    study.input ? `(${study.input.join(',')})` : ''
                  }
                </div>
                {
                  study.plots.map((__, index) => !study.styles[index].noLegend ?
                    <div key={index} className='chart-legend-item'
                    style={ {color: study.styles[index].color} }>
                      {curBar ? curBar[index][2].toFixed(4) : 'N/A'}
                    </div> : null
                  )
                }
                <a className='chart-legend-btn'
                   href='javascript:;'
                   data-id={study.id}
                   onClick={this.removeStudyHandler}>
                  <svg xmlns='http://www.w3.org/2000/svg' viewBox='-2.4 120.9 14 14' width='14' height='14'>
                    <path d='M-2.4 120.9v14h14v-14zm3.34 2.123l3.66 3.66 3.66-3.66 1.217 1.22-3.66 3.658 3.66 3.66-1.22 1.22-3.658-3.66-3.66 3.66-1.22-1.22 3.66-3.66-3.66-3.66z'></path>
                  </svg>
                </a>
              </div>
            }
          })
        }
        {/*
          this.state.showSettingDialog ?
          <Dialog title='设置' className='setting-dialog' onClose={this.studySettingDialogCloseHanlder}>
            <form ref='settingForm' className='chart-study-setting' onSubmit={this.privateSubmitForm}>
            {
              input.map((value, i) => {
                if (typeof value === 'number') {
                  return <div key={i}>
                    <div className='chart-study-setting-field'>
                      <label>{inputLabels[i]}</label>
                      <input type='text' maxLength={3} defaultValue={value + ''} />
                    </div>
                    <div className='chart-study-setting-btn-group clearfix'>
                      <button className='btn btn-gray btn-smaller' onClick={this.studySettingDialogCloseHanlder}>取消</button>
                      <button className='btn btn-blue btn-smaller' onClick={this.confirmBtnClickHanler}>确定</button>
                    </div>
                  </div>
                }
              })
            }
            </form>
          </Dialog> : null
        */}
      </div>
    )
  }

  private studySettingsDialogOpenHandler (ev) {
    this._studyInSetting = _.findWhere(this.props.chartModel.studies, { id: +ev.currentTarget.dataset.id })
    this.setState({ showSettingDialog: true })
  }

  private studySettingDialogCloseHanlder () {
    this._studyInSetting = null
    this.setState({ showSettingDialog: false })
  }

  private confirmBtnClickHanler () {
    const settingForm = this.refs.settingForm
    const input = this._studyInSetting.input.map(
      (value, i) =>
        settingForm[i].tagName.toUpperCase() === 'INPUT' ?
          +settingForm[i].value : Boolean(settingForm[i].value)
    )
    this.props.chartLayout.modifyGraph(this._studyInSetting, { input })
    this.studySettingDialogCloseHanlder()
  }

  private removeStudyHandler (ev) {
    const studyId = +ev.currentTarget.dataset.id
    this.props.chartLayout.removeStudy(this.props.chartModel, studyId)
  }

  private removeCompareHandler (ev) {
    const graphId = +ev.currentTarget.dataset.id
    this.props.chartLayout.removeComparison(graphId)
  }

  /**
   * 指针移动事件触发的回调处理函数
   * @param  {[type]} point 指针位置
   */
  private cursorMoveHandler (point) {
    if (point) {
      this.forceUpdate()
    }
  }

  private updateView () {
    this.forceUpdate()
  }

  private privateSubmitForm (ev) {
    ev.preventDefault()
  }
}
