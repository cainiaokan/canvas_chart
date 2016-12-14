import './index.less'
import '../../style/btn.less'

import * as React from 'react'
import * as _ from 'underscore'
import { StockDatasource } from '../../datasource'
import ChartLayout from '../../model/chartlayout'
import ChartModel from '../../model/chart'
import StudyModel from '../../model/study'
import StockModel from '../../model/stock'
import Dialog from '../../component/dialog'
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
    this.studyDeleteHandler = this.studyDeleteHandler.bind(this)
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
    chartLayout.addListener('symbol_resolved', this.updateView)
    chartLayout.addListener('graph_add', this.updateView)
    chartLayout.addListener('graph_delete', this.updateView)
    chartLayout.addListener('graph_modify', this.updateView)

  }

  public componentWillUnmound () {
    const chartLayout = this.props.chartLayout
    chartLayout.removeListener('cursor_move', this.cursorMoveHandler)
    chartLayout.removeListener('graph_hover', this.updateView)
    chartLayout.removeListener('graph_select', this.updateView)
    chartLayout.removeListener('resolution_change', this.updateView)
    chartLayout.removeListener('symbol_change', this.updateView)
    chartLayout.removeListener('symbol_resolved', this.updateView)
    chartLayout.removeListener('graph_add', this.updateView)
    chartLayout.removeListener('graph_delete', this.updateView)
    chartLayout.removeListener('graph_modify', this.updateView)
  }

  public render () {
    const chart = this.props.chartModel
    // 过滤出所有非指标图
    const nonStudies = chart.nonStudies
    // 过滤出所有指标图
    const studies = chart.studies
    // 过滤出所有均线指标图
    const maStudies = studies.filter(graph => graph.studyType === 'MA') as Array<StudyModel>
    // 过滤出所有非均线指标
    const nonMAStudies = studies.filter(graph => graph.studyType !== 'MA') as Array<StudyModel>

    const studyInSetting = this._studyInSetting
    const input = this.state.showSettingDialog ? studyInSetting.input : null
    const inputLabels = this.state.showSettingDialog ? studyInSetting.inputLabels : null

    return (
      <div className='chart-legend'>
        {
          nonStudies.map(graph => {
            // 股票类图形
            if (graph instanceof StockModel) {
              const curBar = graph.getCurBar()
              const prevBar = graph.getPrevBar()
              const datasource = graph.datasource as StockDatasource
              const cur = curBar ? datasource.barAt(datasource.search(curBar[0][1])) : null
              const prev = prevBar ? datasource.barAt(datasource.search(prevBar[0][1])) : null
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
                    {!datasource.symbolInfo ? '加载中' : `${datasource.symbolInfo.description},${resolutionText}`}
                  </div>
                  <div className='chart-legend-item' style={ cur ? {
                    color: cur.changerate > 0 ?
                      colorUp : cur.changerate < 0 ?
                        colorDown : 'inherit',
                    display: resolution === '1' ? '' : 'none'} : {display : 'none'} }>
                    现价&nbsp;{cur ? formatNumber(cur.close) : 'N/A'}
                  </div>
                  <div className='chart-legend-item' style={ cur ? {
                    color: prev ? cur.open > prev.close ?
                      colorUp : cur.open < prev.close ?
                        colorDown : 'inherit' : 'inherit',
                    display: resolution > '1' ? '' : 'none'} : {display : 'none'} }>
                    开盘&nbsp;{cur ? formatNumber(cur.open) : 'N/A'}
                  </div>
                  <div className='chart-legend-item' style={ cur ? {
                    color: prev ? cur.high > prev.close ?
                      colorUp : cur.high < prev.close ?
                        colorDown : 'inherit' : 'inherit',
                    display: resolution > '1' ? '' : 'none'} : {display : 'none'} }>
                    最高&nbsp;{cur ? formatNumber(cur.high) : 'N/A'}
                  </div>
                  <div className='chart-legend-item' style={ cur ? {
                    color: prev ? cur.low > prev.close ?
                      colorUp : cur.low < prev.close ?
                        colorDown : 'inherit' : 'inherit',
                    display: resolution > '1' ? '' : 'none'} : {display : 'none'} }>
                    最低&nbsp;{cur ? formatNumber(cur.low) : 'N/A'}
                  </div>
                  <div className='chart-legend-item' style={ cur ? {
                    color: prev ? cur.close > prev.close ?
                      colorUp : cur.close < prev.close ?
                        colorDown : 'inherit' : 'inherit',
                    display: resolution > '1' ? '' : 'none'} : {display : 'none'} }>
                    收盘&nbsp;{cur ? formatNumber(cur.close) : 'N/A'}
                  </div>
                  <div className='chart-legend-item'
                    style={ cur ? {
                      color: cur.changerate > 0 ?
                        colorUp : cur.changerate < 0 ?
                          colorDown : 'inherit',
                      display: typeof cur.changerate === 'number' ? '' : 'none'} : {display: 'none'}}>
                    涨跌幅&nbsp;
                    {
                      cur && typeof cur.changerate === 'number' ?
                        (cur.changerate > 0 ? '+' : '') +
                        (cur.changerate * 100).toFixed(2) + '%'
                        :'N/A'
                    }
                  </div>
                  <div className='chart-legend-item'
                  style={ {display: cur && typeof cur.turnover === 'string' ? '' : 'none'} }>
                    换手率&nbsp;{ cur && typeof cur.turnover === 'string' ? (+cur.turnover * 100).toFixed(2) + '%' : 'N/A'}
                  </div>
                  <div className='chart-legend-item' style={ {display:cur ? '' : 'none'} }>
                    成交量&nbsp;{cur ? formatNumber(cur.volume) + '手' : 'N/A'}
                  </div>
                  <div className='chart-legend-item' style={ {display:cur ? '' : 'none'} }>
                    成交额&nbsp;{cur ? formatNumber(cur.amount) : 'N/A'}
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
                  {/*<a className='chart-legend-btn' href='javascript:;'>
                    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 14 14' width='14' height='14'>
                      <path d='M0 0v14h14V0zm7 2.69c3.018 0 5.172 3.232 5.172 4.31 0 1.077-2.154 4.31-5.172 4.31S1.828 8.08 1.828 7c0-1.077 2.154-4.31 5.172-4.31zm0 1.508C5.49 4.198 4.198 5.49 4.198 7S5.49 9.802 7 9.802 9.802 8.51 9.802 7 8.51 4.198 7 4.198zm0 1.68c.646 0 1.12.476 1.12 1.122 0 .646-.473 1.12-1.12 1.12-.646 0-1.12-.473-1.12-1.12 0-.646.473-1.12 1.12-1.12z'></path>
                    </svg>
                  </a>*/}
                  <a className='chart-legend-btn'
                     href='javascript:;'
                     data-id={ma.id}
                     onClick={this.studySettingsDialogOpenHandler}>
                    <svg xmlns='http://www.w3.org/2000/svg' viewBox='-2.4 120.9 14 14' width='14' height='14'>
                      <path d='M-2.4 120.9v14h14v-14zm6.086 1.803H5.52v1.332c.416.1.805.258 1.166.48l.944-.935 1.297 1.297-.943.943c.215.35.38.748.48 1.164H9.8v1.837H8.463c-.1.417-.257.806-.48 1.167l.935.944-1.296 1.298-.944-.943c-.35.215-.747.38-1.164.48v1.332H3.677v-1.33c-.415-.102-.804-.258-1.165-.482l-.943.936-1.298-1.296.94-.945c-.216-.35-.38-.748-.482-1.165H-.597v-1.835H.737c.1-.416.257-.805.48-1.166l-.935-.944 1.296-1.297.944.943c.35-.215.747-.38 1.164-.48zm.912 3.053c-1.188 0-2.143.963-2.143 2.143 0 1.187.963 2.143 2.143 2.143 1.18 0 2.14-.963 2.145-2.145 0-1.188-.966-2.144-2.145-2.144z'></path>
                    </svg>
                  </a>
                  <a className='chart-legend-btn'
                     href='javascript:;'
                     data-id={ma.id}
                     onClick={this.studyDeleteHandler}>
                    <svg xmlns='http://www.w3.org/2000/svg' viewBox='-2.4 120.9 14 14' width='14' height='14'>
                      <path d='M-2.4 120.9v14h14v-14zm3.34 2.123l3.66 3.66 3.66-3.66 1.217 1.22-3.66 3.658 3.66 3.66-1.22 1.22-3.658-3.66-3.66 3.66-1.22-1.22 3.66-3.66-3.66-3.66z'></path>
                    </svg>
                  </a>
                </div>
              })
            }
          </div> : null
        }
        {
          nonMAStudies.map(study => {
            if (study.studyType !== 'VOLUME') {
              const curBar = study.getCurBar()
              return <div className='chart-legend-line'
                style={ {fontWeight: study.hover || study.selected ? 600 : 'normal'} }>
                <div className='chart-legend-item'>
                  {study.studyType}({study.input.join(',')})
                </div>
                {
                  curBar && curBar.map((bar, index) => !study.styles[index].noLegend ?
                    <div className='chart-legend-item'
                    style={ {color: study.styles[index].color} }>
                      {bar[2].toFixed(4)}
                    </div> : null
                  )
                }
                <a className='chart-legend-btn'
                   href='javascript:;'
                   data-id={study.id}
                   onClick={this.studyDeleteHandler}>
                  <svg xmlns='http://www.w3.org/2000/svg' viewBox='-2.4 120.9 14 14' width='14' height='14'>
                    <path d='M-2.4 120.9v14h14v-14zm3.34 2.123l3.66 3.66 3.66-3.66 1.217 1.22-3.66 3.658 3.66 3.66-1.22 1.22-3.658-3.66-3.66 3.66-1.22-1.22 3.66-3.66-3.66-3.66z'></path>
                  </svg>
                </a>
              </div>
            }
          })
        }
        {
          this.state.showSettingDialog ?
          <Dialog title='设置' className='setting-dialog' onClose={this.studySettingDialogCloseHanlder}>
            <form ref='settingForm' className='chart-study-setting' onSubmit={this.privateSubmitForm}>
            {
              input.map((value, i) => {
                if (typeof value === 'number') {
                  return <div>
                    <div className='chart-study-setting-field'>
                      <label>{inputLabels[i]}</label>
                      <input type='text' maxLength={3} defaultValue={value + ''} />
                    </div>
                    <div className='chart-study-setting-btn-group clearfix'>
                      <a href='javascript:;' className='btn btn-gray btn-smaller' onClick={this.studySettingDialogCloseHanlder}>取消</a>
                      <a href='javascript:;' className='btn btn-blue btn-smaller' onClick={this.confirmBtnClickHanler}>确定</a>
                    </div>
                  </div>
                }
              })
            }
            </form>
          </Dialog> : null
        }
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
    const newInput = this._studyInSetting.input.map((value, i) => settingForm[i].tagName.toUpperCase() === 'INPUT' ? +settingForm[i].value : Boolean(settingForm[i].value))
    this.props.chartLayout.modifyStudy(this._studyInSetting, newInput)
    this.studySettingDialogCloseHanlder()
  }

  private studyDeleteHandler (ev) {
    const studyId = +ev.currentTarget.dataset.id
    this.props.chartLayout.deleteStudy(this.props.chartModel, studyId)
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
