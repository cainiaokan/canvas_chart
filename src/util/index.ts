export function pad (n = '', width, z = '0') {
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
}
