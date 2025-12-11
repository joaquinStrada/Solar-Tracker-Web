export const $id = id => document.getElementById(id)

export const $ = (el, parent = document) => parent.querySelector(el)

export const $$ = (el, parent = document) => parent.querySelectorAll(el)