export type ResolutionType = '1' | '5' | '15' | '30' | '60' | 'D' | 'W' | 'M'
export type ShapeType = 'line' | 'column' | 'histogram' | 'bar' | 'mountain' | 'candle' | 'band'
export type StudyType = 'MA' | 'MACD' | 'KDJ' | 'BOLL' | 'RSI' | 'CCI' | 'VOLUME' | '均价'
export const OPEN_DAYS = [1, 2, 3, 4, 5]
export const OPEN_TIME_RANGE = [
  [[9, 30], [11, 30]],
  [[13, 0], [15, 0]],
]
export const OPEN_MINITES_COUNT = OPEN_TIME_RANGE.reduce((count, timeRange) => {
  count += (timeRange[1][0] - timeRange[0][0]) * 60 + (timeRange[1][1] - timeRange[0][1])
  return count
}, 0)
