export default class Model {
    constructor() {
        this.view = null
    }

    setView(view) {
        this.view = view
    }

    getLocation() {
        if ("geolocation" in window.navigator) {
            window.navigator.geolocation.getCurrentPosition(({ coords }) => this.view.onCoords(coords.latitude, coords.longitude), 
            err => console.error(err))
        } else {
            alert("Permisos de localizacion desactivados")
        }
    }
}