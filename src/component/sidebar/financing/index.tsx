import './index.less'
import '../../../style/table.less'
import * as React from 'react'
import IScroll = require('iscroll')
import { FinancingInfo } from '../pollmanager'

type Prop = {
  financingInfo: FinancingInfo
  height: number
}

export default class Financing extends React.Component<Prop, any> {

  public refs: {
    financing: HTMLDivElement
  }

  private _financingScroll

  public componentDidMount () {
    this._financingScroll = new IScroll(this.refs.financing, {
      mouseWheel: true,
      scrollbars: true,
      fadeScrollbars: true,
    })
  }

  public componentWillUnmount () {
    this._financingScroll.destroy()
    this._financingScroll = null
  }

  public componentDidUpdate () {
    this._financingScroll.refresh()
  }

  public shouldComponentUpdate (nextProps: Prop, nextState: any) {
    const curProp = this.props
    return curProp.financingInfo !== nextProps.financingInfo
  }

  public render () {
    const financingInfo = this.props.financingInfo
    return financingInfo ?
    <div className='financing' ref='financing' style={ {height: this.props.height + 'px'} }>
      <div>
        <h3>财务信息</h3>
        <table className='indexes-display s-table stripe even left-header'>
          <tbody>
            <tr>
              <th width='133'>每股收益</th>
              <td width='134'>{financingInfo.earning_per_Share}元</td>
            </tr>
            <tr>
              <th>净利润</th>
              <td>{financingInfo.net_income}亿元</td>
            </tr>
            <tr>
              <th>净利润增长率</th>
              <td>{financingInfo.net_income_growth_rate}%</td>
            </tr>
            <tr>
              <th>营业总收入</th>
              <td>{financingInfo.revenue}亿元</td>
            </tr>
            <tr>
              <th>总收入增长率</th>
              <td>{financingInfo.revenue_growth_rate}%</td>
            </tr>
            <tr>
              <th>每股净资产</th>
              <td>{financingInfo.book_value_per_share}元</td>
            </tr>
            <tr>
              <th>净资产收益率</th>
              <td>{financingInfo.return_on_Equity}%</td>
            </tr>
            <tr>
              <th>净资产收益率摊薄</th>
              <td>{financingInfo.return_on_equity_diluted}%</td>
            </tr>
            <tr>
              <th>资产负债比率</th>
              <td>{financingInfo.asset_liability_ratio}%</td>
            </tr>
            <tr>
              <th>每股资本公积金</th>
              <td>{financingInfo.capital_surplus_per_share}元</td>
            </tr>
            <tr>
              <th>每股未分配利润</th>
              <td>{financingInfo.retained_earning_per_share}元</td>
            </tr>
            <tr>
              <th>每股经营现金流</th>
              <td>{financingInfo.operating_cash_flow_per_share}元</td>
            </tr>
            <tr>
              <th>经营现金流入</th>
              <td>{financingInfo.operating_cashflow_in}亿元</td>
            </tr>
            <tr>
              <th>经营现金流出</th>
              <td>{financingInfo.operating_cashflow_out}亿元</td>
            </tr>
            <tr>
              <th>经营现金流量净额</th>
              <td>{financingInfo.net_operating_cashflow}亿元</td>
            </tr>
            <tr>
              <th>流动比率</th>
              <td>{financingInfo.currentRatio}</td>
            </tr>
            <tr>
              <th>速动比率</th>
              <td>{financingInfo.quickRatio}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div> :
    <div className='financing' ref='financing' style={ {height: this.props.height + 'px'} }>
      <div className='no-financing-info'>无财务信息</div>
    </div>
  }
}
