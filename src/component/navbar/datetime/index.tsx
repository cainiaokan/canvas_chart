import './index.less'
import '../../../style/btn.less'
import 'react-datetime/css/react-datetime.css'
import * as React from 'react'
import * as moment from 'moment'
import * as _ from 'underscore'
import * as DatetimePicker from 'react-datetime'
import Dialog from '../../../component/dialog'
import ChartLayoutModel from '../../../model/chartlayout'
import { OPEN_HOURS } from '../../../constant'

type Prop = {
  chartLayout: ChartLayoutModel
}

const dateTimeFormat = 'YYYY-MM-DD HH:mm'
const dateFormat = 'YYYY-MM-DD'

type State = {
  showDialog?: boolean
  showDatetimePicker?: boolean
}

export default class Datetime extends React.Component<Prop, State> {
  public refs: {
    dateInput: HTMLInputElement
  }

  private _inputDateValue: moment.Moment = null

  constructor () {
    super()
    this.state = {
      showDialog: false,
      showDatetimePicker: false,
    }
    this.inputClickHandler = this.inputClickHandler.bind(this)
    this.dateChangeHandler = this.dateChangeHandler.bind(this)
    this.datePickerBlurHandler = this.datePickerBlurHandler.bind(this)
    this.openDialogHandler = this.openDialogHandler.bind(this)
    this.dialogCloseHandler = this.dialogCloseHandler.bind(this)
    this.goToDateHandler = this.goToDateHandler.bind(this)
    this.checkDateHandler = this.checkDateHandler.bind(this)
  }

  public shouldComponentUpdate (nextProps: Prop, nextState: State) {
    return !_.isEqual(this.state, nextState)
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

    return <div className='chart-datetime chart-btn-group'>
      <button className='btn' onClick={this.openDialogHandler}>定位时间</button>
      {
        this.state.showDialog ?
        <Dialog title='定位时间' onClose={this.dialogCloseHandler}>
          <div>
            <input ref='dateInput'
                   type='text'
                   readOnly={true}
                   defaultValue={nowDateStr}
                   onClick={this.inputClickHandler} />
            <button className='btn btn-blue' onClick={this.goToDateHandler}>前往</button>
          </div>
          <DatetimePicker
            input={false}
            value={thisMoment.toDate()}
            open={this.state.showDatetimePicker}
            isValidDate={this.checkDateHandler}
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
  }

  // 输入框点击时
  private inputClickHandler () {
    this.setState({
      showDatetimePicker: true,
    })
  }

  private openDialogHandler () {
    this.setState({ showDialog: true })
  }

  // 定位时间对话框关闭时
  private dialogCloseHandler () {
    this.setState({
      showDialog: false,
      showDatetimePicker: false,
    })
  }

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
      showDatetimePicker: false,
    })
  }

  // 校验日期是否可选。晚于当前日期都不可选。
  private checkDateHandler (currentDate: moment.Moment, selectedDate: moment.Moment) {
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
