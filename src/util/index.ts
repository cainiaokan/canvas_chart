export function cloneObj (source: Object) {
  return JSON.parse(JSON.stringify(source))
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
