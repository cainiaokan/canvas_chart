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
            <svg x='0px' y='0px' viewBox='0 0 63.4 63.4'>
            <g>
              <g>
                <polygon className='up' points='13.3,56.2 13.3,58.2 50.1,58.2 50.1,56.2 32.7,56.2 32.7,38.4 38.8,44.4 40.2,43 32.4,35.2 31,35.2 23.2,43 24.6,44.4 30.7,38.4 30.7,56.2'/>
                <polygon className='down' points='23.2,20.4 31,28.2 32.4,28.2 40.2,20.4 38.8,19 32.7,25.1 32.7,7.3 50.1,7.3 50.1,5.3 13.3,5.3 13.3,7.3 30.7,7.3 30.7,25.1 24.6,19'/>
              </g>
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
