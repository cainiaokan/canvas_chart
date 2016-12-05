import './index.less'
import '../../style/btn.less'
import 'react-datetime/css/react-datetime.css'
import * as moment from 'moment'
import * as React from 'react'
import * as Datetime from 'react-datetime'
import Dialog from '../../component/dialog'
import ChartLayoutModel from '../../model/chartlayout'

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

  private studyStates = [false, false, false, false, false]

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
    const thisMoment = moment()
    const dontShowTime = this.props.chartLayout.mainDatasource.resolution > '60'
    const nowDateStr =  dontShowTime ? thisMoment.format(dateFormat) : thisMoment.format(dateTimeFormat)
    return (
      <div className='chart-footerbar' style={ {width: this.props.width + 'px', height: this.props.height + 'px'} }>
        <div className='control-list'>
          {
            studyNames.map((study, i) =>
              <a href='javascript:;' data-index={i}
                className={this.studyStates[i] ? 'active' : ''}
                onClick={this.changeStudyHandler}>
                {study}
              </a>
            )
          }
          <a href='javascript:;' onClick={this.openGoToDateDialogHandler}>定位时间</a>
        </div>
        {
          this.state.showGotoDateDialog ?
          <Dialog title='定位时间'
                  width={300}
                  height={100}
                  onClose={this.dialogCloseHandler}>
            <div>
              <input ref='dateInput'
                     type='text'
                     readOnly={true}
                     defaultValue={nowDateStr}
                     onClick={this.inputClickHandler} />
              <button className='chart-go-to-date-btn btn' onClick={this.goToDateHandler}>前往</button>
            </div>
            <Datetime
              input={false}
              value={thisMoment.toDate()}
              open={this.state.showCalendar}
              dateFormat={dontShowTime ? 'YYYY-MM-DD' : 'YYYY-MM-DD'}
              timeFormat={dontShowTime ? null : 'HH:mm'}
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
    const studyStates = this.studyStates
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
    this.dialogCloseHandler()
  }

  // 日期选择器值发生变化时
  private dateChangeHandler (moment: moment.Moment) {
    this.refs.dateInput.value = moment.format(
      this.props.chartLayout.mainDatasource.resolution > '60' ?
      moment.format(dateFormat) : moment.format(dateTimeFormat)
    )
  }

  // 日期选择器关闭时
  private datePickerBlurHandler () {
    this.setState({
      showCalendar: false,
    })
  }
}
