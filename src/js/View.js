import Coords from './components/Coords'
import Calendar from './components/Calendar'
import { $id } from './functions'

export default class View {
    constructor() {
        this.model = null
        this.formControls = $id('form-controls')
        this.coords = new Coords()
        this.calendar = new Calendar(new Date())

        this.formControls.addEventListener('submit', e => e.preventDefault())
        this.coords.setGetDataLocation(valueSearch => this.model.getDataLocation(valueSearch))
        this.calendar.setGetDataDay((index, day, month, year, widthCanvas, heightCanvas) => this.onData(index, day, month, year, widthCanvas, heightCanvas))
    }

    setModel(model) {
        this.model = model
    }

    onCoords(lat, lon) {
        this.coords.setCoords(lat, lon)
        this.calendar.render()
    }

    onData(index, day, month, year, widthCanvas, heightCanvas) {
        const { lat } = this.coords.data
        const points = this.model.getDataDay(lat, day, month, year, widthCanvas, heightCanvas)
        this.calendar.drawCanvas(index, points)       
    }
}