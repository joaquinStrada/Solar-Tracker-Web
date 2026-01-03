import { $id } from '../functions'

export default class Viewer {
    constructor() {
        this.viewSimulator = $id('view-simulator')
        this.controlsSimulator = $id('controls-simulator')
        this.btnPlay = $id('btn-play')
        this.progressSimulator = $id('progress-simulator')
        this.progressText = $id('progress-text')
        this.solarTrackerChart = $id('solar-tracker-chart')
    }

    getMessurmentChart() {
        return this.solarTrackerChart.getBoundingClientRect()
    }

    renderGraph(points) {
        // Seteamos las medidas del canvas
        const messurmentChart = this.getMessurmentChart()
        
        this.solarTrackerChart.setAttribute('width', messurmentChart.width)
        this.solarTrackerChart.setAttribute('height', messurmentChart.height)

        // Obtenemos el contexto y limpiamos el canvas
        const ctx = this.solarTrackerChart.getContext('2d')
        ctx.clearRect(0, 0, messurmentChart.width, messurmentChart.height)

        // Pintamos los puntos
        ctx.fillStyle = '#F00'

        points.forEach(point => {
            ctx.beginPath()
            ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI)
            ctx.fill()
        })

        // Pintamos las lineas
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 2

        // Inciamos el trazo
        ctx.beginPath()
        ctx.moveTo(points[0].x, points[0].y)

        // Reccorro los puntos
        for (let i = 0; i < points.length - 1; i++) {
            const { x: px, y: py } = points[i - 1] || points[i]
            const { x: px1, y: py1 } = points[i]
            const { x: px2, y: py2 } = points[i + 1]
            const { x: px3, y: py3 } = points[i + 2] || points[i + 1]

            const distX = Math.abs(px2 - px1)

            if (distX > messurmentChart.width / 2) {
                ctx.stroke()
                ctx.beginPath()
                ctx.moveTo(px2, py2)
                continue
            }

            // Sacamos los puntos de control
            const t = 6
            let cp1x = px1 + (px2 - px) / t
            let cp1y = py1 + (py2 - py) / t

            let cp2x = px2 + (px3 - px1) / t
            let cp2y = py2 + (py3 - py1) / t

            if (py1 < py && py1 < py2) {
                cp1y = py1
            } else if (py2 < py && py2 < py3) {
                cp2y = py2
            }

            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, px2, py2)
        }

        ctx.stroke()
    }
}