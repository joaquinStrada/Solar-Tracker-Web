import { $$, $id } from '../functions'
import * as L from 'leaflet'


export default class Coords {
    constructor() {
        this.formControls = $id('form-controls')
        this.inputLat = $id('input-lat')
        this.inputLon = $id('input-lon')
        this.btnSearch = $id('search-location')
        this.contentSearchLocation = $id('content-location')
        this.formSearchLocation = $id('form-location')
        this.contentSearch = $id('search')
        this.contentInputSearch = $id('content-input')
        this.inputSearch = $id('input-search')
        this.btnSearchLocation = $id('btn-search')
        this.aLocations = $$('#list-locations a')
        this.btnClose = $id('btn-close')
        this.map = null
        this.marker = null
        this.data = {
            lat: 0,
            lng: 0
        }
        this.getDataLocation = async () => {}

        this.inputLat.addEventListener('input', e => this.onInput(e))
        this.inputLon.addEventListener('input', e => this.onInput(e))
        this.btnSearch.addEventListener('click', () => this.onClick())
        this.btnClose.addEventListener('click', () => this.contentSearchLocation.classList.remove('active'))
        this.inputSearch.addEventListener('input', () => this.onInputSearch())
        this.btnSearchLocation.addEventListener('click', () => this.onSearch())
        this.aLocations.forEach(a => a.addEventListener('click', e => this.onSelect(e)))
        this.formSearchLocation.addEventListener('submit', e => this.onSubmit(e))
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

    setCoords(lat, lon, setControls = true) {
        this.data.lat = lat
        this.data.lng = lon

        if (setControls) {
            this.inputLat.value = Math.round(lat * 1000) / 10000
            this.inputLon.value = Math.round(lon * 1000) / 10000
        }

        // Mostramos la ubicacion en el mapa
        this.map && this.map.setView([lat, lon], this.map.getZoom())

        this.marker && this.marker.setLatLng([lat, lon])
    }

    onClick() {
        if (!this.contentSearchLocation.classList.contains('active')) {
            this.contentSearchLocation.classList.add('active')

            // Actualizamos el size del mapa
            this.map && setTimeout(() => {
                this.map.invalidateSize()
            }, 300)
        }

        // Resetear los controles
        this.formSearchLocation.reset()
        this.contentSearch.classList.contains('active') && 
        this.contentSearch.classList.remove('active')
        this.contentInputSearch.classList.contains('active') &&
        this.contentInputSearch.classList.remove('active')
    }

    onInputSearch() {
        if (this.inputSearch.value.length < 3 && this.contentInputSearch.classList.contains('active')) this.contentInputSearch.classList.remove('active')
        else if (this.inputSearch.value.length >= 3 && !this.contentInputSearch.classList.contains('active')) this.contentInputSearch.classList.add('active')

        if (this.inputSearch.value.length < 3 && this.contentSearch.classList.contains('active')) this.contentSearch.classList.remove('active')
        if (this.inputSearch.value.length >= 3 && this.btnSearchLocation.hasAttribute('disabled')) this.btnSearchLocation.removeAttribute('disabled')
    }

    async onSearch() {
        try {
            const { status, data } = await this.getDataLocation(this.inputSearch.value)
                        
            if (status !== 200 || data.length < 5) return
            
            data.forEach(({ lat, lon, display_name }, i) => {
                const a = this.aLocations[i]

                // Setear los atributos
                a.setAttribute('data-lat', lat)
                a.setAttribute('data-lon', lon)

                // Seteamos el contenido
                a.innerText = display_name
            })

            // Mostramos la lista de a
            !this.contentSearch.classList.contains('active') && 
            this.contentSearch.classList.add('active')
            
            // Desactivar el boton search
            this.btnSearchLocation.setAttribute('disabled', '')
        } catch (err) {
            console.error(err)
        }
    }

    onSelect(e) {
        e.preventDefault()
        const { lat, lon } = e.currentTarget.dataset
        
        this.setCoords(parseFloat(lat), parseFloat(lon), false)

        // seteamos el valor en el input
        this.inputSearch.value = e.currentTarget.innerText

        // Resetear las clases
        this.contentSearch.classList.remove('active')
        this.contentInputSearch.classList.remove('active')
    }

    onSubmit(e) {
        e.preventDefault()
        this.setCoords(this.data.lat, this.data.lng, true)
        this.contentSearchLocation.classList.remove('active')       
    }

    setGetDataLocation(callback) {
        this.getDataLocation = callback
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