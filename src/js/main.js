import { config, library, dom } from '@fortawesome/fontawesome-svg-core'
import { faLocationDot, faAngleLeft, faAngleRight,
        faAngleDown, faAngleUp, faPlay, faCheck, 
        faXmark, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import '../fonts/Roboto.css'
import 'leaflet/dist/leaflet.css'
import '../css/styles.css'

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import L from 'leaflet'

import Model from './Model'
import View from './View'

// Configuramos los iconos
config.mutateApproach = 'sync'
library.add(faLocationDot)
library.add(faAngleLeft)
library.add(faAngleRight)
library.add(faAngleDown)
library.add(faAngleUp)
library.add(faPlay)
library.add(faCheck)
library.add(faXmark)
library.add(faMagnifyingGlass)
dom.watch()

// Configuramos Leaflet
delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
    iconUrl,
    iconRetinaUrl,
    shadowUrl
})

document.addEventListener('DOMContentLoaded', () => {
    const model = new Model()
    const view = new View()

    model.setView(view)
    view.setModel(model)
    model.getLocation()
    view.coords.renderMap()
})

