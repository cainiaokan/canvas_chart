import './index.less'
import '../../../style/btn.less'
import 'react-datetime/css/react-datetime.css'
import * as React from 'react'
import * as moment from 'moment'
import * as _ from 'underscore'
import * as DatetimePicker from 'react-datetime'
import Dialog from '../../../component/widget/dialog'
import ChartLayoutModel from '../../../model/chartlayout'
import { OPEN_HOUR, OPEN_MINUTE, CLOSE_HOUR, CLOSE_MINUTE } from '../../../constant'

type Prop = {
  chartLayout: ChartLayoutModel
}

const dateTimeFormat = 'YYYY-MM-DD HH:mm'
const dateFormat = 'YYYY-MM-DD'

type State = {
  showDialog?: boolean
  showDatetimePicker?: boolean
}

export default class GoToDate extends React.Component<Prop, State> {
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
    const chartLayout = this.props.chartLayout
    const dontShowTime = chartLayout.mainDatasource.resolution > '60'
    const mainDatasource = chartLayout.mainDatasource
    const now = new Date(mainDatasource.now() * 1000)
    this.correctTime(now)

    const thisMoment = this._inputDateValue ?
                this._inputDateValue : moment(now).minute(now.getMinutes() - now.getMinutes() % 5)

    const nowDateStr =  dontShowTime ? thisMoment.format(dateFormat) : thisMoment.format(dateTimeFormat)

    this._inputDateValue = thisMoment

    return <div className='chart-gotodate chart-btn-group'>
      <a className='mini-btn' href='javascript:;' onClick={this.openDialogHandler}>定位时间</a>
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
            timeConstraints={ { hours: { min: OPEN_HOUR, max: CLOSE_HOUR }, minutes: { step: 5 } } }
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

  // 校验日期是否可选。晚于当前日期都不可选。太早的日期也不可选。
  private checkDateHandler (currentDate: moment.Moment, selectedDate: moment.Moment) {
    const chartLayout = this.props.chartLayout
    const resolution = chartLayout.mainDatasource.resolution
    const now = chartLayout.mainDatasource.now()
    const thisMoment = moment(now * 1000)
    const constraintMoment = moment(now * 1000)

    if (currentDate.isAfter(thisMoment)) {
      return false
    }

    switch (resolution) {
      case '1':
        constraintMoment.subtract(1, 'months')
        return currentDate.isAfter(constraintMoment)
      case '5':
        constraintMoment.subtract(2, 'months')
        return currentDate.isAfter(constraintMoment)
      case '15':
        constraintMoment.subtract(6, 'months')
        return currentDate.isAfter(constraintMoment)
      case '30':
        constraintMoment.subtract(1, 'years')
        return currentDate.isAfter(constraintMoment)
      case '60':
        constraintMoment.subtract(2, 'years')
        return currentDate.isAfter(constraintMoment)
      case 'D':
      case 'W':
      case 'M':
        return true
      default:
        throw new Error('Unsupported resolution')
    }
  }

  // 校正日期，使其在开收盘的限制范围内
  private correctTime (date) {
    const hour = date.getHours()
    const minute = date.getMinutes()

    if (hour < OPEN_HOUR || (hour === OPEN_HOUR && minute < OPEN_MINUTE)) {
      date.setHours(OPEN_HOUR)
      date.setMinutes(OPEN_MINUTE)
    } else if (hour > CLOSE_HOUR || (hour === CLOSE_HOUR && minute > CLOSE_MINUTE)) {
      date.setHours(CLOSE_HOUR)
      date.setMinutes(CLOSE_MINUTE)
    }
  }
}
