import Coords from "./components/Coords"

export default class View {
    constructor() {
        this.model = null
        this.coords = new Coords()
    }

    setModel(model) {
        this.model = model
    }

    onCoords(lat, lon) {
        this.coords.setCoords(lat, lon)
    }
}