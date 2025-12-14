import { $id } from '../functions'
import * as L from 'leaflet'


export default class Coords {
    constructor() {
        this.formControls = $id('form-controls')
        this.inputLat = $id('input-lat')
        this.inputLon = $id('input-lon')
        this.btnSearch = $id('search-location')
        this.contentSearchLocation = $id('content-location')
        this.formSearchLocation = $id('form-location')
        this.inputSearch = $id('input-search')
        this.btnClose = $id('btn-close')
        this.map = null
        this.marker = null
        this.data = {
            lat: 0,
            lng: 0
        }

        this.inputLat.addEventListener('input', e => this.onInput(e))
        this.inputLon.addEventListener('input', e => this.onInput(e))
        this.btnSearch.addEventListener('click', () => this.onSearch())
        this.btnClose.addEventListener('click', () => this.contentSearchLocation.classList.remove('active'))
    }

    onInput(e) {
        const { currentTarget, inputType, data } = e

        if (inputType == 'insertText' && isNaN(data)) {
            currentTarget.value = currentTarget.id == 'input-lat' ?
                this.data.lat :
                this.data.lng
            return
        }

        if (currentTarget.id == 'input-lat') this.data.lat = parseFloat(currentTarget.value)
        else this.data.lng = parseFloat(currentTarget.value)
    }

    setCoords(lat, lon) {
        this.data.lat = lat
        this.data.lng = lon

        this.inputLat.value = Math.round(lat * 1000) / 10000
        this.inputLon.value = Math.round(lon * 1000) / 10000

        // Mostramos la ubicacion en el mapa
        this.map.setView([lat, lon], this.map.getZoom())

        this.marker.setLatLng([lat, lon])
    }

    onSearch() {
        if (!this.contentSearchLocation.classList.contains('active')) {
            this.contentSearchLocation.classList.add('active')

            // Actualizamos el size del mapa
            if (this.map) setTimeout(() => {
                this.map.invalidateSize()
            }, 300)
        }
    }

    renderMap() {
        this.map = L.map('map-location').setView([this.data.lat, this.data.lng], 13)

        L.tileLayer('https://tile.openstreetmap.de/{z}/{x}/{y}.png').addTo(this.map)

        // Agregamos un marcador
        this.marker = L.marker([this.data.lat, this.data.lng]).addTo(this.map)

        this.marker.bindPopup('Aqui Estas!')

        // Reseteamos el form controls
        this.formControls.reset()
    }
}