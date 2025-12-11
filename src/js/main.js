import { config, library, dom } from '@fortawesome/fontawesome-svg-core'
import { faLocationDot, faAngleLeft, faAngleRight, faAngleDown, faAngleUp, faPlay, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons'
import '../fonts/Roboto.css'
import '../css/styles.css'

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
dom.watch()

document.addEventListener('DOMContentLoaded', () => {
    const model = new Model()
    const view = new View()

    model.setView(view)
    view.setModel(model)
    model.getLocation()
})

