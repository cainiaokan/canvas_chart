export const SUPPORT_TOUCH = 'createTouch' in document
export const START_EVENT = SUPPORT_TOUCH ? 'touchstart' : 'mousedown'
export const MOVE_EVENT = SUPPORT_TOUCH ? 'touchmove' : 'mousemove'
export const END_EVENT = SUPPORT_TOUCH ? 'touchend' : 'mouseup'
