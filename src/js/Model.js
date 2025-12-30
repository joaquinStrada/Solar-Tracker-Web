import axios from 'axios'
import { constrain } from './functions'

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

    getDataDay(lat, day, month, year, widthCanvas, heightCanvas) {
        const data = []
        const latRad = lat * Math.PI / 180

        // Determino N
        const firstDate = Date.UTC(year, 0, 1)
        const dateNow = Date.UTC(year, month, day)
        const N = Math.floor((dateNow - firstDate) / (24 * 60 * 60 * 1000)) + 1

        // Determinar si el año es biciesto
        const totalDaysYear = new Date(year, 2, 0).getDate() == 29 ? 366 : 365

        // Obtenter los puntos
        for (let h = 0; h < 24; h++) {
            const x = (2 * Math.PI / totalDaysYear) * (N - 1 + ((h - 12) / 24))
            const delta = 0.006918 - 0.399912 * Math.cos(x) + 0.070257 * Math.sin(x)
            - 0.006758 * Math.cos(2 * x) + 0.000907 * Math.sin(2 * x)
            - 0.002697 * Math.cos(3 * x) + 0.001480 * Math.sin(3 * x)

            const omega = 15 * (h - 12) * Math.PI / 180
            const elevationRad = Math.asin(Math.cos(latRad) * Math.cos(omega) * Math.cos(delta)
                                            + Math.sin(latRad) * Math.sin(delta))
            let azimutRad = (Math.cos(latRad) * Math.sin(delta) 
                    - Math.cos(omega) * Math.sin(latRad) * Math.cos(delta)) / Math.cos(elevationRad)
            azimutRad = Math.acos(constrain(azimutRad, -1, 1))
    
            // Nomalizar azimutRad de 0 a 2PI
            azimutRad = Math.sin(omega) > 0 ? (2 * Math.PI) - azimutRad : azimutRad

            // Voltear la campana
            azimutRad = (azimutRad + Math.PI) % (2 * Math.PI)

            // { x: 50px, y: 30px }
            // Pasar de radianes a cordenadas
            // voltear en un eje = Tamaño - valor
            const px = azimutRad * widthCanvas / (2 * Math.PI)
            const py = heightCanvas * (1 - (2 * elevationRad / Math.PI))

            const point = {
                x: constrain(px, 0, widthCanvas),
                y: constrain(py, 0, heightCanvas)
            }

            data.push(point)
        }

        return data
    }
}