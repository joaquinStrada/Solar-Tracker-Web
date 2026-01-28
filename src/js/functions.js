import { MTLLoader } from 'three/addons/loaders/MTLLoader.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import * as THREE from 'three'

export const $id = id => document.getElementById(id)

export const $ = (el, parent = document) => parent.querySelector(el)

export const $$ = (el, parent = document) => parent.querySelectorAll(el)

export const constrain = (x, min, max) => {
    if (x < min) {
        return min
    } else if (x > max) {
        return max
    } else {
        return x
    }
}

export const loadModel = async (MTL, OBJ) => {
    // Load Material
    const mtlLoader = new MTLLoader()
    const material = await mtlLoader.loadAsync(MTL)
    material.preload()

    const objLoader = new OBJLoader()
    objLoader.setMaterials(material)

    return await objLoader.loadAsync(OBJ)
}

export const prepareModel = (model, scale = 1, rotate = [0, 0, 0]) => {
    model.scale.set(scale, scale, scale)
    model.rotation.set(...rotate)

    model.traverse(child => {
        if (child.isMesh) {
            child.geometry.computeVertexNormals()
            child.material.side = THREE.DoubleSide
        }
    })

    return model
}

export const getScaleModel = (model, targetMeters, axis = 'x') => {
    const box = new THREE.Box3().setFromObject(model)
    const size = new THREE.Vector3()
    box.getSize(size)
    return targetMeters / size[axis]
}

export const placeOnGround = (model, groundY = 0) => {
    const box = new THREE.Box3().setFromObject(model)
    const minY = box.min.y
    model.position.y += groundY - minY
    return model
}