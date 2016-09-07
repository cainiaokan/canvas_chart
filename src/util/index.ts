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

export function pointToSegDist (
  x: number, y: number,
  startx: number, starty: number,
  endx: number, endy: number): number {
  // 线段两点距离平方  
  const se = (startx - endx) * (startx - endx) + (starty - endy) * (starty - endy)
  // 向量点乘=|a|*|b|*cosA
  const p = ((x - startx) * (endx - startx) + (y - starty) * (endy - starty))
  // r即点到线段的投影长度与线段长度比  
  const r = p / se
  const outx = startx + r * (endx - startx)
  const outy = starty + r * (endy - starty)
  const des  = (x - outx) * (x - outx) + (y - outy) * (y - outy)
  return Math.sqrt(des)
}
