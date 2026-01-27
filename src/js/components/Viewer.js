import { $id, loadModel, prepareModel } from '../functions'
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
                panel: null
            }
        }
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
        this.camera.position.z = 10
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
            const baseModel = await loadModel(BaseMTL, BaseOBJ)
            const supportModel = await loadModel(SupportMTL, SupportOBJ)
            const panelModel = await loadModel(PanelMTL, PanelOBJ)

            // Configuramos los modelos
            this.configSimulator.models.base = prepareModel(baseModel)
            this.configSimulator.models.support = prepareModel(supportModel)
            this.configSimulator.models.panel = prepareModel(panelModel)

            // Cargamos los modelos            
            this.scene.add(this.configSimulator.models.base)
            this.scene.add(this.configSimulator.models.support)
            this.scene.add(this.configSimulator.models.panel)

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
}