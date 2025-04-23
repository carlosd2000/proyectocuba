// src/scripts/operaciones.js

import { ref } from 'vue'

// Datos compartidos
export const filasFijas = ref([
  { circulo1: '', circulo2: '' },
  { circulo1: '', circulo2: '' },
  { circulo1: '', circulo2: '', circuloSolo: '' },
  { circulo1: '', circulo2: '' },
  { circulo1: '', circulo2: '' },
])

export const filasExtra = ref([])

export const agregarFila = () => {
  filasExtra.value.push({ circulo1: '', circulo2: '' })
}

// NUEVO: función para limpiar todos los inputs
export const limpiarCampos = () => {
  filasFijas.value = [
    { circulo1: '', circulo2: '' },
    { circulo1: '', circulo2: '' },
    { circulo1: '', circulo2: '', circuloSolo: '' },
    { circulo1: '', circulo2: '' },
    { circulo1: '', circulo2: '' },
  ]
  filasExtra.value = []
}

// Cálculo de totales
export function calcularTotales(fijas, extras) {
  const fijasValue = fijas.value || []
  const extrasValue = extras.value || []

  const col3 = fijasValue.reduce(
    (acc, fila) => acc + (fila.circulo1 !== '' ? Number(fila.circulo1) : 0), 0
  ) + extrasValue.reduce(
    (acc, fila) => acc + (fila.circulo1 !== '' ? Number(fila.circulo1) : 0), 0
  )

  const col4 = fijasValue.reduce(
    (acc, fila) => acc + (fila.circulo2 !== '' ? Number(fila.circulo2) : 0), 0
  ) + extrasValue.reduce(
    (acc, fila) => acc + (fila.circulo2 !== '' ? Number(fila.circulo2) : 0), 0
  )

  const col5 = fijasValue[2]?.circuloSolo !== '' ? Number(fijasValue[2].circuloSolo) : 0

  return { col3, col4, col5 }
}
