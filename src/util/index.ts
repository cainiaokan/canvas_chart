export function pad (n = '', width, z = '0') {
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
}

export function padRight (n = '', width, z = '0') {
  return n.length >= width ? n : n + new Array(width - n.length + 1).join(z)
}

export function clientOffset (dom: HTMLElement): { offsetTop: number, offsetLeft: number } {
  let offsetTop = 0
  let offsetLeft = 0
  while (dom !== document.body) {
    offsetTop += dom.offsetTop
    offsetLeft += dom.offsetLeft
    dom = dom.offsetParent as HTMLElement
  }
  return {
    offsetTop,
    offsetLeft,
  }
}

export function formatNumber (num: number, precision = 2): string {
  if (num / 1e8 >= 1) {
    return (num / 1e8).toFixed(precision) + '亿'
  } else if (num / 1e4 >= 1) {
    return (num / 1e4).toFixed(precision) + '万'
  } else {
    return num.toFixed(precision)
  }
}
