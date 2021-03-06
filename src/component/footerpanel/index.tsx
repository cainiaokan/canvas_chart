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
    this.selectTabHandler = this.selectTabHandler.bind(this)
    this.toggleHandler = this.toggleHandler.bind(this)
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
                onClick={this.selectTabHandler}>{label}</button>
            )
          }
          <a
            href='javascript:;'
            className='toggle-btn'
            onClick={this.toggleHandler}>
            <svg viewBox='0 0 10.35 16'>
              <g>
                <path d='M0,14.42,1.57,16l3.6-3.6L8.78,16l1.58-1.58L5.18,9.25ZM10.35,1.58,8.78,0,5.18,3.6,1.58,0,0,1.58,5.18,6.75Z'/>
              </g>
            </svg>
          </a>
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
              <RecentVisit width={width} /> : null
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

  private toggleHandler () {
    if (this.props.folded) {
      this.props.onChange(false, this.props.activeIndex)
    } else {
      this.props.onChange(true, this.props.activeIndex)
    }
  }

  private selectTabHandler (ev) {
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
