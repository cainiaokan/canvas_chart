export default class StockInfo {
  public open: number = 0
  public high: number = 0
  public low: number = 0
  public preClose: number = 0
  public price: number = 0
  public changeRate: number = 0
  public changePrice: number = 0
  public amount: number = 0
  public volume: number = 0
  public turnover: number = 0
  public amplitude: number = 0
  public inVol: number = 0
  public outVol: number = 0

  public selling: number[][]
  public buying: number[][]

  public pressure: number = 0
  public support: number = 0

  public ticks: { time: string, price: string, volume: string, type: '1' | '2' | '3' }[] = []
}
