import { $id } from '../functions'

export default class Coords {
    constructor() {
        this.inputLat = $id('input-lat')
        this.inputLon = $id('input-lon')
        this.btnSearch = $id('search-location')
        this.contentSearchLocation = $id('content-location')
        this.formSearchLocation = $id('form-location')
        this.inputSearch = $id('input-search')
        this.contentMap= $id('map-location')
        this.btnClose = $id('btn-close')
        this.data = {
            lat: 0,
            lon: 0
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
                this.data.lon
            return
        }

        if (currentTarget.id == 'input-lat') this.data.lat = parseFloat(currentTarget.value)
        else this.data.lon = parseFloat(currentTarget.value)
    }

    setCoords(lat, lon) {
        this.data.lat = lat
        this.data.lon = lon

        this.inputLat.value = Math.round(lat * 1000) / 10000
        this.inputLon.value = Math.round(lon * 1000) / 10000
    }

    onSearch() {
        if (!this.contentSearchLocation.classList.contains('active')) this.contentSearchLocation.classList.add('active')
    }
}