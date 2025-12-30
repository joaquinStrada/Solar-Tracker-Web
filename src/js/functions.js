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