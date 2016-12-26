import { BaseToolRenderer } from './basetool'
import { HIT_TEST_TOLERANCE } from '../../constant'
import { pointToSegDist } from '../../util'

export class TrendAngleToolRenderer extends BaseToolRenderer {
  public drawTool (ctx: CanvasRenderingContext2D) {
    const chart = this._chart
    const axisX = chart.axisX
    const axisY = chart.axisY
    const rangeY = chart.axisY.range
    const cursor = this.getCursor()

    const coords = this._vertexes.map(vertex => ({
      x: ~~axisX.getXByTime(vertex.time),
      y: ~~axisY.getYByValue(vertex.value, rangeY),
    }))

    if (!this.isFinished()) {
      coords.push({
        x: cursor.x,
        y: cursor.y,
      })
    }

    ctx.strokeStyle = '#000'
    ctx.lineWidth = 1
    ctx.beginPath()

    coords.forEach((coord, i) => {
      if (i === 0) {
        ctx.moveTo(coord.x, coord.y)
      } else if (i === 1) {
        ctx.lineTo(coord.x, coord.y)
        ctx.stroke()
        let firstCoord = coords[0]
        let clockwise = coord.y >= firstCoord.y
        let angle = Math.atan((coord.y - firstCoord.y) / (coord.x - firstCoord.x))
        if (angle === 0) {
          if (coord.x >= firstCoord.x) {
            angle = 0
          } else {
            angle = Math.PI
          }
        } else {
          if (clockwise) {
            angle = angle > 0 ? angle : Math.PI + angle
          } else {
            angle = angle < 0 ? 2 * Math.PI + angle : Math.PI + angle
          }
        }
        let angleInt = ~~(angle / 2 / Math.PI * 360)
        if (clockwise) {
          angleInt = -angleInt
        } else {
          angleInt = 360 - angleInt
        }
        if (ctx.setLineDash) {
          ctx.setLineDash([3, 3])
        }
        ctx.moveTo(firstCoord.x, firstCoord.y)
        ctx.lineTo(firstCoord.x + 60, firstCoord.y)
        ctx.stroke()
        ctx.beginPath()
        if (clockwise) {
          ctx.arc(firstCoord.x, firstCoord.y, 60, 0, angle)
        } else {
          ctx.arc(firstCoord.x, firstCoord.y, 60, angle, 2 * Math.PI)
        }
        ctx.font = '12px ans-serif'
        ctx.fillStyle = 'black'
        ctx.fillText(angleInt + '°', firstCoord.x + 65, firstCoord.y + 6)
        ctx.stroke()
      }
    })
  }

  public hitTestTool (): boolean {
    const chart = this._chart
    const axisX = chart.axisX
    const axisY = chart.axisY
    const rangeY = chart.axisY.range

    const point = chart.crosshair.point
    const vertex1 = this._vertexes[0]
    const vertex2 = this._vertexes[1]
    const x0 = point.x
    const y0 = point.y
    const x1 = axisX.getXByTime(vertex1.time)
    const y1 = axisY.getYByValue(vertex1.value, rangeY)
    const x2 = axisX.getXByTime(vertex2.time)
    const y2 = axisY.getYByValue(vertex2.value, rangeY)

    let distance = pointToSegDist(x0, y0, x1, y1, x2, y2)

    return distance < HIT_TEST_TOLERANCE
  }

  public isFinished (): boolean {
    return this._vertexes.length === 2
  }
}
