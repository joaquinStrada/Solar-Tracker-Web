import { $id, getScaleModel, loadModel, placeOnGround, prepareModel } from '../functions'
import * as THREE from 'three'
import { Sky } from 'three/examples/jsm/objects/Sky.js'
import BaseOBJ from '../../models/Base.obj'
import BaseMTL from '../../models/Base.mtl'
import SupportOBJ from '../../models/Soporte.obj'
import SupportMTL from '../../models/Soporte.mtl'
import PanelOBJ from '../../models/Panel.obj'
import PanelMTL from '../../models/Panel.mtl'


export default class Viewer {
    constructor() {
        this.viewSimulator = $id('view-simulator')
        this.controlsSimulator = $id('controls-simulator')
        this.btnPlay = $id('btn-play')
        this.progressSimulator = $id('progress-simulator')
        this.progressText = $id('progress-text')
        this.solarTrackerChart = $id('solar-tracker-chart')
        this.camera = null
        this.scene = null
        this.renderer = null
        this.configSimulator = {
            sky: null,
            sun: null,
            sunLight: null,
            models: {
                base: null,
                support: null,
                panel: null,
                tracker: null
            },
            // eslint-disable-next-line no-unused-vars
            getData: (hour, lat, day, month, year) => {},
            data: {
                lat: 0,
                day: null,
                month: null,
                year: null,
                timeInit: 0
            },
            active: false,
            play: false
        }

        this.viewSimulator.addEventListener('mousemove', e => this.onMove(e))
        this.controlsSimulator.addEventListener('submit', e => e.preventDefault()) 
        this.btnPlay.addEventListener('click', () => this.onClick())
        this.progressSimulator.addEventListener('mousemove', () => this.updateSimulator())
        this.controlsSimulator.reset()
    }

    getMessurmentChart() {
        return this.solarTrackerChart.getBoundingClientRect()
    }

    renderGraph(points) {
        // Seteamos las medidas del canvas
        const messurmentChart = this.getMessurmentChart()

        this.solarTrackerChart.setAttribute('width', messurmentChart.width)
        this.solarTrackerChart.setAttribute('height', messurmentChart.height)

        // Obtenemos el contexto y limpiamos el canvas
        const ctx = this.solarTrackerChart.getContext('2d')
        ctx.clearRect(0, 0, messurmentChart.width, messurmentChart.height)

        // Pintamos los puntos
        ctx.fillStyle = '#F00'

        points.forEach(point => {
            ctx.beginPath()
            ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI)
            ctx.fill()
        })

        // Pintamos las lineas
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 2

        // Inciamos el trazo
        ctx.beginPath()
        ctx.moveTo(points[0].x, points[0].y)

        // Reccorro los puntos
        for (let i = 0; i < points.length - 1; i++) {
            const { x: px, y: py } = points[i - 1] || points[i]
            const { x: px1, y: py1 } = points[i]
            const { x: px2, y: py2 } = points[i + 1]
            const { x: px3, y: py3 } = points[i + 2] || points[i + 1]

            const distX = Math.abs(px2 - px1)

            if (distX > messurmentChart.width / 2) {
                ctx.stroke()
                ctx.beginPath()
                ctx.moveTo(px2, py2)
                continue
            }

            // Sacamos los puntos de control
            const t = 6
            let cp1x = px1 + (px2 - px) / t
            let cp1y = py1 + (py2 - py) / t

            let cp2x = px2 + (px3 - px1) / t
            let cp2y = py2 + (py3 - py1) / t

            if (py1 < py && py1 < py2) {
                cp1y = py1
            } else if (py2 < py && py2 < py3) {
                cp2y = py2
            }

            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, px2, py2)
        }

        ctx.stroke()
    }

    async loadSimulator() {
        const { width, height } = this.viewSimulator.getBoundingClientRect()

        // Scene
        this.scene = new THREE.Scene()

        // Crear la camara
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
        this.camera.position.set(0, 2, 6)
        this.camera.lookAt(0, 1, 0)
        this.scene.add(this.camera)

        // Agregamos la iluminacion
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
        this.scene.add(ambientLight)

        const mainLight = new THREE.DirectionalLight(0xffffff, 1)
        mainLight.position.set(5, 10, 7)
        this.scene.add(mainLight)

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.4)
        fillLight.position.set(-5, 3, -5)
        this.scene.add(fillLight)

        // Generamos el fondo
        this.configSimulator.sky = new Sky()
        this.configSimulator.sky.scale.setScalar(1000)

        this.configSimulator.sun = new THREE.Vector3()

        const uniforms = this.configSimulator.sky.material.uniforms
        uniforms['turbidity'].value = 10
        uniforms['rayleigh'].value = 2
        uniforms['mieCoefficient'].value = 0.005
        uniforms['mieDirectionalG'].value = 0.8

        // Posicion del sol
        this.configSimulator.sun.setFromSphericalCoords(
            1,
            THREE.MathUtils.degToRad(90),
            THREE.MathUtils.degToRad(60)
        )

        uniforms['sunPosition'].value.copy(this.configSimulator.sun)
        this.scene.add(this.configSimulator.sky)

        // Iluminacion del sol
        this.configSimulator.sunLight = new THREE.DirectionalLight(0xffffff, 1.5)
        this.configSimulator.sunLight.position.copy(this.configSimulator.sun.clone().multiplyScalar(100))
        this.scene.add(this.configSimulator.sunLight)

        try {
            // Cargamos los modelos
            let tracker = new THREE.Group()
            const baseModel = await loadModel(BaseMTL, BaseOBJ)
            const supportModel = await loadModel(SupportMTL, SupportOBJ)
            const panelModel = await loadModel(PanelMTL, PanelOBJ)

            // Configuramos los modelos
            this.configSimulator.models.base = prepareModel(baseModel, 1, [THREE.MathUtils.degToRad(90), 0, 0])
            this.configSimulator.models.support = prepareModel(supportModel, 1, [THREE.MathUtils.degToRad(-90), 0, 0])
            this.configSimulator.models.panel = prepareModel(panelModel, 1, [THREE.MathUtils.degToRad(-90), 0, 0])

            this.configSimulator.models.base = placeOnGround(this.configSimulator.models.base, 0)
            this.configSimulator.models.support = placeOnGround(this.configSimulator.models.support, 0.018)
            this.configSimulator.models.panel = placeOnGround(this.configSimulator.models.panel, 90)

            // Añadimos los modelos al tracker
            tracker.add(this.configSimulator.models.base)
            tracker.add(this.configSimulator.models.support)
            tracker.add(this.configSimulator.models.panel)

            // Configuramos el tracker
            tracker.scale.setScalar(getScaleModel(tracker, 2.25, 'y'))
            tracker = placeOnGround(tracker)

            // Cargamos los modelos            
            this.scene.add(tracker)

            // Renderizamos la escena
            this.renderer = new THREE.WebGLRenderer({
                antialias: true
            })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(width, height)
            this.renderer.setAnimationLoop(() => this.animate())
            this.viewSimulator.appendChild(this.renderer.domElement)
        } catch (err) {
            console.error(err)
        }
    }

    animate() {
        this.renderer.render(this.scene, this.camera)
    }

    renderSimulator(lat, day, month, year) {
        // Seteamos las variables en el objeto
        this.configSimulator.data.lat = lat
        this.configSimulator.data.day = day
        this.configSimulator.data.month = month
        this.configSimulator.data.year = year
        this.configSimulator.active = true       
    }

    onMove(e) {
        if (!this.configSimulator.active) return
        
        const { clientY } = e
        const { top, height } = this.viewSimulator.getBoundingClientRect()
        const umbral = height - clientY + top

        if (umbral < 30 && !this.controlsSimulator.classList.contains('active')) this.controlsSimulator.classList.add('active')
        else if (umbral > 30 && this.controlsSimulator.classList.contains('active'))this.controlsSimulator.classList.remove('active')
    }

    onClick() {
        if (!this.configSimulator.active) return
        
        this.configSimulator.play = !this.configSimulator.play

        if (this.configSimulator.play) {
            this.btnPlay.innerHTML = `<svg class="svg-inline--fa fa-pause" data-prefix="fas" data-icon="pause" role="img" viewBox="0 0 384 512" aria-hidden="true" data-fa-i2svg="">
                <path fill="currentColor" d="M48 32C21.5 32 0 53.5 0 80L0 432c0 26.5 21.5 48 48 48l64 0c26.5 0 48-21.5 48-48l0-352c0-26.5-21.5-48-48-48L48 32zm224 0c-26.5 0-48 21.5-48 48l0 352c0 26.5 21.5 48 48 48l64 0c26.5 0 48-21.5 48-48l0-352c0-26.5-21.5-48-48-48l-64 0z">
                </path>
                </svg>`
            this.configSimulator.data.timeInit = new Date().getTime()
        } else {
            this.btnPlay.innerHTML = `<svg class="svg-inline--fa fa-play" data-prefix="fas" data-icon="play" role="img" viewBox="0 0 448 512" aria-hidden="true" data-fa-i2svg="">
                <path fill="currentColor" d="M91.2 36.9c-12.4-6.8-27.4-6.5-39.6 .7S32 57.9 32 72l0 368c0 14.1 7.5 27.2 19.6 34.4s27.2 7.5 39.6 .7l336-184c12.8-7 20.8-20.5 20.8-35.1s-8-28.1-20.8-35.1l-336-184z">
                </path>
                </svg>`
        }
    }

    updateSimulator() {
        const value = parseInt(this.progressSimulator.value)
        this.progressText.innerText = `${Math.floor(value / 60000)}:${(
            Math.floor(value / 1000) % 60) < 10 ? `0${Math.floor(value / 1000) % 60}`
        : Math.floor(value / 1000) % 60}/2:00`
        const percent = value * 100 / 120000
        this.progressSimulator.style.background = `linear-gradient(90deg, #0074d9 0 ${percent}%, #ccc ${percent}% 100%)`

        // Simulacion
    }
}