export const SUPPORT_TOUCH = 'ontouchstart' in document

export const DOWN_EVENT_REACT = SUPPORT_TOUCH ? 'onTouchStart' : 'onMouseDown'
export const MOVE_EVENT_REACT = SUPPORT_TOUCH ? 'onTouchMove' : 'onMouseMove'
export const UP_EVENT_REACT = SUPPORT_TOUCH ? 'onTouchEnd' : 'onMouseUp'

export const DOWN_EVENT = SUPPORT_TOUCH ? 'touchstart' : 'mousedown'
export const MOVE_EVENT = SUPPORT_TOUCH ? 'touchmove' : 'mousemove'
export const UP_EVENT = SUPPORT_TOUCH ? 'touchend' : 'mouseup'

