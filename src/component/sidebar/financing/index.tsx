import './index.less'
import '../../../style/table.less'
import * as React from 'react'
import { FinancingInfo } from '../pollmanager'
import * as iScroll from '../../../vendor/iscroll'

type Prop = {
  financingInfo: FinancingInfo
  height: number
}

export default class Financing extends React.Component<Prop, any> {

  public refs: {
    [propName: string]: Element
    financing: HTMLDivElement
  }

  private _financingScroll

  public componentDidMount () {
    this._financingScroll = new iScroll(this.refs.financing, {
      mouseWheel: true,
      scrollbars: true,
      fadeScrollbars: true,
    })
  }

  public componentDidUpdate () {
    this._financingScroll.refresh()
  }

  public shouldComponentUpdate (nextProps, nextState) {
    const curProp = this.props
    return curProp.financingInfo !== nextProps.financingInfo
  }

  public render () {
    const financingInfo = this.props.financingInfo
    return financingInfo ?
    <div className='financing' ref='financing' style={ {height: this.props.height + 'px'} }>
      <div>
        <h3>财务信息</h3>
        <table className='indexes-display s-table stripe'>
          <tbody>
            <tr>
              <td width='133'>每股收益</td>
              <td width='134'>{financingInfo.earning_per_Share}元</td>
            </tr>
            <tr>
              <td>净利润</td>
              <td>{financingInfo.net_income}亿元</td>
            </tr>
            <tr>
              <td>净利润增长率</td>
              <td>{financingInfo.net_income_growth_rate}%</td>
            </tr>
            <tr>
              <td>营业总收入</td>
              <td>{financingInfo.revenue}亿元</td>
            </tr>
            <tr>
              <td>总收入增长率</td>
              <td>{financingInfo.revenue_growth_rate}%</td>
            </tr>
            <tr>
              <td>每股净资产</td>
              <td>{financingInfo.book_value_per_share}亿元</td>
            </tr>
            <tr>
              <td>净资产收益率</td>
              <td>{financingInfo.return_on_Equity}%</td>
            </tr>
            <tr>
              <td>净资产收益率摊薄</td>
              <td>{financingInfo.return_on_equity_diluted}%</td>
            </tr>
            <tr>
              <td>资产负债比率</td>
              <td>{financingInfo.asset_liability_ratio}%</td>
            </tr>
            <tr>
              <td>每股资本公积金</td>
              <td>{financingInfo.capital_surplus_per_share}元</td>
            </tr>
            <tr>
              <td>每股未分配利润</td>
              <td>{financingInfo.retained_earning_per_share}元</td>
            </tr>
            <tr>
              <td>每股经营现金流</td>
              <td>{financingInfo.operating_cash_flow_per_share}元</td>
            </tr>
            <tr>
              <td>经营现金流入</td>
              <td>{financingInfo.operating_cashflow_in}亿元</td>
            </tr>
            <tr>
              <td>经营现金流出</td>
              <td>{financingInfo.operating_cashflow_out}亿元</td>
            </tr>
            <tr>
              <td>经营现金流量净额</td>
              <td>{financingInfo.net_operating_cashflow}亿元</td>
            </tr>
            <tr>
              <td>流动比率</td>
              <td>{financingInfo.currentRatio}</td>
            </tr>
            <tr>
              <td>速动比率</td>
              <td>{financingInfo.quickRatio}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div> :
    <div className='financing' ref='financing'  style={ {height: this.props.height + 'px'} }>
      <div className='no-financing-info'>无财务信息</div>
    </div>
  }
}
