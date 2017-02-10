import './index.less'

import * as React from 'react'
import * as _ from 'underscore'
import SelfSelectStock from './selfselect'
import RecentVisit from './recentvisit'
import PlateList from './platelist'
import MainBoard from './mainboard'

type Prop = {
  width: number
  folded: boolean
  activeIndex: number
  onChange: (folded: boolean, index: number) => void
}

const TAB_CONFIG = ['自选股', '最近访问', '板块列表', '大盘综合']

export default class FooterPanel extends React.Component<Prop, any> {
  constructor (props: Prop, context: any) {
    super(props, context)
    this.clickHandler = this.clickHandler.bind(this)
  }

  public shouldComponentUpdate (nextProps: Prop) {
    return !_.isEqual(this.props, nextProps)
  }

  public render () {
    const activeIndex = this.props.activeIndex
    const width = this.props.width
    return (
      <div className='chart-footer-panel' style={ {width: width + 'px' } }>
        <div className={`btn-group ${this.props.folded ? 'folded' : ''}`}>
          {
            TAB_CONFIG.map((label, i) =>
              <button
                key={i}
                className={`${!this.props.folded && activeIndex === i ? 'active' : ''}`}
                data-index={i}
                onClick={this.clickHandler}>{label}</button>
            )
          }
        </div>
        {
          !this.props.folded ?
          <div className='panel-board'>
            {
              activeIndex === 0 ?
              <SelfSelectStock width={width} /> : null
            }
            {
              activeIndex === 1 ?
              <RecentVisit /> : null
            }
            {
              activeIndex === 2 ?
              <PlateList width={width} /> : null
            }
            {
              activeIndex === 3 ?
              <MainBoard width={width} /> : null
            }
          </div> : null
        }
      </div>
    )
  }

  private clickHandler (ev) {
    const newIndex = +ev.target.dataset.index
    const folded = this.props.folded

    if (!folded && this.props.activeIndex === newIndex) {
      if (this.props.onChange) {
        this.props.onChange(true, newIndex)
      }
      return
    }

    if (this.props.onChange) {
      this.props.onChange(false, newIndex)
    }
  }
}
