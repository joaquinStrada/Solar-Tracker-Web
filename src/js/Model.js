import axios from 'axios'

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

    async getDataLocation(valueSearch) {
        return await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: valueSearch,
                polygon_geojson: 1,
                limit: 5,
                format: 'jsonv2'
            }
        })
    }
}