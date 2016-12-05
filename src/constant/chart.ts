export type ResolutionType = '1' | '5' | '15' | '30' | '60' | 'D' | 'W' | 'M'
export type ShapeType = 'line' | 'column' | 'histogram' | 'bar' | 'mountain' | 'candle' | 'band'
export type StudyType = 'MA' | 'MACD' | 'KDJ' | 'BOLL' | 'RSI' | 'CCI' | 'VOLUME'
export const WEEKDAYS = [1, 2, 3, 4, 5]
export const OPEN_HOURS = [
  [[9, 30], [11, 30]],
  [[13, 0], [15, 0]],
]
