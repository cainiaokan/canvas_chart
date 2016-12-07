import './index.less'
import '../../style/btn.less'
import 'react-datetime/css/react-datetime.css'
import * as moment from 'moment'
import * as React from 'react'
import * as Datetime from 'react-datetime'
import Dialog from '../../component/dialog'
import ChartLayoutModel from '../../model/chartlayout'
import { OPEN_HOURS } from '../../constant'

type Prop = {
  chartLayout: ChartLayoutModel
  width: number
  height: number
}

type State = {
  showGotoDateDialog?: boolean
  showCalendar?: boolean
}

const studyNames = ['MACD', 'KDJ', 'RSI', 'BOLL', 'CCI']
const dateTimeFormat = 'YYYY-MM-DD HH:mm'
const dateFormat = 'YYYY-MM-DD'

export default class FooterBar extends React.Component<Prop, State> {
  public refs: {
    dateInput: HTMLInputElement
  }

  private _studyStates = [false, false, false, false, false]
  private _inputDateValue: moment.Moment = null

  constructor () {
    super()
    this.state = {
      showGotoDateDialog: false,
      showCalendar: false,
    }
    this.changeStudyHandler = this.changeStudyHandler.bind(this)
    this.goToDateHandler = this.goToDateHandler.bind(this)
    this.inputClickHandler = this.inputClickHandler.bind(this)
    this.openGoToDateDialogHandler = this.openGoToDateDialogHandler.bind(this)
    this.datePickerBlurHandler = this.datePickerBlurHandler.bind(this)
    this.dateChangeHandler = this.dateChangeHandler.bind(this)
    this.dialogCloseHandler = this.dialogCloseHandler.bind(this)
    this.checkValidDate = this.checkValidDate.bind(this)
  }

  public shouldComponentUpdate (nextProps: Prop, nextState: State) {
    const curProps = this.props
    const curState = this.state
    return curProps.width !== nextProps.width ||
           curProps.height !== nextProps.height ||
           curState.showGotoDateDialog !== nextState.showGotoDateDialog ||
           curState.showCalendar !== nextState.showCalendar
  }

  public render () {
    const minHour = OPEN_HOURS[0][0][0]
    const maxHour = OPEN_HOURS[OPEN_HOURS.length - 1][1][0]
    const chartLayout = this.props.chartLayout
    const dontShowTime = chartLayout.mainDatasource.resolution > '60'
    const mainDatasource = chartLayout.mainDatasource
    const now = new Date(mainDatasource.now() * 1000)
    this.correctTime(now)

    const thisMoment = this._inputDateValue ?
                this._inputDateValue : moment(now).minute(now.getMinutes() - now.getMinutes() % 5)

    const nowDateStr =  dontShowTime ? thisMoment.format(dateFormat) : thisMoment.format(dateTimeFormat)

    this._inputDateValue = thisMoment

    return (
      <div className='chart-footerbar' style={ {width: this.props.width + 'px', height: this.props.height + 'px'} }>
        <div className='control-list'>
          {
            studyNames.map((study, i) =>
              <a href='javascript:;' data-index={i}
                className={this._studyStates[i] ? 'active' : ''}
                onClick={this.changeStudyHandler}>
                {study}
              </a>
            )
          }
          <a href='javascript:;' onClick={this.openGoToDateDialogHandler}>定位时间</a>
        </div>
        {
          this.state.showGotoDateDialog ?
          <Dialog title='定位时间' onClose={this.dialogCloseHandler}>
            <div className='chart-go-to-date'>
              <input ref='dateInput'
                     type='text'
                     readOnly={true}
                     defaultValue={nowDateStr}
                     onClick={this.inputClickHandler} />
              <button className='btn btn-blue' onClick={this.goToDateHandler}>前往</button>
            </div>
            <Datetime
              input={false}
              value={thisMoment.toDate()}
              open={this.state.showCalendar}
              isValidDate={this.checkValidDate}
              dateFormat={true}
              timeFormat={dontShowTime ? null : true}
              timeConstraints={ { hours: { min: minHour, max: maxHour }, minutes: { step: 5 } } }
              closeOnSelect={true}
              disableOnClickOutside={true}
              locale={'zh-cn'}
              onBlur={this.datePickerBlurHandler}
              onChange={this.dateChangeHandler} />
          </Dialog> : null
        }
      </div>
    )
  }

  private changeStudyHandler (ev) {
    const dom = ev.target
    const chartLayout = this.props.chartLayout
    const studyStates = this._studyStates
    const studyIndex = dom.dataset.index
    const studyName = dom.innerHTML

    if (!studyStates[studyIndex]) {
      studyStates[studyIndex] = true
      chartLayout.addStudy(studyName)
    } else {
      studyStates[studyIndex] = false
      chartLayout.removeStudy(studyName)
    }

    // 刷新视图
    this.forceUpdate()
  }

  // 输入框点击时
  private inputClickHandler () {
    this.setState({
      showCalendar: true,
    })
  }

  // “定位时间”按钮点击时
  private openGoToDateDialogHandler () {
    this.setState({
      showGotoDateDialog: true,
      showCalendar: false,
    })
  }

  // 定位时间对话框关闭时
  private dialogCloseHandler () {
    this.setState({
      showGotoDateDialog: false,
      showCalendar: false,
    })
  }

  // 点击“前往”按钮时
  private goToDateHandler () {
    const chartLayout = this.props.chartLayout
    const resolution = chartLayout.mainDatasource.resolution
    const toDate = this._inputDateValue.toDate()

    toDate.setSeconds(0)

    if (resolution > '60') {
      toDate.setHours(0)
      toDate.setMinutes(0)
    }

    this.dialogCloseHandler()
    chartLayout.goToDate(~~(toDate.getTime() / 1000))
  }

  // 日期选择器值发生变化时
  private dateChangeHandler (moment: moment.Moment) {
    const resolution = this.props.chartLayout.mainDatasource.resolution
    this._inputDateValue = moment
    this.refs.dateInput.value =
      moment.format(resolution > '60' ? moment.format(dateFormat) : moment.format(dateTimeFormat))
  }

  // 日期选择器关闭时
  private datePickerBlurHandler () {
    this.setState({
      showCalendar: false,
    })
  }

  // 校验日期是否可选。晚于当前日期都不可选。
  private checkValidDate (currentDate: moment.Moment, selectedDate: moment.Moment) {
    const now = this.props.chartLayout.mainDatasource.now()
    const thisMoment = moment(now * 1000)
    return !currentDate.isAfter(thisMoment)
  }

  // 校正日期，使其在开收盘的限制范围内
  private correctTime (date) {
    const minHour = OPEN_HOURS[0][0][0]
    const maxHour = OPEN_HOURS[OPEN_HOURS.length - 1][1][0]
    const minMinute = OPEN_HOURS[0][0][1]
    const maxMinute = OPEN_HOURS[OPEN_HOURS.length - 1][1][1]
    const hour = date.getHours()
    const minute = date.getMinutes()

    if (hour < minHour || (hour === minHour && minute < minMinute)) {
      date.setHours(minHour)
      date.setMinutes(minMinute)
    } else if (hour > maxHour || (hour === maxHour && minute > maxMinute)) {
      date.setHours(maxHour)
      date.setMinutes(maxMinute)
    }
  }
}
