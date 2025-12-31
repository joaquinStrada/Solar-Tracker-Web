import { $, $$, $id } from '../functions'

export default class Calendar {
    constructor(dateNow) {
        this.dateNow = dateNow
        this.month = dateNow.getMonth()
        this.year = dateNow.getFullYear()
        this.months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
        this.btnPreviousMonth = $id('btn-previous-month')
        this.labelMonth = $id('label-navigate-month')
        this.btnNextMonth = $id('btn-next-month')
        this.btnPreviousYear = $id('btn-previous-year')
        this.labelYear = $id('label-navigate-year')
        this.btnNextYear = $id('btn-next-year')
        this.isLoad = false
        this.calendar = $id('calendar')
        // eslint-disable-next-line no-unused-vars
        this.getDataDay = (index, day, month, year, widthCanvas, heightCanvas) => {}

        this.btnPreviousMonth.addEventListener('click', e => this.onClick(e))
        this.btnNextMonth.addEventListener('click', e => this.onClick(e))
        this.btnPreviousYear.addEventListener('click', e => this.onClick(e))
        this.btnNextYear.addEventListener('click', e => this.onClick(e))
    }

    render() {
        // Seteamos los valores de los labels
        this.isLoad = true
        this.labelMonth.innerText = this.months[this.month]
        this.labelYear.innerText = this.year

        // Activar o desactivar los controles
        // Botones mes
        if (this.month < 11 && this.btnNextMonth.hasAttribute('disabled')) this.btnNextMonth.removeAttribute('disabled')
        else if (this.month == 11 && !this.btnNextMonth.hasAttribute('disabled')) this.btnNextMonth.setAttribute('disabled', '')

        if (this.month > 0 && this.btnPreviousMonth.hasAttribute('disabled')) this.btnPreviousMonth.removeAttribute('disabled')
        else if (this.month == 0 && !this.btnPreviousMonth.hasAttribute('disabled')) this.btnPreviousMonth.setAttribute('disabled', '')

        // Botenes Año
        if (this.year < (this.dateNow.getFullYear() + 20) && this.btnNextYear.hasAttribute('disabled')) this.btnNextYear.removeAttribute('disabled')
        else if (this.year == (this.dateNow.getFullYear() + 20) && !this.btnNextYear.hasAttribute('disabled')) this.btnNextYear.setAttribute('disabled', '')
        
        if (this.year > (this.dateNow.getFullYear() - 20) && this.btnPreviousYear.hasAttribute('disabled')) this.btnPreviousYear.removeAttribute('disabled')
        else if (this.year == (this.dateNow.getFullYear() - 20) && !this.btnPreviousYear.hasAttribute('disabled')) this.btnPreviousYear.setAttribute('disabled', '')
    
        // Reseteamos el calendar
        $$('tbody td.active, tbody td[disabled]', this.calendar).forEach(tdDay => {
            tdDay.classList.contains('active') && tdDay.classList.remove('active')
            tdDay.hasAttribute('disabled') && tdDay.removeAttribute('disabled')
        })

        // Obtener los datos diarios
        const nDaysMonth = new Date(this.year, this.month + 1, 0).getDate()
        const nDaysPreviousMonth = new Date(this.year, this.month, 0).getDate()
        const firstDayMonth = new Date(this.year, this.month, 1).getDay() == 0 ? 6 : new Date(this.year, this.month, 1).getDay() - 1
    
        for (let i = 1; i <= 42; i++) {
            const tdDay = $(`tbody td[data-index="${i}"]`, this.calendar)
            
            if (i < (firstDayMonth + 1)) {
                $('.day-number', tdDay).innerText = nDaysPreviousMonth - firstDayMonth + i
                tdDay.setAttribute('disabled', '')
            } else if (i > (nDaysMonth + firstDayMonth)) {
                $('.day-number', tdDay).innerText = i - (nDaysMonth + firstDayMonth)
                tdDay.setAttribute('disabled', '')
            } else {
                $('.day-number', tdDay).innerText = i - firstDayMonth
                const { width, height } = $('.day-tracker', tdDay).getBoundingClientRect()
                this.getDataDay(i, i - firstDayMonth, this.month, this.year, width, height)
            }
        }
    }

    onClick(e) {
        if (!this.isLoad) return

        switch (e.currentTarget.id) {
            case 'btn-previous-month':
                this.month = this.month > 0 ? this.month - 1 : this.month 
                break
            case 'btn-next-month':
                this.month = this.month < 11 ? this.month + 1 : this.month
                break
            case 'btn-previous-year':
                this.year = this.year > (this.dateNow.getFullYear() - 20) ? this.year - 1 : this.year
                break
            case 'btn-next-year':
                this.year = this.year < (this.dateNow.getFullYear() + 20) ? this.year + 1 : this.year
                break
            default:
                console.error(new Error(`not define id: ${e.currentTarget.id}`))
                break
        }

        this.render()
    }

    setGetDataDay(callback) {
        this.getDataDay = callback
    }

    drawCanvas(index, points) {
        const canvas = $(`tbody td[data-index="${index}"] .day-tracker`, this.calendar)   
        const { width, height } = canvas.getBoundingClientRect()
        
        // Seteamos las medidas en el canvas
        canvas.setAttribute('width', width)
        canvas.setAttribute('height', height)

        // Limpiamos el canvas
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, width, height)

        // Pintamos los puntos
        points.forEach(point => {
            ctx.fillStyle = '#F00'
            ctx.beginPath()
            ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI)
            ctx.fill()
        })

        // Dibujar las lineas
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 2
        ctx.beginPath()

        // Inicio el trazo
        ctx.moveTo(points[0].x, points[0].i)

        // Recorro los puntos
        for (let i = 1; i < points.length - 2; i++) {
            const { x: px, y: py } = points[i]
            const xc = (px + points[i + 1].x) / 2
            const yc = (py + points[i + 1].y) / 2

            ctx.quadraticCurveTo(px, py, xc, yc)
        }

        if (points.length > 2) {
            const { x: px, y: py } = points[points.length - 2]
            const { x: px2, y: py2 } = points[points.length - 1]


            ctx.quadraticCurveTo(px, py, px2, py2)
        }

        ctx.stroke()
    }
}