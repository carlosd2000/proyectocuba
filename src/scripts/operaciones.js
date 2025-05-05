// src/scripts/operaciones.js

import { ref } from 'vue'

// Datos compartidos
export const nombreUsuario = ref('')

export const filasFijas = ref([
  { cuadrado: '', circulo1: '', circulo2: '' },
  { cuadrado: '', circulo1: '', circulo2: '' },
  { cuadrado: '', circulo1: '', circulo2: '', circuloSolo: '' },
  { cuadrado: '', circulo1: '', circulo2: '' },
  { cuadrado: '', circulo1: '', circulo2: '' },
])

export const filasExtra = ref([])

export const agregarFila = () => {
  filasExtra.value.push({ cuadrado: '', circulo1: '', circulo2: '' })
}

// Función para limpiar todos los campos
export const limpiarCampos = () => {
  filasFijas.value = [
    { cuadrado: '', circulo1: '', circulo2: '' },
    { cuadrado: '', circulo1: '', circulo2: '' },
    { cuadrado: '', circulo1: '', circulo2: '', circuloSolo: '' },
    { cuadrado: '', circulo1: '', circulo2: '' },
    { cuadrado: '', circulo1: '', circulo2: '' },
  ]
  filasExtra.value = []
  nombreUsuario.value = '' // limpia el campo de nombre
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
