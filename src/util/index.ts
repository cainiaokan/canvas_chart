export function cloneObj (source: Object) {
  return JSON.parse(JSON.stringify(source))
}

export function getParameterByName (name) {
  const match = RegExp('[?&]' + name + '=([^&]*)')
                  .exec(window.location.search)
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '))
}

export function getUrlParams () {
  let obj = {}
  let name
  let value
  let str = location.search // 取得整个地址栏
  let num = str.indexOf('?')
  str = str.substr(num + 1) // 取得所有参数   stringvar.substr(start [, length ])
  let arr = str.split('&') // 各个参数放到数组里
  for (let i = 0; i < arr.length; i++) {
    num = arr[i].indexOf('=')
    if (num > 0) {
      name = arr[i].substring(0, num)
      value = arr[i].substr(num + 1)
      obj[name] = value
    }
  }
  return obj
}

export function darkenRGB (rgbColor: string) {
  const matches = rgbColor.match(/\((.*?)\)/)
  if (!matches) {
    throw new Error('rgbColor is not a valid rgb color string.')
  }
  const params = matches[1].split(',')
  const colors = params.slice(0, 3).map(color => (+color - 50 > 0 ? +color - 50 : 0) + '')
  if (params.length === 4) {
    colors.push(params[3])
  }
  return 'rgb(' + colors.join(',') + ')'
}

export function pad (n = '', width, z = '0') {
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
}

export function padRight (n = '', width, z = '0') {
  return n.length >= width ? n : n + new Array(width - n.length + 1).join(z)
}

export function clientOffset (dom: HTMLElement): { top: number, left: number } {
  let top = 0
  let left = 0
  while (dom !== document.body) {
    top += dom.offsetTop
    left += dom.offsetLeft
    dom = dom.offsetParent as HTMLElement
  }
  return {
    top,
    left,
  }
}

export function formatNumber (num: number, precision = 0): string {
  if (Math.abs(num / 1e12) >= 1) {
    return (num / 1e12).toFixed(precision) + '万亿'
  } else if (Math.abs(num / 1e8) >= 1) {
    return (num / 1e8).toFixed(precision) + '亿'
  } else if (Math.abs(num / 1e4) >= 1) {
    return (num / 1e4).toFixed(precision) + '万'
  } else {
    return num.toFixed(precision)
  }
}

export function pointToSegDist (
  x: number, y: number,
  x1: number, y1: number,
  x2: number, y2: number): number {
  const cross = (x2 - x1) * (x - x1) + (y2 - y1) * (y - y1)
  if (cross <= 0) {
    return Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1))
  }
  const d2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)
  if (cross >= d2) {
    return Math.sqrt((x - x2) * (x - x2) + (y - y2) * (y - y2))
  }
  const r = cross / d2
  const px = x1 + (x2 - x1) * r
  const py = y1 + (y2 - y1) * r
  return Math.sqrt((x - px) * (x - px) + (y - py) * (y - py))
}

export function isPointInRect (x0, y0, x1, y1, x2, y2) {
  return (x0 >= Math.min(x1, x2)) && (x0 <= Math.max(x1, x2)) &&
         (y0 >= Math.min(y1, y2)) && (y0 <= Math.max(y1, y2))
}

export function getCanvasHeight (canvas: HTMLCanvasElement) {
  return canvas.style.height ? parseInt(canvas.style.height) : canvas.height
}

export function getCanvasWidth (canvas: HTMLCanvasElement) {
  return canvas.style.width ? parseInt(canvas.style.width) : canvas.width
}

type AnimationQueue = {
  _itvl: number
  _queue: Array<['delay' | 'action', Function | number]>
  _go: () => void
  delay: (millis: number) => AnimationQueue
  enqueue: (action: Function) => AnimationQueue}

export function animationQueue () {
  const q: AnimationQueue = {
    _itvl: 0,
    _queue: [],
    delay (millis: number) {
      q._queue.push(['delay', millis])
      q._go()
      return q
    },
    enqueue (action: Function) {
      q._queue.push(['action', action])
      q._go()
      return q
    },
    _go () {
      clearTimeout(q._itvl)
      q._itvl = setTimeout(function () {
        const job = q._queue.shift()
        if (!!job) {
          if (job[0] === 'delay') {
            setTimeout(() => q._go(), job[1])
          } else if (job[0] === 'action') {
            (job[1] as Function)()
            setTimeout(() => q._go(), 0)
          }
        }
      }, 0)
    },
  }

  return q
}

/**
 * 标准化 requestFullscreen 方法
 * @param {DOM} elem 要全屏显示的元素(webkit下只要是DOM即可，Firefox下必须是文档中的DOM元素)
 */
export function requestFullscreen(elem) {
    if (elem.requestFullscreen) {
        elem.requestFullscreen()
    } else if (elem.webkitRequestFullScreen) {
        // 对 Chrome 特殊处理，
        // 参数 Element.ALLOW_KEYBOARD_INPUT 使全屏状态中可以键盘输入。
        if ( window.navigator.userAgent.toUpperCase().indexOf( 'CHROME' ) >= 0 ) {
            elem.webkitRequestFullScreen()
        } else {// Safari 浏览器中，如果方法内有参数，则 Fullscreen 功能不可用。
            elem.webkitRequestFullScreen()
        }
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen()
    }
}

export function exitFullscreen () {
  ['exitFullscreen', 'mozCancelFullScreen', 'mozExitFullscreen', 'webkitExitFullscreen', 'msExitFullscreen']
    .some(function(funcName) {
      if ('function' === typeof document[funcName]) {
          return document[funcName](), true
      }
  })
}

export function getFullScreenElement () {
  let fullscreenElement = null
  let propNames = ['fullscreenElement', 'webkitFullscreenElement', 'mozFullscreenElement', 'msFullscreenElement']

  propNames.some(propName => {
    if (propName in document) {
      fullscreenElement = document[propName]
      return true
    }
  })

  return fullscreenElement
}
