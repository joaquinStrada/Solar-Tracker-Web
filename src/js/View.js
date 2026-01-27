import Coords from './components/Coords'
import Calendar from './components/Calendar'
import { $id } from './functions'
import Viewer from './components/Viewer'

export default class View {
    constructor() {
        this.model = null
        this.formControls = $id('form-controls')
        this.coords = new Coords()
        this.calendar = new Calendar(new Date())
        this.viewer = new Viewer()

        this.formControls.addEventListener('submit', e => e.preventDefault())
        this.coords.setGetDataLocation(valueSearch => this.model.getDataLocation(valueSearch))
        this.calendar.setGetDataDay((index, day, month, year, widthCanvas, heightCanvas) => this.onData(index, day, month, year, widthCanvas, heightCanvas))
        this.calendar.setOnSelect((day, month, year) => this.onSelect(day, month, year))
    }

    setModel(model) {
        this.model = model
    }

    onCoords(lat, lon) {
        this.coords.setCoords(lat, lon)
        this.calendar.render()
        this.viewer.loadSimulator()
    }

    onData(index, day, month, year, widthCanvas, heightCanvas) {
        const { lat } = this.coords.data
        const points = this.model.getDataDay(lat, day, month, year, widthCanvas, heightCanvas)
        this.calendar.drawCanvas(index, points)
    }

    onSelect(day, month, year) {
        const canvasMessurment = this.viewer.getMessurmentChart()
        const points = this.model.getDataDay(this.coords.data.lat, day, month, year, canvasMessurment.width, canvasMessurment.height)
        this.viewer.renderGraph(points)
    }
}